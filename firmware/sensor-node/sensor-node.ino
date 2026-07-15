/*
 * Sensor Node (LoRa Transmitter)
 *
 * Reads soil moisture, pH, and TDS sensors,
 * then transmits alternating packet types to the ESP32 Gateway:
 *
 *   Even cycle — PH,<pH>,0,<tds2>
 *   Odd  cycle — TS,<tds1>,<moisture>
 *
 * The gateway expects these two packet formats.
 */

#include <SPI.h>
#include <LoRa.h>

// ──── Pin Mapping ────
const int LORA_SS   = 10;
const int LORA_RST  = 9;
const int LORA_DIO0 = 2;

// ──── Analog Sensor Pins ────
const int SOIL_MOISTURE_PIN = A0;
const int PH_PIN            = A1;
const int TDS1_PIN          = A2;
const int TDS2_PIN          = A3;

// ──── Timing ────
const unsigned long TX_INTERVAL = 10000;  // ms between transmissions

unsigned long lastTx = 0;
int cycle = 0;  // alternates 0 = PH, 1 = TS

// ──── Sensor Reads ────────────────────────────────────────────

int readSoilMoisture() {
  int raw = analogRead(SOIL_MOISTURE_PIN);
  return map(raw, 0, 4095, 0, 100);
}

float readPH() {
  int raw = analogRead(PH_PIN);
  // Calibrate to your sensor's voltage/pH curve
  return 7.0 + ((raw - 2048) / 4095.0 * 4.0);
}

int readTDS(int pin) {
  int raw = analogRead(pin);
  return (raw / 4095.0) * 1000.0;
}

// ──── Transmit ────────────────────────────────────────────────

void transmitReading() {
  int   moisture = readSoilMoisture();
  float ph       = readPH();
  int   tds1     = readTDS(TDS1_PIN);
  int   tds2     = readTDS(TDS2_PIN);

  LoRa.beginPacket();

  if (cycle == 0) {
    // PH packet:  PH,<pH>,0,<tds2>
    LoRa.print("PH,");
    LoRa.print(ph, 1);
    LoRa.print(",0,");
    LoRa.print(tds2);

    Serial.print("TX PH: ph="); Serial.print(ph, 1);
    Serial.print(" tds2="); Serial.println(tds2);
  } else {
    // TS packet:  TS,<tds1>,<moisture>
    LoRa.print("TS,");
    LoRa.print(tds1);
    LoRa.print(",");
    LoRa.print(moisture);

    Serial.print("TX TS: tds1="); Serial.print(tds1);
    Serial.print(" moist="); Serial.println(moisture);
  }

  LoRa.endPacket();

  cycle = 1 - cycle;
}

// ──── Setup / Loop ────────────────────────────────────────────

void setup() {
  Serial.begin(115200);

  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(433E6)) {
    Serial.println("LoRa init failed!");
    while (1);
  }

  LoRa.setTxPower(20);
  Serial.println("Sensor node ready");
}

void loop() {
  unsigned long now = millis();
  if (now - lastTx >= TX_INTERVAL) {
    lastTx = now;
    transmitReading();
  }
}
