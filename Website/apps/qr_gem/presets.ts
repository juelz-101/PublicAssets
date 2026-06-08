import type { Preset, PresetName } from './types';

export const presetOrder: PresetName[] = ['none', 'classic-tech', 'neon-funk', 'golden-royal'];

export const presets: Record<PresetName, Preset> = {
  'none': {
    name: "Default",
    options: {},
    borderOptions: {},
  },
  'ziky': {
    name: "Ziky (Debug)",
    options: {
      margin: 10,
      dotsOptions: {
        color: '#1d4ed8', // blue-700
      },
      backgroundOptions: {
        color: '#ffffff',
      },
      cornersSquareOptions: {
        color: '#1e3a8a', // blue-800
        type: 'extra-rounded',
      },
      cornersDotOptions: {
        color: '#1e3a8a', // blue-800
        type: 'dot',
      },
    },
    borderOptions: {
      style: 'solid',
      width: 15,
      color: '#dbeafe', // blue-100
    },
    experimentalOptions: {
      enabled: true,
      presetName: 'Ziky',
      dotSvg: 'M0 0 H100 V20 H20 L80 80 H100 V100 H0 V80 L80 20 H0 V0 Z',
      cornerSquareEnabled: false,
      cornerSquarePresetName: 'Square',
      cornerSquareSvg: 'M0 0 H100 V100 H0Z',
    },
    logoShape: 'square',
  },
  'neon-funk': {
    name: "Neon Funk",
    options: {
      margin: 15,
      dotsOptions: {
        type: 'classy-rounded',
        gradient: {
          type: 'linear',
          rotation: Math.PI / 4,
          colorStops: [{ offset: 0, color: '#f92ced' }, { offset: 1, color: '#7c3aed' }]
        }
      },
      backgroundOptions: {
        color: '#020617',
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
        gradient: {
          type: 'linear',
          rotation: -Math.PI / 4,
          colorStops: [{ offset: 0, color: '#22d3ee' }, { offset: 1, color: '#0ea5e9' }]
        }
      },
      cornersDotOptions: {
        type: 'dot',
        color: '#22d3ee'
      },
    },
    borderOptions: {
      style: 'corners',
      width: 20,
      color: '#a855f7',
      cornerLength: 50,
    },
    experimentalOptions: {
      enabled: false,
      cornerSquareEnabled: false,
      cornerSquarePresetName: 'Square',
      cornerSquareSvg: 'M0 0 H100 V100 H0Z',
    },
    logoShape: 'circle',
  },
  'classic-tech': {
    name: 'Classic Tech',
    options: {
      margin: 5,
      dotsOptions: {
        type: 'classy-rounded',
        color: '#262626',
      },
      backgroundOptions: {
        color: '#f5f5f5', // neutral-100
      },
      cornersSquareOptions: {
        type: 'square',
        color: '#262626',
      },
      cornersDotOptions: {
        type: 'square',
        color: '#262626',
      },
    },
    borderOptions: {
      style: 'solid',
      width: 15,
      color: '#262626', // neutral-800
    },
    experimentalOptions: {
      enabled: false,
      cornerSquareEnabled: false,
      cornerSquarePresetName: 'Square',
      cornerSquareSvg: 'M0 0 H100 V100 H0Z',
    },
    logoShape: 'square',
  },
  'golden-royal': {
    name: 'Golden Royal',
    options: {
      margin: 20,
      dotsOptions: {
        type: 'extra-rounded',
        gradient: {
          type: 'linear',
          rotation: Math.PI / 2,
          colorStops: [{ offset: 0, color: '#fef08a' }, { offset: 1, color: '#b45309' }]
        }
      },
      backgroundOptions: {
        color: '#1e1b4b',
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
        color: '#ca8a04',
      },
      cornersDotOptions: {
        type: 'dot',
        color: '#fef08a',
      },
    },
    borderOptions: {
      style: 'double',
      width: 24,
      color: '#ca8a04',
    },
    experimentalOptions: {
      enabled: false,
      cornerSquareEnabled: false,
      cornerSquarePresetName: 'Square',
      cornerSquareSvg: 'M0 0 H100 V100 H0Z',
    },
    logoShape: 'circle',
  },
};