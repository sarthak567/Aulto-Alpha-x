import { NextResponse } from "next/server";
import { fetchMarketSnapshot } from "@/lib/market";

export async function GET() {
  try {
    const data = await fetchMarketSnapshot();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unable to load market intelligence." },
      { status: 500 }
    );
  }
}
