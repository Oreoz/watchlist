export type Mover = {
  diff: number;
  name: string;
  percentage: number;
  price: number;
};

/**
 * An array that houses the movers when the script runs.
 */
export const movers: Mover[] = [];
