/**
 * Calculates a fixed payment (cuota) for a loan using the standard amortization formula.
 * @param {number} principal - Total amount borrowed
 * @param {number} rate - Annual interest rate (e.g., 10 for 10%)
 * @param {number} term - Term in years
 * @returns {number} Fixed annual payment
 */
export function calculateLoanPayment(principal, rate, term) {
  if (!principal || principal <= 0) return 0;
  if (!term || term <= 0) return principal; // Immediate repayment if no term
  
  const r = rate / 100;
  if (r === 0) return principal / term;

  // Standard annuity formula: P * [r(1+r)^n] / [(1+r)^n - 1]
  const payment = principal * (r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1);
  return payment;
}

/**
 * Calculates Economic Value Added (EVA).
 * EVA = NOPAT - (Invested Capital * WACC)
 * For simplicity in this game: EVA = Net Income - (Equity * Cost of Equity)
 * @param {number} netIncome 
 * @param {number} equity 
 * @param {number} costOfEquity 
 * @returns {number}
 */
export function calculateEVA(netIncome, equity, costOfEquity) {
  return netIncome - (equity * costOfEquity);
}
