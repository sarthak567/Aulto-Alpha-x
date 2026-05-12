import { NextResponse } from "next/server";
import { fetchMarketSnapshot } from "@/lib/market";

export async function GET() {
  try {
    const market = await fetchMarketSnapshot();
    const top = market.opportunities[0];
    const growth = Math.max(0.4, Math.min(4.8, top.confidence / 30)).toFixed(2);
    const summary = `Your virtual portfolio moved ${growth}% today. Main driver: ${top.name} (${top.change24h}) with ${top.confidence}% confidence. Risk climate remained ${market.marketBrain.riskClimate.toLowerCase()} while liquidity stayed ${market.marketBrain.liquidityFlow.toLowerCase()}.`;

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      summary
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unable to produce daily report." },
      { status: 500 }
    );
  }
}
