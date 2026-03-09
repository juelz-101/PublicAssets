import type { ThemePresetCategory } from '../../types';

export const themePresets: ThemePresetCategory[] = [
    {
        category: 'Standard',
        themes: [
            {
                name: 'Classic',
                colors: {
                    '--color-background-base': { light: '#f0f0f0', dark: '#0a0a0a' },
                    '--color-background-secondary': { light: '#ffffff', dark: '#141414' },
                    '--color-background-tertiary': { light: '#e0e0e0', dark: '#222222' },
                    '--color-text-primary': { light: '#1a1a1a', dark: '#eaeaea' },
                    '--color-text-secondary': { light: '#5c5c5c', dark: '#a0a0a0' },
                    '--color-accent-primary': { light: '#ff7f50', dark: '#08f7fe' },
                    '--color-accent-secondary': { light: '#007bff', dark: '#f50057' },
                    '--color-accent-tertiary': { light: '#32cd32', dark: '#00ff9f' },
                    '--color-accent-error': { light: '#d90429', dark: '#ff073a' },
                    '--color-glow': { light: 'rgba(255, 127, 80, 0.5)', dark: 'rgba(8, 247, 254, 0.5)' },
                    '--color-grid': { light: 'rgba(26, 26, 26, 0.15)', dark: 'rgba(234, 234, 234, 0.1)' },
                    '--color-horizon-sun': { light: '#ff7f50', dark: '#08f7fe' },
                    '--color-horizon-hills': { light: '#007bff', dark: '#08f7fe' },
                    '--color-stars': { light: '#1a1a1a', dark: '#eaeaea' },
                }
            },
            {
                name: 'Minimal',
                colors: {
                    '--color-background-base': { light: '#ffffff', dark: '#111111' },
                    '--color-background-secondary': { light: '#f5f5f5', dark: '#1e1e1e' },
                    '--color-background-tertiary': { light: '#eeeeee', dark: '#2a2a2a' },
                    '--color-text-primary': { light: '#212121', dark: '#e0e0e0' },
                    '--color-text-secondary': { light: '#757575', dark: '#9e9e9e' },
                    '--color-accent-primary': { light: '#007acc', dark: '#3399ff' },
                    '--color-accent-secondary': { light: '#c53929', dark: '#ff5555' },
                    '--color-accent-tertiary': { light: '#388e3c', dark: '#66bb6a' },
                    '--color-accent-error': { light: '#d32f2f', dark: '#ef5350' },
                    '--color-glow': { light: 'rgba(0, 122, 204, 0.4)', dark: 'rgba(51, 153, 255, 0.4)' },
                    '--color-grid': { light: 'rgba(0, 0, 0, 0.1)', dark: 'rgba(255, 255, 255, 0.1)' },
                }
            }
        ]
    },
    {
        category: 'Futuristic',
        themes: [
            {
                name: 'Cyberpunk',
                colors: {
                    '--color-background-base': { light: '#EAEAEA', dark: '#0a0a0a' },
                    '--color-background-secondary': { light: '#FFFFFF', dark: '#141414' },
                    '--color-background-tertiary': { light: '#D1D5DB', dark: '#222222' },
                    '--color-text-primary': { light: '#111827', dark: '#eaeaea' },
                    '--color-text-secondary': { light: '#4B5563', dark: '#a0a0a0' },
                    '--color-accent-primary': { light: '#00B8C4', dark: '#08f7fe' },
                    '--color-accent-secondary': { light: '#D9005B', dark: '#f50057' },
                    '--color-accent-tertiary': { light: '#39FF14', dark: '#00ff9f' },
                    '--color-accent-error': { light: '#EF4444', dark: '#ff073a' },
                    '--color-glow': { light: 'rgba(0, 184, 196, 0.5)', dark: 'rgba(8, 247, 254, 0.5)' },
                    '--color-grid': { light: 'rgba(17, 24, 39, 0.15)', dark: 'rgba(234, 234, 234, 0.1)' },
                    '--color-horizon-sun': { light: '#D9005B', dark: '#08f7fe' },
                    '--color-horizon-hills': { light: '#00B8C4', dark: '#08f7fe' },
                    '--color-stars': { light: '#111827', dark: '#eaeaea' }
                }
            },
            {
                name: 'Synthwave',
                colors: {
                    '--color-background-base': { light: '#FADADD', dark: '#1A103C' },
                    '--color-background-secondary': { light: '#FFFFFF', dark: '#2A1A4C' },
                    '--color-background-tertiary': { light: '#FFE4E1', dark: '#3A2A5C' },
                    '--color-text-primary': { light: '#3D0B4F', dark: '#F0F0F0' },
                    '--color-text-secondary': { light: '#5d3d74', dark: '#b0a8d9' },
                    '--color-accent-primary': { light: '#FF6AC1', dark: '#FF4F8B' },
                    '--color-accent-secondary': { light: '#18DCFF', dark: '#00E5FF' },
                    '--color-accent-tertiary': { light: '#FFCB47', dark: '#F2E74B' },
                    '--color-accent-error': { light: '#E11D48', dark: '#FF2E63' },
                    '--color-glow': { light: 'rgba(255, 106, 193, 0.5)', dark: 'rgba(255, 79, 139, 0.5)' },
                    '--color-grid': { light: 'rgba(61, 11, 79, 0.15)', dark: 'rgba(240, 240, 240, 0.1)' },
                    '--color-horizon-sun': { light: '#FFCB47', dark: '#F2E74B' },
                    '--color-horizon-hills': { light: '#FF6AC1', dark: '#FF4F8B' },
                    '--color-stars': { light: '#3D0B4F', dark: '#F0F0F0' }
                }
            }
        ]
    },
    {
        category: 'Developer',
        themes: [
             {
                name: 'Nord',
                colors: {
                    '--color-background-base': { light: '#ECEFF4', dark: '#2E3440' },
                    '--color-background-secondary': { light: '#FFFFFF', dark: '#3B4252' },
                    '--color-background-tertiary': { light: '#E5E9F0', dark: '#434C5E' },
                    '--color-text-primary': { light: '#2E3440', dark: '#ECEFF4' },
                    '--color-text-secondary': { light: '#4C566A', dark: '#D8DEE9' },
                    '--color-accent-primary': { light: '#5E81AC', dark: '#88C0D0' },
                    '--color-accent-secondary': { light: '#B48EAD', dark: '#B48EAD' },
                    '--color-accent-tertiary': { light: '#A3BE8C', dark: '#A3BE8C' },
                    '--color-accent-error': { light: '#BF616A', dark: '#BF616A' },
                    '--color-glow': { light: 'rgba(94, 129, 172, 0.4)', dark: 'rgba(136, 192, 208, 0.4)' },
                    '--color-grid': { light: 'rgba(46, 52, 64, 0.1)', dark: 'rgba(236, 239, 244, 0.1)' },
                    '--color-horizon-sun': { light: '#EBCB8B', dark: '#EBCB8B' },
                    '--color-horizon-hills': { light: '#5E81AC', dark: '#88C0D0' },
                    '--color-stars': { light: '#2E3440', dark: '#ECEFF4' }
                }
            },
            {
                name: 'Solarized',
                colors: {
                    '--color-background-base': { light: '#fdf6e3', dark: '#002b36' },
                    '--color-background-secondary': { light: '#eee8d5', dark: '#073642' },
                    '--color-background-tertiary': { light: '#e7e1cf', dark: '#104350' },
                    '--color-text-primary': { light: '#586e75', dark: '#839496' },
                    '--color-text-secondary': { light: '#93a1a1', dark: '#586e75' },
                    '--color-accent-primary': { light: '#268bd2', dark: '#268bd2' },
                    '--color-accent-secondary': { light: '#d33682', dark: '#d33682' },
                    '--color-accent-tertiary': { light: '#859900', dark: '#859900' },
                    '--color-accent-error': { light: '#dc322f', dark: '#dc322f' },
                    '--color-glow': { light: 'rgba(38, 139, 210, 0.4)', dark: 'rgba(38, 139, 210, 0.4)' },
                    '--color-grid': { light: 'rgba(88, 110, 117, 0.15)', dark: 'rgba(131, 148, 150, 0.15)' },
                    '--color-horizon-sun': { light: '#b58900', dark: '#b58900' },
                    '--color-horizon-hills': { light: '#268bd2', dark: '#268bd2' },
                    '--color-stars': { light: '#586e75', dark: '#839496' }
                }
            },
            {
                name: 'Gruvbox',
                colors: {
                    '--color-background-base': { light: '#fbf1c7', dark: '#282828' },
                    '--color-background-secondary': { light: '#ebdbb2', dark: '#3c3836' },
                    '--color-background-tertiary': { light: '#d5c4a1', dark: '#504945' },
                    '--color-text-primary': { light: '#3c3836', dark: '#ebdbb2' },
                    '--color-text-secondary': { light: '#7c6f64', dark: '#bdae93' },
                    '--color-accent-primary': { light: '#427b58', dark: '#8ec07c' },
                    '--color-accent-secondary': { light: '#af3a03', dark: '#fe8019' },
                    '--color-accent-tertiary': { light: '#b57614', dark: '#fabd2f' },
                    '--color-accent-error': { light: '#9d0006', dark: '#cc241d' },
                    '--color-glow': { light: 'rgba(175, 58, 3, 0.4)', dark: 'rgba(254, 128, 25, 0.4)' },
                    '--color-grid': { light: 'rgba(60, 56, 54, 0.15)', dark: 'rgba(235, 219, 178, 0.1)' },
                    '--color-horizon-sun': { light: '#b57614', dark: '#fabd2f' },
                    '--color-horizon-hills': { light: '#427b58', dark: '#8ec07c' },
                    '--color-stars': { light: '#3c3836', dark: '#ebdbb2' }
                }
            },
            {
                name: 'Dracula',
                colors: {
                    '--color-background-base': { light: '#f8f8f2', dark: '#282a36' },
                    '--color-background-secondary': { light: '#e9e9e5', dark: '#44475a' },
                    '--color-background-tertiary': { light: '#d1d1cc', dark: '#21222C' },
                    '--color-text-primary': { light: '#282a36', dark: '#f8f8f2' },
                    '--color-text-secondary': { light: '#6272a4', dark: '#bd93f9' },
                    '--color-accent-primary': { light: '#00a1b8', dark: '#8be9fd' },
                    '--color-accent-secondary': { light: '#ff55b8', dark: '#ff79c6' },
                    '--color-accent-tertiary': { light: '#3dcc4a', dark: '#50fa7b' },
                    '--color-accent-error': { light: '#ff5555', dark: '#ff5555' },
                    '--color-glow': { light: 'rgba(255, 85, 184, 0.4)', dark: 'rgba(139, 233, 253, 0.4)' },
                    '--color-grid': { light: 'rgba(40, 42, 54, 0.15)', dark: 'rgba(248, 248, 242, 0.1)' },
                    '--color-horizon-sun': { light: '#ffb86c', dark: '#f1fa8c' },
                    '--color-horizon-hills': { light: '#00a1b8', dark: '#8be9fd' },
                    '--color-stars': { light: '#282a36', dark: '#f8f8f2' }
                }
            },
             {
                name: 'Matrix',
                colors: {
                    '--color-background-base': { light: '#F0FFF0', dark: '#000000' },
                    '--color-background-secondary': { light: '#FFFFFF', dark: '#0D0D0D' },
                    '--color-background-tertiary': { light: '#d4e6d4', dark: '#1A1A1A' },
                    '--color-text-primary': { light: '#00590D', dark: '#39FF14' },
                    '--color-text-secondary': { light: '#008F11', dark: '#00C136' },
                    '--color-accent-primary': { light: '#008F11', dark: '#39FF14' },
                    '--color-accent-secondary': { light: '#00590D', dark: '#00FF41' },
                    '--color-accent-tertiary': { light: '#00C136', dark: '#008F11' },
                    '--color-accent-error': { light: '#990000', dark: '#C10000' },
                    '--color-glow': { light: 'rgba(0, 143, 17, 0.5)', dark: 'rgba(57, 255, 20, 0.5)' },
                    '--color-grid': { light: 'rgba(0, 89, 13, 0.15)', dark: 'rgba(57, 255, 20, 0.15)' },
                    '--color-horizon-sun': { light: '#00C136', dark: '#39FF14' },
                    '--color-horizon-hills': { light: '#008F11', dark: '#00FF41' },
                    '--color-stars': { light: '#00590D', dark: '#39FF14' }
                }
            }
        ]
    },
    {
        category: 'Editor & UI Kits',
        themes: [
            {
                name: 'Monokai',
                colors: {
                    '--color-background-base': { light: '#F9F8F5', dark: '#272822' },
                    '--color-background-secondary': { light: '#FFFFFF', dark: '#3E3D32' },
                    '--color-background-tertiary': { light: '#F2F1ED', dark: '#1E1E1E' },
                    '--color-text-primary': { light: '#3A3A3A', dark: '#F8F8F2' },
                    '--color-text-secondary': { light: '#75715E', dark: '#75715E' },
                    '--color-accent-primary': { light: '#66D9EF', dark: '#66D9EF' },
                    '--color-accent-secondary': { light: '#F92672', dark: '#F92672' },
                    '--color-accent-tertiary': { light: '#A6E22E', dark: '#A6E22E' },
                    '--color-accent-error': { light: '#F92672', dark: '#F92672' },
                    '--color-glow': { light: 'rgba(102, 217, 239, 0.5)', dark: 'rgba(249, 38, 114, 0.5)' },
                    '--color-grid': { light: 'rgba(58, 58, 58, 0.15)', dark: 'rgba(248, 248, 242, 0.1)' },
                    '--color-horizon-sun': { light: '#E6DB74', dark: '#E6DB74' },
                    '--color-horizon-hills': { light: '#66D9EF', dark: '#66D9EF' },
                    '--color-stars': { light: '#3A3A3A', dark: '#F8F8F2' }
                }
            },
            {
                name: 'Material',
                colors: {
                    '--color-background-base': { light: '#ECEFF1', dark: '#263238' },
                    '--color-background-secondary': { light: '#FFFFFF', dark: '#37474F' },
                    '--color-background-tertiary': { light: '#CFD8DC', dark: '#455A64' },
                    '--color-text-primary': { light: '#263238', dark: '#ECEFF1' },
                    '--color-text-secondary': { light: '#546E7A', dark: '#B0BEC5' },
                    '--color-accent-primary': { light: '#2196F3', dark: '#64B5F6' },
                    '--color-accent-secondary': { light: '#E91E63', dark: '#F06292' },
                    '--color-accent-tertiary': { light: '#4CAF50', dark: '#81C784' },
                    '--color-accent-error': { light: '#F44336', dark: '#E57373' },
                    '--color-glow': { light: 'rgba(33, 150, 243, 0.5)', dark: 'rgba(100, 181, 246, 0.4)' },
                    '--color-grid': { light: 'rgba(38, 50, 56, 0.1)', dark: 'rgba(236, 239, 241, 0.1)' },
                    '--color-horizon-sun': { light: '#FF9800', dark: '#FFB74D' },
                    '--color-horizon-hills': { light: '#2196F3', dark: '#64B5F6' },
                    '--color-stars': { light: '#263238', dark: '#ECEFF1' }
                }
            },
            {
                name: 'Ayu',
                colors: {
                    '--color-background-base': { light: '#FAFAFA', dark: '#0F1419' },
                    '--color-background-secondary': { light: '#FFFFFF', dark: '#131920' },
                    '--color-background-tertiary': { light: '#F2F2F2', dark: '#232930' },
                    '--color-text-primary': { light: '#5C6166', dark: '#CBCCC6' },
                    '--color-text-secondary': { light: '#8A9199', dark: '#6C737C' },
                    '--color-accent-primary': { light: '#36A3D9', dark: '#73D0FF' },
                    '--color-accent-secondary': { light: '#F07171', dark: '#FF7777' },
                    '--color-accent-tertiary': { light: '#86B300', dark: '#BAE67E' },
                    '--color-accent-error': { light: '#D95757', dark: '#F26D78' },
                    '--color-glow': { light: 'rgba(54, 163, 217, 0.5)', dark: 'rgba(115, 208, 255, 0.4)' },
                    '--color-grid': { light: 'rgba(92, 97, 102, 0.1)', dark: 'rgba(203, 204, 198, 0.1)' },
                    '--color-horizon-sun': { light: '#F29718', dark: '#FFD580' },
                    '--color-horizon-hills': { light: '#36A3D9', dark: '#73D0FF' },
                    '--color-stars': { light: '#5C6166', dark: '#CBCCC6' }
                }
            }
        ]
    },
    {
        category: 'Nature',
        themes: [
            {
                name: 'Forest Whisper',
                colors: {
                    '--color-background-base': { light: '#F5F5DC', dark: '#1A2A2A' },
                    '--color-background-secondary': { light: '#FFFFFF', dark: '#2A3A3A' },
                    '--color-background-tertiary': { light: '#E8E8D8', dark: '#3A4A4A' },
                    '--color-text-primary': { light: '#3B322C', dark: '#E0E0E0' },
                    '--color-text-secondary': { light: '#6B5B51', dark: '#A0A0A0' },
                    '--color-accent-primary': { light: '#556B2F', dark: '#8FBC8F' },
                    '--color-accent-secondary': { light: '#8B4513', dark: '#D2B48C' },
                    '--color-accent-tertiary': { light: '#228B22', dark: '#32CD32' },
                    '--color-accent-error': { light: '#B22222', dark: '#FF6347' },
                    '--color-glow': { light: 'rgba(85, 107, 47, 0.5)', dark: 'rgba(143, 188, 143, 0.5)' },
                    '--color-grid': { light: 'rgba(59, 50, 44, 0.15)', dark: 'rgba(224, 224, 224, 0.1)' },
                    '--color-horizon-sun': { light: '#FFD700', dark: '#F0E68C' },
                    '--color-horizon-hills': { light: '#556B2F', dark: '#8FBC8F' },
                    '--color-stars': { light: '#3B322C', dark: '#E0E0E0' }
                }
            },
            {
                name: 'Ocean Depths',
                colors: {
                    '--color-background-base': { light: '#F0F8FF', dark: '#001F3F' },
                    '--color-background-secondary': { light: '#FFFFFF', dark: '#002A54' },
                    '--color-background-tertiary': { light: '#E6F2FF', dark: '#00356B' },
                    '--color-text-primary': { light: '#004080', dark: '#E6F2FF' },
                    '--color-text-secondary': { light: '#4682B4', dark: '#B0C4DE' },
                    '--color-accent-primary': { light: '#FF7F50', dark: '#00BFFF' },
                    '--color-accent-secondary': { light: '#20B2AA', dark: '#7FFFD4' },
                    '--color-accent-tertiary': { light: '#4169E1', dark: '#AFEEEE' },
                    '--color-accent-error': { light: '#FF6347', dark: '#FF7F7F' },
                    '--color-glow': { light: 'rgba(255, 127, 80, 0.5)', dark: 'rgba(0, 191, 255, 0.5)' },
                    '--color-grid': { light: 'rgba(0, 64, 128, 0.15)', dark: 'rgba(230, 242, 255, 0.1)' },
                    '--color-horizon-sun': { light: '#FFD700', dark: '#E0FFFF' },
                    '--color-horizon-hills': { light: '#4682B4', dark: '#00BFFF' },
                    '--color-stars': { light: '#004080', dark: '#E6F2FF' }
                }
            }
        ]
    },
    {
        category: 'Monochromatic',
        themes: [
            {
                name: 'Slate',
                colors: {
                    '--color-background-base': { light: '#F8F9FA', dark: '#212529' },
                    '--color-background-secondary': { light: '#FFFFFF', dark: '#343A40' },
                    '--color-background-tertiary': { light: '#E9ECEF', dark: '#495057' },
                    '--color-text-primary': { light: '#212529', dark: '#F8F9FA' },
                    '--color-text-secondary': { light: '#6C757D', dark: '#CED4DA' },
                    '--color-accent-primary': { light: '#495057', dark: '#FFFFFF' },
                    '--color-accent-secondary': { light: '#343A40', dark: '#F8F9FA' },
                    '--color-accent-tertiary': { light: '#212529', dark: '#E9ECEF' },
                    '--color-accent-error': { light: '#DC3545', dark: '#FF6B6B' },
                    '--color-glow': { light: 'rgba(73, 80, 87, 0.4)', dark: 'rgba(255, 255, 255, 0.4)' },
                    '--color-grid': { light: 'rgba(33, 37, 41, 0.15)', dark: 'rgba(248, 249, 250, 0.1)' },
                    '--color-horizon-sun': { light: '#212529', dark: '#FFFFFF' },
                    '--color-horizon-hills': { light: '#495057', dark: '#F8F9FA' },
                    '--color-stars': { light: '#212529', dark: '#F8F9FA' }
                }
            },
            {
                name: 'Sepia Tone',
                colors: {
                    '--color-background-base': { light: '#FBF0D9', dark: '#4A3F35' },
                    '--color-background-secondary': { light: '#FFFFFF', dark: '#5D4F43' },
                    '--color-background-tertiary': { light: '#F5EAD6', dark: '#706051' },
                    '--color-text-primary': { light: '#5D4F43', dark: '#DCD0C0' },
                    '--color-text-secondary': { light: '#8C7D6F', dark: '#A69888' },
                    '--color-accent-primary': { light: '#A0522D', dark: '#DEB887' },
                    '--color-accent-secondary': { light: '#8B4513', dark: '#F4A460' },
                    '--color-accent-tertiary': { light: '#CD853F', dark: '#FFD700' },
                    '--color-accent-error': { light: '#A52A2A', dark: '#FFA07A' },
                    '--color-glow': { light: 'rgba(160, 82, 45, 0.5)', dark: 'rgba(222, 184, 135, 0.5)' },
                    '--color-grid': { light: 'rgba(93, 79, 67, 0.15)', dark: 'rgba(220, 208, 192, 0.1)' },
                    '--color-horizon-sun': { light: '#A0522D', dark: '#DEB887' },
                    '--color-horizon-hills': { light: '#8B4513', dark: '#F4A460' },
                    '--color-stars': { light: '#5D4F43', dark: '#DCD0C0' }
                }
            }
        ]
    }
];