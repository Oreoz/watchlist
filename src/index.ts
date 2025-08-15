import "dotenv/config";
import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";
import ora from "ora";
import { CardUpdater } from "./card-updater";
import { printTopMovers, updated, wait } from "./utils";

const {
  GOOGLE_PRIVATE_KEY,
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  SPREADSHEET_ID = "",
} = process.env;

/**
 * We kindly ask that you insert 50 – 100 milliseconds of delay
 * between the requests you send to the server at api.scryfall.com.
 *
 * See https://scryfall.com/docs/api
 */
const SCRYFALL_API_DELAY = 50;

/**
 * Google API has a maximum of 60 read/writes reqs per minute (1/sec).
 */
const SHEETS_API_DELAY = 1_000;

/**
 * Determine how many calls to Scryfall we should do prior to "flushing"
 * out data to the spreadsheet.
 */
const BATCH_SIZE = Math.ceil(SHEETS_API_DELAY / SCRYFALL_API_DELAY);

const jwt = new JWT({
  email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: GOOGLE_PRIVATE_KEY,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

/**
 * The spreadsheet that we will be manipulating during this script.
 */
const spreadsheet = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);

(async () => {
  const spinner = ora("Updating prices").start();

  await spreadsheet.loadInfo();

  for (let sheetIndex = 0; sheetIndex < spreadsheet.sheetCount; sheetIndex++) {
    const worksheet = spreadsheet.sheetsByIndex[sheetIndex];
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
