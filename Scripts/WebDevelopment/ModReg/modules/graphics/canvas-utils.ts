


import type { Vector } from './vector-utils';

export interface DrawOptions {
  fillStyle?: string | CanvasGradient | CanvasPattern;
  strokeStyle?: string | CanvasGradient | CanvasPattern;
  lineWidth?: number;
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
}

export interface TextOptions extends DrawOptions {
  font?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
}

export interface DrawImageOptions {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    sx?: number;
    sy?: number;
    sWidth?: number;
    sHeight?: number;
    rotation?: number; // in radians
    opacity?: number;
}


/**
 * A higher-order function to save and restore canvas context state around a drawing operation.
 * @param ctx The canvas rendering context.
 * @param callback The drawing operations to perform.
 */
export const withState = (ctx: CanvasRenderingContext2D, callback: () => void): void => {
  ctx.save();
  try {
    callback();
  } finally {
    ctx.restore();
  }
};


/**
 * Safely gets the 2D rendering context from a canvas element.
 * @param canvas The HTMLCanvasElement.
 * @returns The CanvasRenderingContext2D or null if not available.
 */
export const getContext = (canvas: HTMLCanvasElement | null): CanvasRenderingContext2D | null => {
  if (!canvas) return null;
  return canvas.getContext('2d');
};

/**
 * Clears the entire canvas.
 * @param ctx The canvas rendering context.
 */
export const clearCanvas = (ctx: CanvasRenderingContext2D): void => {
  const canvas = ctx.canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

/**
 * Draws a circle on the canvas.
 * @param ctx The canvas rendering context.
 * @param x The x-coordinate of the center.
 * @param y The y-coordinate of the center.
 * @param radius The radius of the circle.
 * @param options Optional drawing styles.
 */
export const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, options: DrawOptions = {}): void => {
  withState(ctx, () => {
    Object.assign(ctx, options);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    if (options.fillStyle) ctx.fill();
    if (options.strokeStyle) ctx.stroke();
  });
};

/**
 * Draws a rectangle on the canvas.
 * @param ctx The canvas rendering context.
 * @param x The x-coordinate of the top-left corner.
 * @param y The y-coordinate of the top-left corner.
 * @param width The width of the rectangle.
 * @param height The height of the rectangle.
 * @param options Optional drawing styles.
 */
export const drawRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, options: DrawOptions = {}): void => {
  withState(ctx, () => {
    Object.assign(ctx, options);
    if (options.fillStyle) ctx.fillRect(x, y, width, height);
    if (options.strokeStyle) ctx.strokeRect(x, y, width, height);
  });
};

/**
 * Draws a rectangle with rounded corners on the canvas.
 * @param ctx The canvas rendering context.
 * @param x The x-coordinate of the top-left corner.
 * @param y The y-coordinate of the top-left corner.
 * @param width The width of the rectangle.
 * @param height The height of the rectangle.
 * @param radius The corner radius.
 * @param options Optional drawing styles.
 */
export const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, options: DrawOptions = {}): void => {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;

    withState(ctx, () => {
        Object.assign(ctx, options);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
        if (options.fillStyle) ctx.fill();
        if (options.strokeStyle) ctx.stroke();
    });
};


/**
 * Draws a line on the canvas from (x1, y1) to (x2, y2).
 * @param ctx The canvas rendering context.
 * @param x1 The starting x-coordinate.
 * @param y1 The starting y-coordinate.
 * @param x2 The ending x-coordinate.
 * @param y2 The ending y-coordinate.
 * @param options Optional drawing styles (strokeStyle, lineWidth, etc.).
 */
export const drawLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, options: DrawOptions = {}): void => {
  withState(ctx, () => {
    Object.assign(ctx, { strokeStyle: '#000', ...options }); // Default strokeStyle
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });
};

/**
 * Draws text on the canvas.
 * @param ctx The canvas rendering context.
 * @param text The text to draw.
 * @param x The x-coordinate of the anchor point.
 * @param y The y-coordinate of the anchor point.
 * @param options Optional text and drawing styles.
 */
export const drawText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, options: TextOptions = {}): void => {
  withState(ctx, () => {
    Object.assign(ctx, options);
    if (options.fillStyle) ctx.fillText(text, x, y);
    if (options.strokeStyle) ctx.strokeText(text, x, y);
  });
};

/**
 * Draws a polygon on the canvas from an array of points.
 * @param ctx The canvas rendering context.
 * @param points An array of points, e.g., [{x: 10, y: 10}, {x: 50, y: 100}, ...].
 * @param options Optional drawing styles.
 */
export const drawPolygon = (ctx: CanvasRenderingContext2D, points: { x: number, y: number }[], options: DrawOptions = {}): void => {
  if (points.length < 2) return;

  withState(ctx, () => {
    Object.assign(ctx, options);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    if (options.fillStyle) ctx.fill();
    if (options.strokeStyle) ctx.stroke();
  });
};

/**
 * Draws an image on the canvas with support for scaling, rotation, and cropping.
 * @param ctx The canvas rendering context.
 * @param image The image source (e.g., HTMLImageElement, HTMLCanvasElement).
 * @param options Optional drawing parameters.
 */
export const drawImage = (ctx: CanvasRenderingContext2D, image: CanvasImageSource, options: DrawImageOptions = {}): void => {
    const {
        x = 0,
        y = 0,
// Fix: Cast `image` to `any` to access `width` and `height` properties.
// These exist on most `CanvasImageSource` types but not on the union type itself, resolving the type error.
        width = (image as any).width,
        height = (image as any).height,
        sx, sy, sWidth, sHeight,
        rotation = 0,
        opacity = 1
    } = options;

    withState(ctx, () => {
        ctx.globalAlpha = opacity;
        
        if (rotation) {
            const centerX = x + width / 2;
            const centerY = y + height / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(rotation);
            ctx.translate(-centerX, -centerY);
        }

        const hasCrop = sx !== undefined && sy !== undefined && sWidth !== undefined && sHeight !== undefined;

        if (hasCrop) {
            ctx.drawImage(image, sx, sy, sWidth, sHeight, x, y, width, height);
        } else {
            ctx.drawImage(image, x, y, width, height);
        }
    });
};

/**
 * Draws a vector on the canvas from the origin (0,0) of the current context.
 * Assumes the context is translated to the desired starting point of the vector.
 * @param ctx The canvas rendering context.
 * @param v The vector to draw.
 * @param color The color of the vector.
 * @param label An optional label for the vector.
 */
export const drawVector = (ctx: CanvasRenderingContext2D, v: Vector, color: string, label?: string): void => {
  drawLine(ctx, 0, 0, v.x, v.y, { strokeStyle: color, lineWidth: 2 });
  drawCircle(ctx, v.x, v.y, 4, { fillStyle: color });
  if (label) {
    drawText(ctx, label, v.x + 8, v.y, { font: '14px monospace', fillStyle: color, textBaseline: 'middle' });
  }
};
