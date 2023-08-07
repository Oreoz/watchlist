/**
 * Get data for a single card given its set code and collector number.
 *
 * @param set
 * The set code for a set. ie. KHM for Kaldheim
 *
 * @param number
 * The collector number for a given card.
 *
 * @returns A `fetch` promise.
 */
export async function get(set: string, number: string) {
  const normalizedSet = set.toLowerCase();

  return await fetch(`https://api.scryfall.com/cards/${normalizedSet}/${number}`);
}
