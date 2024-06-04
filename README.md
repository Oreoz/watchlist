# Watchlist 👀

A little Node script that's used to keep prices of my Magic: the Gathering collection up to date automatically.

## Setup

1. Clone this repository
2. Fill-in the information necessary for the script to crawl through you spreadsheet, those are to be placed in `.env`. You can copy-paste the contents of `.env.example` as a starting point.

`GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY` come from the Google project you'll need to configure in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials). [The docs](https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication?id=setting-up-your-quotapplicationquot) for `google-spreadsheet` goes into it quite well.

`SPREADSHEET_ID` comes directly from the URL in Google Sheets.

3. Install dependencies via `npm i`
4. Start the script via `npm start`
