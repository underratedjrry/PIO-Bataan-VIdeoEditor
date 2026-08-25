import { NextRequest, NextResponse } from "next/server";
import { searchLocations } from "@/lib/weather";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const results = await searchLocations(query);
  return NextResponse.json({ results });
}
