import fetch from "node-fetch";

const url = "https://api.scryfall.com";

type Response = {
  name: string;
  usd?: number;
  usd_foil?: number;
  usd_etched?: number;
};

export async function getCardData(set: string, number: string): Promise<Response | null> {
  const normalizedSet = set.toLowerCase();

  const res = await fetch(`${url}/cards/${normalizedSet}/${number}`);

  if (res.ok) {
    const json = await res.json();
    return { name: json.name, ...json.prices };
  }

  return null;
}
