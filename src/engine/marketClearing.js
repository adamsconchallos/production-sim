import { calculateYear } from './simulation.js';
import { calculateLoanPayment } from '../utils/finance.js';

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
  let forecast = (intercept + slope * lastVal) * trend;

  if (isNaN(forecast)) forecast = lastVal * trend;

  let sumSqResid = 0;
  for (let i = 0; i < n; i++) {
    const predicted = intercept + slope * x[i];
    sumSqResid += Math.pow(y[i] - (isNaN(predicted) ? y[i] : predicted), 2);
  }

  let se = Math.sqrt(sumSqResid / (n - 2 || 1));
  se = Math.max(isNaN(se) ? 0 : se, forecast * 0.02);

  return { mean: isNaN(forecast) ? 0 : forecast, sd: isNaN(se) ? 0 : se };
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
    if (!demand || typeof demand.intercept === 'undefined' || typeof demand.slope === 'undefined') {
      console.warn(`Missing demand parameters for product ${prod}. Using defaults.`);
      const fallback = { A: {intercept:50, slope:0.002}, B: {intercept:60, slope:0.003}, C: {intercept:70, slope:0.005} }[prod];
      results[prod] = { price: fallback.intercept, qty: 0 };
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
          clearQty = Math.max(0, (demand.intercept - o.price) / (demand.slope || 1));
          clearPrice = o.price;
          found = true;
          break;
        }
      }

      if (!found) {
        // All supply clears
        clearQty = cumQ;
        clearPrice = Math.max(0, demand.intercept - demand.slope * cumQ);
      }
    }

    results[prod] = {
      price: isNaN(clearPrice) ? (demand.intercept || 0) : Math.max(0, clearPrice),
      qty: isNaN(clearQty) ? 0 : Math.max(0, clearQty)
    };
  });

  return results;
}

/**
 * Compute a single firm's actual results after market clearing.
 *
 * @param {Object} firmDecision - {qty, sales, price, inv, finance}
 * @param {Object} clearingResults - {A: {price, qty}, B: {...}, C: {...}}
 * @param {Object} firmState - {state: {balance sheet}, inventory_details, efficiency} or null for initial
 * @param {Object} gameSetup - initial balance sheet from game config
 * @param {Object} rates - {st, lt, tax}
 * @param {Object} allApprovedLoans - Array of ALL approved loans for this firm historically
 * @param {number} currentRound - Current round number
 * @returns {Object} {nextStart, inventoryDetails, nextEfficiency, financials}
 */
export function computeFirmActualResults(
  firmDecision, 
  clearingResults, 
  firmState, 
  gameSetup, 
  rates, 
  allApprovedLoans = [],
  currentRound = 1
) {
  // Determine starting position
  const start = firmState?.state
    ? { ...firmState.state, rates }
    : { ...gameSetup, rates };

  const startInventoryDetails = firmState?.inventory_details
    || { A: { units: 0, value: 0 }, B: { units: 0, value: 0 }, C: { units: 0, value: 0 } };

  const prevEfficiency = firmState?.efficiency || 0;

  // 1. Calculate Mandatory Payment for this round
  // We sum the payments (cuotas) of all loans approved in PREVIOUS rounds or CURRENT round.
  // Note: A loan approved in Round N usually starts payment in Round N+1 or Round N.
  // Here we'll assume payment starts the round it is approved (as it is "cleared" in that round).
  let mandatoryPayment = 0;
  allApprovedLoans.forEach(loan => {
      // A loan is active if: round_approved <= currentRound < (round_approved + term)
      const roundApproved = loan.round;
      const term = loan.approved_term || 1;
      
      if (currentRound >= roundApproved && currentRound < (roundApproved + term)) {
          const cuota = calculateLoanPayment(loan.approved_amount, loan.approved_rate, term);
          mandatoryPayment += cuota;
      }
  });

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

  // Current round loan terms (for interest calculation on new debt)
  const currentRoundLoans = {
    st: allApprovedLoans.find(l => l.round === currentRound && l.loan_type === 'ST'),
    lt: allApprovedLoans.find(l => l.round === currentRound && l.loan_type === 'LT')
  };

  // Run the simulation engine with actual values
  const isFinalRound = currentRound === 6;
  const result = calculateYear(
    start, 
    actualDecision, 
    prevEfficiency, 
    startInventoryDetails, 
    rates, 
    currentRoundLoans,
    mandatoryPayment,
    isFinalRound
  );

  return {
    nextStart: result.nextStart,
    inventoryDetails: result.inventoryDetails,
    nextEfficiency: result.nextEfficiency,
    financials: result.financials,
    usage: result.usage,
    capacityCheck: result.capacityCheck,
    limits: result.limits
  };
}
