import { getCurrentProfile } from "@/lib/supabase/profile";
import { fetchWeather, resolveWeatherLocation, WEATHER_CODES } from "@/lib/weather";
import { WeatherLocationForm } from "@/components/WeatherLocationForm";
import { WeatherWidgets } from "@/components/WeatherWidgets";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function WeatherPage() {
  const { profile } = await getCurrentProfile();
  const location = resolveWeatherLocation(profile);
  const weather = await fetchWeather(location);
  const isCustom = profile.weather_location_name !== null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Weather Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Live conditions and a 5-day outlook for your location.
        </p>
      </div>

      <WeatherLocationForm currentName={location.name} isCustom={isCustom} />

      {!weather ? (
        <p className="border-2 border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Weather data is unavailable right now. Try again later.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_3fr]">
            <div className="flex flex-col justify-center gap-1 border-2 border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <p className="nav-label text-slate-500 dark:text-slate-400">Right now</p>
              <p className="text-5xl font-bold text-slate-900 dark:text-slate-50">
                {Math.round(weather.current.tempC)}&deg;C
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {WEATHER_CODES[weather.current.weatherCode] ?? "-"} &middot; Feels like{" "}
                {Math.round(weather.current.feelsLikeC)}&deg;C
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Humidity {weather.current.humidity}% &middot; Wind{" "}
                {Math.round(weather.current.windKph)} km/h
              </p>
            </div>

            <div className="grid grid-cols-5 gap-px border-2 border-slate-200 bg-slate-200 dark:border-slate-800 dark:bg-slate-800">
              {weather.daily.map((day, i) => (
                <div
                  key={day.date}
                  className="flex flex-col items-center gap-1 bg-white p-3 text-center dark:bg-slate-900"
                >
                  <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    {i === 0 ? "Today" : DAY_NAMES[new Date(day.date).getDay()]}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {WEATHER_CODES[day.weatherCode] ?? "-"}
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {Math.round(day.tempMaxC)}&deg;
                  </span>
                  <span className="text-xs text-slate-400">{Math.round(day.tempMinC)}&deg;</span>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400">
                    {day.precipitationChance}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <WeatherWidgets lat={location.lat} lng={location.lng} />
        </>
      )}

      <p className="text-xs text-slate-400">
        Data from Open-Meteo. PAGASA does not publish a public data API, so live figures come
        from this equivalent open weather model instead.
      </p>
    </div>
  );
}
