// We use the "Published to Web" ID (2PACX...) not the editing ID.
// IMPORTANT: Changed '/pubhtml' to '/pub?output=csv' to get raw data instead of HTML.
export const PUBLISHED_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vSJM77z8w5otsNJ7G287thlhqCgdlLaexKnV6gzsiIrrok0dXp-NjFdp14eu4906arzwzxdbuObRhJF/pub?gid=0&single=true&output=csv`;

export const DEFAULT_SCENARIOS = {
  A: {
    name: "Product A (Mass Market)",
    history: [
      { year: "Y-4", price: 26, demand: 11000 },
      { year: "Y-3", price: 27, demand: 11500 },
      { year: "Y-2", price: 28, demand: 12000 },
      { year: "Y-1", price: 30, demand: 12500 },
      { year: "Y0",  price: 32, demand: 13000 }
    ],
    forecast: {
      year: "Y1",
      price: { mean: 33.50, sd: 1.5 },
      demand: { mean: 13500, sd: 800 }
    }
  },
  B: {
    name: "Product B (Specialized)",
    history: [
      { year: "Y-4", price: 42, demand: 7000 },
      { year: "Y-3", price: 40, demand: 7500 },
      { year: "Y-2", price: 38, demand: 8000 },
      { year: "Y-1", price: 36, demand: 8500 },
      { year: "Y0",  price: 35, demand: 9000 }
    ],
    forecast: {
      year: "Y1",
      price: { mean: 34.00, sd: 2.0 },
      demand: { mean: 9500, sd: 1200 }
    }
  },
  C: {
    name: "Product C (Premium/Niche)",
    history: [
      { year: "Y-4", price: 38, demand: 2500 },
      { year: "Y-3", price: 39, demand: 2800 },
      { year: "Y-2", price: 40, demand: 3000 },
      { year: "Y-1", price: 42, demand: 3200 },
      { year: "Y0",  price: 45, demand: 3500 }
    ],
    forecast: {
      year: "Y1",
      price: { mean: 46.50, sd: 3.0 },
      demand: { mean: 3800, sd: 400 }
    }
  }
};
