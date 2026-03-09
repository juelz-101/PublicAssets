/**
 * The golden ratio constant.
 */
const PHI = 1.61803398875;

export interface GoldenRatioSplit {
  major: number;
  minor: number;
}

/**
 * Calculates the major and minor segments of a total dimension based on the golden ratio.
 * @param total The total width or height.
 * @returns An object containing the `major` and `minor` segment sizes.
 */
export const calculateGoldenRatio = (total: number): GoldenRatioSplit => {
  if (total <= 0) {
    return { major: 0, minor: 0 };
  }
  const major = total / PHI;
  const minor = total - major;
  return { major, minor };
};
