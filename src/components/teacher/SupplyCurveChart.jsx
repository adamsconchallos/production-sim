import React, { useMemo, useState } from 'react';

const SupplyCurveChart = ({ submissions, product = 'A', parameters }) => {
  const height = 200;
  const width = 500;
  const padding = 40;

  const { data, demandPoints } = useMemo(() => {
    if (!submissions || submissions.length === 0) return { data: [], demandPoints: [] };

    // Extract {price, qty} for the selected product from all submissions
    const points = submissions
      .map(s => ({
        price: parseFloat(s.data.price[product]) || 0,
        qty: parseFloat(s.data.sales[product]) || 0 // Use intended sales
      }))
      .filter(p => p.qty > 0)
      .sort((a, b) => a.price - b.price);

    if (points.length === 0) return { data: [], demandPoints: [] };

    // Build cumulative supply curve
    let cumulativeQty = 0;
    const curve = [];
    
    // Add start point
    curve.push({ price: points[0].price, qty: 0 });

    points.forEach(p => {
      cumulativeQty += p.qty;
      curve.push({ price: p.price, qty: cumulativeQty });
    });

    // Build demand curve points if parameters exist
    const dPoints = [];
    if (parameters && parameters[product]) {
      const { intercept, slope } = parameters[product];
      const maxQ = cumulativeQty * 1.5 || 20000;
      dPoints.push({ qty: 0, price: intercept });
      dPoints.push({ qty: maxQ, price: Math.max(0, intercept - slope * maxQ) });
    }

    return { data: curve, demandPoints: dPoints };
  }, [submissions, product, parameters]);

  if (data.length === 0) {
    return (
      <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 h-[200px] flex items-center justify-center text-slate-400 text-sm">
        No supply data for Product {product} yet.
      </div>
    );
  }

  const maxPriceSupply = Math.max(...data.map(d => d.price));
  const maxPriceDemand = demandPoints.length > 0 ? demandPoints[0].price : 0;
  const maxPrice = Math.max(maxPriceSupply, maxPriceDemand) * 1.1;
  
  const minPrice = 0; // Better to start at 0 for market comparison
  const maxQty = Math.max(...data.map(d => d.qty)) * 1.2;
  const priceRange = maxPrice - minPrice || 1;

  const getX = (qty) => padding + (qty / maxQty) * (width - padding * 2);
  const getY = (price) => height - padding - ((price - minPrice) / priceRange) * (height - padding * 2);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-bold text-slate-500 uppercase">
          Market Clearing: Product {product}
        </h4>
        <div className="flex gap-4 text-[10px] font-bold">
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-indigo-600 rounded-full"></div> Supply</div>
          {demandPoints.length > 0 && <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-400 rounded-full"></div> Demand</div>}
          <span className="text-slate-400 font-mono">Total Q: {data[data.length-1].qty.toLocaleString()}</span>
        </div>
      </div>
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

          {/* Demand Curve Line */}
          {demandPoints.length > 0 && (
            <line
              x1={getX(demandPoints[0].qty)}
              y1={getY(demandPoints[0].price)}
              x2={getX(demandPoints[1].qty)}
              y2={getY(demandPoints[1].price)}
              stroke="#f87171"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
          )}

          {/* Supply Step Line */}
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
          <text x={width/2} y={height - 5} textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="bold">Market Quantity</text>
          <text x={-height/2} y={12} textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="bold" transform={`rotate(-90)`}>Price ($)</text>
        </svg>
      </div>
    </div>
  );
};

export default SupplyCurveChart;
