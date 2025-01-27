import "dotenv/config";
import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";
import ora from "ora";
import { CardUpdater } from "./card-updater";
import { printTopMovers, updated, wait } from "./utils";

/**
 * We kindly ask that you insert 50 – 100 milliseconds of delay
 * between the requests you send to the server at api.scryfall.com.
 *
 * See https://scryfall.com/docs/api
 */
const SCRYFALL_API_DELAY = 75;

/**
 * Google API has a maximum of 60 read/writes reqs per minute (1/sec).
 */
const SHEETS_API_DELAY = 1_000;

/**
 * Determine how many calls to Scryfall we should do prior to "flushing"
 * out data to the spreadsheet.
 */
const BATCH_SIZE = Math.ceil(SHEETS_API_DELAY / SCRYFALL_API_DELAY);

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

      await worksheet.loadCells(`A${currentRowIndex}:H${currentRowIndex + BATCH_SIZE}`);

      for (let i = 0; i < BATCH_SIZE; i++) {
        try {
          await updater.update(currentRowIndex + i);
          await wait(SCRYFALL_API_DELAY); // Throttle in between Scryfall API calls.
        } catch (error) {
          done = true;
          break;
        }
      }

      await worksheet.saveUpdatedCells();

      if (done) break;

      currentRowIndex += BATCH_SIZE;
    }
  }

  spinner.succeed("Done updating prices.");

  printTopMovers();
})();
