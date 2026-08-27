// Open-Meteo: free, no API key. PAGASA itself has no public API to pull
// live data from - this is the same source already used by the header
// clock/weather widget.
const DEFAULT_LOCATION = {
  name: "Balanga City, Bataan",
  lat: 14.6761,
  lng: 120.5361,
};

export type WeatherLocation = { name: string; lat: number; lng: number };

export type CurrentWeather = {
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  windKph: number;
  weatherCode: number;
  isDay: boolean;
};

export type DailyForecast = {
  date: string;
  weatherCode: number;
  tempMaxC: number;
  tempMinC: number;
  precipitationChance: number;
  precipitationSumMm: number;
  windMaxKph: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
};

export type WeatherData = {
  location: WeatherLocation;
  current: CurrentWeather;
  daily: DailyForecast[];
};

export const WEATHER_CODES: Record<number, string> = {
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

export function resolveWeatherLocation(profile: {
  weather_location_name: string | null;
  weather_location_lat: number | null;
  weather_location_lng: number | null;
}): WeatherLocation {
  if (
    profile.weather_location_name &&
    profile.weather_location_lat !== null &&
    profile.weather_location_lng !== null
  ) {
    return {
      name: profile.weather_location_name,
      lat: profile.weather_location_lat,
      lng: profile.weather_location_lng,
    };
  }
  return DEFAULT_LOCATION;
}

export async function fetchWeather(location: WeatherLocation): Promise<WeatherData | null> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(location.lat));
  url.searchParams.set("longitude", String(location.lng));
  url.searchParams.set("current", "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day");
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,uv_index_max,sunrise,sunset",
  );
  url.searchParams.set("timezone", "Asia/Manila");
  url.searchParams.set("forecast_days", "5");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 600 } });
    if (!res.ok) return null;
    const data = await res.json();

    return {
      location,
      current: {
        tempC: data.current.temperature_2m,
        feelsLikeC: data.current.apparent_temperature,
        humidity: data.current.relative_humidity_2m,
        windKph: data.current.wind_speed_10m,
        weatherCode: data.current.weather_code,
        isDay: data.current.is_day === 1,
      },
      daily: (data.daily.time as string[]).map((date, i) => ({
        date,
        weatherCode: data.daily.weather_code[i],
        tempMaxC: data.daily.temperature_2m_max[i],
        tempMinC: data.daily.temperature_2m_min[i],
        precipitationChance: data.daily.precipitation_probability_max[i],
        precipitationSumMm: data.daily.precipitation_sum[i],
        windMaxKph: data.daily.wind_speed_10m_max[i],
        uvIndexMax: data.daily.uv_index_max[i],
        sunrise: data.daily.sunrise[i],
        sunset: data.daily.sunset[i],
      })),
    };
  } catch {
    return null;
  }
}

export type LocationSearchResult = { name: string; lat: number; lng: number; admin1?: string };

// Open-Meteo's free geocoding API - place-name search, no key required.
export async function searchLocations(query: string): Promise<LocationSearchResult[]> {
  if (!query.trim()) return [];
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", "6");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data = await res.json();
    return ((data.results ?? []) as Array<Record<string, unknown>>).map((r) => ({
      name: String(r.name),
      lat: Number(r.latitude),
      lng: Number(r.longitude),
      admin1: r.admin1 ? String(r.admin1) : undefined,
    }));
  } catch {
    return [];
  }
}
