import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { CardUpdater } from "./card-updater";
import { wait } from "./utils";

/**
 * Google API has a maximum of 60 read/writes requests per minute (1/sec).
 * Scryfall asks for a maximum of 10 calls per seconds.
 */
const API_DELAY = 1000;

/**
 * Since we're allowed 10 requests per seconds on Scryfall, we're going to
 * update prices in 10 card chunks to not exceed the 1 request per second
 * limit on the Google Sheets API.
 */
const BATCH_SIZE = 10;

/**
 * Create the google service account credentials that we'll use in order
 * to acces our spreadsheet. This leverages information that we store in
 * our .env file.
 */
const serviceAccountCredentials = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

/**
 * The spreadsheet that we will be manipulating during this script.
 */
const doc = new GoogleSpreadsheet(
  process.env.SPREADSHEET_ID ?? "",
  serviceAccountCredentials
);

(async () => {
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
