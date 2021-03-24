import { GoogleSpreadsheetRow } from "google-spreadsheet";

export class RowBuilder {
  row: GoogleSpreadsheetRow;

  constructor(row: GoogleSpreadsheetRow) {
    this.row = row;
  }

  set(name: string, value: any) {
    this.row[name] = value;
    return this;
  }

  build() {
    this.row.save();
  }
}
