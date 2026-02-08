/**
 * Calculates a firm's credit rating and risk premium based on their financial state.
 * 
 * @param {Object} financials - The firm's financials from the LAST round (or setup).
 * @param {Object} baseRates - Global base rates { st: 10, lt: 5 }
 * @returns {Object} { rating, score, riskPremium, maxLTV, label, color }
 */
export function calculateCreditRating(financials, baseRates) {
  if (!financials) return getDefaultRating(baseRates);

  // 1. Calculate Ratios
  const totalDebt = (financials.stDebt || 0) + (financials.ltDebt || 0);
  const totalEquity = (financials.equity || 0) + (financials.retainedEarnings || 0);
  const equity = totalEquity || 1; // Avoid div by zero
  const debtToEquity = totalDebt / equity;

  const currentAssets = (financials.cash || 0) + (financials.inventory || 0);
  const currentLiabilities = financials.stDebt || 0;
  const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 3.0; // 3.0 is healthy cap if no debt

  const ebit = financials.ebit || 0;
  const interest = financials.interest || 0;
  const interestCoverage = interest > 0 ? ebit / interest : (ebit > 0 ? 10 : 0);

  // 2. Score Calculation (Base 100)
  let score = 75; // Start at 'BBB' level

  // Penalize High Leverage (D/E)
  if (debtToEquity > 2.0) score -= 20;
  else if (debtToEquity > 1.5) score -= 10;
  else if (debtToEquity < 0.5) score += 10;

  // Penalize Low Liquidity (Current Ratio)
  if (currentRatio < 1.0) score -= 15;
  else if (currentRatio > 1.5) score += 5;

  // Penalize Low Coverage (EBIT/Interest)
  if (interestCoverage < 1.5) score -= 15;
  else if (interestCoverage > 3.0) score += 5;

  // 3. Determine Rating Tier
  let rating = 'B';
  let riskPremium = 0;
  let label = 'High Risk';
  let color = 'text-red-600';
  let bgColor = 'bg-red-50 border-red-200';

  if (score >= 90) {
    rating = 'AAA';
    riskPremium = -1.0; // Discount for prime borrowers
    label = 'Prime';
    color = 'text-emerald-700';
    bgColor = 'bg-emerald-50 border-emerald-200';
  } else if (score >= 80) {
    rating = 'A';
    riskPremium = 0.0; // Base rate
    label = 'Strong';
    color = 'text-green-600';
    bgColor = 'bg-green-50 border-green-200';
  } else if (score >= 65) {
    rating = 'BBB';
    riskPremium = 2.0;
    label = 'Standard';
    color = 'text-blue-600';
    bgColor = 'bg-blue-50 border-blue-200';
  } else if (score >= 50) {
    rating = 'BB';
    riskPremium = 4.0;
    label = 'Speculative';
    color = 'text-amber-600';
    bgColor = 'bg-amber-50 border-amber-200';
  } else {
    rating = 'C';
    riskPremium = 8.0; // Junk status
    label = 'Distressed';
    color = 'text-red-700';
    bgColor = 'bg-red-100 border-red-200';
  }

  // 4. Calculate Likely Rates
  const estimatedST = Math.max(2, baseRates.st + riskPremium);
  const estimatedLT = Math.max(2, baseRates.lt + riskPremium);

  return {
    rating,
    score,
    riskPremium,
    estimatedST,
    estimatedLT,
    label,
    color,
    bgColor,
    metrics: { debtToEquity, currentRatio }
  };
}

function getDefaultRating(baseRates) {
  return {
    rating: 'A',
    score: 85,
    riskPremium: 0,
    estimatedST: baseRates.st,
    estimatedLT: baseRates.lt,
    label: 'New Firm',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50 border-slate-200',
    metrics: { debtToEquity: 0, currentRatio: 0 }
  };
}
