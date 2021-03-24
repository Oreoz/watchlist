import { Trend } from "../types/trend";

export const determineTrend = (currentPrice: number, newPrice: number): Trend => {
  if (newPrice > currentPrice) return "up";
  if (newPrice < currentPrice) return "down";
  return "same";
};
