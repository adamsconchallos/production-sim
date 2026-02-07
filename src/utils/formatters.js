export const formatVal = (val, format) => {
  if (val === null || val === undefined) return '—';
  const n = Number(val);
  if (isNaN(n)) return '—';

  if (format === 'currency') return `$${n.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
  if (format === 'percent') return `${n.toFixed(1)}%`;
  if (format === 'decimal') return n.toFixed(2);
  if (format === 'number') return n.toLocaleString(undefined, {maximumFractionDigits: 0});
  return n.toLocaleString();
};
