export const formatVal = (val, format) => {
  if (format === 'currency') return `$${val.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
  if (format === 'percent') return `${val.toFixed(1)}%`;
  if (format === 'decimal') return val.toFixed(2);
  if (format === 'number') return val.toLocaleString(undefined, {maximumFractionDigits: 0});
  return val.toLocaleString();
};
