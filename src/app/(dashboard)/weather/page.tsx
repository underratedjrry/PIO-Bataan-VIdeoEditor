import { getCurrentProfile } from "@/lib/supabase/profile";
import { fetchWeather, resolveWeatherLocation } from "@/lib/weather";
import { WeatherLocationForm } from "@/components/WeatherLocationForm";
import { WeatherWidgets } from "@/components/WeatherWidgets";
import { WeatherCards } from "@/components/WeatherCards";

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
          <WeatherCards weather={weather} />
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
