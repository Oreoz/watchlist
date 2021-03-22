import moment from "moment";
import { CARD_NAME, DATE, EDITION, MARKET_PRICE, TREND } from "./data/headers";
import { getNamedCardData } from "./http/scryfall";
import { initSpreadsheetAndGetRows } from "./sheets";
import { wait } from "./utils";

const SCRYFALL_THROTTLE = 1000;

(async () => {
  const rows = await initSpreadsheetAndGetRows();

  const formattedDate = moment().format("DD-MM-YYYY");

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];

    const data = await getNamedCardData(row[CARD_NAME], row[EDITION]);

    if (!data) continue;

    const { usd, foil_usd } = data;

    const foil = row["Foil"] === "Yes";

    const currentPrice = Number(foil ? foil_usd : usd);
    const previousPrice = Number(row[MARKET_PRICE]);

    row[MARKET_PRICE] = currentPrice;
    row[DATE] = formattedDate;
    row[TREND] =
      currentPrice > previousPrice
        ? "up"
        : currentPrice < previousPrice
        ? "down"
        : "same";

    row.save();

    await wait(SCRYFALL_THROTTLE);
  }
})();
