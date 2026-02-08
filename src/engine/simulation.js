import {
  DEPRECIATION_RATE,
  CAPACITY_PER_1000_MACHINE,
  CAPACITY_PER_1000_LABOUR,
  EFFICIENCY_GAIN_PER_10K_INV,
  RECIPE,
  BASE_COSTS,
  LIQUIDATION_HAIRCUT_INVENTORY,
  LIQUIDATION_HAIRCUT_FIXED_ASSETS,
  COST_OF_EQUITY
} from '../constants/recipes.js';
import { calculateEVA } from '../utils/finance.js';

const DEFAULT_LIMITS = { machine: 1000, labour: 1000, material: 500 };

/**
 * Simulates a single year of operations.
 * 
 * @param {Object} start - Starting balance sheet/state
 * @param {Object} decision - Firm's decisions for the round
 * @param {number} prevEfficiency - Current efficiency multiplier
 * @param {Object} startInventoryDetails - Detailed inventory breakdown
 * @param {Object} rates - Global tax/interest rates
 * @param {Object} loanTerms - Per-firm loan rates (if applicable)
 * @param {number} mandatoryPayment - Required debt payment (cuota) for this round
 * @param {boolean} isFinalRound - If true, all debt is settled from liquidation
 */
export function calculateYear(
  start, 
  decision, 
  prevEfficiency = 0, 
  startInventoryDetails, 
  rates, 
  loanTerms = null,
  mandatoryPayment = 0,
  isFinalRound = false
) {
  // Ensure limits always exist
  if (!start.limits) start = { ...start, limits: DEFAULT_LIMITS };

  // 1. Efficiency & Costs
  const costMultiplier = 1 - prevEfficiency;

  let revenue = 0;
  let totalProdCost = 0;
  let cogs = 0;
  let machineHoursUsed = 0;
  let labourHoursUsed = 0;
  let totalUnitsSold = 0;
  let totalInventoryUnits = 0;
  let totalInventoryValue = 0;

  const nextInventoryDetails = { A: {units:0, value:0}, B: {units:0, value:0}, C: {units:0, value:0} };

  const products = ['A', 'B', 'C'];

  products.forEach(p => {
    const prodQty = decision.qty[p];

    machineHoursUsed += prodQty * RECIPE.machine[p];
    labourHoursUsed += prodQty * RECIPE.labour[p];

    const unitMachineCost = RECIPE.machine[p] * BASE_COSTS.machine;
    const unitLabourCost = RECIPE.labour[p] * BASE_COSTS.labour;
    const unitMatCost = RECIPE.material[p] * BASE_COSTS.material;
    const currentUnitCost = (unitMachineCost + unitLabourCost + unitMatCost) * costMultiplier;

    totalProdCost += prodQty * currentUnitCost;

    // --- FIFO SALES LOGIC ---
    const oldUnits = startInventoryDetails ? startInventoryDetails[p].units : 0;
    const oldTotalValue = startInventoryDetails ? startInventoryDetails[p].value : 0;
    const oldUnitCost = oldUnits > 0 ? oldTotalValue / oldUnits : 0;
    const available = oldUnits + prodQty;

    // Unit-based sales: user specifies how many units to sell, capped to available stock
    const demand = Math.min(decision.sales[p], available);

    let soldFromOld = 0;
    let soldFromNew = 0;

    if (demand <= oldUnits) {
        soldFromOld = demand;
        soldFromNew = 0;
    } else {
        soldFromOld = oldUnits;
        soldFromNew = demand - oldUnits;
    }

    totalUnitsSold += (soldFromOld + soldFromNew);

    revenue += (soldFromOld + soldFromNew) * decision.price[p];

    const cogsOld = soldFromOld * oldUnitCost;
    const cogsNew = soldFromNew * currentUnitCost;
    cogs += (cogsOld + cogsNew);

    const endUnitsOld = oldUnits - soldFromOld;
    const endUnitsNew = prodQty - soldFromNew;
    const endValueOld = endUnitsOld * oldUnitCost;
    const endValueNew = endUnitsNew * currentUnitCost;

    nextInventoryDetails[p].units = endUnitsOld + endUnitsNew;
    nextInventoryDetails[p].value = endValueOld + endValueNew;

    totalInventoryUnits += nextInventoryDetails[p].units;
    totalInventoryValue += nextInventoryDetails[p].value;
  });

  // 2. Fixed Costs & Interest
  const stRate = loanTerms?.st?.rate ?? rates.st;
  const ltRate = loanTerms?.lt?.rate ?? rates.lt;
  const interest = (start.stDebt * (stRate/100)) + (start.ltDebt * (ltRate/100));
  const depreciation = start.fixedAssets * DEPRECIATION_RATE;
  const trainingExp = decision.inv.labour;
  const opEx = depreciation + trainingExp;

  // 3. Voluntary Repayments (beyond mandatory)
  // Logic: mandatory payment is deducted first. Decisions.finance.payXX are ADDITIONAL payments.
  let actualPayST = Math.min(decision.finance.payST, start.stDebt);
  let actualPayLT = Math.min(decision.finance.payLT, start.ltDebt);

  // 4. Profit before taxes
  const grossProfit = revenue - cogs;
  const ebit = grossProfit - opEx;
  const ebt = ebit - interest;
  const tax = Math.max(0, ebt > 0 ? ebt * (rates.tax/100) : 0);
  const netIncome = ebt - tax;

  // 5. Cash Flow & Liquidation
  const cashIn = start.cash + revenue + decision.finance.newST + decision.finance.newLT;
  const baseCashOut = totalProdCost + trainingExp + interest + tax + decision.inv.machine + actualPayST + actualPayLT + decision.finance.div;
  
  let endCash = cashIn - baseCashOut - mandatoryPayment;
  let liquidationLoss = 0;
  let inventoryLiquidated = 0;
  let assetsLiquidated = 0;

  // Final assets before liquidation
  let endFixedAssets = start.fixedAssets - depreciation + decision.inv.machine;
  let endInventoryValue = totalInventoryValue;

  // Handle Cash Deficit via Forced Liquidation
  if (endCash < 0) {
    // 1. Sell Inventory (30% haircut)
    const inventoryRecoveryValue = endInventoryValue * (1 - LIQUIDATION_HAIRCUT_INVENTORY);
    const neededFromInventory = Math.min(Math.abs(endCash), inventoryRecoveryValue);
    
    inventoryLiquidated = neededFromInventory / (1 - LIQUIDATION_HAIRCUT_INVENTORY);
    liquidationLoss += inventoryLiquidated * LIQUIDATION_HAIRCUT_INVENTORY;
    endCash += neededFromInventory;
    endInventoryValue -= inventoryLiquidated;

    // 2. Sell Fixed Assets (50% haircut)
    if (endCash < 0) {
      const assetsRecoveryValue = endFixedAssets * (1 - LIQUIDATION_HAIRCUT_FIXED_ASSETS);
      const neededFromAssets = Math.min(Math.abs(endCash), assetsRecoveryValue);

      assetsLiquidated = neededFromAssets / (1 - LIQUIDATION_HAIRCUT_FIXED_ASSETS);
      liquidationLoss += assetsLiquidated * LIQUIDATION_HAIRCUT_FIXED_ASSETS;
      endCash += neededFromAssets;
      endFixedAssets -= assetsLiquidated;
    }
  }

  // 6. Balance Sheet Adjustments
  // Mandatory payment reduces debt. For simplicity, we reduce LT debt first, then ST.
  let remainingMandatory = mandatoryPayment;
  let repaidLTFromMandatory = Math.min(remainingMandatory, start.ltDebt - actualPayLT);
  remainingMandatory -= repaidLTFromMandatory;
  let repaidSTFromMandatory = Math.min(remainingMandatory, start.stDebt - actualPayST);
  
  let endST = start.stDebt - actualPayST - repaidSTFromMandatory + decision.finance.newST;
  let endLT = start.ltDebt - actualPayLT - repaidLTFromMandatory + decision.finance.newLT;

  let finalLiquidationLoss = liquidationLoss;
  let finalEquity = start.equity;
  let finalRE = (start.retainedEarnings || 0) + netIncome - decision.finance.div - liquidationLoss;

  // Final Round Settlement
  if (isFinalRound) {
    const totalRemainingDebt = endST + endLT;
    const finalRecoveryInventory = endInventoryValue * (1 - LIQUIDATION_HAIRCUT_INVENTORY);
    const finalRecoveryAssets = endFixedAssets * (1 - LIQUIDATION_HAIRCUT_FIXED_ASSETS);
    
    const availableToSettle = endCash + finalRecoveryInventory + finalRecoveryAssets;
    
    if (availableToSettle < totalRemainingDebt) {
        // Bankruptcy: Equity is wiped
        endCash = 0;
        endInventoryValue = 0;
        endFixedAssets = 0;
        endST = 0;
        endLT = 0;
        // Total liquidation loss is whatever is needed to bring Equity to 0
        finalLiquidationLoss = (start.equity + (start.retainedEarnings || 0) + netIncome - decision.finance.div);
        finalEquity = 0;
        finalRE = 0;
    } else {
        // Full Settlement
        endCash = availableToSettle - totalRemainingDebt;
        finalLiquidationLoss += (endInventoryValue - finalRecoveryInventory) + (endFixedAssets - finalRecoveryAssets);
        endInventoryValue = 0;
        endFixedAssets = 0;
        endST = 0;
        endLT = 0;
        finalRE = (start.retainedEarnings || 0) + netIncome - decision.finance.div - finalLiquidationLoss;
    }
  }

  const endTotalAssets = endCash + endInventoryValue + endFixedAssets;
  const endRE = finalRE;
  const endEquity = finalEquity;
  const endTotalLiabEquity = endST + endLT + endEquity + endRE;
  const totalDebt = endST + endLT;

  const totalEquity = endEquity + endRE;
  const eva = calculateEVA(netIncome - finalLiquidationLoss, (start.equity + (start.retainedEarnings || 0)), COST_OF_EQUITY);

  // 7. Next Round State
  const addedMachineCap = (decision.inv.machine / 1000) * CAPACITY_PER_1000_MACHINE;
  const addedLabourCap = (decision.inv.labour / 1000) * CAPACITY_PER_1000_LABOUR;
  const nextLimits = {
    machine: Math.max(0, (start.limits.machine - (assetsLiquidated / 1000 * CAPACITY_PER_1000_MACHINE)) + addedMachineCap),
    labour: start.limits.labour + addedLabourCap,
    material: 100000
  };
  const totalInv = decision.inv.machine + decision.inv.labour;
  const addedEfficiency = (totalInv / 10000) * EFFICIENCY_GAIN_PER_10K_INV;
  const nextEfficiency = prevEfficiency + addedEfficiency;

  // 8. Ratios
  const roe = totalEquity > 0 ? (netIncome / totalEquity) * 100 : 0;
  const roa = endTotalAssets > 0 ? (netIncome / endTotalAssets) * 100 : 0;
  const assetTurnover = endTotalAssets > 0 ? revenue / endTotalAssets : 0;
  const equityMultiplier = totalEquity > 0 ? endTotalAssets / totalEquity : 0;
  const debtEquityRatio = totalEquity > 0 ? totalDebt / totalEquity : 0;

  return {
    financials: {
        revenue,
        varCost: cogs,
        grossProfit,
        depreciation,
        trainingExp,
        ebit,
        interest,
        tax,
        netIncome,
        liquidationLoss,
        mandatoryPayment,
        eva,
        roe,
        roa,
        assetTurnover,
        equityMultiplier,
        debtEquityRatio,
        // Balance Sheet Items
        cash: endCash,
        inventory: endInventoryValue,
        inventoryUnits: totalInventoryUnits,
        fixedAssets: endFixedAssets,
        totalAssets: endTotalAssets,
        stDebt: endST,
        ltDebt: endLT,
        equity: endEquity,
        retainedEarnings: endRE,
        totalLiabEquity: endTotalLiabEquity,
        totalUnitsSold,
        inventoryUnitsA: nextInventoryDetails.A.units,
        inventoryUnitsB: nextInventoryDetails.B.units,
        inventoryUnitsC: nextInventoryDetails.C.units
    },
    inventoryDetails: nextInventoryDetails,
    limits: nextLimits,
    usage: { machine: machineHoursUsed, labour: labourHoursUsed },
    nextStart: {
      cash: endCash,
      inventory: endInventoryValue,
      fixedAssets: endFixedAssets,
      stDebt: endST,
      ltDebt: endLT,
      equity: endEquity,
      retainedEarnings: endRE,
      limits: nextLimits
    },
    nextEfficiency,
    capacityCheck: {
        machine: { used: machineHoursUsed, limit: start.limits.machine, isOver: machineHoursUsed > start.limits.machine },
        labour: { used: labourHoursUsed, limit: start.limits.labour, isOver: labourHoursUsed > start.limits.labour }
    }
  };
}
