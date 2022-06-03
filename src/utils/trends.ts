export type Trend = "up" | "down" | "same";

export const determineTrend = (current: number, updated: number): Trend => {
  if (updated > current) return "up";
  if (updated < current) return "down";
  return "same";
};
