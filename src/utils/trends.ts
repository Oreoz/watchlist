export const determineTrend = (currentPrice: number, newPrice: number): string => {
  if (newPrice > currentPrice) return "📈";
  if (newPrice < currentPrice) return "📉";
  return "✋";
};
