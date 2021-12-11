import moment from "moment";
import { RowBuilder } from "./builders/row";
import Headers from "./data/headers";
import { getCardData } from "./http/scryfall";
import { initializeSpreadsheet } from "./sheets";
import { determineTrend, EmojiMap, wait } from "./utils";

/**
 * Google API has a maximum of 1 write request per second
 * Scryfall asks for a maximum of 10 calls per seconds
 */
const API_DELAY = 1000;

type Foil = "Yes" | "No" | "Etched";

(async () => {
  const doc = await initializeSpreadsheet();

  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();

  const formattedDate = moment().format("DD-MM-YYYY");

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];

    if (formattedDate === row[Headers.Date]) {
      // Only update prices once per day. 🧠
      continue;
    }

    const foil: Foil = row[Headers.Foil];
    const set = row[Headers.Edition];
    const number = row[Headers.Number];

    const data = await getCardData(set, number);

    if (!data) {
      console.log(
        `Unable to get card data for ${set}-${number}, double-check your spreadsheet. 🤷‍♂️`
      );
      continue;
    }

    const { name, usd, usd_foil, usd_etched } = data;

    const priceMap: Record<Foil, number | undefined> = {
      Yes: usd_foil,
      No: usd,
      Etched: usd_etched,
    };

    const marketPrice = Number(priceMap[foil]);
    const currentPrice = Number(row[Headers.MarketPrice]);

    const trend = determineTrend(currentPrice, marketPrice);

    console.log(`${name} (${set}) ${EmojiMap[trend]} ${marketPrice}`);

    new RowBuilder(row)
      .set(Headers.CardName, name)
      .set(Headers.Trend, trend)
      .set(Headers.Date, formattedDate)
      .set(Headers.MarketPrice, marketPrice.toFixed(2))
      .build();

    await wait(API_DELAY);
  }
})();
