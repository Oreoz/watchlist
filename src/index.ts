import moment from "moment";
import Headers from "./data/headers";
import { getCardData } from "./http/scryfall";
import { initializeSpreadsheet } from "./sheets";
import { determineTrend, wait } from "./utils";

const SCRYFALL_THROTTLE = 1000;

(async () => {
  const doc = await initializeSpreadsheet();

  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();

  const formattedDate = moment().format("DD-MM-YYYY");

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];

    const name = row[Headers.CardName];

    if (formattedDate === row[Headers.Date]) {
      // Only update prices once per day. 🧠
      continue;
    }

    const set = row[Headers.Edition];
    const number = row[Headers.Number];

    const data = await getCardData({ name, number, set });

    if (!data) {
      console.log(`Unable to get card data for ${name}, check your spreadsheet. 🤷‍♂️`);
      continue;
    }

    const { usd, usd_foil } = data;

    const wantsTheShinies = row[Headers.Foil] === "Yes";

    const marketPrice = Number(wantsTheShinies ? usd_foil : usd);
    const currentPrice = Number(row[Headers.MarketPrice]);

    row[Headers.Date] = formattedDate;
    row[Headers.MarketPrice] = marketPrice;

    const trend = determineTrend(currentPrice, marketPrice);

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

    row[Headers.Trend] = trend;

    row.save();

    await wait(SCRYFALL_THROTTLE);
  }
})();
