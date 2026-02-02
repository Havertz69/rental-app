/**
 * Format currency utilities
 */

/**
 * Format amount as whole number currency
 * @param {number|string} amount - The amount to format
 * @param {string} currency - Currency symbol (default: 'KES')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'KES') => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return `${currency} 0`;
  }
  
  // Round to nearest whole number
  const roundedAmount = Math.round(numAmount);
  
  // Format with thousands separator
  const formattedAmount = roundedAmount.toLocaleString();
  
  return `${currency} ${formattedAmount}`;
};

/**
 * Format amount as whole number without currency symbol
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted number string
 */
export const formatWholeNumber = (amount) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '0';
  }
  
  // Round to nearest whole number
  const roundedAmount = Math.round(numAmount);
  
  // Format with thousands separator
  return roundedAmount.toLocaleString();
};

/**
 * Format percentage
 * @param {number} value - The value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '0%';
  }
  
  return `${numValue.toFixed(decimals)}%`;
};
