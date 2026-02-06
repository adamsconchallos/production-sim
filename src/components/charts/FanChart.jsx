const FanChart = ({ title, data, type = 'price', color = "#4f46e5" }) => {
  const height = 220;
  const width = 400;
  const padding = 40;

  // Extract Data
  const history = data.history || [];
  const forecast = data.forecast || { year: '?', price: {mean:0, sd:0}, demand: {mean:0, sd:0} };
  const fData = forecast[type] || { mean: 0, sd: 0 };

  // Combine for scaling
  const allValues = [
    ...history.map(d => d[type]),
    fData.mean + (fData.sd * 2),
    fData.mean - (fData.sd * 2)
  ];

  const minVal = Math.min(...allValues) * 0.95;
  const maxVal = Math.max(...allValues) * 1.05;
  const range = (maxVal - minVal) || 1;

  const getX = (index, totalPoints) => padding + (index * ((width - (padding*2)) / (totalPoints - 1)));
  const getY = (val) => height - padding - ((val - minVal) / range) * (height - (padding * 2));

  const totalPoints = history.length + 1;
  const lastHistIndex = history.length - 1;

  if (history.length === 0) return <div>No Data</div>;

  // 1. History Line Path
  let histPath = "";
  history.forEach((d, i) => {
    histPath += `${i === 0 ? 'M' : 'L'} ${getX(i, totalPoints)} ${getY(d[type])} `;
  });

  // 2. Forecast Cone
  const startX = getX(lastHistIndex, totalPoints);
  const startY = getY(history[lastHistIndex][type]);
  const endX = getX(lastHistIndex + 1, totalPoints);

  const meanY = getY(fData.mean);
  const sd1UpY = getY(fData.mean + fData.sd);
  const sd1DownY = getY(fData.mean - fData.sd);
  const sd2UpY = getY(fData.mean + (fData.sd * 2));
  const sd2DownY = getY(fData.mean - (fData.sd * 2));

  const formatVal = (v) => type === 'price' ? `$${v.toFixed(2)}` : v.toLocaleString();

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
      <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex justify-between">
        <span>{title}</span>
        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">Forecast {forecast.year}</span>
      </h4>
      <div className="flex-grow flex justify-center items-center">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#e2e8f0" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="#e2e8f0" strokeWidth="1" />

          <path d={`M ${startX} ${startY} L ${endX} ${sd2UpY} L ${endX} ${sd2DownY} Z`} fill={color} opacity="0.15" />
          <path d={`M ${startX} ${startY} L ${endX} ${sd1UpY} L ${endX} ${sd1DownY} Z`} fill={color} opacity="0.3" />
          <path d={histPath} fill="none" stroke={color} strokeWidth="2.5" />
          <line x1={startX} y1={startY} x2={endX} y2={meanY} stroke={color} strokeWidth="2" strokeDasharray="4,4" />

          {history.map((d, i) => (
            <g key={i}>
              <circle cx={getX(i, totalPoints)} cy={getY(d[type])} r="3" fill="white" stroke={color} strokeWidth="2" />
              <text x={getX(i, totalPoints)} y={height - padding + 15} textAnchor="middle" fontSize="10" fill="#94a3b8">{d.year}</text>
            </g>
          ))}

          <text x={endX} y={height - padding + 15} textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="bold">{forecast.year}</text>
          <text x={padding - 5} y={getY(maxVal)} textAnchor="end" fontSize="10" fill="#94a3b8">{formatVal(maxVal)}</text>
          <text x={padding - 5} y={getY(minVal)} textAnchor="end" fontSize="10" fill="#94a3b8">{formatVal(minVal)}</text>

          <text x={endX + 5} y={sd2UpY} fontSize="9" fill={color} alignmentBaseline="middle">High (2SD)</text>
          <text x={endX + 5} y={meanY} fontSize="9" fontWeight="bold" fill={color} alignmentBaseline="middle">Mean</text>
          <text x={endX + 5} y={sd2DownY} fontSize="9" fill={color} alignmentBaseline="middle">Low (2SD)</text>
        </svg>
      </div>
    </div>
  );
};

export default FanChart;
