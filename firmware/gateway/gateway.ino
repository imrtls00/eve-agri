/*
 * ESP32 Gateway
 *
 * Hardware: ESP32 + LoRa + ILI9341 TFT LCD
 *
 * - Receives LoRa packets from sensor node(s)
 * - Parses PH and TS packet formats
 * - Displays readings on TFT LCD
 * - Uploads to Google Apps Script (GET)
 * - Uploads to dashboard API (POST JSON)
 */

#include <SPI.h>
#include <LoRa.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ──── CONFIG (set before upload) ────
const char* WIFI_SSID = "YOUR_SSID";
const char* WIFI_PASS = "YOUR_PASSWORD";

const String GAS_URL =
  "https://script.google.com/macros/s/YOUR_GAS_ID/exec";

const String API_URL =
  "http://your-dashboard/api/readings";

const String DEVICE_ID = "gateway-01";

// ──── Pin Mapping ────
// LoRa
const int LORA_SS   = 5;
const int LORA_RST  = 14;
const int LORA_DIO0 = 26;

// TFT (ILI9341)
const int TFT_CS  = 15;
const int TFT_DC  = 2;
const int TFT_RST = 4;

// ──── State ────
struct SensorData {
  float ph;
  int   soil;
  int   tds1;
  int   tds2;
  int   rssi;
  bool  hasPh;
  bool  hasTs;
  bool  fresh;
};

SensorData data = {0, 0, 0, 0, 0, false, false, false};
Adafruit_ILI9341 tft(TFT_CS, TFT_DC, TFT_RST);
bool wifiConnected = false;

unsigned long lastUpload = 0;
const unsigned long UPLOAD_INTERVAL = 10000;

// ──── TFT ──────────────────────────────────────────────────────

void initDisplay() {
  tft.begin();
  tft.setRotation(2);
  tft.fillScreen(ILI9341_BLACK);
  tft.setTextSize(2);

  tft.setTextColor(ILI9341_WHITE);
  tft.setCursor(25, 10);  tft.print("SMART");
  tft.setCursor(10, 35);  tft.print("AGRICULTURE");
  tft.drawFastHLine(10, 65, 220, ILI9341_WHITE);

  tft.setTextColor(ILI9341_CYAN);
  tft.setCursor(10, 80);  tft.print("SENDER 1");
  tft.setCursor(10, 175); tft.print("SENDER 2");
}

void updateDisplay() {
  tft.fillRect(0, 100, 240, 60, ILI9341_BLACK);
  tft.fillRect(0, 195, 240, 60, ILI9341_BLACK);
  tft.setTextSize(2);

  tft.setTextColor(ILI9341_GREEN);
  tft.setCursor(20, 110);
  tft.print("SOIL : "); tft.print(data.soil); tft.print("%");

  tft.setTextColor(ILI9341_YELLOW);
  tft.setCursor(20, 140);
  tft.print("TDS1 : "); tft.print(data.tds1); tft.print(" ppm");

  tft.setTextColor(ILI9341_MAGENTA);
  tft.setCursor(20, 205);
  tft.print("pH   : "); tft.print(data.ph, 1);

  tft.setTextColor(ILI9341_CYAN);
  tft.setCursor(20, 235);
  tft.print("TDS2 : "); tft.print(data.tds2); tft.print(" ppm");
}

// ──── LoRa ─────────────────────────────────────────────────────

void initLoRa() {
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(433E6)) {
    Serial.println("LoRa init failed!");
    while (1);
  }
  LoRa.setSpreadingFactor(7);
  LoRa.setSignalBandwidth(125E3);
  LoRa.setCodingRate4(5);
  LoRa.enableCrc();
  Serial.println("LoRa OK");
}

void receivePacket() {
  int size = LoRa.parsePacket();
  if (size == 0) return;

  String raw = "";
  while (LoRa.available()) {
    raw += (char)LoRa.read();
  }
  raw.trim();

  int rssi = LoRa.packetRssi();
  Serial.print("RX: "); Serial.print(raw);
  Serial.print("  RSSI: "); Serial.println(rssi);

  // ── PH,<pH>,<ignored>,<tds2> ──
  if (raw.startsWith("PH,")) {
    int c1 = raw.indexOf(',');
    int c2 = raw.indexOf(',', c1 + 1);
    int c3 = raw.indexOf(',', c2 + 1);
    if (c1 != -1 && c2 != -1 && c3 != -1) {
      data.ph   = raw.substring(c1 + 1, c2).toFloat();
      data.tds2 = raw.substring(c3 + 1).toInt();
      data.rssi = rssi;
      data.hasPh = true;
      data.fresh = true;
    }
  }

  // ── TS,<tds1>,<soil> ──
  else if (raw.startsWith("TS,")) {
    int c1 = raw.indexOf(',');
    int c2 = raw.indexOf(',', c1 + 1);
    if (c1 != -1 && c2 != -1) {
      data.tds1 = raw.substring(c1 + 1, c2).toInt();
      data.soil = raw.substring(c2 + 1).toInt();
      data.rssi = rssi;
      data.hasTs = true;
      data.fresh = true;
    }
  }
}

// ──── WiFi ─────────────────────────────────────────────────────

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  delay(500);
  WiFi.disconnect();
  delay(500);

  Serial.print("Connecting to WiFi... ");
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 40) {
    delay(500);
    Serial.print(".");
    tries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.print(" OK — IP: ");
    Serial.println(WiFi.localIP());
  } else {
    wifiConnected = false;
    Serial.println(" FAILED");
  }
}

// ──── Upload (dual path) ──────────────────────────────────────

void uploadReadings() {
  if (!wifiConnected) return;

  // 1 — Google Apps Script (GET — existing system)
  String gasUrl = GAS_URL
    + "?slave=1"
    + "&ph=" + String(data.ph, 1)
    + "&tds1=" + String(data.tds1)
    + "&tds2=" + String(data.tds2)
    + "&moisture=" + String(data.soil);

  {
    HTTPClient http;
    http.begin(gasUrl);
    http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
    int code = http.GET();
    if (code > 0) {
      Serial.print("GAS upload: HTTP ");
      Serial.println(code);
    } else {
      Serial.print("GAS upload failed: ");
      Serial.println(http.errorToString(code).c_str());
    }
    http.end();
  }

  // 2 — Dashboard API (POST JSON — future system)
  {
    HTTPClient http;
    http.begin(API_URL);
    http.addHeader("Content-Type", "application/json");

    JsonDocument doc;
    doc["deviceId"]     = DEVICE_ID;
    doc["soilMoisture"] = data.soil;
    doc["ph"]           = data.ph;
    doc["tds1"]         = data.tds1;
    doc["tds2"]         = data.tds2;
    doc["rssi"]         = data.rssi;
    doc["battery"]      = nullptr;

    String body;
    serializeJson(doc, body);
    int code = http.POST(body);
    if (code > 0) {
      Serial.print("API upload: HTTP ");
      Serial.println(code);
    }
    http.end();
  }
}

// ──── Setup / Loop ────────────────────────────────────────────

void setup() {
  Serial.begin(115200);

  initDisplay();
  initLoRa();
  connectWiFi();
}

void loop() {
  receivePacket();

  if (data.fresh) {
    updateDisplay();

    Serial.print("DATA: soil="); Serial.print(data.soil);
    Serial.print(" tds1="); Serial.print(data.tds1);
    Serial.print(" ph="); Serial.print(data.ph);
    Serial.print(" tds2="); Serial.print(data.tds2);
    Serial.print(" rssi="); Serial.println(data.rssi);

    data.fresh = false;
  }

  if (millis() - lastUpload >= UPLOAD_INTERVAL && data.hasPh && data.hasTs) {
    lastUpload = millis();
    uploadReadings();
  }

  delay(20);
}
