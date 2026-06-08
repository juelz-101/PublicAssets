import type { SvgPreset } from '../types';

export const zikyLetterPaths = [
  'M0 0 H100 V20 H20 L80 80 H100 V100 H0 V80 L80 20 H0 V0Z', // Z
  'M40 0 H60 V100 H40 V0Z', // I
  'M0 0 H20 V100 H0V0ZM100 0 L20 50 L100 100 H80 L40 50 L80 0 H100Z', // K
  'M0 0 L50 50 L100 0 L80 0 L50 30 L20 0 Z M40 50 H60 V100 H40 V50Z' // Y
];

export const svgPresets: SvgPreset[] = [
  { name: 'Ziky', path: 'M0 0 H100 V20 H20 L80 80 H100 V100 H0 V80 H80 L20 20 H0 V0 Z' },
  { name: 'Diamond', path: 'M50 0L100 50L50 100L0 50Z' },
  { name: 'Star', path: 'M50 0 L61.8 38.2 L100 38.2 L69.1 61.8 L80.9 100 L50 76.4 L19.1 100 L30.9 61.8 L0 38.2 L38.2 38.2 Z' },
  { name: 'Heart', path: 'M50 25 C 25 0, 0 25, 25 50 L 50 75 L 75 50 C 100 25, 75 0, 50 25 Z' },
  { name: 'Custom', path: '' }, // Placeholder for custom user input
];

export const customPresetName = 'Custom';

// New presets for corner squares
export const cornerSquareSvgPresets: SvgPreset[] = [
  { name: 'Square', path: 'M0 0 H100 V100 H0Z' },
  { name: 'Rounded Frame', path: 'M0 20C0 8.95 8.95 0 20 0H80C91.05 0 100 8.95 100 20V80C100 91.05 91.05 100 80 100H20C8.95 100 0 91.05 0 80V20Z M15 25C15 16.72 21.72 10 30 10H70C78.28 10 85 16.72 85 25V70C85 78.28 78.28 85 70 85H30C21.72 85 15 78.28 15 70V25Z' },
  { name: 'Spiky', path: 'M50 0L65 35L100 35L75 60L85 100L50 75L15 100L25 60L0 35L35 35Z' },
  { name: 'Circle', path: 'M50 0C22.39 0 0 22.39 0 50s22.39 50 50 50 50-22.39 50-50S77.61 0 50 0z' },
  { name: 'Custom', path: '' },
];