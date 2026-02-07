const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Load Env
const envPath = path.resolve(process.cwd(), '.env');
let SUPABASE_URL = process.env.VITE_SUPABASE_URL;
let SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    lines.forEach(line => {
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
const JOIN_CODE = process.argv[2];

if (!JOIN_CODE) {
    console.error("Please provide a Join Code.");
    process.exit(1);
}

async function main() {
    console.log(`Connecting to game ${JOIN_CODE}...`);

    // 2. Get Game
    const { data: game, error: gameErr } = await supabase
        .from('games')
        .select('*')
        .eq('join_code', JOIN_CODE)
        .single();
    
    if (gameErr || !game) {
        console.error("Game not found:", gameErr);
        return;
    }

    console.log(`Game: ${game.name} (Round ${game.current_round})`);
    
    // 3. Get Firms
    const { data: firms, error: firmsErr } = await supabase
        .from('firms')
        .select('*')
        .eq('game_id', game.id);
    
    if (firmsErr) {
        console.error("Error fetching firms:", firmsErr);
        return;
    }
    console.log(`Found ${firms.length} firms.`);

    // 4. Get Previous State (for capacity limits)
    // If Round 1, use Game Setup. Else use firm_state from round-1
    const prevRound = game.current_round - 1;
    let firmStates = {}; // firmId -> state object

    if (prevRound === 0) {
        // Use Setup for everyone
        firms.forEach(f => {
            firmStates[f.id] = game.setup;
        });
    } else {
        const { data: states } = await supabase
            .from('firm_state')
            .select('firm_id, state')
            .eq('game_id', game.id)
            .eq('round', prevRound);
        
        if (states) {
            states.forEach(s => firmStates[s.firm_id] = s.state);
        }
    }

    // 5. Generate Decisions
    const decisions = [];
    
    firms.forEach(firm => {
        const state = firmStates[firm.id] || game.setup;
        const limits = state.limits || { machine: 1000, labour: 1000, material: 100000 };
        const machineCap = limits.machine || 1000;
        
        console.log(`Firm ${firm.name}: Machine Cap = ${machineCap}`);

        // Random Strategy: "Balanced Growth"
        // Produce ~90% of capacity
        const productionA = Math.floor(machineCap * 0.45); // 45% to A
        const productionB = Math.floor(machineCap * 0.35); // 35% to B
        const productionC = Math.floor(machineCap * 0.10); // 10% to C

        // Prices: fluctuate around defaults
        const priceA = 24 + (Math.random() * 4 - 2); // 22-26
        const priceB = 28 + (Math.random() * 4 - 2); // 26-30
        const priceC = 35 + (Math.random() * 6 - 3); // 32-38

        const decision = {
            qty: { A: productionA, B: productionB, C: productionC },
            sales: { A: productionA, B: productionB, C: productionC }, // Sell what we make
            price: { A: priceA.toFixed(2), B: priceB.toFixed(2), C: priceC.toFixed(2) },
            inv: { machine: 0, labour: 0 }, // No investment for now
            finance: { newST: 0, newLT: 0, dividends: 0 }
        };

        // Randomly invest for some firms
        if (Math.random() > 0.7 && state.financials?.cash > 5000) {
            decision.inv.machine = 100;
        }

        console.log(`  -> Decision: Qty [${productionA}, ${productionB}, ${productionC}] @ Prices [${decision.price.A}, ${decision.price.B}, ${decision.price.C}]`);

        decisions.push({
            game_id: game.id,
            firm_id: firm.id,
            round: game.current_round,
            data: decision,
            submitted_at: new Date().toISOString()
        });
    });

    // 6. Submit
    const { error: insertErr } = await supabase
        .from('decisions')
        .upsert(decisions, { onConflict: 'game_id,firm_id,round' });

    if (insertErr) {
        console.error("Error submitting decisions:", insertErr);
    } else {
        console.log(`Successfully submitted decisions for ${decisions.length} firms for Round ${game.current_round}.`);
    }
}

main();