import { Trend } from "../types/trend";

interface Data {
  name: string;
  marketPrice: number;
  set: string;
}

export const outputTrend = (trend: Trend, { name, marketPrice, set }: Data) => {
  let emoji = "";

  switch (trend) {
    case "up":
      emoji = "📈";
      break;
    case "down":
      emoji = "📉";
      break;
    default:
      emoji = "✋";
  }

  console.log(`${name} (${set}) ${emoji} ${marketPrice}`);
};
