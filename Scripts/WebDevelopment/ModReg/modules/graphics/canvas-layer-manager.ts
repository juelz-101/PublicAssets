
/**
 * Represents a single canvas layer with its own context and properties.
 */
export class Layer {
  public readonly canvas: HTMLCanvasElement;
  public readonly ctx: CanvasRenderingContext2D;
  public isVisible: boolean = true;

  constructor(public readonly name: string, width: number, height: number) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.dataset.layerName = name;
    
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error(`Failed to get 2D context for layer "${name}"`);
    }
    this.ctx = context;
  }

  /**
   * Clears the entire layer.
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Sets the visibility of the layer.
   * @param visible - Whether the layer should be visible.
   */
  setVisibility(visible: boolean): void {
    this.isVisible = visible;
    this.canvas.style.display = visible ? 'block' : 'none';
  }

  /**
   * Sets the opacity of the layer.
   * @param opacity - A value from 0 (transparent) to 1 (opaque).
   */
  setOpacity(opacity: number): void {
    this.canvas.style.opacity = String(Math.max(0, Math.min(1, opacity)));
  }

  /**
   * Sets the CSS blend mode for the layer.
   * @param mode - A valid CSS blend mode string (e.g., 'multiply', 'screen').
   */
  setBlendMode(mode: GlobalCompositeOperation): void {
    this.ctx.globalCompositeOperation = mode;
  }
}

/**
 * Manages a stack of canvas layers within a container element.
 */
export class LayerManager {
  private layers: Map<string, Layer> = new Map();
  private container: HTMLElement;
  public width: number;
  public height: number;

  /**
   * @param container - The HTML element that will hold the canvas layers.
   */
  constructor(container: HTMLElement) {
    this.container = container;
    this.container.style.position = 'relative'; // Ensure proper stacking
    this.width = container.clientWidth;
    this.height = container.clientHeight;
  }

  /**
   * Creates a new canvas layer and adds it to the manager.
   * @param name - A unique name for the layer.
   * @returns The newly created Layer instance.
   */
  createLayer(name: string): Layer {
    if (this.layers.has(name)) {
      throw new Error(`Layer with name "${name}" already exists.`);
    }
    const layer = new Layer(name, this.width, this.height);
    this.layers.set(name, layer);
    this.container.appendChild(layer.canvas);
    this.reorderLayers([...this.layers.keys()]); // Ensure z-index is set
    return layer;
  }

  /**
   * Retrieves a layer by its name.
   * @param name - The name of the layer to get.
   * @returns The Layer instance, or undefined if not found.
   */
  getLayer(name: string): Layer | undefined {
    return this.layers.get(name);
  }

  /**
   * Reorders the layers based on an array of names.
   * @param names - An array of layer names in the desired stacking order (first = bottom).
   */
  reorderLayers(names: string[]): void {
    names.forEach((name, index) => {
      const layer = this.layers.get(name);
      if (layer) {
        layer.canvas.style.zIndex = String(index);
      }
    });
  }

  /**
   * Resizes all managed layers.
   * @param width - The new width.
   * @param height - The new height.
   */
  resizeAll(width: number, height: number): void {
    this.width = width;
    this.height = height;
    for (const layer of this.layers.values()) {
      layer.canvas.width = width;
      layer.canvas.height = height;
    }
  }

  /**
   * Returns an array of all layer names.
   */
  getLayerNames(): string[] {
    return Array.from(this.layers.keys());
  }

   /**
   * Returns the container element.
   */
  getContainer(): HTMLElement {
    return this.container;
  }
}
