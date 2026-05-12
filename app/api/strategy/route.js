import { NextResponse } from "next/server";
import { buildStrategy, fetchMarketSnapshot } from "@/lib/market";

export async function POST(request) {
  try {
    const { investorType, goal } = await request.json();
    const market = await fetchMarketSnapshot();
    const strategy = buildStrategy({
      investorType,
      goal,
      marketBrain: market.marketBrain
    });

    return NextResponse.json({ strategy });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unable to generate strategy." },
      { status: 500 }
    );
  }
}
