/**
 * The number of cards that were updated during the script's execution time.
 */
export let updated = 0;

/**
 * Increase the number of card updated by 1.
 */
export const bump = () => {
  updated += 1;
};
