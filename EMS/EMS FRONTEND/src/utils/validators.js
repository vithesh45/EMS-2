/**
 * Validate form data
 */
export const validateFormData = (formData, items) => {
  const errors = [];

  if (!formData.date) errors.push('Date is required');
  if (!formData.dcNo) errors.push('DC No is required');
  if (!formData.lrNo) errors.push('LR No is required');
  if (!formData.vehicleNo) errors.push('Vehicle No is required');
  if (!formData.supplierId && !formData.subContractorId) {
    errors.push('Supplier/Sub-contractor is required');
  }
  if (items.length === 0) errors.push('At least one item is required');

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate item quantities
 */
export const validateQuantities = (item) => {
  if (item.actualReceipt < 0) return false;
  if (item.reject < 0) return false;
  if (item.short < 0) return false;
  return true;
};