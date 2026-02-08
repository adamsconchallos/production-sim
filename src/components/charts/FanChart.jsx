import { useState } from 'react';

const FanChart = ({ title, data, type = 'price', color = "#4f46e5" }) => {
  const height = 300;
  const padding = 50;
  const pointSpacingX = Math.max(100, 350 / Math.max(1, (data.history?.length || 1)));
  const width = Math.max(600, padding * 2 + pointSpacingX * Math.max(2, (data.history?.length || 1) + 1));

  // Extract Data
  const history = data.history || [];
  const forecast = data.forecast || { year: '?', price: {mean:0, sd:0}, demand: {mean:0, sd:0} };
  const fData = forecast[type] || { mean: 0, sd: 0 };

  // Combine for scaling
  const allValues = [
    ...history.map(d => d[type]),
    fData.mean + (fData.sd * 2),
    fData.mean - (fData.sd * 2)
  ].filter(v => !isNaN(v) && v !== null);

  if (allValues.length === 0 || history.length === 0) return <div className="p-4 text-slate-400 text-center">No Data Available</div>;

  const minVal = Math.min(...allValues) * 0.95;
  const maxVal = Math.max(...allValues) * 1.05;
  const range = (maxVal - minVal) || 1;

  const totalPoints = history.length + 1;
  const lastHistIndex = history.length - 1;

  const getX = (index) => padding + (index * pointSpacingX);
  const getY = (val) => height - padding - ((val - minVal) / range) * (height - (padding * 2));

  // 1. History Line Path
  let histPath = "";
  history.forEach((d, i) => {
    const val = d[type];
    if (!isNaN(val)) {
        histPath += `${histPath === "" ? 'M' : 'L'} ${getX(i)} ${getY(val)} `;
    }
  });

  // 2. Forecast Cone
  const startX = getX(lastHistIndex);
  const lastVal = history[lastHistIndex][type];
  const startY = getY(lastVal);
  const endX = getX(lastHistIndex + 1);

  const meanY = getY(fData.mean);
  const sd1UpY = getY(fData.mean + fData.sd);
  const sd1DownY = getY(fData.mean - fData.sd);
  const sd2UpY = getY(fData.mean + (fData.sd * 2));
  const sd2DownY = getY(fData.mean - (fData.sd * 2));

  const formatVal = (v) => {
    if (isNaN(v) || v === null) return "—";
    const absV = Math.abs(v);
    let formatted = "";
    if (absV >= 1000) {
      const kVal = v / 1000;
      formatted = Number.isInteger(kVal) ? kVal + "k" : kVal.toFixed(1) + "k";
    } else {
      formatted = v.toFixed(0);
    }
    return type === 'price' ? `$${formatted}` : formatted;
  };

  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipX, setTooltipX] = useState(0);
  const [tooltipY, setTooltipY] = useState(0);

  const handleMouseMove = (e) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;

    // Convert mouseX to SVG coordinate system
    const scaleX = width / svgRect.width;
    const scaleY = height / svgRect.height;
    const svgCoordX = mouseX * scaleX;
    const svgCoordY = mouseY * scaleY;


    // Find the closest data point
    const points = history.map((d, i) => ({
      year: d.year,
      value: d[type],
      x: getX(i),
      y: getY(d[type]),
      isForecast: false,
    }));

    // Add forecast point
    points.push({
      year: forecast.year,
      value: fData.mean,
      x: getX(lastHistIndex + 1),
      y: meanY,
      isForecast: true,
    });

    let closestPoint = null;
    let minDistance = Infinity;

    for (const point of points) {
      // Only consider distance in X for finding the closest year/data point
      const distance = Math.abs(svgCoordX - point.x);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    }

    // Define a threshold for how close the mouse needs to be to a data point's x-coordinate
    const hoverThreshold = pointSpacingX / 2; // Half the distance between two points

    if (closestPoint && minDistance < hoverThreshold) {
      setTooltipVisible(true);
      // Position tooltip relative to the SVG element, but using client coordinates for positioning for CSS `left`/`top`
      setTooltipX(mouseX + 10); // Offset tooltip slightly from cursor
      setTooltipY(mouseY - 20);
      setTooltipContent(`${closestPoint.year}: ${formatVal(closestPoint.value)} ${closestPoint.isForecast ? '(Forecast)' : ''}`);
    } else {
      setTooltipVisible(false);
    }
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex justify-between flex-shrink-0">
        <span>{title}</span>
        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">Forecast {forecast.year}</span>
      </h4>
      <div className="flex-grow flex items-center relative overflow-x-auto"
           onMouseMove={handleMouseMove}
           onMouseLeave={handleMouseLeave}
      >
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible" style={{ minWidth: '100%' }}>
          <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#e2e8f0" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="#e2e8f0" strokeWidth="1" />

          <path d={`M ${startX} ${startY} L ${endX} ${sd2UpY} L ${endX} ${sd2DownY} Z`} fill={color} opacity="0.15" />
          <path d={`M ${startX} ${startY} L ${endX} ${sd1UpY} L ${endX} ${sd1DownY} Z`} fill={color} opacity="0.3" />
          <path d={histPath} fill="none" stroke={color} strokeWidth="2.5" />
          <line x1={startX} y1={startY} x2={endX} y2={meanY} stroke={color} strokeWidth="2" strokeDasharray="4,4" />

          {history.map((d, i) => (
            <g key={i}>
              <circle cx={getX(i)} cy={getY(d[type])} r="4" fill="white" stroke={color} strokeWidth="2.5" />
              <text x={getX(i)} y={height - padding + 18} textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="500">{d.year}</text>
            </g>
          ))}

          <text x={endX} y={height - padding + 18} textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="bold">{forecast.year}</text>
          {Array.from({ length: 5 }).map((_, i) => {
            const tickValue = minVal + (i * (maxVal - minVal) / 4);
            return (
              <g key={`y-tick-${i}`}>
                <line x1={padding} y1={getY(tickValue)} x2={width - padding} y2={getY(tickValue)} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2,2" />
                <text x={padding - 10} y={getY(tickValue)} textAnchor="end" fontSize="11" fill="#94a3b8">{formatVal(tickValue)}</text>
              </g>
            );
          })}

          <text x={endX + 5} y={sd2UpY} fontSize="9" fill={color} alignmentBaseline="middle">High (2SD)</text>
          <text x={endX + 5} y={meanY} fontSize="9" fontWeight="bold" fill={color} alignmentBaseline="middle">Mean</text>
          <text x={endX + 5} y={sd2DownY} fontSize="9" fill={color} alignmentBaseline="middle">Low (2SD)</text>
        </svg>
        {tooltipVisible && (
          <div
            className="absolute z-10 p-2 bg-slate-800 text-white text-xs rounded-md shadow-lg pointer-events-none"
            style={{ left: tooltipX, top: tooltipY }}
          >
            {tooltipContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default FanChart;
