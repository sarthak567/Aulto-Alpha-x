const COINGECKO_API = "https://api.coingecko.com/api/v3";

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "0.00%";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export async function fetchMarketSnapshot() {
  const [globalRes, trendingRes, marketsRes] = await Promise.all([
    fetch(`${COINGECKO_API}/global`, { next: { revalidate: 120 } }),
    fetch(`${COINGECKO_API}/search/trending`, { next: { revalidate: 120 } }),
    fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`,
      { next: { revalidate: 120 } }
    )
  ]);

  if (!globalRes.ok || !trendingRes.ok || !marketsRes.ok) {
    throw new Error("Failed to fetch live market data.");
  }

  const global = (await globalRes.json()).data;
  const trending = await trendingRes.json();
  const markets = await marketsRes.json();

  const moodScore =
    (global.market_cap_change_percentage_24h_usd || 0) * 2 +
    ((global.market_cap_percentage?.btc || 0) > 50 ? 4 : -4);

  const mood =
    moodScore > 4 ? "Bullish" : moodScore < -4 ? "Defensive" : "Neutral to Positive";

  const riskClimate =
    Math.abs(global.market_cap_change_percentage_24h_usd || 0) > 3 ? "High" : "Moderate";

  const opportunities = markets.slice(0, 8).map((coin) => {
    const change = coin.price_change_percentage_24h || 0;
    const action = change > 2 ? "BUY" : change < -2 ? "WAIT" : "HOLD";
    const confidence = Math.min(92, Math.max(52, 65 + Math.round(change * 3)));
    const risk = Math.abs(change) > 6 ? "High" : Math.abs(change) > 3 ? "Medium" : "Low";

    return {
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      headline: `${coin.name} move detected`,
      action,
      confidence,
      risk,
      change24h: formatPercent(change),
      price: coin.current_price
    };
  });

  return {
    marketBrain: {
      mood,
      liquidityFlow: global.market_cap_change_percentage_24h_usd > 0 ? "Increasing" : "Cooling",
      riskClimate,
      totalMarketCapUsd: Math.round(global.total_market_cap?.usd || 0),
      btcDominance: Number((global.market_cap_percentage?.btc || 0).toFixed(2)),
      marketCap24h: formatPercent(global.market_cap_change_percentage_24h_usd || 0)
    },
    trending: trending.coins.slice(0, 5).map((entry) => ({
      id: entry.item.id,
      name: entry.item.name,
      symbol: entry.item.symbol
    })),
    opportunities
  };
}

export function buildStrategy({ investorType, goal, marketBrain }) {
  const map = {
    safe: "Capital Preservation + Stable Momentum",
    smart: "Momentum + Liquidity Capture",
    aggressive: "High Beta Breakout Alpha"
  };
  const horizon =
    goal === "daily" ? "Short-term (1-3 days)" : goal === "double" ? "Mid-term (2-6 weeks)" : "Long-term (3-12 months)";
  const riskPlan =
    investorType === "safe"
      ? "Strict downside shield, lower position sizing."
      : investorType === "aggressive"
        ? "Dynamic exposure with volatility throttling."
        : "Balanced risk with adaptive stop logic.";

  return {
    strategyName: map[investorType] || map.smart,
    horizon,
    riskPlan,
    rationale: `Strategy tuned for ${marketBrain.mood.toLowerCase()} market mood and ${marketBrain.liquidityFlow.toLowerCase()} liquidity flow.`
  };
}
