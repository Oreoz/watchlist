import fetch from "node-fetch";

const url = "https://api.scryfall.com";

export async function getNamedCardData(name: string, set: string) {
  const destination = `${url}/cards/named?exact=${name}&set=${set}`;

  const res = await fetch(destination);

  console.log("Querying", destination, "-", res.status);

  if (res.ok) {
    const json = await res.json();
    return json.prices;
  }

  return null;
}
