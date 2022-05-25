import fetch from "node-fetch";

const url = "https://api.scryfall.com";

export async function getCardData(set: string, number: string) {
  const normalizedSet = set.toLowerCase();

  return await fetch(`${url}/cards/${normalizedSet}/${number}`);
}
