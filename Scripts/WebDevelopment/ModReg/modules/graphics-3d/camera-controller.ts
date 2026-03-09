
import type { PerspectiveCamera } from './scene-manager';

export class OrbitController {
    private element: HTMLElement;
    private camera: PerspectiveCamera;
    private isMouseDown = false;
    private lastMouseX = 0;
    private lastMouseY = 0;

    constructor(camera: PerspectiveCamera, element: HTMLElement) {
        this.camera = camera;
        this.element = element;

        this.element.addEventListener('mousedown', this.onMouseDown);
        this.element.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);
        this.element.addEventListener('wheel', this.onWheel);
    }

    private onMouseDown = (event: MouseEvent) => {
        event.preventDefault();
        this.isMouseDown = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    };

    private onMouseMove = (event: MouseEvent) => {
        if (!this.isMouseDown) return;
        event.preventDefault();
        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;

        this.camera.rotateY(deltaX * 0.01);
        this.camera.rotateX(deltaY * 0.01);

        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    };

    private onMouseUp = () => {
        this.isMouseDown = false;
    };

    private onWheel = (event: WheelEvent) => {
        event.preventDefault();
        const zoomAmount = event.deltaY * 0.5;
        this.camera.zoom(zoomAmount);
    };

    public dispose = () => {
        this.element.removeEventListener('mousedown', this.onMouseDown);
        this.element.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
        this.element.removeEventListener('wheel', this.onWheel);
    };
}

export const createOrbitController = (camera: PerspectiveCamera, element: HTMLElement): OrbitController => {
    return new OrbitController(camera, element);
};
