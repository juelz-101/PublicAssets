
// A helper class to store node information for the A* algorithm
class PathNode {
    public x: number;
    public y: number;
    public gCost: number = 0; // Distance from the starting node
    public hCost: number = 0; // Heuristic distance to the end node
    public fCost: number = 0; // gCost + hCost
    public parent: PathNode | null = null;
    public isWall: boolean = false;

    constructor(x: number, y: number, isWall: boolean = false) {
        this.x = x;
        this.y = y;
        this.isWall = isWall;
    }

    calculateFCost() {
        this.fCost = this.gCost + this.hCost;
    }
}

// Type definitions for the generator's yielded value
export interface GridPoint {
    x: number;
    y: number;
}

export interface PathfindingStep {
    openSet: GridPoint[];
    closedSet: GridPoint[];
    path: GridPoint[];
    currentNode?: GridPoint;
    complete: boolean;
}

// Heuristic function (Manhattan distance)
const calculateHCost = (a: PathNode, b: PathNode): number => {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return dx + dy;
};

// Function to reconstruct the path from the end node
const reconstructPath = (endNode: PathNode): GridPoint[] => {
    const path: GridPoint[] = [];
    let currentNode: PathNode | null = endNode;
    while (currentNode !== null) {
        path.push({ x: currentNode.x, y: currentNode.y });
        currentNode = currentNode.parent;
    }
    return path.reverse();
};

/**
 * A generator that yields each step of the A* search algorithm.
 * @param grid A 2D array where 0 is walkable and 1 is a wall.
 * @param start The starting coordinate.
 * @param end The ending coordinate.
 */
export function* findPathAStar(grid: number[][], start: GridPoint, end: GridPoint): Generator<PathfindingStep> {
    const width = grid[0].length;
    const height = grid.length;

    const pathGrid: PathNode[][] = Array.from({ length: height }, (_, y) =>
        Array.from({ length: width }, (_, x) => new PathNode(x, y, grid[y][x] === 1))
    );

    const startNode = pathGrid[start.y][start.x];
    const endNode = pathGrid[end.y][end.x];

    const openSet: PathNode[] = [startNode];
    const closedSet: Set<PathNode> = new Set();

    startNode.hCost = calculateHCost(startNode, endNode);
    startNode.calculateFCost();

    while (openSet.length > 0) {
        // Find the node with the lowest fCost in the open set
        let currentNode = openSet[0];
        for (let i = 1; i < openSet.length; i++) {
            if (openSet[i].fCost < currentNode.fCost || (openSet[i].fCost === currentNode.fCost && openSet[i].hCost < currentNode.hCost)) {
                currentNode = openSet[i];
            }
        }
        
        // Yield the current state for visualization
        yield {
            openSet: openSet.map(n => ({ x: n.x, y: n.y })),
            closedSet: Array.from(closedSet).map(n => ({ x: n.x, y: n.y })),
            path: [],
            currentNode: { x: currentNode.x, y: currentNode.y },
            complete: false
        };

        // Move current node from open to closed set
        const currentIndex = openSet.indexOf(currentNode);
        openSet.splice(currentIndex, 1);
        closedSet.add(currentNode);

        // Path found
        if (currentNode === endNode) {
            yield { openSet: [], closedSet: [], path: reconstructPath(endNode), complete: true };
            return;
        }

        // Get neighbors
        const neighbors: PathNode[] = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue; // Skip self
                 // To disallow diagonal movement, uncomment the following line
                 // if (Math.abs(dx) === 1 && Math.abs(dy) === 1) continue;

                const checkX = currentNode.x + dx;
                const checkY = currentNode.y + dy;

                if (checkX >= 0 && checkX < width && checkY >= 0 && checkY < height) {
                    neighbors.push(pathGrid[checkY][checkX]);
                }
            }
        }

        for (const neighbor of neighbors) {
            if (neighbor.isWall || closedSet.has(neighbor)) {
                continue;
            }

            const newGCost = currentNode.gCost + calculateHCost(currentNode, neighbor);
            if (newGCost < neighbor.gCost || !openSet.includes(neighbor)) {
                neighbor.gCost = newGCost;
                neighbor.hCost = calculateHCost(neighbor, endNode);
                neighbor.calculateFCost();
                neighbor.parent = currentNode;

                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                }
            }
        }
    }

    // No path found
    yield { openSet: [], closedSet: Array.from(closedSet).map(n => ({ x: n.x, y: n.y })), path: [], complete: true };
}
