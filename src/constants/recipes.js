export const DEPRECIATION_RATE = 0.05;
export const CAPACITY_PER_1000_MACHINE = 50;
export const CAPACITY_PER_1000_LABOUR = 100;
export const EFFICIENCY_GAIN_PER_10K_INV = 0.01;

// Liquidation & Scoring Constants
export const LIQUIDATION_HAIRCUT_INVENTORY = 0.30; // 30% loss on forced sale
export const LIQUIDATION_HAIRCUT_FIXED_ASSETS = 0.50; // 50% loss on forced sale
export const COST_OF_EQUITY = 0.12; // 12% for EVA calculation

export const RECIPE = {
  machine: { A: 2.0, B: 1.5, C: 1.0 },
  labour: { A: 1.0, B: 1.5, C: 2.0 },
  material: { A: 1.0, B: 1.0, C: 1.0 }
};

export const BASE_COSTS = {
  machine: 10,
  labour: 8,
  material: 5
};
