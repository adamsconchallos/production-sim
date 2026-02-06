# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build locally
- `npm run lint` — Run ESLint across the project

## Architecture

This is **StratFi**, a single-page React app for a business strategy simulation game. It lets players plan production, pricing, financing, and investment decisions across 3 rounds, with a chained financial simulation engine that computes income statements, balance sheets, and key ratios.

### Module structure

```
src/
├── main.jsx                    Entry point (unchanged)
├── App.jsx                     Root component: state, composition, layout
├── constants/
│   ├── defaults.js             PUBLISHED_URL, DEFAULT_SCENARIOS
│   ├── recipes.js              RECIPE, BASE_COSTS, DEPRECIATION_RATE, CAPACITY_*, EFFICIENCY_*
│   └── gridRows.js             getGridRows() — row definitions for planner table, CSV, and ticket
├── engine/
│   └── simulation.js           calculateYear() — pure financial simulation function
├── hooks/
│   └── useMarketData.js        Custom hook for fetching/managing market scenario data
├── utils/
│   └── formatters.js           formatVal() — currency/percent/decimal/number formatting
├── components/
│   ├── ui/
│   │   ├── Card.jsx
│   │   ├── Tooltip.jsx
│   │   └── InputCell.jsx
│   ├── charts/
│   │   ├── SimpleChart.jsx     SVG line charts (Analysis tab)
│   │   └── FanChart.jsx        SVG forecast cone charts (Market Brief tab)
│   ├── MarketBrief.jsx         Tabbed market data view with FanCharts
│   ├── SetupPanel.jsx          Initial Position (balance sheet) input card
│   ├── PlannerGrid.jsx         Master grid table with collapsible sections
│   └── SubmissionModal.jsx     Ticket generation, copy-to-clipboard, Google Form link
```

No routing or state management library. All state lives in the root `StratFi` component via `useState`/`useMemo`.

### Key modules

- **`engine/simulation.js`**: `calculateYear(start, decision, prevEfficiency, startInventoryDetails, rates)` — pure function implementing FIFO inventory costing, capacity constraints (machine/labour hours), depreciation (5%), efficiency gains, and full financial statement generation. Called 3 times in a chain (R1→R2→R3).
- **`constants/gridRows.js`**: Declarative row definitions that drive the planner table UI, CSV export, and ticket generation. Each row has a `type` (header/input/output/status/displayLimit/spacer) and maps to either user input or computed output.
- **`hooks/useMarketData.js`**: Fetches market data from Google Sheets CSV on mount, parses and sorts it, falls back to `DEFAULT_SCENARIOS`.
- **State structure**: `setup` (initial balance sheet position), `decisions` (per-round inputs for r1/r2/r3 containing qty, price, investments, financing), `scenarios` (market data).

### Business logic constants

- `RECIPE` — resource consumption per product (machine hours, labour hours, material)
- `BASE_COSTS` — cost per hour/unit for each resource type
- `DEPRECIATION_RATE` (5%), `CAPACITY_PER_1000_MACHINE` (50 hrs), `CAPACITY_PER_1000_LABOUR` (100 hrs), `EFFICIENCY_GAIN_PER_10K_INV` (1%)

### External data

Market data is fetched from a published Google Sheet CSV on mount. The fetch uses the URL directly (a CORS proxy is commented out). On failure, falls back to `DEFAULT_SCENARIOS`.

## Tech Stack

- React 19 with Vite 7
- Tailwind CSS 3 for styling (all styles are utility classes inline, `App.css` is unused boilerplate)
- lucide-react for icons
- No test framework is configured
- ESLint with react-hooks and react-refresh plugins; `no-unused-vars` ignores uppercase/underscore-prefixed variables
