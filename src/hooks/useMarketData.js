import { useState, useEffect, useCallback } from 'react';
import { PUBLISHED_URL, DEFAULT_SCENARIOS } from '../constants/defaults';

const SHEET_CSV_URL = PUBLISHED_URL;

export function useMarketData(gameId) {
  const [scenarios, setScenarios] = useState(DEFAULT_SCENARIOS);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [usingDefaults, setUsingDefaults] = useState(false);

  // --- Supabase fetch (game mode) ---
  const fetchFromSupabase = useCallback(async () => {
    const { supabase } = await import('../lib/supabase');
    if (!supabase || !gameId) return;

    setIsLoadingData(true);
    setUsingDefaults(false);

    try {
      const { data: rows, error } = await supabase
        .from('market_data')
        .select('*')
        .eq('game_id', gameId)
        .order('sort_order')
        .order('created_at');

      if (error || !rows || rows.length === 0) {
        throw new Error(error?.message || 'No market data found');
      }

      const newScenarios = JSON.parse(JSON.stringify(DEFAULT_SCENARIOS));
      ['A', 'B', 'C'].forEach(p => {
        newScenarios[p].history = [];
        newScenarios[p].forecast = null;
      });

      rows.forEach(row => {
        const p = row.product;
        if (!newScenarios[p]) return;

        if (row.type === 'Forecast') {
          newScenarios[p].forecast = {
            year: row.year,
            price: { mean: parseFloat(row.price), sd: parseFloat(row.price_sd || 0) },
            demand: { mean: parseFloat(row.demand), sd: parseFloat(row.demand_sd || 0) }
          };
        } else {
          newScenarios[p].history.push({
            year: row.year,
            price: parseFloat(row.price),
            demand: parseFloat(row.demand)
          });
        }
      });

      // Safety: if no forecast, generate from last history point
      ['A', 'B', 'C'].forEach(p => {
        if (!newScenarios[p].forecast && newScenarios[p].history.length > 0) {
          const last = newScenarios[p].history[newScenarios[p].history.length - 1];
          newScenarios[p].forecast = {
            year: 'Next',
            price: { mean: last.price, sd: 0 },
            demand: { mean: last.demand, sd: 0 }
          };
        }
      });

      setScenarios(newScenarios);
    } catch (e) {
      console.warn('Failed to load market data from Supabase:', e);
      setUsingDefaults(true);
      setScenarios(DEFAULT_SCENARIOS);
    } finally {
      setIsLoadingData(false);
    }
  }, [gameId]);

  // --- Google Sheets fetch (demo mode) ---
  const fetchFromSheets = useCallback(async () => {
    setIsLoadingData(true);
    setUsingDefaults(false);
    try {
      const response = await fetch(SHEET_CSV_URL);
      if (!response.ok) throw new Error("Network response was not ok");
      const text = await response.text();

      const rows = text.split(/\r?\n/).slice(1);
      if (rows.length < 3) throw new Error("Empty data received");

      const newScenarios = JSON.parse(JSON.stringify(DEFAULT_SCENARIOS));
      ['A','B','C'].forEach(p => {
        newScenarios[p].history = [];
        newScenarios[p].forecast = null;
      });

      let validRowsCount = 0;

      rows.forEach(row => {
        const cols = row.split(',').map(c => c ? c.replace(/^"|"$/g, '').trim() : '');
        if (cols.length < 5) return;

        const [prod, type, year, price, demand, priceSD, demandSD] = cols;
        if (!newScenarios[prod]) return;

        validRowsCount++;

        const pSD = parseFloat(priceSD || "0");
        const dSD = parseFloat(demandSD || "0");
        const isForecast = (pSD > 0 || dSD > 0) || (type && type.toLowerCase() === 'forecast');

        if (isForecast) {
          newScenarios[prod].forecast = {
            year,
            price: { mean: parseFloat(price), sd: pSD },
            demand: { mean: parseFloat(demand), sd: dSD }
          };
        } else {
          newScenarios[prod].history.push({ year, price: parseFloat(price), demand: parseFloat(demand) });
        }
      });

      ['A','B','C'].forEach(p => {
        if (!newScenarios[p].history.length) return;
        newScenarios[p].history.sort((a, b) => {
          const numA = parseFloat(a.year.replace(/[^0-9.-]+/g, ""));
          const numB = parseFloat(b.year.replace(/[^0-9.-]+/g, ""));
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return a.year.localeCompare(b.year, undefined, { numeric: true });
        });
        if (!newScenarios[p].forecast) {
          const lastHist = newScenarios[p].history[newScenarios[p].history.length - 1];
          newScenarios[p].forecast = { year: "Next", price: { mean: lastHist.price, sd: 0 }, demand: { mean: lastHist.demand, sd: 0 } };
        }
      });

      if (validRowsCount > 0) {
        setScenarios(newScenarios);
      } else {
        throw new Error("No valid rows parsed");
      }
    } catch (e) {
      console.warn("Failed to load market data, using defaults:", e);
      setUsingDefaults(true);
      setScenarios(DEFAULT_SCENARIOS);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  const fetchMarketData = useCallback(() => {
    if (gameId) return fetchFromSupabase();
    return fetchFromSheets();
  }, [gameId, fetchFromSupabase, fetchFromSheets]);

  // Fetch on mount and when gameId changes
  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  return { scenarios, isLoadingData, usingDefaults, fetchMarketData };
}
