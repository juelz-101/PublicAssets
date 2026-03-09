/**
 * Parses an SVG string into an SVGSVGElement.
 * @param svgString The raw SVG string.
 * @returns An SVGSVGElement or null if parsing fails.
 */
export const parseSVG = (svgString: string): SVGSVGElement | null => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');
    // Check for parser errors, which browsers embed in the document
    if (svgElement && !doc.querySelector('parsererror')) {
        return svgElement;
    }
    return null;
};

/**
 * Serializes an SVGSVGElement back into a string.
 * @param svgElement The SVG element to serialize.
 * @returns The SVG string.
 */
export const serializeSVG = (svgElement: SVGSVGElement): string => {
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgElement);
};

/**
 * Applies a set of attributes to an SVG element.
 * @param element The SVG element to modify.
 * @param attributes An object of key-value pairs for attributes. Use `null` to remove an attribute.
 */
export const applyAttributes = (element: Element, attributes: Record<string, string | number | null>): void => {
    for (const [key, value] of Object.entries(attributes)) {
        if (value === null) {
            element.removeAttribute(key);
        } else {
            element.setAttribute(key, String(value));
        }
    }
};

/**
 * Converts basic SVG shapes (<rect>, <circle>, etc.) to an equivalent <path> element.
 * @param shapeElement The SVG shape element to convert.
 * @returns An SVGPathElement or the original element if conversion is not supported.
 */
export const shapeToPath = (shapeElement: SVGElement): SVGElement => {
    if (shapeElement.tagName === 'path') return shapeElement;

    let d = '';
    const tagName = shapeElement.tagName.toLowerCase();
    
    // Helper to get attribute value or a default
    const getAttr = (name: string, def: number = 0) => parseFloat(shapeElement.getAttribute(name) || String(def));

    switch (tagName) {
        case 'rect': {
            const x = getAttr('x');
            const y = getAttr('y');
            const width = getAttr('width');
            const height = getAttr('height');
            let rx = getAttr('rx');
            let ry = getAttr('ry');
            if (!rx && !ry) { // Simple rect
                d = `M${x} ${y}h${width}v${height}h${-width}z`;
            } else { // Rounded rect
                rx = rx || ry;
                ry = ry || rx;
                d = `M${x + rx} ${y} h${width - 2 * rx} a${rx},${ry} 0 0 1 ${rx},${ry} v${height - 2 * ry} a${rx},${ry} 0 0 1 ${-rx},${ry} h${-(width - 2 * rx)} a${rx},${ry} 0 0 1 ${-rx},${-ry} v${-(height - 2 * ry)} a${rx},${ry} 0 0 1 ${rx},${-ry}z`;
            }
            break;
        }
        case 'circle': {
            const cx = getAttr('cx');
            const cy = getAttr('cy');
            const r = getAttr('r');
            d = `M${cx - r},${cy} a${r},${r} 0 1,0 ${r * 2},0 a${r},${r} 0 1,0 -${r * 2},0`;
            break;
        }
        case 'ellipse': {
            const cx = getAttr('cx');
            const cy = getAttr('cy');
            const rx = getAttr('rx');
            const ry = getAttr('ry');
            d = `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${rx * 2},0 a${rx},${ry} 0 1,0 -${rx * 2},0`;
            break;
        }
        case 'line': {
            const x1 = getAttr('x1');
            const y1 = getAttr('y1');
            const x2 = getAttr('x2');
            const y2 = getAttr('y2');
            d = `M${x1} ${y1}L${x2} ${y2}`;
            break;
        }
        case 'polygon':
        case 'polyline': {
            const pointsStr = shapeElement.getAttribute('points') || '';
            const points = pointsStr.trim().split(/\s*,\s*|\s+/);
            if (points.length > 1) {
                 d = `M${points.slice(0, 2).join(' ')} L${points.slice(2).join(' ')} ${tagName === 'polygon' ? 'z' : ''}`;
            }
            break;
        }
        default:
            return shapeElement; // Return original if not convertible
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);

    // Copy over relevant attributes
    const attrsToCopy = ['fill', 'stroke', 'stroke-width', 'opacity', 'transform', 'style', 'class'];
    attrsToCopy.forEach(attr => {
        if (shapeElement.hasAttribute(attr)) {
            path.setAttribute(attr, shapeElement.getAttribute(attr)!);
        }
    });

    return path;
};


/**
 * Traverses an SVG element and converts all basic shapes to paths.
 * @param svgElement The root SVG element to traverse.
 * @returns The mutated SVGSVGElement.
 */
export const convertAllShapesToPaths = (svgElement: SVGSVGElement): SVGSVGElement => {
    const shapes = Array.from(svgElement.querySelectorAll('rect, circle, ellipse, line, polygon, polyline'));
    shapes.forEach(shape => {
        const path = shapeToPath(shape as SVGElement);
        if (path !== shape && shape.parentNode) {
            shape.parentNode.replaceChild(path, shape);
        }
    });
    return svgElement;
};

/**
 * Renders a component function into an SVG element and appends it.
 * A component function is any function that returns an SVGElement.
 * @param parent The parent SVGElement to append the component to.
 * @param componentFn The function that creates the SVG component (e.g., a function that returns an SVGGElement).
 * @param args The arguments to pass to the component function.
 * @returns The created SVGElement.
 */
export const renderComponent = <T extends (...args: any[]) => SVGElement>(
  parent: SVGSVGElement | SVGGElement,
  componentFn: T,
  ...args: Parameters<T>
): ReturnType<T> => {
  const element = componentFn(...args) as ReturnType<T>;
  parent.appendChild(element);
  return element;
};