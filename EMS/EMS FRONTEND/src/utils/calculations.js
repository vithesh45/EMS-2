/**
 * Calculate accepted quantity
 * Formula: Accepted = Actual Receipt - Reject - Short
 */
export const calculateAccepted = (actualReceipt, reject, short) => {
  return Math.max(0, actualReceipt - reject - short);
};

/**
 * Get stock status based on quantity
 */
export const getStockStatus = (quantity) => {
  if (quantity === 0) {
    return {
      label: 'Out of Stock',
      color: 'bg-danger-100 text-danger-600 border-danger-200',
      badge: 'danger'
    };
  }
  if (quantity < 50) {
    return {
      label: 'Low Stock',
      color: 'bg-warning-100 text-warning-600 border-warning-200',
      badge: 'warning'
    };
  }
  return {
    label: 'In Stock',
    color: 'bg-success-100 text-success-600 border-success-200',
    badge: 'success'
  };
};