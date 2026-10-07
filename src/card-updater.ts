import { GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { get } from "./scryfall";
import { bump, determineTrend, movers } from "./utils";

const prices = {
  Yes: "usd_foil",
  No: "usd",
  Etched: "usd_etched",
} as const;

type Foil = keyof typeof prices;
type Price = (typeof prices)[Foil];

const Rows = {
  name: 0,
  foil: 1,
  set: 2,
  number: 3,
  notes: 4,
  price: 5,
  date: 6,
  trend: 7,
};

const timestamp = new Date().toLocaleDateString("en-CA");

const isFoil = (value: unknown): value is Foil =>
  typeof value === "string" && Object.prototype.hasOwnProperty.call(prices, value);

export class CardUpdater {
  worksheet: GoogleSpreadsheetWorksheet;

  constructor(worksheet: GoogleSpreadsheetWorksheet) {
    this.worksheet = worksheet;
  }

  async update(row: number) {
    const dateCell = this.worksheet.getCell(row, Rows.date);
    const foilCell = this.worksheet.getCell(row, Rows.foil);
    const nameCell = this.worksheet.getCell(row, Rows.name);
    const numberCell = this.worksheet.getCell(row, Rows.number);
    const priceCell = this.worksheet.getCell(row, Rows.price);
    const setCell = this.worksheet.getCell(row, Rows.set);
    const trendCell = this.worksheet.getCell(row, Rows.trend);

    if (!setCell.value || !numberCell.value) {
      throw new Error("Looks like the current row is empty.");
    }

    const res = await get(String(setCell.value), String(numberCell.value));

    if (!res.ok) {
      throw new Error(
        `Couldn't fetch the card data from Scryfall: ${setCell.value} ${numberCell.value}.`
      );
    }

    const json = await res.json();

    const currentPriceRaw = Number(priceCell.value);
    const currentPrice = Number.isFinite(currentPriceRaw) ? currentPriceRaw : 0;

    const foilValue = foilCell.value;
    if (!isFoil(foilValue)) {
      throw new Error(`Invalid foil value: ${String(foilValue)}`);
    }

    const updatedPriceRaw = Number(json.prices[prices[foilValue]]);
    const updatedPrice = Number.isFinite(updatedPriceRaw) ? updatedPriceRaw : 0;

    const trend = determineTrend(currentPrice, updatedPrice);

    if (trend === "up") {
      const diff = updatedPrice - currentPrice;
      const percentage = currentPrice > 0 ? (diff / currentPrice) * 100 : 0;

      movers.push({
        diff,
        name: json.name,
        percentage,
        price: updatedPrice,
      });
    }

    if (dateCell.value !== timestamp) {
      dateCell.value = timestamp;
      trendCell.value = trend;
    }

    nameCell.value = json.name;
    priceCell.value = updatedPrice;

    bump();
  }
}
