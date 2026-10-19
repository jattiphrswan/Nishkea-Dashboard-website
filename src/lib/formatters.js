/**
 * Currency, Date and Inventory Formatter Utilities
 * Follows AGENTS.md rule: integer minor currency units, explicit currency.
 */

/**
 * Formats integer minor currency units (e.g. 249900 paise = ₹2,499.00)
 * @param {number} minorUnits - Amount in integer minor units (e.g. cents, paise)
 * @param {string} currency - ISO 4217 currency code (default: 'INR')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(minorUnits = 0, currency = 'INR') {
  const safeMinor = Number.isInteger(minorUnits) ? minorUnits : Math.round(Number(minorUnits) || 0);
  const majorUnits = safeMinor / 100;

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(majorUnits);
  } catch {
    return `₹${majorUnits.toFixed(2)}`;
  }
}

/**
 * Formats ISO date to readable string
 * @param {string} dateString 
 * @returns {string}
 */
export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Computes available stock from sellable on-hand and active reservations
 * available = sellable - reserved (never negative)
 */
export function computeAvailableStock(sellable = 0, reserved = 0) {
  const s = Math.max(0, parseInt(sellable, 10) || 0);
  const r = Math.max(0, parseInt(reserved, 10) || 0);
  return Math.max(0, s - r);
}
