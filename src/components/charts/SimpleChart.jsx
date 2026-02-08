const SimpleChart = ({ title, data, dataKey, color = "#4f46e5", format = "currency" }) => {
  const minHeight = 250;
  const padding = 40;
  const pointSpacingX = Math.max(80, 300 / Math.max(1, data.length - 1));
  const width = Math.max(500, padding * 2 + pointSpacingX * Math.max(1, data.length - 1));
  const height = minHeight;

  const values = data.map(d => d[dataKey]).filter(v => !isNaN(v) && v !== null);
  const min = values.length > 0 ? Math.min(0, ...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 1;
  const range = (max - min) || 1;

  const getY = (val) => {
    return height - padding - ((val - min) / range) * (height - (padding * 2));
  };

  const formatY = (val) => {
    if (isNaN(val) || val === null) return "—";
    if (format === 'percent') return val.toFixed(1) + '%';
    const absV = Math.abs(val);
    if (absV >= 1000) {
      const kVal = val / 1000;
      return Number.isInteger(kVal) ? kVal + "k" : kVal.toFixed(1) + "k";
    }
    return val.toFixed(0);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
      <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">{title}</h4>
      <div className="flex justify-start min-w-full">
        <svg width={width} height={height} className="overflow-visible" style={{ minWidth: '100%' }}>
          <line x1={padding} y1={getY(0)} x2={width-padding} y2={getY(0)} stroke="#e2e8f0" strokeWidth="1" />
          <polyline
            points={data.map((d, i) => {
              const x = padding + (i * pointSpacingX);
              return `${x},${getY(d[dataKey])}`;
            }).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
          />
          {data.map((d, i) => {
            const x = padding + (i * pointSpacingX);
            const y = getY(d[dataKey]);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="4" fill="white" stroke={color} strokeWidth="2.5" />
                <text x={x} y={y - 15} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="bold">
                  {format === 'currency' && '$'}{formatY(d[dataKey])}
                </text>
                <text x={x} y={height - padding + 20} textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="500">
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default SimpleChart;
