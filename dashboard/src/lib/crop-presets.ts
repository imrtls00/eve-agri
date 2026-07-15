import type { CropKey, CropPreset, Thresholds } from '@/types'

export const CROP_PRESETS: Record<CropKey, CropPreset> = {
  tomato: {
    label: 'Tomato',
    ph: { min: 6.0, max: 6.8 },
    moist: { min: 60, max: 80 },
    tds: { min: 350, max: 700 },
  },
  rice: {
    label: 'Rice',
    ph: { min: 5.5, max: 6.5 },
    moist: { min: 70, max: 90 },
    tds: { min: 300, max: 600 },
  },
  wheat: {
    label: 'Wheat',
    ph: { min: 6.0, max: 7.5 },
    moist: { min: 40, max: 60 },
    tds: { min: 300, max: 650 },
  },
  maize: {
    label: 'Maize (Corn)',
    ph: { min: 5.8, max: 7.0 },
    moist: { min: 50, max: 70 },
    tds: { min: 300, max: 650 },
  },
  potato: {
    label: 'Potato',
    ph: { min: 5.0, max: 6.5 },
    moist: { min: 60, max: 80 },
    tds: { min: 300, max: 600 },
  },
}

export const DEFAULT_THRESHOLDS: Thresholds = {
  ph: { min: 6.0, max: 7.5 },
  moist: { min: 30, max: 60 },
  tds: { min: 300, max: 650 },
}

export function getThresholds(crop: CropKey | null): Thresholds {
  if (!crop) return DEFAULT_THRESHOLDS
  const p = CROP_PRESETS[crop]
  return {
    ph: p.ph,
    moist: p.moist,
    tds: p.tds,
  }
}
