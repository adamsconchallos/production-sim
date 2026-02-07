import { calculateYear } from './simulation';

/**
 * AR(1) forecast on a time series with trend adjustment.
 * Direct port from the Google Apps Script.
 */
export function calculateAR1Forecast(series, trend) {
  if (series.length < 3) {
    const last = series[series.length - 1];
    return { mean: last * trend, sd: last * 0.05 };
  }

  const x = [];
  const y = [];
  for (let i = 1; i < series.length; i++) {
    x.push(series[i - 1]);
    y.push(series[i]);
  }

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

  const denom = n * sumXX - sumX * sumX;
  const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
  const intercept = (sumY - slope * sumX) / n;

  const lastVal = series[series.length - 1];
  const forecast = (intercept + slope * lastVal) * trend;

  let sumSqResid = 0;
  for (let i = 0; i < n; i++) {
    const predicted = intercept + slope * x[i];
    sumSqResid += Math.pow(y[i] - predicted, 2);
  }

  let se = Math.sqrt(sumSqResid / (n - 2 || 1));
  se = Math.max(se, forecast * 0.02);

  return { mean: forecast, sd: se };
}

/**
 * Clear the market for all products.
 *
 * @param {Object} parameters - {A: {intercept, slope, growth}, B: {...}, C: {...}}
 * @param {Array} firmDecisions - [{firmId, data: {qty, sales, price, inv, finance}}, ...]
 * @returns {Object} {A: {price, qty}, B: {price, qty}, C: {price, qty}}
 */
export function clearMarket(parameters, firmDecisions) {
  const results = {};

  ['A', 'B', 'C'].forEach(prod => {
    const demand = parameters[prod];
    if (!demand) {
      results[prod] = { price: 0, qty: 0 };
      return;
    }

    // Build supply curve: each firm's offered sales qty at their ask price
    const offers = [];
    firmDecisions.forEach(fd => {
      const salesQty = fd.data.sales[prod] || 0;
      const askPrice = fd.data.price[prod] || 0;
      if (salesQty > 0) {
        offers.push({ firmId: fd.firmId, price: askPrice, qty: salesQty });
      }
    });

    // Sort by price ascending (merit order)
    offers.sort((a, b) => a.price - b.price);

    let clearPrice = 0;
    let clearQty = 0;

    if (offers.length === 0) {
      // No supply → price is at demand intercept
      clearPrice = demand.intercept;
      clearQty = 0;
    } else {
      let cumQ = 0;
      let found = false;

      for (let j = 0; j < offers.length; j++) {
        const o = offers[j];
        cumQ += o.qty;
        const demandPrice = demand.intercept - demand.slope * cumQ;

        if (o.price > demandPrice) {
          // This firm's ask exceeds demand at cumulative qty
          clearQty = (demand.intercept - o.price) / demand.slope;
          clearPrice = o.price;
          found = true;
          break;
        }
      }

      if (!found) {
        // All supply clears
        clearQty = cumQ;
        clearPrice = demand.intercept - demand.slope * cumQ;
      }
    }

    results[prod] = {
      price: Math.max(0, clearPrice),
      qty: Math.max(0, clearQty)
    };
  });

  return results;
}

/**
 * Compute a single firm's actual results after market clearing.
 *
 * For each product:
 * - If firm's ask price <= clearing price → sells min(offered_sales, available_stock) at clearing price
 * - If firm's ask price > clearing price → sells 0 (unsold inventory carries forward)
 *
 * @param {Object} firmDecision - {qty, sales, price, inv, finance}
 * @param {Object} clearingResults - {A: {price, qty}, B: {...}, C: {...}}
 * @param {Object} firmState - {state: {balance sheet}, inventory_details, efficiency} or null for initial
 * @param {Object} gameSetup - initial balance sheet from game config
 * @param {Object} rates - {st, lt, tax}
 * @param {Object} approvedLoans - {st: {rate: ...}, lt: {rate: ...}} or null
 * @returns {Object} {nextStart, inventoryDetails, nextEfficiency, financials}
 */
export function computeFirmActualResults(firmDecision, clearingResults, firmState, gameSetup, rates, approvedLoans = null) {
  // Determine starting position
  const start = firmState?.state
    ? { ...firmState.state, rates }
    : { ...gameSetup, rates };

  const startInventoryDetails = firmState?.inventory_details
    || { A: { units: 0, value: 0 }, B: { units: 0, value: 0 }, C: { units: 0, value: 0 } };

  const prevEfficiency = firmState?.efficiency || 0;

  // Build the actual decision: same production/inv/finance, but actual sales and clearing prices
  const actualDecision = {
    qty: { ...firmDecision.qty },
    sales: { A: 0, B: 0, C: 0 },
    price: { A: 0, B: 0, C: 0 },
    inv: { ...firmDecision.inv },
    finance: { ...firmDecision.finance }
  };

  ['A', 'B', 'C'].forEach(p => {
    const clearing = clearingResults[p];
    const firmAskPrice = firmDecision.price[p];
    const firmOfferedSales = firmDecision.sales[p] || 0;

    if (firmAskPrice <= clearing.price && firmOfferedSales > 0) {
      // Firm sells at clearing price
      const prodQty = firmDecision.qty[p] || 0;
      const oldUnits = startInventoryDetails[p]?.units || 0;
      const available = oldUnits + prodQty;
      actualDecision.sales[p] = Math.min(firmOfferedSales, available);
      actualDecision.price[p] = clearing.price;
    } else {
      // Firm doesn't sell — unsold stock carries as inventory
      actualDecision.sales[p] = 0;
      actualDecision.price[p] = 0;
    }
  });

  // Run the simulation engine with actual values
  // Pass approvedLoans as loanTerms if provided (handled inside calculateYear)
  const result = calculateYear(start, actualDecision, prevEfficiency, startInventoryDetails, rates, approvedLoans);

  return {
    nextStart: result.nextStart,
    inventoryDetails: result.inventoryDetails,
    nextEfficiency: result.nextEfficiency,
    financials: result.financials
  };
}
