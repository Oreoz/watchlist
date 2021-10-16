export type Trend = "up" | "down" | "same";

export const EmojiMap: Record<Trend, string> = {
  up: "📈",
  down: "📉",
  same: "✋",
};

export const determineTrend = (currentPrice: number, newPrice: number): Trend => {
  if (newPrice > currentPrice) return "up";
  if (newPrice < currentPrice) return "down";
  return "same";
};
