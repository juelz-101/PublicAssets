export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

// --- Helper Vector type for polygon collisions ---
interface Vector {
    x: number;
    y: number;
}


/**
 * Checks if a point is inside a rectangle.
 * @param point The point to check.
 * @param rect The rectangle.
 * @returns True if the point is inside the rectangle, false otherwise.
 */
export const pointInRect = (point: Point, rect: Rect): boolean => {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
};

/**
 * Checks if a point is inside a circle.
 * @param point The point to check.
 * @param circle The circle.
 * @returns True if the point is inside the circle, false otherwise.
 */
export const pointInCircle = (point: Point, circle: Circle): boolean => {
  const dx = point.x - circle.x;
  const dy = point.y - circle.y;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
};

/**
 * Checks for collision between two Axis-Aligned Bounding Boxes (AABBs).
 * @param rect1 The first rectangle.
 * @param rect2 The second rectangle.
 * @returns True if the rectangles are colliding, false otherwise.
 */
export const rectToRect = (rect1: Rect, rect2: Rect): boolean => {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
};

/**
 * Checks for collision between two circles.
 * @param circle1 The first circle.
 * @param circle2 The second circle.
 * @returns True if the circles are colliding, false otherwise.
 */
export const circleToCircle = (circle1: Circle, circle2: Circle): boolean => {
  const dx = circle1.x - circle2.x;
  const dy = circle1.y - circle2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < circle1.radius + circle2.radius;
};

/**
 * Checks for collision between a rectangle and a circle.
 * @param rect The rectangle.
 * @param circle The circle.
 * @returns True if they are colliding, false otherwise.
 */
export const rectToCircle = (rect: Rect, circle: Circle): boolean => {
  // Find the closest point on the rectangle to the center of the circle
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

  // Calculate the distance between the closest point and the circle's center
  const distanceX = circle.x - closestX;
  const distanceY = circle.y - closestY;

  // If the distance is less than the circle's radius, there's a collision
  return (distanceX * distanceX + distanceY * distanceY) < (circle.radius * circle.radius);
};

/**
 * Checks if a point is inside a convex or concave polygon using the ray-casting algorithm.
 * @param point The point to check.
 * @param polygon An array of points representing the polygon's vertices in order.
 * @returns True if the point is inside the polygon, false otherwise.
 */
export const pointInPolygon = (point: Point, polygon: Point[]): boolean => {
    let isInside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;

        const intersect = ((yi > point.y) !== (yj > point.y))
            && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) isInside = !isInside;
    }
    return isInside;
};


// --- SAT (Separating Axis Theorem) Helpers ---

const getAxes = (polygon: Point[]): Vector[] => {
    const axes: Vector[] = [];
    for (let i = 0; i < polygon.length; i++) {
        const p1 = polygon[i];
        const p2 = polygon[i + 1 === polygon.length ? 0 : i + 1];
        const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
        // Get the perpendicular vector (normal)
        const normal = { x: -edge.y, y: edge.x };
        axes.push(normal);
    }
    return axes;
};

const project = (polygon: Point[], axis: Vector): { min: number, max: number } => {
    let min = Infinity;
    let max = -Infinity;
    for (const point of polygon) {
        // Dot product to project the point onto the axis
        const projection = point.x * axis.x + point.y * axis.y;
        if (projection < min) min = projection;
        if (projection > max) max = projection;
    }
    return { min, max };
};

/**
 * Checks for collision between two convex polygons using the Separating Axis Theorem.
 * @param poly1 The vertices of the first polygon.
 * @param poly2 The vertices of the second polygon.
 * @returns True if they are colliding, false otherwise.
 */
export const polygonToPolygon = (poly1: Point[], poly2: Point[]): boolean => {
    const axes1 = getAxes(poly1);
    const axes2 = getAxes(poly2);

    for (const axis of [...axes1, ...axes2]) {
        const p1 = project(poly1, axis);
        const p2 = project(poly2, axis);

        // If there is no overlap on this axis, they can't be colliding
        if (p1.max < p2.min || p2.max < p1.min) {
            return false;
        }
    }
    // If we found no separating axis, they must be colliding
    return true;
};


/**
 * Checks for collision between a polygon and a rectangle using the Separating Axis Theorem.
 * @param polygon The polygon's vertices.
 * @param rect The rectangle.
 * @returns True if they are colliding, false otherwise.
 */
export const polygonToRect = (polygon: Point[], rect: Rect): boolean => {
    const rectPolygon: Point[] = [
        { x: rect.x, y: rect.y },
        { x: rect.x + rect.width, y: rect.y },
        { x: rect.x + rect.width, y: rect.y + rect.height },
        { x: rect.x, y: rect.y + rect.height },
    ];
    return polygonToPolygon(polygon, rectPolygon);
};

/**
 * Checks for collision between a polygon and a circle.
 * @param polygon The polygon's vertices.
 * @param circle The circle.
 * @returns True if they are colliding, false otherwise.
 */
export const polygonToCircle = (polygon: Point[], circle: Circle): boolean => {
    // 1. Check if any polygon vertex is inside the circle
    for (const vertex of polygon) {
        if (pointInCircle(vertex, circle)) {
            return true;
        }
    }

    // 2. Check if the circle's center is inside the polygon
    if (pointInPolygon({x: circle.x, y: circle.y}, polygon)) {
        return true;
    }

    // 3. Check for intersection with any polygon edge
    for (let i = 0; i < polygon.length; i++) {
        const p1 = polygon[i];
        const p2 = polygon[i + 1 === polygon.length ? 0 : i + 1];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const lenSq = dx * dx + dy * dy;
        
        const t = lenSq === 0 ? -1 : Math.max(0, Math.min(1, ((circle.x - p1.x) * dx + (circle.y - p1.y) * dy) / lenSq));

        const closestPoint = {
            x: p1.x + t * dx,
            y: p1.y + t * dy,
        };

        if (pointInCircle(closestPoint, circle)) {
            return true;
        }
    }

    return false;
};
