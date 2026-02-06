import { useState, useEffect } from 'react';
import { PUBLISHED_URL, DEFAULT_SCENARIOS } from '../constants/defaults';

// FIX: Use a CORS Proxy to bypass browser restrictions
//const PROXY = "https://api.allorigins.win/raw?url=";
//const SHEET_CSV_URL = `${PROXY}${encodeURIComponent(PUBLISHED_URL)}`;
const SHEET_CSV_URL = PUBLISHED_URL;

export function useMarketData() {
  const [scenarios, setScenarios] = useState(DEFAULT_SCENARIOS);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [usingDefaults, setUsingDefaults] = useState(false);

  const fetchMarketData = async () => {
    setIsLoadingData(true);
    setUsingDefaults(false);
    try {
      const response = await fetch(SHEET_CSV_URL);
      if (!response.ok) throw new Error("Network response was not ok");
      const text = await response.text();

      // Basic CSV Parse (Robust for AllOrigins response)
      // Rows might contain \r\n
      const rows = text.split(/\r?\n/).slice(1); // skip header

      if (rows.length < 3) {
        throw new Error("Empty data received");
      }

      const newScenarios = JSON.parse(JSON.stringify(DEFAULT_SCENARIOS));
      ['A','B','C'].forEach(p => {
        newScenarios[p].history = [];
        newScenarios[p].forecast = null; // Clear to detect later
      });

      let validRowsCount = 0;

      rows.forEach(row => {
        // CSV split handling simple commas
        const cols = row.split(',').map(c => c ? c.replace(/^"|"$/g, '').trim() : '');
        if (cols.length < 5) return;

        const [prod, type, year, price, demand, priceSD, demandSD] = cols;
        if (!newScenarios[prod]) return;

        validRowsCount++;

        const pSD = parseFloat(priceSD || "0");
        const dSD = parseFloat(demandSD || "0");

        // LOGIC UPDATE: Use SD presence OR "Forecast" label to identify the single forecast row
        const isForecast = (pSD > 0 || dSD > 0) || (type && type.toLowerCase() === 'forecast');

        if (isForecast) {
          newScenarios[prod].forecast = {
            year,
            price: { mean: parseFloat(price), sd: pSD },
            demand: { mean: parseFloat(demand), sd: dSD }
          };
        } else {
          newScenarios[prod].history.push({
            year,
            price: parseFloat(price),
            demand: parseFloat(demand)
          });
        }
      });

      // SORTING UPDATE: Auto-sort history chronologically
      ['A','B','C'].forEach(p => {
        if (!newScenarios[p].history.length) return;

        newScenarios[p].history.sort((a, b) => {
          // Try to extract numbers from "Y-4", "Year 1", "2023"
          const numA = parseFloat(a.year.replace(/[^0-9.-]+/g, ""));
          const numB = parseFloat(b.year.replace(/[^0-9.-]+/g, ""));

          // If both have valid numbers, sort numerically
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
          // Fallback: String sort
          return a.year.localeCompare(b.year, undefined, { numeric: true });
        });

        // Safety check: if no forecast found, use last history + dummy SD
        if (!newScenarios[p].forecast) {
          const lastHist = newScenarios[p].history[newScenarios[p].history.length - 1];
          newScenarios[p].forecast = {
            year: "Next",
            price: { mean: lastHist.price, sd: 0 },
            demand: { mean: lastHist.demand, sd: 0 }
          };
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
  };

  // Fetch on mount
  useEffect(() => {
    fetchMarketData();
  }, []);

  return { scenarios, isLoadingData, usingDefaults, fetchMarketData };
}
