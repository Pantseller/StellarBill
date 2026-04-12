/**
 * Generate a short unique invoice ID.
 * Format: INV-<timestamp base36>-<random 4 chars>
 */
export function generateInvoiceId() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `INV-${timestamp}-${random}`
}

/**
 * Format an XLM amount to a readable string with up to 7 decimal places.
 * Trims trailing zeros.
 */
export function formatAmount(amount) {
  return parseFloat(amount).toFixed(7).replace(/\.?0+$/, '')
}
