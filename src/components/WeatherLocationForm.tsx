"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { runWithToast } from "@/lib/toast-action";
import { resetWeatherLocation, updateWeatherLocation } from "@/lib/weather-actions";
import { XIcon } from "@/components/icons";
import type { LocationSearchResult } from "@/lib/weather";

export function WeatherLocationForm({
  currentName,
  isCustom,
}: {
  currentName: string;
  isCustom: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      return;
    }
    // setSearching(true) is deferred into the timeout callback (not called
    // synchronously in the effect body) - a bare synchronous setState call
    // here trips react-hooks/set-state-in-effect.
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/weather/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Derived, not stored - avoids clearing `results` synchronously in the
  // effect above just because the query got short again.
  const visibleResults = query.trim().length < 2 ? [] : results;

  function selectLocation(loc: LocationSearchResult) {
    const label = loc.admin1 ? `${loc.name}, ${loc.admin1}` : loc.name;
    const formData = new FormData();
    formData.set("name", label);
    formData.set("lat", String(loc.lat));
    formData.set("lng", String(loc.lng));
    startTransition(() => {
      runWithToast(() => updateWeatherLocation(formData), "Location updated.");
    });
    setQuery("");
    setResults([]);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-500 dark:text-slate-400">Location:</span>
        <span className="font-semibold text-slate-900 dark:text-slate-50">{currentName}</span>
        {isCustom && (
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(() => {
                runWithToast(() => resetWeatherLocation(), "Reset to default location.");
              })
            }
            aria-label="Reset to default location"
            title="Reset to default"
            className="text-slate-400 hover:text-[#E10017] disabled:opacity-50"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="relative max-w-sm">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a city or municipality..."
          className="form-input w-full"
        />
        {(visibleResults.length > 0 || searching) && (
          <div className="absolute z-20 mt-1 w-full border-2 border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
            {searching && (
              <p className="px-3 py-2 text-xs text-slate-400">Searching...</p>
            )}
            {!searching &&
              visibleResults.map((loc, i) => (
                <button
                  key={`${loc.lat}-${loc.lng}-${i}`}
                  type="button"
                  onClick={() => selectLocation(loc)}
                  className="block w-full border-b border-slate-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-slate-50 dark:border-slate-700/60 dark:hover:bg-slate-700/40"
                >
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {loc.name}
                  </span>
                  {loc.admin1 && (
                    <span className="text-slate-500 dark:text-slate-400"> - {loc.admin1}</span>
                  )}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
