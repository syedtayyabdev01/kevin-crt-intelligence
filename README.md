# KEVIN CRT INTELLIGENCE

Chrome MV3 companion for TradingView and a local paper-trading research API. **Paper trading only; no broker orders are sent.**

## MVP scope
- TradingView companion panel (does not scrape private TradingView APIs).
- Pine Script v6 confirmed-bar range sweep/reclaim alert prototype.
- Local Node.js API, CRT candidate detector, risk sizing and in-memory paper ledger.
- Node test suite.

**CRT definition:** this starter explicitly detects a reference-range sweep followed by a close back inside that range. CRT terminology varies across trading communities; this is not a claim to cover every variant.

## Requirements and setup
Node.js 20+.

```bash
npm install
npm test
npm start
```

API listens on `127.0.0.1:8787`.

## Chrome extension
Open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select `extension/`. Open TradingView to see the companion panel.

## TradingView
Paste `pine/kevin_crt_alerts.pine` into TradingView's Pine Editor, add it to a chart, then create an alert using **Any alert() function call**. Webhook access depends on your TradingView plan. Use a secure tunnel only if you understand the exposure; configure `WEBHOOK_SECRET` for the API.

## API endpoints
- `GET /health`
- `GET /api/state`
- `POST /webhook/tradingview`
- `POST /api/analyze/candles`
- `POST /api/paper/open`
- `POST /api/paper/close`

The paper ledger is in-memory and resets on restart. Not implemented yet: licensed multi-symbol market-data feed, full CRT model catalog, synchronized multi-timeframe scanner, historical backtesting, durable database, production authentication and install/TradingView compile verification. Do not treat alerts as financial advice.
