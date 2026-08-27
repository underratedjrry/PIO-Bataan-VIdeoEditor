"use client";

import { useState } from "react";
import { WEATHER_CODES, type WeatherData } from "@/lib/weather";
import { ChevronRightIcon } from "@/components/icons";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toCelsiusOrFahrenheit(tempC: number, unit: "C" | "F") {
  return unit === "C" ? tempC : tempC * (9 / 5) + 32;
}

function timeOfDay(isoLocal: string) {
  const time = isoLocal.split("T")[1];
  return time ? time.slice(0, 5) : "-";
}

export function WeatherCards({ weather }: { weather: WeatherData }) {
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const currentTemp = Math.round(toCelsiusOrFahrenheit(weather.current.tempC, unit));
  const feelsLike = Math.round(toCelsiusOrFahrenheit(weather.current.feelsLikeC, unit));

  return (
    <div className="flex flex-col gap-4">
      {/* Current conditions - click to toggle C/F */}
      <button
        type="button"
        onClick={() => setUnit((u) => (u === "C" ? "F" : "C"))}
        title="Click to switch units"
        className="flex flex-col items-start gap-1 border-2 border-slate-200 bg-white p-6 text-left transition-colors hover:border-[#0036AF] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-[#4d7fff]"
      >
        <p className="nav-label text-slate-500 dark:text-slate-400">Right now</p>
        <p className="text-5xl font-bold text-slate-900 dark:text-slate-50">
          {currentTemp}&deg;{unit}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {WEATHER_CODES[weather.current.weatherCode] ?? "-"} &middot; Feels like {feelsLike}
          &deg;{unit}
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Humidity {weather.current.humidity}% &middot; Wind{" "}
          {Math.round(weather.current.windKph)} km/h &middot; Tap to switch &deg;C/&deg;F
        </p>
      </button>

      {/* Forecast tiles - click to expand extra detail */}
      <div className="grid grid-cols-1 gap-px border-2 border-slate-200 bg-slate-200 sm:grid-cols-5 dark:border-slate-800 dark:bg-slate-800">
        {weather.daily.map((day, i) => {
          const expanded = expandedDay === day.date;
          return (
            <button
              key={day.date}
              type="button"
              onClick={() => setExpandedDay(expanded ? null : day.date)}
              className="flex flex-col items-center gap-1 bg-white p-3 text-center transition-colors hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60"
            >
              <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                {i === 0 ? "Today" : DAY_NAMES[new Date(day.date).getDay()]}
              </span>
              <span className="text-[11px] text-slate-400">
                {WEATHER_CODES[day.weatherCode] ?? "-"}
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                {Math.round(toCelsiusOrFahrenheit(day.tempMaxC, unit))}&deg;
              </span>
              <span className="text-xs text-slate-400">
                {Math.round(toCelsiusOrFahrenheit(day.tempMinC, unit))}&deg;
              </span>
              <span className="text-[11px] text-blue-600 dark:text-blue-400">
                {day.precipitationChance}%
              </span>
              <ChevronRightIcon
                className={`h-3 w-3 text-slate-300 transition-transform dark:text-slate-600 ${
                  expanded ? "rotate-90" : ""
                }`}
              />
              {expanded && (
                <div className="mt-2 flex w-full flex-col gap-1 border-t border-slate-100 pt-2 text-left text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  <span>Rain total: {day.precipitationSumMm} mm</span>
                  <span>Max wind: {Math.round(day.windMaxKph)} km/h</span>
                  <span>UV index: {Math.round(day.uvIndexMax)}</span>
                  <span>Sunrise: {timeOfDay(day.sunrise)}</span>
                  <span>Sunset: {timeOfDay(day.sunset)}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
