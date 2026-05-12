import { NextResponse } from "next/server";
import { fetchMarketSnapshot } from "@/lib/market";

export async function POST(request) {
  try {
    const { symbol } = await request.json();
    const market = await fetchMarketSnapshot();
    const item = market.opportunities.find((op) => op.symbol === symbol);

    if (!item) {
      return NextResponse.json({ error: "Signal not found." }, { status: 404 });
    }

    const prompt = `Explain this crypto opportunity in plain English for a retail investor in less than 80 words.
Coin: ${item.name} (${item.symbol})
24h change: ${item.change24h}
Action: ${item.action}
Confidence: ${item.confidence}%
Market mood: ${market.marketBrain.mood}
Liquidity flow: ${market.marketBrain.liquidityFlow}
Risk climate: ${market.marketBrain.riskClimate}`;

    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      const fallback = `${item.name} is flagged because price momentum (${item.change24h}) aligns with a ${market.marketBrain.mood.toLowerCase()} market and ${market.marketBrain.liquidityFlow.toLowerCase()} liquidity flow. Current action is ${item.action} with ${item.confidence}% confidence under ${market.marketBrain.riskClimate.toLowerCase()} risk climate.`;
      return NextResponse.json({ explanation: fallback, source: "rules-engine" });
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a risk-aware crypto market analyst." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      })
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      return NextResponse.json({ error: `OpenAI error: ${err}` }, { status: 502 });
    }

    const data = await openaiRes.json();
    const explanation = data.choices?.[0]?.message?.content?.trim();
    return NextResponse.json({ explanation, source: "openai" });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unable to explain signal." },
      { status: 500 }
    );
  }
}
