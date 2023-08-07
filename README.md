# Watchlist 👀

A little Node script that's used to keep prices of my Magic: the Gathering collection up to date automatically.

## Setup

First, you'll want to clone the repository.

Then, you'll want to fill in the information necessary for the script to crawl through you spreadsheet, those are to be placed in `.env`, you can copy-paste the contents of `.env.example` as a starting point.

`GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY` come from the Google project you'll need to configure at https://console.cloud.google.com/apis/credentials, [The docs](https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication?id=setting-up-your-quotapplicationquot) for `google-spreadsheet` goes into it a little better.

`SPREADSHEET_ID` comes directly from the URL in Google Sheets.

Finally, run `npm i && npm start`
