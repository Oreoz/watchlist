import "dotenv/config";
import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";
import ora from "ora";
import { CardUpdater } from "./card-updater";
import { printTopMovers, updated, wait } from "./utils";

/**
 * Google API has a maximum of 60 read/writes requests per minute (1/sec).
 * Scryfall asks for a maximum of 10 calls per seconds.
 */
const SHEETS_API_DELAY = 3_000;

/**
 * Since we're allowed 10 requests per seconds on Scryfall, we're going to
 * update prices in 10 card chunks for every second of API delay we introduce
 * to not exceed the 1 request per second limit on the Google Sheets API.
 */
const BATCH_SIZE = SHEETS_API_DELAY / 100;

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
  const spinner = ora("Updating prices").start();

  await doc.loadInfo();

  for (let sheetIndex = 0; sheetIndex < doc.sheetCount; sheetIndex++) {
    const worksheet = doc.sheetsByIndex[sheetIndex];
    let currentRowIndex = 1;
    let done = false;

    const updater = new CardUpdater(worksheet);

    while (!done) {
      spinner.suffixText = `(${updated} cards processed)`;

      const sheetsThrottle = wait(SHEETS_API_DELAY);
      await worksheet.loadCells(`A${currentRowIndex}:H${currentRowIndex + BATCH_SIZE}`);

      for (let i = 0; i < BATCH_SIZE; i++) {
        try {
          await updater.update(currentRowIndex + i);
        } catch (error) {
          done = true;
          break;
        }
      }

      await worksheet.saveUpdatedCells();
      await sheetsThrottle;

      if (done) break;

      currentRowIndex += BATCH_SIZE;
    }
  }

  spinner.succeed("Done updating prices.");

  printTopMovers();
})();
