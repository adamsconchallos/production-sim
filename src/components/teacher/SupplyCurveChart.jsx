import React, { useMemo, useState } from 'react';

const SupplyCurveChart = ({ submissions, product = 'A' }) => {
  const height = 200;
  const width = 500;
  const padding = 40;

  const data = useMemo(() => {
    if (!submissions || submissions.length === 0) return [];

    // Extract {price, qty} for the selected product from all submissions
    const points = submissions
      .map(s => ({
        price: parseFloat(s.data.price[product]) || 0,
        qty: parseFloat(s.data.sales[product]) || 0 // Use intended sales
      }))
      .filter(p => p.qty > 0)
      .sort((a, b) => a.price - b.price);

    if (points.length === 0) return [];

    // Build cumulative supply curve
    let cumulativeQty = 0;
    const curve = [];
    
    // Add start point
    curve.push({ price: points[0].price, qty: 0 });

    points.forEach(p => {
      cumulativeQty += p.qty;
      curve.push({ price: p.price, qty: cumulativeQty });
    });

    return curve;
  }, [submissions, product]);

  if (data.length === 0) {
    return (
      <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 h-[200px] flex items-center justify-center text-slate-400 text-sm">
        No supply data for Product {product} yet.
      </div>
    );
  }

  const maxPrice = Math.max(...data.map(d => d.price)) * 1.1;
  const minPrice = Math.min(...data.map(d => d.price)) * 0.9;
  const maxQty = Math.max(...data.map(d => d.qty)) * 1.1;
  const priceRange = maxPrice - minPrice || 1;

  const getX = (qty) => padding + (qty / maxQty) * (width - padding * 2);
  const getY = (price) => height - padding - ((price - minPrice) / priceRange) * (height - padding * 2);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex justify-between">
        Industry Supply Curve: Product {product}
        <span className="text-indigo-600 font-mono">Total: {data[data.length-1].qty.toLocaleString()} units</span>
      </h4>
      <div className="flex justify-center">
        <svg width={width} height={height} className="overflow-visible">
          {/* Axes */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#cbd5e1" strokeWidth="1" />
          
          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(pct => (
            <g key={pct}>
              <line 
                x1={padding} 
                y1={getY(minPrice + pct * priceRange)} 
                x2={width - padding} 
                y2={getY(minPrice + pct * priceRange)} 
                stroke="#f1f5f9" 
                strokeWidth="1" 
              />
              <text x={padding - 5} y={getY(minPrice + pct * priceRange)} textAnchor="end" fontSize="10" fill="#94a3b8" alignmentBaseline="middle">
                ${(minPrice + pct * priceRange).toFixed(0)}
              </text>
            </g>
          ))}

          {/* Step Line */}
          <path
            d={data.map((d, i) => {
              const x = getX(d.qty);
              const y = getY(d.price);
              if (i === 0) return `M ${getX(0)} ${y} L ${x} ${y}`;
              const prevX = getX(data[i-1].qty);
              return `L ${prevX} ${y} L ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Labels */}
          <text x={width/2} y={height - 5} textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="bold">Cumulative Quantity Supplied</text>
          <text x={-height/2} y={12} textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="bold" transform={`rotate(-90)`}>Price ($)</text>
        </svg>
      </div>
    </div>
  );
};

export default SupplyCurveChart;
