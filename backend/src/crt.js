export function validateCandles(candles) {
  if (!Array.isArray(candles) || candles.length < 2) throw new Error("At least 2 candles are required");
  for (const c of candles) {
    for (const key of ["open", "high", "low", "close", "time"]) {
      if (!Number.isFinite(Number(c?.[key]))) throw new Error("Invalid candle field: " + key);
    }
    if (Number(c.high) < Math.max(Number(c.open), Number(c.close), Number(c.low)) ||
        Number(c.low) > Math.min(Number(c.open), Number(c.close), Number(c.high))) {
      throw new Error("OHLC values are inconsistent");
    }
  }
  return candles;
}

// Matches the Pine prototype: previous candle is the reference range;
// latest confirmed candle wicks beyond it and closes back inside.
export function detectRangeSweepReclaim(candles) {
  validateCandles(candles);
  const range = candles[candles.length - 2];
  const confirm = candles[candles.length - 1];
  const high = Number(range.high), low = Number(range.low);
  const sweptLow = Number(confirm.low) < low && Number(confirm.close) > low && Number(confirm.close) < high;
  const sweptHigh = Number(confirm.high) > high && Number(confirm.close) < high && Number(confirm.close) > low;
  if (sweptLow) return { model: "range-sweep-reclaim", direction: "LONG", rangeHigh: high, rangeLow: low, confirmationTime: confirm.time };
  if (sweptHigh) return { model: "range-sweep-reclaim", direction: "SHORT", rangeHigh: high, rangeLow: low, confirmationTime: confirm.time };
  return null;
}
