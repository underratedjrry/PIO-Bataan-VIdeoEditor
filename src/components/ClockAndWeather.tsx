"use client";

import { useEffect, useState } from "react";
import { useClockTick } from "@/lib/useClockTick";

// Balanga City, Bataan (approximate) - used for a location-appropriate
// weather reading without needing the user's own geolocation permission.
const LATITUDE = 14.6761;
const LONGITUDE = 120.5361;

const WEATHER_CODES: Record<number, string> = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  80: "Rain showers",
  81: "Rain showers",
  82: "Violent showers",
  95: "Thunderstorm",
  96: "Thunderstorm",
  99: "Thunderstorm",
};

export function ClockAndWeather() {
  const tick = useClockTick();
  const now = tick ? new Date(tick) : null;
  const [weather, setWeather] = useState<{ tempC: number; label: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,weather_code&timezone=Asia%2FManila`,
      { signal: controller.signal },
    )
      .then((res) => res.json())
      .then((data) => {
        const tempC = data?.current?.temperature_2m;
        const code = data?.current?.weather_code;
        if (typeof tempC === "number") {
          setWeather({ tempC, label: WEATHER_CODES[code] ?? "-" });
        }
      })
      .catch(() => {
        // Weather is a nice-to-have widget - fail silently.
      });
    return () => controller.abort();
  }, []);

  if (!now) return null;

  const dateText = now.toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeText = now.toLocaleTimeString("en-PH", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
      <span>
        {dateText}, {timeText} PST
      </span>
      {weather && (
        <span>
          Bataan: {Math.round(weather.tempC)}&deg;C, {weather.label}
        </span>
      )}
    </div>
  );
}
