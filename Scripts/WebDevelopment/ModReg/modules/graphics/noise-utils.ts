
/*
 * A speed-improved perlin noise algorithm for 2D.
 *
 * Based on implementation by Ken Perlin. https://mrl.cs.nyu.edu/~perlin/noise/
 * Public domain.
 */
export class PerlinNoise {
    private p: number[] = new Array(512);

    constructor(seed: number = Math.random()) {
        const random = this.seededRandom(seed);
        const permutation = Array.from({ length: 256 }, (_, i) => i);

        // Shuffle the permutation array
        for (let i = permutation.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
        }

        // Duplicate the permutation array
        for (let i = 0; i < 256; i++) {
            this.p[i] = this.p[i + 256] = permutation[i];
        }
    }

    // Seedable random number generator
    private seededRandom(seed: number) {
        let s = seed;
        return function () {
            s = Math.sin(s) * 10000;
            return s - Math.floor(s);
        };
    }

    private fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    private lerp(t: number, a: number, b: number): number {
        return a + t * (b - a);
    }

    private grad(hash: number, x: number, y: number): number {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : (h === 12 || h === 14 ? x : 0);
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    /**
     * Gets the 2D Perlin noise value for a given coordinate.
     * @param x The x-coordinate.
     * @param y The y-coordinate.
     * @returns A noise value between -1 and 1.
     */
    public get(x: number, y: number): number {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);

        const u = this.fade(x);
        const v = this.fade(y);

        const p = this.p;
        const A = p[X] + Y;
        const B = p[X + 1] + Y;

        const gradAA = this.grad(p[p[A]], x, y);
        const gradAB = this.grad(p[p[A] + 1], x, y - 1);
        const gradBA = this.grad(p[p[B]], x - 1, y);
        const gradBB = this.grad(p[p[B] + 1], x - 1, y - 1);

        const lerp1 = this.lerp(u, gradAA, gradBA);
        const lerp2 = this.lerp(u, gradAB, gradBB);

        return this.lerp(v, lerp1, lerp2);
    }
}
