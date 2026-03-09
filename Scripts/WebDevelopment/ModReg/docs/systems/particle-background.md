# Particle Background System

A high-performance, customizable particle background system for React applications.

## Features
- Canvas-based rendering for high performance.
- Customizable particle count, color, and speed.
- Interactive mouse repulsion effect.
- Responsive canvas resizing.

## Installation
Ensure you have the following modules in your project:
- `canvas-utils`
- `vector-utils`
- `color-utils`
- `animation-loop`

## Usage
```tsx
import ParticleBackgroundSystem from './app/ui/ParticleBackgroundSystem';

const MyPage = () => (
  <div className="relative h-screen">
    <ParticleBackgroundSystem 
      particleCount={200}
      particleColor="#ff00ff"
      speed={1.5}
      interactive={true}
    />
    <div className="relative z-10">
      <h1>Welcome</h1>
    </div>
  </div>
);
```

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `particleCount` | `number` | `100` | Total number of particles. |
| `particleColor` | `string` | `'#08f7fe'` | Color of the particles. |
| `speed` | `number` | `1.0` | Movement speed multiplier. |
| `interactive` | `boolean` | `true` | Enable mouse interaction. |
