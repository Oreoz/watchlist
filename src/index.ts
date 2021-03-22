import { getNamedCardData } from "./http/scryfall";
import { wait } from "./utils";

// TODO: Grab that from the spreadsheet.
const cards = [
  { name: "Tainted Pact", set: "ODY" },
  { name: "Nature's Will", set: "CHK" },
  { name: "Tarmogoyf", set: "TSR" },
];

(async () => {
  for (let index = 0; index < cards.length; index++) {
    const { name, set } = cards[index];

    const { usd, usd_foil } = await getNamedCardData(name, set);

    console.log("Response", { usd, usd_foil });

    await wait(1000);
  }
})();
