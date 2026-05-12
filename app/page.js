"use client";

import { useEffect, useMemo, useState } from "react";

const investorTypes = [
  { id: "safe", label: "Safe Builder", emoji: "🐢" },
  { id: "smart", label: "Smart Opportunist", emoji: "🧠" },
  { id: "aggressive", label: "Aggressive Alpha Hunter", emoji: "🚀" }
];

const goals = [
  { id: "double", label: "Grow capital from 5,000 to 10,000" },
  { id: "daily", label: "Target daily small profits" },
  { id: "long", label: "Long-term wealth growth" }
];

export default function HomePage() {
  const [investorType, setInvestorType] = useState("smart");
  const [goal, setGoal] = useState("double");
  const [mode, setMode] = useState("manual");
  const [simulation, setSimulation] = useState(true);
  const [market, setMarket] = useState(null);
  const [strategy, setStrategy] = useState(null);
  const [activeExplanation, setActiveExplanation] = useState("");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Ready");

  const riskShieldText = useMemo(() => {
    if (!market) return "Monitoring volatility and liquidity...";
    return market.marketBrain.riskClimate === "High"
      ? "High risk detected. Exposure is reduced by 20%."
      : "Risk climate stable. Balanced exposure maintained.";
  }, [market]);

  async function loadMarket() {
    const res = await fetch("/api/market");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Market load failed");
    setMarket(data);
  }

  async function generateStrategy() {
    setLoading(true);
    setStatus("Creating your strategy...");
    try {
      const res = await fetch("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investorType, goal })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Strategy failed");
      setStrategy(data.strategy);
      setStatus("Strategy generated.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function explainSignal(symbol) {
    setStatus(`Analyzing ${symbol}...`);
    const res = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol })
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error || "Explainability failed");
      return;
    }
    setActiveExplanation(data.explanation);
    setStatus(`Analysis ready (${data.source}).`);
  }

  async function loadReport() {
    const res = await fetch("/api/report");
    const data = await res.json();
    if (res.ok) setReport(data.summary);
  }

  useEffect(() => {
    loadMarket().catch((error) => setStatus(error.message));
    loadReport().catch(() => null);
  }, []);

  return (
    <main className="page">
      <section className="hero">
        <div className="hero-glow" />
        <p className="tag">AutoAlpha X</p>
        <h1>Let&apos;s build your money engine.</h1>
        <p className="subtitle">
          Your AI Wealth Operator for live market intelligence, adaptive strategy, and
          execution control.
        </p>
      </section>

      <section className="panel">
        <h2>1) Identity-Based Onboarding</h2>
        <div className="choices">
          {investorTypes.map((type) => (
            <button
              key={type.id}
              className={investorType === type.id ? "selected" : ""}
              onClick={() => setInvestorType(type.id)}
            >
              <span>{type.emoji}</span> {type.label}
            </button>
          ))}
        </div>
        <h2>2) Goal-Based Finance</h2>
        <div className="choices">
          {goals.map((g) => (
            <button key={g.id} className={goal === g.id ? "selected" : ""} onClick={() => setGoal(g.id)}>
              {g.label}
            </button>
          ))}
        </div>
        <button className="cta" disabled={loading} onClick={generateStrategy}>
          {loading ? "Building Strategy..." : "Generate AI Strategy"}
        </button>
        {strategy && (
          <div className="strategy">
            <h3>{strategy.strategyName}</h3>
            <p>Time Horizon: {strategy.horizon}</p>
            <p>Risk Plan: {strategy.riskPlan}</p>
            <p>{strategy.rationale}</p>
          </div>
        )}
      </section>

      {market && (
        <section className="panel">
          <h2>Live Market Brain</h2>
          <div className="brain-grid">
            <p>Market Mood: {market.marketBrain.mood}</p>
            <p>Liquidity Flow: {market.marketBrain.liquidityFlow}</p>
            <p>Risk Climate: {market.marketBrain.riskClimate}</p>
            <p>24h Market Cap: {market.marketBrain.marketCap24h}</p>
            <p>BTC Dominance: {market.marketBrain.btcDominance}%</p>
          </div>
          <p className="shield">{riskShieldText}</p>
        </section>
      )}

      {market && (
        <section className="panel">
          <h2>Opportunity Feed</h2>
          <div className="feed">
            {market.opportunities.map((item) => (
              <article key={item.id} className="feed-card">
                <strong>
                  {item.symbol} · {item.action}
                </strong>
                <p>{item.headline}</p>
                <p>Confidence: {item.confidence}%</p>
                <p>Risk: {item.risk}</p>
                <p>24h: {item.change24h}</p>
                <button onClick={() => explainSignal(item.symbol)}>Why this signal?</button>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="panel">
        <h2>Execution Modes</h2>
        <div className="choices">
          <button className={mode === "manual" ? "selected" : ""} onClick={() => setMode("manual")}>
            Manual
          </button>
          <button className={mode === "assist" ? "selected" : ""} onClick={() => setMode("assist")}>
            AI Assist
          </button>
          <button className={mode === "autopilot" ? "selected" : ""} onClick={() => setMode("autopilot")}>
            Full Autopilot
          </button>
        </div>
        <label className="toggle">
          <input type="checkbox" checked={simulation} onChange={() => setSimulation((v) => !v)} />
          Simulation Mode (virtual money first)
        </label>
        <p>
          Current Mode: <strong>{mode}</strong> · {simulation ? "Simulation" : "Live Execution Ready"}
        </p>
      </section>

      {(activeExplanation || report) && (
        <section className="panel">
          <h2>AI Intelligence</h2>
          {activeExplanation && <p>{activeExplanation}</p>}
          {report && (
            <>
              <h3>Daily AI Report</h3>
              <p>{report}</p>
            </>
          )}
        </section>
      )}

      <p className="status">{status}</p>
    </main>
  );
}
