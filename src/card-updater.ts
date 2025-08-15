import { GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { get } from "./scryfall";
import { bump, determineTrend, movers } from "./utils";

type Foil = "Yes" | "No" | "Etched";
type Price = "usd_foil" | "usd" | "usd_etched";

const prices: Record<Foil, Price> = {
  Yes: "usd_foil",
  No: "usd",
  Etched: "usd_etched",
};

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

    const currentPrice = Number(priceCell.value) ?? 0;
    const updatedPrice = Number(json.prices[prices[foilCell.value as Foil]]) ?? 0;

    const trend = determineTrend(currentPrice, updatedPrice);

    if (trend === "up") {
      const diff = updatedPrice - currentPrice;
      const percentage = (diff / currentPrice) * 100;

      movers.push({
        diff,
        name: json.name,
        percentage: percentage,
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
