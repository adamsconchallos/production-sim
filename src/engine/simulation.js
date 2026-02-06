import {
  DEPRECIATION_RATE,
  CAPACITY_PER_1000_MACHINE,
  CAPACITY_PER_1000_LABOUR,
  EFFICIENCY_GAIN_PER_10K_INV,
  RECIPE,
  BASE_COSTS
} from '../constants/recipes';

export function calculateYear(start, decision, prevEfficiency = 0, startInventoryDetails, rates) {
  // 1. Efficiency & Costs
  const costMultiplier = 1 - prevEfficiency;
  const salesRate = decision.general.salesRate / 100;

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

  let salesCapped = false;
  let maxRatePossible = 0;

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

    // interpret salesRate as sell-through of available stock (cap at 100%)
    const sellThrough = Math.min(salesRate, 1);
    let demand = available * sellThrough;

    // optional UI flag: if user typed >100%, show it is capped to 100%
    if (salesRate > 1 && available > 0) {
      salesCapped = true;
      maxRatePossible = 100;
    }

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

  // 2. Fixed Costs
  const endST = Math.max(0, start.stDebt - decision.finance.payST + decision.finance.newST);
  const endLT = Math.max(0, start.ltDebt - decision.finance.payLT + decision.finance.newLT);
  const interest = (endST * (rates.st/100)) + (endLT * (rates.lt/100));
  const depreciation = start.fixedAssets * DEPRECIATION_RATE;
  const trainingExp = decision.inv.labour;
  const opEx = depreciation + trainingExp;

  // 3. Profit
  const grossProfit = revenue - cogs;
  const ebit = grossProfit - opEx;
  const ebt = ebit - interest;
  const tax = Math.max(0, ebt > 0 ? ebt * (rates.tax/100) : 0);
  const netIncome = ebt - tax;

  // 4. Cash Flow
  const cashIn = start.cash + revenue + decision.finance.newST + decision.finance.newLT;
  const cashOut = totalProdCost + trainingExp + interest + tax + decision.inv.machine + decision.finance.payST + decision.finance.payLT + decision.finance.div;
  const endCash = cashIn - cashOut;

  // 5. Balance Sheet
  const endFixedAssets = start.fixedAssets - depreciation + decision.inv.machine;
  const endTotalAssets = endCash + totalInventoryValue + endFixedAssets;
  const endRE = start.retainedEarnings + netIncome - decision.finance.div;
  const endEquity = start.equity + endRE - start.retainedEarnings;
  const endTotalLiabEquity = endST + endLT + endEquity;
  const totalDebt = endST + endLT;

  // 6. Next Round State
  const addedMachineCap = (decision.inv.machine / 1000) * CAPACITY_PER_1000_MACHINE;
  const addedLabourCap = (decision.inv.labour / 1000) * CAPACITY_PER_1000_LABOUR;
  const nextLimits = {
    machine: start.limits.machine + addedMachineCap,
    labour: start.limits.labour + addedLabourCap,
    material: 100000
  };
  const totalInv = decision.inv.machine + decision.inv.labour;
  const addedEfficiency = (totalInv / 10000) * EFFICIENCY_GAIN_PER_10K_INV;
  const nextEfficiency = prevEfficiency + addedEfficiency;

  // 7. Ratios
  const roe = endEquity > 0 ? (netIncome / endEquity) * 100 : 0;
  const roa = endTotalAssets > 0 ? (netIncome / endTotalAssets) * 100 : 0;
  const assetTurnover = endTotalAssets > 0 ? revenue / endTotalAssets : 0;
  const equityMultiplier = endEquity > 0 ? endTotalAssets / endEquity : 0;
  const debtEquityRatio = endEquity > 0 ? totalDebt / endEquity : 0;

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
        roe,
        roa,
        assetTurnover,
        equityMultiplier,
        debtEquityRatio,
        // Balance Sheet Items
        cash: endCash,
        inventory: totalInventoryValue,
        inventoryUnits: totalInventoryUnits,
        fixedAssets: endFixedAssets,
        totalAssets: endTotalAssets,
        stDebt: endST,
        ltDebt: endLT,
        equity: endEquity,
        totalLiabEquity: endTotalLiabEquity,
        totalUnitsSold
    },
    flags: {
        salesCapped,
        maxRatePossible
    },
    inventoryDetails: nextInventoryDetails,
    limits: start.limits,
    usage: { machine: machineHoursUsed, labour: labourHoursUsed },
    nextStart: {
      cash: endCash,
      inventory: totalInventoryValue,
      fixedAssets: endFixedAssets,
      stDebt: endST,
      ltDebt: endLT,
      equity: endEquity,
      retainedEarnings: endRE,
      limits: nextLimits
    },
    nextEfficiency,
    capacityCheck: {
        machine: { used: machineHoursUsed, limit: start.limits.machine, safe: machineHoursUsed <= start.limits.machine },
        labour: { used: labourHoursUsed, limit: start.limits.labour, safe: labourHoursUsed <= start.limits.labour }
    }
  };
}
