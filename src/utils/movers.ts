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

export const printTopMovers = () => {
  // Take the cards that move in order to determine the top 10
  // movers based on price difference and format them for final output.
  const topMovers = movers
    .sort((a, b) => b.diff - a.diff)
    .slice(0, 10)
    .map(({ name, percentage, price }) => {
      return `${name} ${price.toFixed(2)}$ (${percentage.toFixed(2)}%)`;
    });

  console.log(topMovers.join("\n"));
};
