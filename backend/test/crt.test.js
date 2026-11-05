import test from "node:test";
import assert from "node:assert/strict";
import { detectRangeSweepReclaim } from "../src/crt.js";
const candle = (low, high, close, time) => ({ open: close, high, low, close, time });
test("detects bullish low sweep and reclaim", () => {
  const result = detectRangeSweepReclaim([candle(10,20,15,1),candle(8,18,16,2)]);
  assert.equal(result.direction,"LONG");
});
test("detects bearish high sweep and reclaim", () => {
  const result = detectRangeSweepReclaim([candle(10,20,15,1),candle(12,22,14,2)]);
  assert.equal(result.direction,"SHORT");
});
test("returns null without a sweep", () => {
  assert.equal(detectRangeSweepReclaim([candle(10,20,15,1),candle(11,19,15,2)]),null);
});
test("rejects malformed candles", () => {
  assert.throws(() => detectRangeSweepReclaim([{open:1,high:0,low:2,close:1,time:1},{open:1,high:2,low:0,close:1,time:2}]));
});
