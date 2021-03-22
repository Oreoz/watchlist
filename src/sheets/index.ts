import { GoogleSpreadsheet } from "google-spreadsheet";

export async function initSpreadsheetAndGetRows() {
  const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID ?? "");

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "",
    private_key: process.env.GOOGLE_PRIVATE_KEY ?? "",
  });

  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];
  return await sheet.getRows();
}
