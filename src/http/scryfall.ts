import fetch from "node-fetch";

const url = "https://api.scryfall.com";

export async function getCardData(set: string, number: string) {
  const normalizedSet = set.toLowerCase();

  const res = await fetch(`${url}/cards/${normalizedSet}/${number}`);

  if (res.ok) {
    const json = await res.json();
    return { name: json.name, ...json.prices };
  }

  return null;
}
