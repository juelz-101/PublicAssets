
import type { Vector3, Edge, Geometry } from './geometry-primitives';

export interface SceneObject {
    geometry: Geometry;
    position: Vector3;
    rotation: Vector3; // Euler angles in radians
}

export class PerspectiveCamera {
    public rotation: Vector3 = { x: -0.5, y: -0.5, z: 0 };
    public distance: number = 400;
    public fov: number = 75;

    public rotateY(angle: number) { this.rotation.y += angle; }
    public rotateX(angle: number) { this.rotation.x += angle; }
    public zoom(amount: number) { this.distance = Math.max(100, this.distance + amount); }
}

export class SceneManager {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    public objects: SceneObject[] = [];
    public camera: PerspectiveCamera;
    public focalLength: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) throw new Error("Could not get 2D context");
        this.ctx = context;
        this.camera = new PerspectiveCamera();
        this.focalLength = this.canvas.width / 2 / Math.tan((this.camera.fov / 2) * Math.PI / 180);
    }

    public addObject(object: SceneObject): void {
        this.objects.push(object);
    }

    private project(point3d: Vector3): { x: number, y: number } | null {
        const { x, y, z } = point3d;
        
        const cosX = Math.cos(this.camera.rotation.x);
        const sinX = Math.sin(this.camera.rotation.x);
        const cosY = Math.cos(this.camera.rotation.y);
        const sinY = Math.sin(this.camera.rotation.y);
        
        const y1 = y * cosX - z * sinX;
        const z1 = y * sinX + z * cosX;
        const x2 = x * cosY + z1 * sinY;
        const z2 = -x * sinY + z1 * cosY;

        const finalZ = z2 - this.camera.distance;
        if (finalZ >= -this.focalLength * 0.1) return null;

        const scale = this.focalLength / -finalZ;
        const screenX = this.canvas.width / 2 + x2 * scale;
        const screenY = this.canvas.height / 2 + y1 * scale;

        return { x: screenX, y: screenY };
    }

    public render(): void {
        this.ctx.fillStyle = 'var(--color-background-base)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = 'var(--color-accent-primary)';
        this.ctx.lineWidth = 1.5;

        for (const object of this.objects) {
            const cosRx = Math.cos(object.rotation.x);
            const sinRx = Math.sin(object.rotation.x);
            const cosRy = Math.cos(object.rotation.y);
            const sinRy = Math.sin(object.rotation.y);
            const cosRz = Math.cos(object.rotation.z);
            const sinRz = Math.sin(object.rotation.z);
            
            const transformedVertices = object.geometry.vertices.map(v => {
                let x_ = v.x, y_ = v.y, z_ = v.z;

                // Y rotation
                let x1 = x_ * cosRy - z_ * sinRy;
                let z1 = x_ * sinRy + z_ * cosRy;
                x_ = x1; z_ = z1;

                // X rotation
                let y2 = y_ * cosRx - z_ * sinRx;
                let z2 = y_ * sinRx + z_ * cosRx;
                y_ = y2; z_ = z2;

                 // Z rotation
                let x3 = x_ * cosRz - y_ * sinRz;
                let y3 = x_ * sinRz + y_ * cosRz;
                x_ = x3; y_ = y3;
                
                return {
                    x: x_ + object.position.x,
                    y: y_ + object.position.y,
                    z: z_ + object.position.z
                };
            });
            
            const projectedVertices = transformedVertices.map(v => this.project(v));

            this.ctx.beginPath();
            for (const edge of object.geometry.edges) {
                const v1 = projectedVertices[edge[0]];
                const v2 = projectedVertices[edge[1]];
                if (v1 && v2) {
                    this.ctx.moveTo(v1.x, v1.y);
                    this.ctx.lineTo(v2.x, v2.y);
                }
            }
            this.ctx.stroke();
        }
    }
}
