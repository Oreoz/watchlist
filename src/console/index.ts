import { Trend } from "../types/trend";

interface Data {
  name: string;
  marketPrice: number;
}

export const outputTrend = (trend: Trend, { name, marketPrice }: Data) => {
  switch (trend) {
    case "up":
      console.log(name, "📈", marketPrice);
      break;
    case "down":
      console.log(name, "📉", marketPrice);
      break;
    default:
      console.log(name, "✋", marketPrice);
  }
};
