
export interface RDSysParams {
  dA: number;     // Diffusion rate of substance A
  dB: number;     // Diffusion rate of substance B
  f: number;      // Feed rate
  k: number;      // Kill rate
  dt: number;     // Delta time (time step for simulation)
}

/**
 * Manages the grids and calculations for a Gray-Scott Reaction-Diffusion system.
 */
export class ReactionDiffusionSystem {
  public width: number;
  public height: number;
  public params: RDSysParams;

  private gridA: number[][];
  private gridB: number[][];
  private nextA: number[][];
  private nextB: number[][];

  constructor(width: number, height: number, params: RDSysParams) {
    this.width = width;
    this.height = height;
    this.params = params;

    // Initialize grids
    this.gridA = Array.from({ length: height }, () => Array(width).fill(1));
    this.gridB = Array.from({ length: height }, () => Array(width).fill(0));
    this.nextA = Array.from({ length: height }, () => Array(width).fill(1));
    this.nextB = Array.from({ length: height }, () => Array(width).fill(0));
  }

  /**
   * Adds a concentration of chemical B to a specified area.
   * @param x The center x-coordinate of the seed.
   * @param y The center y-coordinate of the seed.
   * @param radius The radius of the seed area.
   */
  seed(x: number, y: number, radius: number): void {
    const rSq = radius * radius;
    for (let i = -radius; i <= radius; i++) {
      for (let j = -radius; j <= radius; j++) {
        const px = x + i;
        const py = y + j;
        if (i * i + j * j < rSq && px >= 0 && px < this.width && py >= 0 && py < this.height) {
          this.gridB[py][px] = 1;
        }
      }
    }
  }

  private laplacian(x: number, y: number, grid: number[][]): number {
    let sum = 0;
    
    // Von Neumann neighborhood with weights
    sum += grid[y][x] * -1;
    sum += grid[y][(x - 1 + this.width) % this.width] * 0.2;
    sum += grid[y][(x + 1) % this.width] * 0.2;
    sum += grid[(y - 1 + this.height) % this.height][x] * 0.2;
    sum += grid[(y + 1) % this.height][x] * 0.2;
    
    // Diagonal neighbors
    sum += grid[(y - 1 + this.height) % this.height][(x - 1 + this.width) % this.width] * 0.05;
    sum += grid[(y - 1 + this.height) % this.height][(x + 1) % this.width] * 0.05;
    sum += grid[(y + 1) % this.height][(x - 1 + this.width) % this.width] * 0.05;
    sum += grid[(y + 1) % this.height][(x + 1) % this.width] * 0.05;

    return sum;
  }
  
  /**
   * Performs one iteration of the simulation step.
   */
  update(): void {
    const { dA, dB, f, k, dt } = this.params;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const a = this.gridA[y][x];
        const b = this.gridB[y][x];

        const laplaceA = this.laplacian(x, y, this.gridA);
        const laplaceB = this.laplacian(x, y, this.gridB);

        const reaction = a * b * b;
        
        let nextValA = a + (dA * laplaceA - reaction + f * (1 - a)) * dt;
        let nextValB = b + (dB * laplaceB + reaction - (k + f) * b) * dt;

        // Clamp values
        nextValA = Math.max(0, Math.min(1, nextValA));
        nextValB = Math.max(0, Math.min(1, nextValB));

        this.nextA[y][x] = nextValA;
        this.nextB[y][x] = nextValB;
      }
    }

    // Swap grids
    [this.gridA, this.nextA] = [this.nextA, this.gridA];
    [this.gridB, this.nextB] = [this.nextB, this.gridB];
  }

  /**
   * Returns the specified chemical grid for rendering.
   * @param chemical The chemical grid to return.
   */
  getGrid(chemical: 'A' | 'B'): number[][] {
    return chemical === 'A' ? this.gridA : this.gridB;
  }
}

/**
 * Creates a new reaction-diffusion simulation system.
 * @param width The width of the simulation grid.
 * @param height The height of the simulation grid.
 * @param params The parameters for the Gray-Scott model.
 * @returns A new ReactionDiffusionSystem instance.
 */
export const createReactionDiffusion = (width: number, height: number, params: RDSysParams): ReactionDiffusionSystem => {
    return new ReactionDiffusionSystem(width, height, params);
};
