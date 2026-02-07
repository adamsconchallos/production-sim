const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Load Env
const envPath = path.resolve(process.cwd(), '.env');
let SUPABASE_URL = process.env.VITE_SUPABASE_URL;
let SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim();
            if (key === 'VITE_SUPABASE_URL') SUPABASE_URL = val;
            if (key === 'VITE_SUPABASE_ANON_KEY') SUPABASE_KEY = val;
        }
    });
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const JOIN_CODE = process.argv[2] || 'SBX94K';

// Helper: random int in [min, max]
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: random float in [min, max], rounded to 2 decimals
function randFloat(min, max) {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// Helper: jitter a value by ±pct
function jitter(val, pct = 0.15) {
    const factor = 1 + (Math.random() * 2 - 1) * pct;
    return Math.round(val * factor);
}

// Strategy archetypes scaled to capacity
function generateDecision(archetype, machineCap, labourCap) {
    switch (archetype) {
        case 'conservative': {
            // Low volume, A-heavy, high prices, no debt, no investment
            const qA = jitter(Math.floor(machineCap * 0.15));
            const qB = jitter(Math.floor(machineCap * 0.08));
            const qC = jitter(Math.floor(machineCap * 0.04));
            return {
                qty: { A: qA, B: qB, C: qC },
                sales: { A: qA, B: qB, C: qC },
                price: { A: randFloat(35, 38), B: randFloat(36, 40), C: randFloat(48, 52) },
                inv: { machine: 0, labour: 0 },
                finance: { newST: 0, newLT: 0, payST: 0, payLT: 0, div: randInt(0, 2) * 500 }
            };
        }
        case 'balanced': {
            // Moderate mix, market prices, some investment, small ST loan
            const qA = jitter(Math.floor(machineCap * 0.20));
            const qB = jitter(Math.floor(machineCap * 0.15));
            const qC = jitter(Math.floor(machineCap * 0.08));
            return {
                qty: { A: qA, B: qB, C: qC },
                sales: { A: qA, B: qB, C: qC },
                price: { A: randFloat(33, 36), B: randFloat(33, 36), C: randFloat(44, 48) },
                inv: { machine: randInt(3, 6) * 1000, labour: randInt(2, 4) * 1000 },
                finance: { newST: randInt(3, 8) * 1000, newLT: 0, payST: 0, payLT: 0, div: 0 }
            };
        }
        case 'growth': {
            // Moderate production, competitive prices, heavy investment, LT debt
            const qA = jitter(Math.floor(machineCap * 0.18));
            const qB = jitter(Math.floor(machineCap * 0.12));
            const qC = jitter(Math.floor(machineCap * 0.06));
            return {
                qty: { A: qA, B: qB, C: qC },
                sales: { A: qA, B: qB, C: qC },
                price: { A: randFloat(32, 35), B: randFloat(32, 35), C: randFloat(43, 47) },
                inv: { machine: randInt(10, 18) * 1000, labour: randInt(8, 12) * 1000 },
                finance: { newST: 0, newLT: randInt(15, 25) * 1000, payST: 0, payLT: 0, div: 0 }
            };
        }
        case 'volume': {
            // Near max capacity, below-market prices, some debt
            const qA = jitter(Math.floor(machineCap * 0.30));
            const qB = jitter(Math.floor(machineCap * 0.20));
            const qC = jitter(Math.floor(machineCap * 0.05));
            return {
                qty: { A: qA, B: qB, C: qC },
                sales: { A: qA, B: qB, C: qC },
                price: { A: randFloat(30, 33), B: randFloat(30, 33), C: randFloat(40, 44) },
                inv: { machine: randInt(2, 5) * 1000, labour: 0 },
                finance: { newST: randInt(5, 12) * 1000, newLT: 0, payST: 0, payLT: 0, div: 0 }
            };
        }
        case 'premium': {
            // C-heavy, high prices, labour investment, moderate LT debt
            const qA = jitter(Math.floor(machineCap * 0.08));
            const qB = jitter(Math.floor(machineCap * 0.10));
            const qC = jitter(Math.floor(labourCap * 0.15));
            return {
                qty: { A: qA, B: qB, C: qC },
                sales: { A: qA, B: qB, C: qC },
                price: { A: randFloat(35, 38), B: randFloat(36, 39), C: randFloat(48, 54) },
                inv: { machine: 0, labour: randInt(6, 10) * 1000 },
                finance: { newST: 0, newLT: randInt(8, 15) * 1000, payST: 0, payLT: 0, div: 0 }
            };
        }
    }
}

const ARCHETYPES = ['conservative', 'balanced', 'growth', 'volume', 'premium'];

async function main() {
    console.log(`\nConnecting to game ${JOIN_CODE}...\n`);

    // Get game
    const { data: game, error: gameErr } = await supabase
        .from('games')
        .select('*')
        .eq('join_code', JOIN_CODE)
        .single();

    if (gameErr || !game) {
        console.error("Game not found:", gameErr?.message);
        return;
    }

    console.log(`Game: ${game.name} | Round: ${game.current_round} | Status: ${game.round_status || 'unknown'}`);

    // Get firms
    const { data: firms, error: firmsErr } = await supabase
        .from('firms')
        .select('*')
        .eq('game_id', game.id);

    if (firmsErr || !firms) {
        console.error("Error fetching firms:", firmsErr?.message);
        return;
    }
    console.log(`Found ${firms.length} firms.\n`);

    // Get previous state for capacity limits
    const prevRound = game.current_round - 1;
    let firmStates = {};

    if (prevRound === 0) {
        firms.forEach(f => { firmStates[f.id] = game.setup; });
    } else {
        const { data: states } = await supabase
            .from('firm_state')
            .select('firm_id, state')
            .eq('game_id', game.id)
            .eq('round', prevRound);
        if (states) {
            states.forEach(s => { firmStates[s.firm_id] = s.state; });
        }
    }

    // Generate and collect decisions + loan requests
    const decisionRows = [];
    const loanRows = [];

    firms.forEach((firm, i) => {
        const state = firmStates[firm.id] || game.setup;
        const limits = state?.limits || { machine: 1000, labour: 1000 };
        const machineCap = limits.machine || 1000;
        const labourCap = limits.labour || 1000;

        // Distribute archetypes evenly, cycling through
        const archetype = ARCHETYPES[i % ARCHETYPES.length];
        const decision = generateDecision(archetype, machineCap, labourCap);

        // Verify capacity constraints
        const machUsed = decision.qty.A * 2 + decision.qty.B * 1.5 + decision.qty.C * 1;
        const labUsed = decision.qty.A * 1 + decision.qty.B * 1.5 + decision.qty.C * 2;

        // Clamp if over capacity
        if (machUsed > machineCap || labUsed > labourCap) {
            const scale = Math.min(machineCap / machUsed, labourCap / labUsed) * 0.95;
            decision.qty.A = Math.floor(decision.qty.A * scale);
            decision.qty.B = Math.floor(decision.qty.B * scale);
            decision.qty.C = Math.floor(decision.qty.C * scale);
            decision.sales.A = decision.qty.A;
            decision.sales.B = decision.qty.B;
            decision.sales.C = decision.qty.C;
        }

        const tag = archetype.toUpperCase().padEnd(13);
        console.log(`  ${tag} ${firm.name.padEnd(22)} | Qty A:${String(decision.qty.A).padStart(4)} B:${String(decision.qty.B).padStart(4)} C:${String(decision.qty.C).padStart(4)} | Price A:$${decision.price.A} B:$${decision.price.B} C:$${decision.price.C} | Inv M:$${decision.inv.machine} L:$${decision.inv.labour} | ST:$${decision.finance.newST} LT:$${decision.finance.newLT}`);

        decisionRows.push({
            game_id: game.id,
            firm_id: firm.id,
            round: game.current_round,
            data: decision,
            submitted_at: new Date().toISOString()
        });

        // Create loan requests if borrowing
        if (decision.finance.newST > 0) {
            loanRows.push({
                game_id: game.id,
                firm_id: firm.id,
                round: game.current_round,
                loan_type: 'ST',
                requested_amount: decision.finance.newST,
                status: 'pending'
            });
        }
        if (decision.finance.newLT > 0) {
            loanRows.push({
                game_id: game.id,
                firm_id: firm.id,
                round: game.current_round,
                loan_type: 'LT',
                requested_amount: decision.finance.newLT,
                status: 'pending'
            });
        }
    });

    // Submit decisions
    console.log(`\nSubmitting ${decisionRows.length} decisions...`);
    const { error: decErr } = await supabase
        .from('decisions')
        .upsert(decisionRows, { onConflict: 'game_id,firm_id,round' });

    if (decErr) {
        console.error("Error submitting decisions:", decErr.message);
        return;
    }
    console.log(`Decisions submitted successfully.`);

    // Submit loan requests
    if (loanRows.length > 0) {
        console.log(`Submitting ${loanRows.length} loan requests...`);
        const { error: loanErr } = await supabase
            .from('loan_requests')
            .upsert(loanRows, { onConflict: 'game_id,firm_id,round,loan_type' });

        if (loanErr) {
            console.error("Error submitting loan requests:", loanErr.message);
        } else {
            console.log(`Loan requests submitted successfully.`);
        }
    }

    // Verify
    const { data: verify } = await supabase
        .from('decisions')
        .select('firm_id')
        .eq('game_id', game.id)
        .eq('round', game.current_round);

    console.log(`\nVerification: ${verify?.length || 0} decisions in DB for Round ${game.current_round} (expected ${firms.length}).`);
}

main();
