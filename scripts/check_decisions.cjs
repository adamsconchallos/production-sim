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

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const JOIN_CODE = process.argv[2];

async function main() {
    console.log("Checking decisions...");
     const { data: game } = await supabase.from('games').select('id, current_round').eq('join_code', JOIN_CODE).single();
     if(!game) { console.log("Game not found"); return; }

     console.log(`Game ID: ${game.id}, Round: ${game.current_round}`);

    const { data, error } = await supabase
        .from('decisions')
        .select('firm_id, round, data')
        .eq('game_id', game.id)
        .eq('round', game.current_round); // Check CURRENT round

    if (error) console.error(error);
    console.log(`Found ${data?.length || 0} decisions for Round ${game.current_round}`);
    if (data && data.length > 0) {
        console.log("Sample Decision:", JSON.stringify(data[0].data));
    }
}

main();