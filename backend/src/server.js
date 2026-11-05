import express from "express";
import { detectRangeSweepReclaim, validateCandles } from "./crt.js";
import { PaperLedger } from "./paper.js";

const app = express();
app.use(express.json({ limit: "256kb" }));
const ledger = new PaperLedger();
const seen = new Set();
const secret = process.env.WEBHOOK_SECRET || "";

app.get("/health", (_req, res) => res.json({ ok: true, service: "kevin-crt-api", mode: "paper-only" }));
app.get("/api/state", (_req, res) => res.json({ paper: ledger.state(), signals: seen.size }));

// TradingView Pine alert payloads are candidate events, not raw candle history.
app.post("/webhook/tradingview", (req, res) => {
  if (secret && req.body?.secret !== secret) return res.status(401).json({ error: "Invalid webhook secret" });
  const { symbol, timeframe, direction, model, close, signalId } = req.body || {};
  if (!symbol || !timeframe || !["LONG", "SHORT"].includes(direction) || !Number.isFinite(Number(close))) {
    return res.status(400).json({ error: "symbol, timeframe, LONG/SHORT direction and numeric close are required" });
  }
  const id = String(signalId || [symbol, timeframe, model || "range-sweep-reclaim", direction, close].join(":"));
  if (seen.has(id)) return res.status(409).json({ error: "Duplicate signal" });
  seen.add(id);
  return res.json({ accepted: true, signal: { id, symbol, timeframe, direction, model: model || "range-sweep-reclaim", close: Number(close), receivedAt: new Date().toISOString() } });
});

app.post("/api/analyze/candles", (req, res) => {
  try { validateCandles(req.body?.candles); return res.json({ signal: detectRangeSweepReclaim(req.body.candles) }); }
  catch (error) { return res.status(400).json({ error: error.message }); }
});
app.post("/api/paper/open", (req, res) => {
  try { return res.status(201).json({ trade: ledger.openTrade(req.body || {}) }); }
  catch (error) { return res.status(400).json({ error: error.message }); }
});
app.post("/api/paper/close", (req, res) => {
  try { return res.json({ trade: ledger.closeTrade(req.body || {}) }); }
  catch (error) { return res.status(400).json({ error: error.message }); }
});

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "127.0.0.1";
app.listen(port, host, () => console.log("KEVIN CRT API listening on http://" + host + ":" + port));
