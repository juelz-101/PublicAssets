import { Vector, createVector, add, multiply } from './vector-utils';
import { drawCircle } from './canvas-utils';

interface Particle {
    pos: Vector;
    vel: Vector;
    lifespan: number; // in milliseconds
    age: number;
    size: number;
    color: string;
}

export interface EmitterConfig {
    x: number;
    y: number;
    particleLifespan?: number; // average lifespan in ms
    particleSpeed?: number; // average speed in px/s
    particleSize?: number; // average size in px
    gravity?: Vector;
}

export class ParticleEmitter {
    private pos: Vector;
    private particles: Particle[] = [];
    private config: Required<EmitterConfig>;

    constructor(config: EmitterConfig) {
        this.pos = createVector(config.x, config.y);
        this.config = {
            particleLifespan: 1000,
            particleSpeed: 50,
            particleSize: 5,
            gravity: createVector(0, 50),
            ...config,
        };
    }

    emit(count: number): void {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = this.config.particleSpeed * (0.5 + Math.random());
            const velocity = createVector(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );

            this.particles.push({
                pos: { ...this.pos },
                vel: velocity,
                lifespan: this.config.particleLifespan * (0.75 + Math.random() * 0.5),
                age: 0,
                size: this.config.particleSize * (0.5 + Math.random()),
                color: `hsl(${Math.random() * 60 + 180}, 100%, 75%)` // Shades of cyan/blue
            });
        }
    }

    update(deltaTime: number): void {
        const dtSeconds = deltaTime / 1000;
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.age += deltaTime;

            if (p.age >= p.lifespan) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // Apply gravity
            p.vel = add(p.vel, multiply(this.config.gravity, dtSeconds));
            // Update position
            p.pos = add(p.pos, multiply(p.vel, dtSeconds));
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.particles.forEach(p => {
            const lifeRatio = 1 - (p.age / p.lifespan);
            const alpha = Math.max(0, lifeRatio);
            const size = p.size * lifeRatio;
            
            if (size > 0) {
                 drawCircle(ctx, p.pos.x, p.pos.y, size, {
                    fillStyle: `color-mix(in srgb, ${p.color}, transparent ${100 - alpha * 100}%)`
                 });
            }
        });
    }
    
    setPosition(x: number, y: number) {
        this.pos.x = x;
        this.pos.y = y;
    }
}

export const createEmitter = (config: EmitterConfig): ParticleEmitter => {
    return new ParticleEmitter(config);
};
