"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateWeatherLocation(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));

  if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("Select a location from the search results");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      weather_location_name: name,
      weather_location_lat: lat,
      weather_location_lng: lng,
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/weather");
}

export async function resetWeatherLocation() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({
      weather_location_name: null,
      weather_location_lat: null,
      weather_location_lng: null,
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/weather");
}
