export type Mover = {
  diff: number;
  dollars: string;
  name: string;
  percentage: string;
};

/**
 * An array that houses the movers when the script runs.
 */
export const movers: Mover[] = [];
