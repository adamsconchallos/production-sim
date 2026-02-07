export const tutorial = {
  // Navigation labels
  nav: {
    overview: 'Overview',
    concepts: 'Financial Concepts',
    grid: 'Reading the Grid',
    flow: 'Round Flow',
    tips: 'Strategic Tips',
    glossary: 'Glossary'
  },

  // Section 1: Game Overview
  overview: {
    title: 'What is StratFi?',
    subtitle: 'A Business Strategy Simulation Game',

    objective_title: 'Your Objective',
    objective_text: 'Maximize your firm\'s Return on Equity (ROE) over multiple rounds by making smart decisions about production, pricing, financing, and investment. ROE measures how efficiently you turn shareholder money into profit.',

    competition_title: 'Competition',
    competition_text: 'You\'re competing against other firms in the same market. Your pricing decisions affect market demand, and your production choices influence your profitability. Watch the leaderboard to see how you compare!',

    winning_title: 'How to Win',
    winning_text: 'The firm with the highest ROE at the end of the final round wins. High ROE comes from maximizing net income while managing equity efficiently. This requires balancing profitability, growth, and financial leverage.',

    rounds_title: 'Game Structure',
    rounds_text: 'The game runs for multiple rounds (typically 3-5). Each round represents a business period where you plan, submit decisions, and see results. Your instructor controls when each round closes and results are revealed.'
  },

  // Section 2: Financial Concepts
  concepts: {
    title: 'Key Financial Concepts',
    intro: 'Understanding these financial metrics is essential for making smart decisions and winning the game.',

    revenue_term: 'Revenue',
    revenue_spanish: 'Ingresos',
    revenue_def: 'Total money earned from selling products.',
    revenue_formula: 'Price × Units Sold (for each product)',
    revenue_example: 'Example: Sell 100 units of Product A at $50 each = $5,000 revenue',

    cogs_term: 'COGS (Cost of Goods Sold)',
    cogs_spanish: 'Costo de Bienes Vendidos',
    cogs_def: 'Variable costs of production including materials, machine hours, and labor.',
    cogs_formula: 'Total variable cost of all units sold (uses FIFO inventory method)',
    cogs_example: 'Example: Each unit costs $30 to make, sell 100 units = $3,000 COGS',

    gross_profit_term: 'Gross Profit',
    gross_profit_spanish: 'Margen Bruto / Utilidad Bruta',
    gross_profit_def: 'Profit after deducting variable costs.',
    gross_profit_formula: 'Revenue − COGS',
    gross_profit_example: 'Example: $5,000 revenue − $3,000 COGS = $2,000 gross profit',

    ebit_term: 'EBIT (Earnings Before Interest & Taxes)',
    ebit_spanish: 'UAII (Utilidad Antes de Intereses e Impuestos)',
    ebit_def: 'Operating profit before considering financing costs.',
    ebit_formula: 'Gross Profit − Depreciation − Training/Development Expenses',
    ebit_example: 'Example: $2,000 gross profit − $500 depreciation = $1,500 EBIT',

    net_income_term: 'Net Income',
    net_income_spanish: 'Utilidad Neta / Ganancia Neta',
    net_income_def: 'Final profit after all expenses, interest, and taxes.',
    net_income_formula: 'EBIT − Interest − Taxes',
    net_income_example: 'Example: $1,500 EBIT − $200 interest − $300 taxes = $1,000 net income',

    roe_term: 'ROE (Return on Equity)',
    roe_spanish: 'Retorno sobre Patrimonio',
    roe_def: '🏆 THE WINNING METRIC! Shows how efficiently you use shareholder money to generate profit.',
    roe_formula: 'Net Income ÷ Equity',
    roe_example: 'Example: $1,000 net income ÷ $10,000 equity = 10% ROE',
    roe_importance: 'Higher ROE means better performance. The firm with the highest ROE wins!',

    balance_sheet_title: 'Balance Sheet Basics',
    balance_sheet_equation: 'Assets = Liabilities + Equity',
    balance_sheet_assets: 'Assets: What you own (cash, inventory, machines)',
    balance_sheet_liabilities: 'Liabilities: What you owe (short-term debt, long-term debt)',
    balance_sheet_equity: 'Equity: Shareholder investment + retained earnings',

    cash_title: 'Cash Management',
    cash_importance: '💰 Cash is king! Running out of cash can force you out of the game.',
    cash_sources: 'Cash comes from: sales revenue, borrowing money (debt)',
    cash_uses: 'Cash is used for: production costs, buying machines/labor, repaying debt, paying dividends',
    cash_warning: 'Always project your ending cash balance. If it goes negative, you need to borrow or cut spending!'
  },

  // Section 3: Understanding the Planner Grid
  grid_guide: {
    title: 'Understanding the Planner Grid',
    intro: 'The planner grid is your main decision-making tool. It shows both input cells (where you enter decisions) and output cells (calculated results).',

    operations_title: '📊 Operations Section',
    operations_desc: 'Plan production and pricing for each product (A, B, C). Enter how many units to produce, set prices, and decide how many to sell. The simulation calculates revenue, costs, and inventory levels.',

    capacity_title: '⚙️ Capacity & Utilization Section',
    capacity_desc: 'Track your machine hours and labor hours. Each product requires different amounts of these resources. If you exceed 100% capacity, you can\'t produce everything you planned!',
    capacity_tip: 'Tip: Aim for 80-100% utilization to spread fixed costs efficiently.',

    growth_title: '📈 Growth (CAPEX & Expense) Section',
    growth_desc: 'Invest in expansion by buying more machines or training labor. These investments increase your capacity for future rounds. You can also invest in training/development to improve efficiency.',
    growth_warning: 'Investments cost cash upfront but pay off over time through higher capacity and lower costs.',

    finance_title: '💳 Finance Section',
    finance_desc: 'Manage debt and dividends. Borrow short-term or long-term debt to fund operations or growth. Repay principal to reduce debt. Pay dividends to return cash to shareholders.',
    finance_tip: 'Tip: Short-term debt has higher interest rates. Use long-term debt for major investments.',

    income_statement_title: '📋 Income Statement Section',
    income_statement_desc: 'Shows your projected profit for the round. All cells here are calculated automatically based on your decisions. Key metric: Net Income.',

    balance_sheet_title: '🏦 Financial Position (Balance Sheet) Section',
    balance_sheet_desc: 'Shows your projected assets, liabilities, and equity at the end of the round. All cells calculated automatically. Key metric: Equity (used to calculate ROE).',

    input_vs_output: 'Input cells (white background): You enter values here',
    output_cells: 'Output cells (gray/blue background): Automatically calculated',

    tooltips: 'Hover over row labels to see helpful tooltips explaining each metric.'
  },

  // Section 4: How a Round Works
  flow: {
    title: 'How a Round Works',
    intro: 'Each round follows a predictable timeline. Understanding the flow helps you plan ahead.',

    step1_title: 'Step 1: Review Results',
    step1_desc: 'If not Round 1, review your actual results from the previous round. How did you perform? What was your ROE? Check the leaderboard to see competitor performance.',

    step2_title: 'Step 2: Check Market Data',
    step2_desc: 'Review the market brief to see demand forecasts and price trends for each product. This helps you decide what to produce and at what price.',
    step2_tip: 'Higher demand = more units sold, but prices may fall if supply increases.',

    step3_title: 'Step 3: Plan Operations',
    step3_desc: 'Enter production quantities, set prices, and decide sales volumes. Consider your capacity limits and contribution margins.',

    step4_title: 'Step 4: Plan Investments',
    step4_desc: 'Decide if you want to expand capacity (buy machines, train labor) or improve efficiency (R&D spending).',
    step4_consider: 'Consider: Do you have cash? Will future demand justify the investment?',

    step5_title: 'Step 5: Plan Financing',
    step5_desc: 'Determine if you need to borrow money (new debt) or can repay existing debt. Consider paying dividends if you have excess cash.',
    step5_warning: 'Warning: Borrowing increases interest expense, which reduces net income.',

    step6_title: 'Step 6: Submit Decisions',
    step6_desc: 'Click "Submit Round X Decisions" and generate a submission ticket. Copy the data and submit it to your instructor (via Google Form or other method).',
    step6_deadline: 'Pay attention to submission deadlines! Late submissions may not be accepted.',

    step7_title: 'Step 7: Wait for Instructor',
    step7_desc: 'After all firms submit, your instructor will "clear" the round. This means they process all decisions and calculate market-wide results.',
    step7_patience: 'This step requires patience. The instructor determines when results are ready.',

    step8_title: 'Step 8: See Results & Leaderboard',
    step8_desc: 'Once the round is cleared, your actual results appear in the grid. Compare projected vs. actual. Check the leaderboard to see rankings by ROE.',
    step8_learn: 'Learn from differences: Why did actual results differ from projections? Adjust your strategy for the next round!',

    resubmission: 'Can I resubmit? Yes, until the round closes. Your latest submission counts.',
    timing: 'Typical timeline: 1-2 days per round, depending on class schedule.'
  },

  // Section 5: Strategic Tips
  tips: {
    title: 'Strategic Tips & Common Mistakes',
    intro: 'Learn from these common patterns to improve your performance.',

    cash_warning_title: '🚨 Don\'t Run Out of Cash!',
    cash_warning_desc: 'The #1 mistake beginners make. If your projected cash balance goes negative, you\'re in crisis mode.',
    cash_warning_solution: 'Solutions: Borrow short-term debt, reduce production, delay investments, or cut dividends.',
    cash_warning_prevention: 'Prevention: Always project your cash flow before submitting. Build a cash cushion (5-10% of revenue).',

    capacity_title: '⚙️ Optimize Capacity Utilization',
    capacity_desc: 'Running at 80-100% capacity spreads fixed costs (like machine depreciation) over more units, lowering cost per unit.',
    capacity_too_low: 'Too low (<60%): You\'re wasting capacity. Produce more or cut capacity.',
    capacity_too_high: '(>100%): Impossible! You can\'t exceed 100%. Reduce production or invest in more machines/labor.',
    capacity_sweet_spot: 'Sweet spot: 85-95% gives you flexibility while staying efficient.',

    contribution_margin_title: '💡 Focus on Contribution Margin',
    contribution_margin_desc: 'Not all sales are equally profitable. Contribution margin = Price − Variable Cost per Unit.',
    contribution_margin_formula: 'Calculate: (Price − Material Cost − Machine Hour Cost − Labor Hour Cost) per unit',
    contribution_margin_strategy: 'If capacity is limited, prioritize products with the highest contribution margin per bottleneck hour (usually machine hours).',
    contribution_margin_example: 'Example: Product A earns $20 per machine hour, Product B earns $15. Focus on A!',

    debt_title: '📊 Use Debt Strategically',
    debt_good: 'Debt is not inherently bad! It can boost ROE if you earn more than the interest rate.',
    debt_leverage: 'Leverage effect: Borrow at 8%, earn 15% ROE → you keep the 7% spread per dollar borrowed.',
    debt_danger: 'Danger: Too much debt increases interest expense and financial risk. If profits fall, you still owe interest.',
    debt_types: 'Short-term debt: High rate (~10%), pay back quickly. Long-term debt: Lower rate (~6%), pay over time.',

    competitors_title: '👀 Watch Your Competitors',
    competitors_leaderboard: 'Check the leaderboard every round. Who\'s leading? Why?',
    competitors_market: 'Monitor market dynamics: If everyone raises prices, demand may shift. If everyone over-produces, prices fall.',
    competitors_strategy: 'Adapt your strategy: If you\'re behind, take calculated risks. If you\'re ahead, protect your position.',

    growth_title: '🌱 Balance Growth vs. Profit',
    growth_tradeoff: 'Investing in machines/labor costs cash now but increases capacity later.',
    growth_timing: 'Early rounds: Invest if demand is growing. Late rounds: Focus on profit (no time to recoup investments).',
    growth_roe_impact: 'Growth reduces short-term ROE (cash spent, no immediate return) but can boost long-term ROE.',

    pricing_title: '💵 Pricing Strategy',
    pricing_higher: 'Price too high: Fewer units sold, but higher margin per unit.',
    pricing_lower: 'Price too low: More units sold, but lower margin per unit.',
    pricing_optimal: 'Optimal price: Maximize total contribution margin (units sold × margin per unit).',
    pricing_market: 'Consider market demand forecasts. If demand is high, you can charge more.',

    fifo_title: '📦 Understand FIFO Inventory',
    fifo_desc: 'The game uses FIFO (First In, First Out) inventory costing. Older inventory is sold first.',
    fifo_impact: 'If costs change over time (e.g., you invested in efficiency), your COGS reflects older, higher costs first.',
    fifo_strategy: 'To reduce COGS quickly after efficiency gains, sell through old inventory fast.'
  },

  // Section 6: Glossary
  glossary: {
    title: 'Financial Terms Glossary',
    intro: 'Quick reference for all financial terminology used in the game.',

    terms: [
      {
        english: 'Assets',
        spanish: 'Activos',
        definition: 'What your firm owns: cash, inventory, fixed assets (machines).'
      },
      {
        english: 'Balance Sheet',
        spanish: 'Balance General / Estado de Situación Financiera',
        definition: 'Financial snapshot showing Assets = Liabilities + Equity at a point in time.'
      },
      {
        english: 'COGS (Cost of Goods Sold)',
        spanish: 'Costo de Bienes Vendidos',
        definition: 'Variable costs of units sold (materials, machine time, labor).'
      },
      {
        english: 'Contribution Margin',
        spanish: 'Margen de Contribución',
        definition: 'Price minus variable cost per unit. Shows profitability per unit sold.'
      },
      {
        english: 'Depreciation',
        spanish: 'Depreciación',
        definition: 'Fixed assets lose value each year (5% in this game). Non-cash expense.'
      },
      {
        english: 'EBIT (Earnings Before Interest & Taxes)',
        spanish: 'UAII (Utilidad Antes de Intereses e Impuestos)',
        definition: 'Operating profit before considering debt costs and taxes.'
      },
      {
        english: 'Equity',
        spanish: 'Patrimonio / Capital Contable',
        definition: 'Shareholder investment plus retained earnings. What owners have in the firm.'
      },
      {
        english: 'Fixed Assets',
        spanish: 'Activos Fijos',
        definition: 'Long-term assets like machines. Value decreases via depreciation.'
      },
      {
        english: 'Gross Profit',
        spanish: 'Margen Bruto / Utilidad Bruta',
        definition: 'Revenue minus COGS. Profit before operating expenses.'
      },
      {
        english: 'Income Statement',
        spanish: 'Estado de Resultados / Estado de Pérdidas y Ganancias',
        definition: 'Shows revenues, expenses, and profit over a period (one round).'
      },
      {
        english: 'Interest',
        spanish: 'Intereses',
        definition: 'Cost of borrowing money. Calculated as debt × interest rate.'
      },
      {
        english: 'Inventory',
        spanish: 'Inventario',
        definition: 'Finished goods not yet sold. Stored for future sales.'
      },
      {
        english: 'Liabilities',
        spanish: 'Pasivos',
        definition: 'What your firm owes: short-term debt, long-term debt.'
      },
      {
        english: 'LT Debt (Long-Term Debt)',
        spanish: 'Deuda a Largo Plazo',
        definition: 'Loans with lower interest rates, repaid over multiple rounds.'
      },
      {
        english: 'Net Income',
        spanish: 'Utilidad Neta / Ganancia Neta',
        definition: 'Final profit after all expenses. Used to calculate ROE.'
      },
      {
        english: 'Revenue',
        spanish: 'Ingresos / Ventas',
        definition: 'Total money earned from selling products. Price × Quantity for each product.'
      },
      {
        english: 'ROE (Return on Equity)',
        spanish: 'Retorno sobre Patrimonio / ROE',
        definition: 'Net Income ÷ Equity. THE WINNING METRIC. Measures profit per dollar of equity.'
      },
      {
        english: 'ST Debt (Short-Term Debt)',
        spanish: 'Deuda a Corto Plazo',
        definition: 'Loans with higher interest rates, typically repaid within one round.'
      },
      {
        english: 'Taxes',
        spanish: 'Impuestos',
        definition: 'Corporate income tax on EBIT minus interest. Percentage set by instructor.'
      },
      {
        english: 'Utilization',
        spanish: 'Utilización de Capacidad',
        definition: 'Percentage of capacity used. (Hours Used ÷ Hours Available) × 100%.'
      }
    ],

    footer: 'Remember: You don\'t need to memorize these! Use this glossary as a reference anytime.'
  },

  // Common UI elements
  close: 'Close',
  back: 'Back',
  next: 'Next',
  got_it: 'Got it!',
  learn_more: 'Learn More'
};
