/**
 * Price utility helpers for SimuFlux Lab
 *
 * normalizePrice: converts admin input to a Number or null.
 * formatPrice:    converts a DB price into a human-readable string.
 */

/**
 * Normalize a raw price value from admin input.
 *
 * @param {string|number|null|undefined} raw - The raw value from the form body.
 * @returns {number|null} A non-negative number, or null when left blank.
 * @throws {Error} If the value is present but NaN or negative.
 */
export function normalizePrice(raw) {
  // Treat missing / empty-string as "price not set"
  if (raw === undefined || raw === null || raw === '') {
    return null;
  }

  const num = Number(raw);

  if (isNaN(num) || num < 0) {
    throw new Error('Price must be a non-negative number.');
  }

  return num;
}

/**
 * Format a DB price for display.
 *
 * @param {number|null|undefined} price - The stored price from the database.
 * @returns {string} A human-readable price string.
 */
export function formatPrice(price) {
  if (price === null || price === undefined) {
    return 'Price Inquiry';
  }
  if (price === 0) {
    return 'Free';
  }
  return `PKR ${price.toLocaleString()}`;
}
