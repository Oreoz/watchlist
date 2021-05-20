import fetch from "node-fetch";

const url = "https://api.scryfall.com";

interface Options {
  name: string;
  number: string;
  set: string;
}

export async function getCardData({ name, number, set }: Options) {
  const normalizedSet = set.toLowerCase();

  let destination = url;

  if (number) {
    destination += `/cards/${normalizedSet}/${number}`;
  } else {
    const encodedName = encodeURIComponent(name);
    destination += `/cards/named?exact=${encodedName}&set=${normalizedSet}`;
  }

  const res = await fetch(destination);

  if (res.ok) {
    const json = await res.json();
    return { name: json.name, ...json.prices };
  }

  return null;
}
