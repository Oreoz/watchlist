import { GoogleSpreadsheet } from "google-spreadsheet";
import { CardUpdater } from "./card-updater";
import { wait } from "./utils";

/**
 * Google API has a maximum of 60 read/writes requests per minute (1/sec).
 * Scryfall asks for a maximum of 10 calls per seconds.
 */
const API_DELAY = 1000;

/**
 * Since we're allowed 10 requests per seconds on Scryfall, we going to
 * update prices in 10 card chunks to not exceed the 1 request per second
 * limit on the Google Sheets API.
 */
const BATCH_SIZE = 10;

(async () => {
  const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID ?? "");

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "",
    private_key: process.env.GOOGLE_PRIVATE_KEY ?? "",
  });

  await doc.loadInfo();

  for (let sheetIndex = 0; sheetIndex < doc.sheetCount; sheetIndex++) {
    const sheet = doc.sheetsByIndex[sheetIndex];
    let currentRowIndex = 1;
    let done = false;

    while (!done) {
      const sheetsThrottle = wait(API_DELAY);
      await sheet.loadCells(`A${currentRowIndex}:H${currentRowIndex + BATCH_SIZE}`);

      const updater = new CardUpdater(sheet);

      for (let i = 0; i < BATCH_SIZE; i++) {
        try {
          await updater.update(currentRowIndex + i);
        } catch (error) {
          done = true;
          break;
        }
      }

      await sheet.saveUpdatedCells();
      await sheetsThrottle;

      if (done) break;

      currentRowIndex += BATCH_SIZE;
    }
  }
})();
