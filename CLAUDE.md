# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build locally
- `npm run lint` — Run ESLint across the project

## Architecture

This is **StratFi**, a single-page React app for a business strategy simulation game. It lets players (firms) plan production, pricing, financing, and investment decisions across multiple rounds. The game uses a chained financial simulation engine that computes income statements, balance sheets, and key ratios. All game data and user interactions are persisted in a Supabase backend.

### Module structure

```
src/
├── main.jsx                    Entry point (unchanged)
├── App.jsx                     Root component: state, composition, layout
├── lib/
│   └── supabase.js             Supabase client initialization
├── constants/
│   ├── defaults.js             PUBLISHED_URL, DEFAULT_SCENARIOS
│   ├── recipes.js              RECIPE, BASE_COSTS, DEPRECIATION_RATE, CAPACITY_*, EFFICIENCY_*
│   └── gridRows.js             getGridRows() — row definitions for planner table, CSV, and ticket
├── engine/
│   ├── simulation.js           calculateYear() — pure financial simulation function
│   └── marketClearing.js       Market clearing logic for demand/supply
├── hooks/
│   ├── useAuth.js              Custom hook for handling student/teacher authentication (PIN-based)
│   ├── useMarketData.js        Custom hook for fetching/managing market scenario data
│   ├── useLoanRequests.js      Custom hook for fetching/managing loan requests
│   └── useLeaderboard.js       Custom hook for fetching leaderboard data
│   └── useInstructorLeaderboard.js Custom hook for instructor-specific leaderboard data
│   └── useLoanRequests.js      Custom hook for loan request data
├── utils/
│   ├── formatters.js           formatVal() — currency/percent/decimal/number formatting
│   └── creditRating.js         Logic for calculating firm credit ratings
├── components/
│   ├── ui/
│   │   ├── Card.jsx
│   │   ├── Tooltip.jsx
│   │   └── InputCell.jsx
│   ├── charts/
│   │   ├── SimpleChart.jsx     SVG line charts (Analysis tab)
│   │   └── FanChart.jsx        SVG forecast cone charts (Market Brief tab)
│   ├── planner/
│   │   ├── FinanceTab.jsx      Finance decisions input
│   │   ├── InvestmentTab.jsx   Investment decisions input
│   │   └── OperationsTab.jsx   Operations decisions input
│   │   └── PlannerTabs.jsx     Tab navigation for planner
│   ├── teacher/
│   │   ├── BalanceSheetEditor.jsx
│   │   ├── DemandCurveEditor.jsx
│   │   └── LoanReviewPanel.jsx Review and approve/deny loan requests
│   ├── InstructorLeaderboard.jsx Instructor-view of the leaderboard
│   ├── Leaderboard.jsx         Player-view of the leaderboard
│   ├── LoginPage.jsx           Login interface for students and teachers
│   ├── MarketBrief.jsx         Tabbed market data view with FanCharts
│   ├── PlannerGrid.jsx         Master grid table with collapsible sections
│   ├── SetupPanel.jsx          Initial Position (balance sheet) input card
│   ├── SubmissionModal.jsx     Handles decision submission and loan requests to Supabase
│   └── TeacherDashboard.jsx    Teacher's main interface for game management
```

**Supabase Database Tables:**
- `games`: Stores game configurations, teacher PINs, join codes, and current round status.
- `firms`: Stores individual firm data, including names and student PINs, linked to a specific game.
- `decisions`: Stores player decisions for each firm per round.
- `firm_state`: Stores the calculated financial state of each firm per round after simulation.
- `market_data`: Stores market scenario data for each game.
- `loan_requests`: Stores student loan requests, their approved status, amounts, rates, and terms.

**Authentication:**
The application uses a hybrid authentication system. Students log in with a join code, firm name, and firm PIN (custom PIN-based system). Instructors log in using Supabase Auth (email/password) which is managed through `useAuth.js`. Profiles for instructors are stored in the `profiles` table and linked via `teacher_id` in the `games` table. All database interactions respect Row Level Security (RLS) policies.

**State Management:**
No global state management library like Redux is used. Primary application state lives in the root `App.jsx` component or within specialized custom hooks (`useAuth`, `useMarketData`, etc.). `useAuth` persists session information in `localStorage` to maintain login across refreshes.

### Key modules

- **`lib/supabase.js`**: Initializes the Supabase client using environment variables.
- **`hooks/useAuth.js`**: Manages the custom student and teacher login/logout logic, persisting session information in `localStorage`.
- **`engine/simulation.js`**: `calculateYear(start, decision, prevEfficiency, startInventoryDetails, rates)` — pure function implementing FIFO inventory costing, capacity constraints (machine/labour hours), depreciation (5%), efficiency gains, and full financial statement generation. Called multiple times per round simulation.
- **`engine/marketClearing.js`**: Contains the logic for determining market prices and quantities based on demand and supply curves.
- **`constants/gridRows.js`**: Declarative row definitions that drive the planner table UI, CSV export, and ticket generation. Each row has a `type` (header/input/output/status/displayLimit/spacer) and maps to either user input or computed output.
- **`hooks/useMarketData.js`**: Fetches market data from the `market_data` Supabase table.
- **`hooks/useLoanRequests.js`**: Fetches and manages loan request data for a firm from the `loan_requests` Supabase table.
- **`components/SubmissionModal.jsx`**: Handles the submission of player decisions and loan requests to the Supabase `decisions` and `loan_requests` tables respectively.
- **`components/teacher/LoanReviewPanel.jsx`**: Provides an interface for teachers to review, approve, deny, and set terms for student loan requests, updating the `loan_requests` table.

### Business logic constants

- `RECIPE` — resource consumption per product (machine hours, labour hours, material)
- `BASE_COSTS` — cost per hour/unit for each resource type
- `DEPRECIATION_RATE` (5%), `CAPACITY_PER_1000_MACHINE` (50 hrs), `CAPACITY_PER_1000_LABOUR` (100 hrs), `EFFICIENCY_GAIN_PER_10K_INV` (1%)

### External data

Market data is primarily fetched from the Supabase `market_data` table. Legacy or fallback mechanisms may involve Google Sheets CSV, but Supabase is the main data source for game state.

## Tech Stack

- React 19 with Vite 7
- Supabase for backend database, authentication (custom), and API.
- Tailwind CSS 3 for styling (all styles are utility classes inline, `App.css` is unused boilerplate)
- lucide-react for icons
- No test framework is configured
- ESLint with react-hooks and react-refresh plugins; `no-unused-vars` ignores uppercase/underscore-prefixed variables