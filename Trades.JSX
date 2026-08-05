// api/claude.js  — Vercel Serverless Function
// This keeps your API key secret and solves CORS.
// Deploy to Vercel: https://vercel.com/docs/functions

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid prompt" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         process.env.ANTHROPIC_API_KEY, // Set in Vercel dashboard
        "anthropic-version": "2023-06-01",
        "anthropic-beta":    "tools-2024-04-04",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-20250514",
        max_tokens: 4096,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", errText);
      return res.status(response.status).json({ error: errText });
    }

    const json = await response.json();
    const text = (json.content || [])
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("\n");

    return res.status(200).json({ text });
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: err.message });
  }
}

import { useState, useEffect, useCallback, useRef } from "react";

// ════════════════════════════════════════════════════
// NEXUS v8 — TradingView Edition  (Fixed)
// ════════════════════════════════════════════════════

// ─── Design tokens ───────────────────────────────────
const T = {
  bg:      "#07080f",
  panel:   "#0d0f1c",
  card:    "#101324",
  border:  "#1a1d38",
  borderB: "#222545",
  long:    "#10e8a0",
  short:   "#ff4d6d",
  accent:  "#7b68ee",
  sky:     "#38bdf8",
  amber:   "#ffa940",
  rose:    "#f472b6",
  violet:  "#a78bfa",
  text:    "#e8ecf4",
  sub:     "#6b7280",
  dim:     "#252850",
};

// ─── Coin registry ────────────────────────────────────
const SCAN_COINS = [
  { sym: "BTC",   tv: "BINANCE:BTCUSDT"   },
  { sym: "ETH",   tv: "BINANCE:ETHUSDT"   },
  { sym: "BNB",   tv: "BINANCE:BNBUSDT"   },
  { sym: "SOL",   tv: "BINANCE:SOLUSDT"   },
  { sym: "XRP",   tv: "BINANCE:XRPUSDT"   },
  { sym: "ADA",   tv: "BINANCE:ADAUSDT"   },
  { sym: "AVAX",  tv: "BINANCE:AVAXUSDT"  },
  { sym: "LINK",  tv: "BINANCE:LINKUSDT"  },
  { sym: "DOT",   tv: "BINANCE:DOTUSDT"   },
  { sym: "NEAR",  tv: "BINANCE:NEARUSDT"  },
  { sym: "ARB",   tv: "BINANCE:ARBUSDT"   },
  { sym: "OP",    tv: "BINANCE:OPUSDT"    },
  { sym: "SUI",   tv: "BINANCE:SUIUSDT"   },
  { sym: "INJ",   tv: "BINANCE:INJUSDT"   },
  { sym: "APT",   tv: "BINANCE:APTUSDT"   },
  { sym: "LTC",   tv: "BINANCE:LTCUSDT"   },
  { sym: "DOGE",  tv: "BINANCE:DOGEUSDT"  },
  { sym: "SHIB",  tv: "BINANCE:SHIBUSDT"  },
  { sym: "PEPE",  tv: "BINANCE:PEPEUSDT"  },
  { sym: "WIF",   tv: "BINANCE:WIFUSDT"   },
  { sym: "BONK",  tv: "BINANCE:BONKUSDT"  },
  { sym: "FLOKI", tv: "BINANCE:FLOKIUSDT" },
  { sym: "UNI",   tv: "BINANCE:UNIUSDT"   },
  { sym: "TRX",   tv: "BINANCE:TRXUSDT"   },
];

const ALL_TV_COINS = [
  ...SCAN_COINS,
  { sym: "ATOM",   tv: "BINANCE:ATOMUSDT"   },
  { sym: "FIL",    tv: "BINANCE:FILUSDT"    },
  { sym: "AAVE",   tv: "BINANCE:AAVEUSDT"   },
  { sym: "MKR",    tv: "BINANCE:MKRUSDT"    },
  { sym: "CRV",    tv: "BINANCE:CRVUSDT"    },
  { sym: "LDO",    tv: "BINANCE:LDOUSDT"    },
  { sym: "GMX",    tv: "BINANCE:GMXUSDT"    },
  { sym: "PENDLE", tv: "BINANCE:PENDLEUSDT" },
  { sym: "JUP",    tv: "BINANCE:JUPUSDT"    },
  { sym: "PYTH",   tv: "BINANCE:PYTHUSDT"   },
  { sym: "SEI",    tv: "BINANCE:SEIUSDT"    },
  { sym: "TIA",    tv: "BINANCE:TIAUSDT"    },
  { sym: "RENDER", tv: "BINANCE:RENDERUSDT" },
  { sym: "MEME",   tv: "BINANCE:MEMEUSDT"   },
  { sym: "BOME",   tv: "BINANCE:BOMEUSDT"   },
  { sym: "NOT",    tv: "BINANCE:NOTUSDT"    },
  { sym: "POPCAT", tv: "BINANCE:POPCATUSDT" },
  { sym: "BRETT",  tv: "BINANCE:BRETTUSDT"  },
  { sym: "NEIRO",  tv: "BINANCE:NEIROUSDT"  },
  { sym: "1INCH",  tv: "BINANCE:1INCHUSDT"  },
  { sym: "SAND",   tv: "BINANCE:SANDUSDT"   },
  { sym: "AXS",    tv: "BINANCE:AXSUSDT"    },
  { sym: "GALA",   tv: "BINANCE:GALAUSDT"   },
  { sym: "CHZ",    tv: "BINANCE:CHZUSDT"    },
  { sym: "ENJ",    tv: "BINANCE:ENJUSDT"    },
  { sym: "RPL",    tv: "BINANCE:RPLUSDT"    },
  { sym: "SNX",    tv: "BINANCE:SNXUSDT"    },
  { sym: "COMP",   tv: "BINANCE:COMPUSDT"   },
];

const findTV = sym =>
  ALL_TV_COINS.find(c => c.sym === sym)?.tv || `BINANCE:${sym}USDT`;

// ─── Timeframe options ────────────────────────────────
const TIMEFRAMES = [
  { label: "1m",  tv: "1"   },
  { label: "5m",  tv: "5"   },
  { label: "15m", tv: "15"  },
  { label: "1H",  tv: "60"  },
  { label: "4H",  tv: "240" },
  { label: "1D",  tv: "D"   },
  { label: "1W",  tv: "W"   },
];

// ─── TradingView indicators ───────────────────────────
const TV_INDICATORS = [
  { key: "rsi",   label: "RSI",             study: "RSI@tv-basicstudies"    },
  { key: "macd",  label: "MACD",            study: "MACD@tv-basicstudies"   },
  { key: "bb",    label: "Bollinger Bands", study: "BB@tv-basicstudies"     },
  { key: "vol",   label: "Volume",          study: "Volume@tv-basicstudies" },
  { key: "ema20", label: "EMA 20",          study: "MAExp@tv-basicstudies"  },
  { key: "vwap",  label: "VWAP",            study: "VWAP@tv-basicstudies"   },
];

// ─── Storage helpers (fix: was window.storage which doesn't exist) ─────────
const storage = {
  get(key) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("localStorage write failed:", e.message);
    }
  },
};

// ─── Utils ────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

const fmtP = p => {
  const n = parseFloat(p);
  if (!n || isNaN(n)) return "–";
  if (n >= 10000)  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1)      return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 });
  if (n >= 0.0001) return "$" + n.toFixed(6);
  return "$" + n.toExponential(3);
};

// ─── TradingView iframe URL builder ──────────────────
const buildTVUrl = (tvSymbol, interval = "60", activeIndicators = ["rsi", "macd", "vol"]) => {
  const studies = TV_INDICATORS
    .filter(i => activeIndicators.includes(i.key))
    .map(i => i.study)
    .join(",");

  const params = new URLSearchParams({
    symbol:             tvSymbol,
    interval:           interval,
    hidesidetoolbar:    "1",
    hidetoptoolbar:     "0",
    symboledit:         "0",
    saveimage:          "0",
    calendar:           "0",
    studies:            studies,
    theme:              "dark",
    style:              "1",
    timezone:           "Etc/UTC",
    locale:             "en",
    allow_symbol_change:"0",
    support_host:       "https://www.tradingview.com",
    backgroundColor:    "rgba(7,8,15,1)",
    gridLineColor:      "rgba(26,29,56,1)",
  });
  return `https://www.tradingview.com/widgetembed/?${params.toString()}`;
};

// ─── Claude API — now calls your backend proxy ────────
// Fix: was calling Anthropic directly from browser (CORS + key exposure)
const callClaude = async (prompt) => {
  const res = await fetch("/api/claude", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `API error ${res.status}`);
  }

  const { text } = await res.json();
  return text || "";
};

// Fix: more robust JSON parsing with logging
const parseJSON = text => {
  const clean = text.replace(/```json|```/g, "").trim();

  // Try direct parse first
  try { return JSON.parse(clean); } catch {}

  // Try to extract array
  const s = clean.indexOf("[");
  const e = clean.lastIndexOf("]");
  if (s === -1 || e === -1) {
    console.warn("parseJSON: No JSON array found in response:", clean.slice(0, 300));
    return [];
  }
  try {
    return JSON.parse(clean.slice(s, e + 1));
  } catch (err) {
    console.warn("parseJSON: Parse failed:", err.message, "\nRaw:", clean.slice(s, e + 1).slice(0, 300));
    return [];
  }
};

const fetchBatchSignals = async coins => {
  const text = await callClaude(
    `You are a professional crypto futures analyst. Search for CURRENT live market data for: ${coins.join(", ")}

For EACH coin search and retrieve:
1. Current price in USD (live/real-time)
2. 24h price change %
3. RSI (14-period, 1h chart) — estimate from recent price momentum
4. MACD signal (bullish or bearish on 1h)
5. Volume change vs 24h average (%)
6. Key support and resistance levels (nearest ones)

Then generate a futures signal for each coin using:
- direction: "LONG" if RSI<45 + bullish MACD; "SHORT" if RSI>60 + bearish MACD
- leverage: 2-4x meme/volatile, 4-8x altcoins, 7-15x BTC/ETH/BNB
- entry_price: within 0.15% of live price
- take_profit & stop_loss: minimum 2.5:1 reward-to-risk
- confidence: 40-95 based on indicator agreement
- support: nearest support level (price)
- resistance: nearest resistance level (price)
- reasoning: one sentence with actual numbers

Return ONLY raw JSON array, no markdown, no fences:
[{"symbol":"BTC","price":67420,"change24h":2.1,"rsi":48,"macd":"bullish","volumeChange":22,"direction":"LONG","leverage":10,"entry_price":67350,"take_profit":72000,"stop_loss":64800,"confidence":76,"support":66000,"resistance":70000,"reasoning":"RSI at 48 with bullish MACD and 22% volume surge after holding 66k support"}]`
  );
  return parseJSON(text);
};

const fetchSingleSignal = async sym => {
  const text = await callClaude(
    `You are a professional crypto futures analyst. Search for LIVE real-time data for ${sym} cryptocurrency.

Retrieve:
1. Current price in USD
2. 24h change %
3. RSI (14-period, 1h)
4. MACD (bullish/bearish, 1h)
5. Volume change vs average (%)
6. Key support level (nearest price floor)
7. Key resistance level (nearest price ceiling)

Generate ONE futures signal:
- direction: LONG or SHORT
- leverage: appropriate to volatility
- entry_price, take_profit, stop_loss (2.5:1 R:R minimum)
- confidence: 40-95
- support and resistance prices
- reasoning: specific sentence with real numbers

Return ONLY raw JSON array:
[{"symbol":"${sym}","price":0,"change24h":0,"rsi":50,"macd":"neutral","volumeChange":0,"direction":"LONG","leverage":5,"entry_price":0,"take_profit":0,"stop_loss":0,"confidence":60,"support":0,"resistance":0,"reasoning":"..."}]`
  );
  return parseJSON(text);
};

// ════════════════════════════════════════════════════
// ERROR BOUNDARY
// Fix: was missing — any render error crashed the whole app
// ════════════════════════════════════════════════════
import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, message: err.message };
  }
  componentDidCatch(err, info) {
    console.error("NEXUS ErrorBoundary caught:", err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", background: "#07080f", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px", padding: "24px" }}>
          <div style={{ fontSize: "48px" }}>⚠️</div>
          <div style={{ color: "#ff4d6d", fontWeight: 800, fontSize: "20px" }}>Something went wrong</div>
          <div style={{ color: "#6b7280", fontSize: "13px", fontFamily: "monospace", maxWidth: "500px", textAlign: "center" }}>{this.state.message}</div>
          <button
            onClick={() => this.setState({ hasError: false, message: "" })}
            style={{ background: "#7b68ee20", border: "1px solid #7b68ee", color: "#7b68ee", padding: "10px 24px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}
          >
            ↺ Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ════════════════════════════════════════════════════
// TRADINGVIEW CHART COMPONENT
// ════════════════════════════════════════════════════
const TVChart = ({
  tvSymbol,
  defaultTf    = "60",
  height       = 420,
  showControls = true,
  activeInds   = ["rsi", "macd", "vol"],
}) => {
  const [tf,      setTf]      = useState(defaultTf);
  const [inds,    setInds]    = useState(activeInds);
  const [key,     setKey]     = useState(0);
  const [loading, setLoading] = useState(true);

  // Fix: add timeout so spinner doesn't spin forever if iframe fails
  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 10_000);
    return () => clearTimeout(timeout);
  }, [key, tvSymbol]);

  const toggleInd = ind => {
    setInds(prev =>
      prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]
    );
    setKey(k => k + 1);
  };

  const changeTf = t => {
    setTf(t);
    setKey(k => k + 1);
  };

  const url    = buildTVUrl(tvSymbol, tf, inds);
  const tvLink = `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tvSymbol)}`;

  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: "12px", overflow: "hidden" }}>
      {showControls && (
        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${T.border}`, display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          {/* Timeframe */}
          <div style={{ display: "flex", gap: "4px" }}>
            {TIMEFRAMES.map(t => (
              <button
                key={t.label}
                onClick={() => changeTf(t.tv)}
                style={{
                  background:  tf === t.tv ? `${T.accent}25` : "transparent",
                  border:      `1px solid ${tf === t.tv ? T.accent : T.border}`,
                  color:       tf === t.tv ? T.accent : T.sub,
                  padding:     "4px 9px",
                  borderRadius:"6px",
                  cursor:      "pointer",
                  fontSize:    "10px",
                  fontWeight:  tf === t.tv ? 700 : 400,
                  fontFamily:  "'JetBrains Mono',monospace",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Indicator pills */}
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {TV_INDICATORS.map(i => {
              const on = inds.includes(i.key);
              const ic = i.key === "rsi" ? T.sky : i.key === "macd" ? T.accent : i.key === "bb" ? T.rose : i.key === "vol" ? T.amber : i.key === "ema20" ? T.long : T.violet;
              return (
                <button
                  key={i.key}
                  onClick={() => toggleInd(i.key)}
                  style={{
                    background:  on ? `${ic}18` : "transparent",
                    border:      `1px solid ${on ? ic : T.border}`,
                    color:       on ? ic : T.sub,
                    padding:     "3px 9px",
                    borderRadius:"99px",
                    cursor:      "pointer",
                    fontSize:    "10px",
                    fontFamily:  "'JetBrains Mono',monospace",
                  }}
                >
                  {i.label}
                </button>
              );
            })}
          </div>

          <a
            href={tvLink}
            target="_blank"
            rel="noreferrer"
            style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "5px", background: `${T.accent}12`, border: `1px solid ${T.accent}40`, color: T.accent, padding: "4px 12px", borderRadius: "7px", textDecoration: "none", fontSize: "10px", fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", whiteSpace: "nowrap" }}
          >
            ↗ TradingView
          </a>
        </div>
      )}

      <div style={{ position: "relative", height: `${height}px` }}>
        {loading && (
          <div style={{ position: "absolute", inset: 0, background: T.panel, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 2, gap: "12px" }}>
            <div style={{ fontSize: "28px", animation: "spin 2s linear infinite" }}>◈</div>
            <div style={{ fontSize: "11px", color: T.sub, fontFamily: "'JetBrains Mono',monospace" }}>Loading TradingView chart…</div>
          </div>
        )}
        <iframe
          key={`${tvSymbol}-${tf}-${inds.join("")}-${key}`}
          src={url}
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          allowTransparency={true}
          scrolling="no"
          allowFullScreen={true}
          onLoad={() => setLoading(false)}
          title={`TradingView chart for ${tvSymbol}`}
        />
      </div>

      {showControls && inds.length > 0 && (
        <div style={{ padding: "8px 14px", borderTop: `1px solid ${T.border}`, display: "flex", gap: "14px", flexWrap: "wrap" }}>
          {inds.map(k => {
            const ind = TV_INDICATORS.find(i => i.key === k);
            const ic  = k === "rsi" ? T.sky : k === "macd" ? T.accent : k === "bb" ? T.rose : k === "vol" ? T.amber : k === "ema20" ? T.long : T.violet;
            return ind ? (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: ic }} />
                <span style={{ fontSize: "9px", color: T.sub, fontFamily: "'JetBrains Mono',monospace" }}>{ind.label}</span>
              </div>
            ) : null;
          })}
          <span style={{ fontSize: "9px", color: T.dim, marginLeft: "auto", fontFamily: "'JetBrains Mono',monospace" }}>Powered by TradingView</span>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════
// SHARED MINI COMPONENTS
// ════════════════════════════════════════════════════
const Pill = ({ label, value, color }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: `${color}10`, border: `1px solid ${color}28`, borderRadius: "99px", padding: "2px 9px" }}>
    <span style={{ fontSize: "9px", color: T.sub }}>{label}</span>
    <span style={{ fontSize: "10px", fontWeight: 700, color, fontFamily: "'JetBrains Mono',monospace" }}>{value}</span>
  </div>
);

const LvlBox = ({ label, val, color }) => (
  <div style={{ flex: 1, background: T.panel, border: `1px solid ${T.border}`, borderRadius: "10px", padding: "8px 6px", textAlign: "center" }}>
    <div style={{ fontSize: "8px", color: T.dim, letterSpacing: "2px", marginBottom: "3px", fontFamily: "'JetBrains Mono',monospace" }}>{label}</div>
    <div style={{ color, fontSize: "11px", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{fmtP(val)}</div>
  </div>
);

const Skel = ({ i }) => (
  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: "18px", padding: "22px", animation: `pulse 1.8s ease ${i * 0.12}s infinite` }}>
    {[["60%", "22px"], ["40%", "14px"], ["100%", "54px"], ["100%", "5px"], ["80%", "10px"], ["100%", "48px"]].map(([w, h], j) => (
      <div key={j} style={{ background: T.panel, borderRadius: "8px", height: h, width: w, marginBottom: "12px" }} />
    ))}
  </div>
);

// ════════════════════════════════════════════════════
// SIGNAL CARD
// ════════════════════════════════════════════════════
const SignalCard = ({ sig, idx = 0, onAddTrade, onAddAlert }) => {
  const [showChart, setShowChart] = useState(false);

  const long  = sig.direction === "LONG";
  const col   = long ? T.long : T.short;
  const rsiV  = parseFloat(sig.rsi) || 50;
  const chg   = parseFloat(sig.change24h) || 0;
  const conf  = Math.min(95, Math.max(40, parseInt(sig.confidence) || 60));
  const tvSym = sig.tv || findTV(sig.symbol);

  // Fix: removed synthFund (fabricated data). Show funding as "N/A" or omit.
  const rr = sig.take_profit && sig.stop_loss && sig.entry_price
    ? Math.abs((sig.take_profit - sig.entry_price) / (sig.entry_price - sig.stop_loss)).toFixed(1)
    : "–";

  return (
    <div style={{ background: `linear-gradient(160deg,${T.card},#0c0e21)`, border: `1px solid ${T.border}`, borderTop: `2px solid ${col}`, borderRadius: "18px", overflow: "hidden", animation: `riseIn 0.4s cubic-bezier(0.16,1,0.3,1) ${idx * 0.06}s both` }}>
      <div style={{ padding: "20px", position: "relative" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 130, height: 130, borderRadius: "50%", background: `radial-gradient(circle,${col}10,transparent 70%)`, pointerEvents: "none" }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "4px" }}>
              <span style={{ fontWeight: 800, fontSize: "20px", color: T.text }}>{sig.symbol}</span>
              <span style={{ fontSize: "9px", color: T.sub, background: T.panel, border: `1px solid ${T.border}`, padding: "2px 7px", borderRadius: "99px" }}>PERP</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", color: T.amber, fontSize: "14px", fontWeight: 700 }}>{fmtP(sig.price)}</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: chg >= 0 ? T.long : T.short }}>
                {chg >= 0 ? "↑" : "↓"} {Math.abs(chg).toFixed(2)}%
              </span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
            <div style={{ background: `${col}18`, border: `1.5px solid ${col}`, color: col, padding: "5px 14px", borderRadius: "9px", fontWeight: 800, fontSize: "12px", letterSpacing: "2px" }}>
              {sig.direction}
            </div>
            <div style={{ background: `${col}10`, border: `1px solid ${col}35`, color: col, padding: "3px 11px", borderRadius: "7px", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: "12px" }}>
              ⚡{sig.leverage}×
            </div>
          </div>
        </div>

        {/* Levels */}
        <div style={{ display: "flex", gap: "7px", marginBottom: "6px" }}>
          <LvlBox label="ENTRY" val={sig.entry_price} color={T.sky}   />
          <LvlBox label="TP"    val={sig.take_profit}  color={T.long}  />
          <LvlBox label="SL"    val={sig.stop_loss}    color={T.short} />
        </div>

        {/* Support / Resistance */}
        {(sig.support || sig.resistance) && (
          <div style={{ display: "flex", gap: "7px", marginBottom: "6px" }}>
            {sig.support    && <LvlBox label="SUPPORT"    val={sig.support}    color={T.long}  />}
            {sig.resistance && <LvlBox label="RESISTANCE" val={sig.resistance} color={T.short} />}
            <div style={{ flex: 1, background: T.panel, border: `1px solid ${T.border}`, borderRadius: "10px", padding: "8px 6px", textAlign: "center" }}>
              <div style={{ fontSize: "8px", color: T.dim, letterSpacing: "2px", marginBottom: "3px", fontFamily: "'JetBrains Mono',monospace" }}>R:R</div>
              <div style={{ color: parseFloat(rr) >= 2.5 ? T.long : T.amber, fontSize: "11px", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>1:{rr}</div>
            </div>
          </div>
        )}

        {/* Confidence */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "9px", color: T.sub, fontFamily: "'JetBrains Mono',monospace" }}>AI CONFIDENCE</span>
            <span style={{ fontSize: "12px", fontWeight: 800, color: col }}>{conf}%</span>
          </div>
          <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: "99px", height: "4px", overflow: "hidden" }}>
            <div style={{ width: `${conf}%`, height: "100%", background: `linear-gradient(90deg,${col}50,${col})`, borderRadius: "99px" }} />
          </div>
        </div>

        {/* Indicators */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "12px" }}>
          <Pill label="RSI"  value={rsiV.toFixed(0)}                                                                              color={rsiV > 70 ? T.short : rsiV < 30 ? T.long : T.sky} />
          <Pill label="MACD" value={sig.macd === "bullish" ? "▲ Bull" : "▼ Bear"}                                                color={sig.macd === "bullish" ? T.long : T.short} />
          <Pill label="VOL"  value={`${(sig.volumeChange || 0) > 0 ? "+" : ""}${sig.volumeChange || 0}%`}                        color={(sig.volumeChange || 0) > 15 ? T.long : (sig.volumeChange || 0) < -15 ? T.short : T.sub} />
        </div>

        {/* Reasoning */}
        <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: "10px", padding: "10px 12px", marginBottom: "12px" }}>
          <div style={{ fontSize: "8px", color: col, letterSpacing: "2px", marginBottom: "3px", fontFamily: "'JetBrains Mono',monospace" }}>◈ AI ANALYSIS</div>
          <div style={{ fontSize: "10px", color: T.sub, lineHeight: "1.7" }}>{sig.reasoning}</div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "7px" }}>
          <button
            onClick={() => setShowChart(v => !v)}
            style={{ flex: 1, background: showChart ? `${T.accent}20` : `${T.accent}10`, border: `1px solid ${showChart ? T.accent : T.accent + "40"}`, color: T.accent, padding: "8px", borderRadius: "9px", cursor: "pointer", fontSize: "11px", fontWeight: 700 }}
          >
            {showChart ? "✕ Hide Chart" : "📈 View Chart"}
          </button>
          {onAddTrade && (
            <button
              onClick={() => onAddTrade(sig)}
              style={{ flex: 1, background: `${col}12`, border: `1px solid ${col}40`, color: col, padding: "8px", borderRadius: "9px", cursor: "pointer", fontSize: "11px", fontWeight: 700 }}
            >
              📂 Track
            </button>
          )}
          {onAddAlert && (
            <button
              onClick={() => onAddAlert(sig)}
              style={{ flex: 1, background: `${T.amber}12`, border: `1px solid ${T.amber}40`, color: T.amber, padding: "8px", borderRadius: "9px", cursor: "pointer", fontSize: "11px", fontWeight: 700 }}
            >
              🔔 Alert
            </button>
          )}
        </div>
      </div>

      {showChart && (
        <div style={{ borderTop: `1px solid ${T.border}` }}>
          {/* Fix: removed unused chartTf state. Hardcoded "60" as default */}
          <TVChart tvSymbol={tvSym} defaultTf="60" height={400} showControls={true} />
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════
// TAB: MARKET SCAN
// ════════════════════════════════════════════════════
const ScanTab = ({ onAddTrade, onAddAlert }) => {
  const [signals,  setSignals]  = useState([]);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step,     setStep]     = useState("");
  const [lastScan, setLastScan] = useState(null);
  const [err,      setErr]      = useState(null);
  const [skels,    setSkels]    = useState(0);
  const [filter,   setFilter]   = useState("ALL");
  const [sortBy,   setSortBy]   = useState("confidence");
  const [autoScan, setAutoScan] = useState(false);

  // Fix: use ref to guard scanning — avoids stale closure bug
  const scanningRef = useRef(false);
  const autoRef     = useRef(null);

  const runScan = useCallback(async () => {
    // Fix: guard with ref, not state (state causes stale closure)
    if (scanningRef.current) return;
    scanningRef.current = true;

    setScanning(true);
    setErr(null);
    setProgress(0);
    setSignals([]);
    setSkels(8);

    const all = [];
    try {
      const BATCH = 6;
      for (let i = 0; i < SCAN_COINS.length; i += BATCH) {
        const batch = SCAN_COINS.slice(i, i + BATCH);
        setStep(`Searching live data for ${batch.map(c => c.sym).join(", ")}…`);
        try {
          const sigs = await fetchBatchSignals(batch.map(c => c.sym));
          sigs.forEach(sig => {
            if (sig.symbol && sig.price > 0 && sig.direction && sig.entry_price > 0) {
              const coin = SCAN_COINS.find(c => c.sym === sig.symbol);
              all.push({
                ...sig,
                tv: coin?.tv || findTV(sig.symbol),
                id: `${sig.symbol}-${Date.now()}-${Math.random()}`,
              });
              setSignals([...all].sort((a, b) => b.confidence - a.confidence));
              setSkels(s => Math.max(0, s - 1));
            }
          });
        } catch (e) {
          console.warn("Batch failed:", e.message);
        }
        setProgress(Math.round((Math.min(i + BATCH, SCAN_COINS.length) / SCAN_COINS.length) * 100));
        if (i + BATCH < SCAN_COINS.length) await sleep(400);
      }

      if (all.length === 0) throw new Error("No signals returned — check your API proxy and key, then try again.");
      setSignals(all.sort((a, b) => b.confidence - a.confidence));
      setLastScan(new Date());
    } catch (e) {
      setErr(e.message);
    } finally {
      // Fix: always reset both ref and state
      scanningRef.current = false;
      setScanning(false);
      setStep("");
      setProgress(0);
      setSkels(0);
    }
  }, []); // Fix: no dependency on `scanning` state — ref handles the guard

  // Fix: autoScan interval no longer re-creates runScan on every scan
  useEffect(() => {
    clearInterval(autoRef.current);
    if (autoScan) {
      autoRef.current = setInterval(runScan, 5 * 60 * 1_000);
    }
    return () => clearInterval(autoRef.current);
  }, [autoScan, runScan]);

  const filtered = signals
    .filter(s => filter === "ALL" || s.direction === filter)
    .sort((a, b) => sortBy === "confidence" ? b.confidence - a.confidence : b.leverage - a.leverage);

  const longC  = signals.filter(s => s.direction === "LONG").length;
  const shortC = signals.filter(s => s.direction === "SHORT").length;
  const sent   = signals.length > 0 ? Math.round((longC / signals.length) * 100) : 50;

  return (
    <div>
      {signals.length > 0 && (
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          {[["📊", "SIGNALS", signals.length, T.accent], ["🟢", "LONG", longC, T.long], ["🔴", "SHORT", shortC, T.short]].map(([ico, lbl, val, col]) => (
            <div key={lbl} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: "12px", padding: "12px 18px" }}>
              <div style={{ fontSize: "16px" }}>{ico}</div>
              <div style={{ fontWeight: 800, fontSize: "22px", color: col }}>{val}</div>
              <div style={{ fontSize: "9px", color: T.sub, fontFamily: "'JetBrains Mono',monospace" }}>{lbl}</div>
            </div>
          ))}
          <div style={{ flex: 1, minWidth: "180px", background: T.card, border: `1px solid ${T.border}`, borderRadius: "12px", padding: "12px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "10px", color: T.sub, fontFamily: "'JetBrains Mono',monospace" }}>MARKET BIAS</span>
              <span style={{ fontWeight: 800, fontSize: "12px", color: sent > 55 ? T.long : sent < 45 ? T.short : T.amber }}>
                {sent > 55 ? "🐂 BULL" : sent < 45 ? "🐻 BEAR" : "⚖ NEUTRAL"} {sent}%
              </span>
            </div>
            <div style={{ background: T.panel, borderRadius: "99px", height: "6px", overflow: "hidden" }}>
              <div style={{ width: `${sent}%`, height: "100%", background: `linear-gradient(90deg,${T.long}50,${T.long})`, borderRadius: "99px" }} />
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginBottom: "18px" }}>
        <button
          onClick={runScan}
          disabled={scanning}
          style={{ background: scanning ? "transparent" : `linear-gradient(135deg,${T.accent}20,${T.sky}12)`, border: `1.5px solid ${scanning ? T.border : T.accent}`, color: scanning ? T.sub : T.accent, padding: "10px 22px", borderRadius: "11px", cursor: scanning ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", opacity: scanning ? 0.6 : 1, boxShadow: scanning ? "none" : `0 0 20px ${T.accent}18` }}
        >
          <span style={{ display: "inline-block", animation: scanning ? "spin 1.5s linear infinite" : "none" }}>◈</span>
          {scanning ? `Scanning… ${progress}%` : "🔍 Run Full Scan"}
        </button>

        {["ALL", "LONG", "SHORT"].map(f => {
          const fc = f === "LONG" ? T.long : f === "SHORT" ? T.short : T.accent;
          const on = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ background: on ? `${fc}15` : "transparent", border: `1.5px solid ${on ? fc : T.border}`, color: on ? fc : T.sub, padding: "10px 15px", borderRadius: "10px", cursor: "pointer", fontSize: "11px", fontWeight: on ? 700 : 400 }}
            >
              {f}{f !== "ALL" && signals.length > 0 ? ` (${signals.filter(s => s.direction === f).length})` : ""}
            </button>
          );
        })}

        <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
          {[["confidence", "Conf"], ["leverage", "Lev"]].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setSortBy(v)}
              style={{ background: sortBy === v ? `${T.amber}12` : "transparent", border: `1.5px solid ${sortBy === v ? T.amber : T.border}`, color: sortBy === v ? T.amber : T.sub, padding: "9px 12px", borderRadius: "9px", cursor: "pointer", fontSize: "11px", fontWeight: sortBy === v ? 700 : 400 }}
            >
              {l}
            </button>
          ))}
          <button
            onClick={() => setAutoScan(v => !v)}
            style={{ background: autoScan ? `${T.amber}12` : "transparent", border: `1.5px solid ${autoScan ? T.amber : T.border}`, color: autoScan ? T.amber : T.sub, padding: "9px 12px", borderRadius: "9px", cursor: "pointer", fontSize: "11px", fontWeight: autoScan ? 700 : 400 }}
          >
            {autoScan ? "⏸ Auto" : "▶ Auto"}
          </button>
        </div>
      </div>

      {/* Progress */}
      {scanning && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: T.sub, marginBottom: "5px", fontFamily: "'JetBrains Mono',monospace" }}>
            <span>{step || "Initializing…"}</span>
            <span>{progress}%</span>
          </div>
          <div style={{ background: T.panel, borderRadius: "99px", height: "4px", overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: `linear-gradient(90deg,${T.accent},${T.long})`, borderRadius: "99px", transition: "width 0.5s" }} />
          </div>
        </div>
      )}

      {err && (
        <div style={{ marginBottom: "16px", padding: "12px 16px", background: `${T.short}10`, border: `1px solid ${T.short}30`, borderLeft: `3px solid ${T.short}`, borderRadius: "10px", fontSize: "11px", color: T.short }}>
          ✕ {err}
        </div>
      )}

      {!scanning && signals.length === 0 && skels === 0 && (
        <div style={{ textAlign: "center", padding: "70px 24px" }}>
          <div style={{ fontSize: "52px", marginBottom: "16px" }}>🛰️</div>
          <div style={{ fontWeight: 800, fontSize: "20px", color: T.sub, marginBottom: "10px" }}>Ready to Scan</div>
          <div style={{ fontSize: "12px", color: T.dim, maxWidth: "440px", margin: "0 auto 24px", lineHeight: "1.8", fontFamily: "'JetBrains Mono',monospace" }}>
            Scans 24 coins · Claude AI signals · TradingView chart on every card
          </div>
          <button
            onClick={runScan}
            style={{ background: `linear-gradient(135deg,${T.accent},${T.sky})`, border: "none", color: "#fff", padding: "13px 32px", borderRadius: "12px", cursor: "pointer", fontSize: "14px", fontWeight: 800, boxShadow: `0 8px 28px ${T.accent}35` }}
          >
            ◈ Start Scanning
          </button>
        </div>
      )}

      {skels > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: "16px", marginBottom: "16px" }}>
          {Array.from({ length: skels }).map((_, i) => <Skel key={i} i={i} />)}
        </div>
      )}

      {filtered.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: "16px" }}>
          {filtered.map((sig, i) => (
            <SignalCard key={sig.id} sig={sig} idx={i} onAddTrade={onAddTrade} onAddAlert={onAddAlert} />
          ))}
        </div>
      )}

      {lastScan && (
        <div style={{ marginTop: "16px", fontSize: "9px", color: T.dim, fontFamily: "'JetBrains Mono',monospace", textAlign: "right" }}>
          Last scan: {lastScan.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════
// TAB: TOKEN SEARCH
// ════════════════════════════════════════════════════
const SearchTab = ({ onAddTrade, onAddAlert }) => {
  const [query,     setQuery]     = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [signal,    setSignal]    = useState(null);
  const [err,       setErr]       = useState(null);

  const analyze = async sym => {
    const s = sym.trim().toUpperCase();
    if (!s) return;
    setQuery(s);
    setAnalyzing(true);
    setSignal(null);
    setErr(null);
    try {
      const sigs = await fetchSingleSignal(s);
      if (sigs.length > 0 && sigs[0].price > 0) {
        setSignal({ ...sigs[0], tv: findTV(s), id: `${s}-${Date.now()}` });
      } else {
        setErr(`No data found for "${s}". Check the symbol and try again.`);
      }
    } catch (e) {
      setErr(`Failed: ${e.message}`);
    }
    setAnalyzing(false);
  };

  const SUGGESTIONS = ["RENDER","JUP","PYTH","SEI","TIA","MEME","BOME","NOT","POPCAT","GMX","PENDLE","LDO","AAVE","MKR","CRV","SNX","COMP","SAND","AXS","GALA","1INCH","RPL"];

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontWeight: 800, fontSize: "20px", color: T.text, marginBottom: "5px" }}>Search Any Token</div>
        <div style={{ fontSize: "12px", color: T.sub, fontFamily: "'JetBrains Mono',monospace" }}>Type any symbol — get AI signal + live TradingView chart.</div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "18px", pointerEvents: "none" }}>🔎</div>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && analyze(query)}
            placeholder="Symbol — BTC, RENDER, POPCAT, GMX…"
            style={{ width: "100%", background: T.card, border: `1.5px solid ${query ? T.accent : T.border}`, borderRadius: "14px", color: T.text, padding: "14px 16px 14px 48px", fontSize: "14px", fontFamily: "inherit", outline: "none" }}
          />
        </div>
        <button
          onClick={() => analyze(query)}
          disabled={!query || analyzing}
          style={{ background: !query || analyzing ? "transparent" : `linear-gradient(135deg,${T.accent}20,${T.sky}12)`, border: `1.5px solid ${!query || analyzing ? T.border : T.accent}`, color: !query || analyzing ? T.sub : T.accent, padding: "14px 22px", borderRadius: "14px", cursor: !query || analyzing ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 700, opacity: !query || analyzing ? 0.5 : 1 }}
        >
          {analyzing ? "…" : "Analyze"}
        </button>
      </div>

      {!signal && !analyzing && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "10px", color: T.sub, fontFamily: "'JetBrains Mono',monospace", marginBottom: "8px" }}>QUICK SEARCH</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => analyze(s)}
                style={{ background: T.card, border: `1px solid ${T.border}`, color: T.sub, padding: "5px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "11px", fontFamily: "'JetBrains Mono',monospace" }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {analyzing && (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <div style={{ fontSize: "40px", animation: "spin 2s linear infinite", display: "inline-block", marginBottom: "14px" }}>◈</div>
          <div style={{ fontWeight: 700, fontSize: "16px", color: T.accent, marginBottom: "8px" }}>Analyzing {query}…</div>
        </div>
      )}

      {err && !analyzing && (
        <div style={{ padding: "14px 18px", background: `${T.short}10`, border: `1px solid ${T.short}30`, borderLeft: `3px solid ${T.short}`, borderRadius: "12px", fontSize: "12px", color: T.short }}>
          ✕ {err}
        </div>
      )}

      {signal && !analyzing && (
        <div>
          <div style={{ fontWeight: 800, fontSize: "16px", color: T.text, marginBottom: "14px" }}>◈ Signal for {signal.symbol}</div>
          <div style={{ maxWidth: "480px" }}>
            <SignalCard sig={signal} idx={0} onAddTrade={onAddTrade} onAddAlert={onAddAlert} />
          </div>
          <button
            onClick={() => { setSignal(null); setQuery(""); }}
            style={{ marginTop: "14px", background: "transparent", border: `1px solid ${T.border}`, color: T.sub, padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "11px" }}
          >
            ← Search another
          </button>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════
// TAB: CHARTS
// Fix: removed unused tf state — TVChart handles timeframes internally
// ════════════════════════════════════════════════════
const ChartsTab = () => {
  const [selected, setSelected] = useState(SCAN_COINS[0]);
  const [search,   setSearch]   = useState("");

  const filtered = ALL_TV_COINS.filter(c =>
    !search || c.sym.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontWeight: 800, fontSize: "20px", color: T.text, marginBottom: "5px" }}>Live Charts</div>
        <div style={{ fontSize: "12px", color: T.sub, fontFamily: "'JetBrains Mono',monospace" }}>
          TradingView charts for {ALL_TV_COINS.length} coins · RSI · MACD · Bollinger Bands · Volume · EMA · VWAP
        </div>
      </div>

      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
        {/* Sidebar */}
        <div style={{ width: "160px", flexShrink: 0 }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter…"
            style={{ width: "100%", background: T.card, border: `1px solid ${T.border}`, borderRadius: "8px", color: T.text, padding: "7px 10px", fontSize: "11px", fontFamily: "'JetBrains Mono',monospace", outline: "none", marginBottom: "8px" }}
          />
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: "12px", overflow: "hidden", maxHeight: "500px", overflowY: "auto" }}>
            {filtered.map(c => {
              const on = selected.sym === c.sym;
              return (
                <div
                  key={c.sym}
                  onClick={() => setSelected(c)}
                  style={{ padding: "9px 12px", cursor: "pointer", borderBottom: `1px solid ${T.border}`, background: on ? `${T.accent}15` : "transparent", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  onMouseEnter={e => { if (!on) e.currentTarget.style.background = T.panel; }}
                  onMouseLeave={e => { if (!on) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ fontSize: "12px", fontWeight: on ? 700 : 400, color: on ? T.accent : T.text, fontFamily: "'JetBrains Mono',monospace" }}>{c.sym}</span>
                  {on && <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: T.accent }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart area */}
        <div style={{ flex: 1, minWidth: "300px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: "18px", color: T.text }}>
                {selected.sym}
                <span style={{ fontSize: "11px", color: T.sub, marginLeft: "8px", fontFamily: "'JetBrains Mono',monospace" }}>/ USDT PERP</span>
              </div>
              <div style={{ fontSize: "10px", color: T.sub, fontFamily: "'JetBrains Mono',monospace" }}>{selected.tv}</div>
            </div>
            <a
              href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(selected.tv)}`}
              target="_blank"
              rel="noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "5px", background: `${T.accent}12`, border: `1px solid ${T.accent}40`, color: T.accent, padding: "7px 14px", borderRadius: "9px", textDecoration: "none", fontSize: "11px", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}
            >
              ↗ Open full chart
            </a>
          </div>
          {/* Fix: TVChart itself manages timeframe — no need for outer tf state */}
          <TVChart tvSymbol={selected.tv} defaultTf="60" height={520} showControls={true} activeInds={["rsi", "macd", "bb", "vol"]} />
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════
// TAB: ALERTS
// Fix: alert hit detection logic corrected
// Fix: liveP is now polled from App level
// Fix: browser Notification is actually sent when hit
// ════════════════════════════════════════════════════
const AlertsTab = ({ alerts, onRemove, liveP }) => {
  if (!alerts.length) return (
    <div style={{ textAlign: "center", padding: "70px 24px" }}>
      <div style={{ fontSize: "50px", marginBottom: "16px" }}>🔔</div>
      <div style={{ fontWeight: 800, fontSize: "20px", color: T.sub, marginBottom: "8px" }}>No Alerts Set</div>
      <div style={{ fontSize: "12px", color: T.dim, maxWidth: "340px", margin: "0 auto", lineHeight: "1.7", fontFamily: "'JetBrains Mono',monospace" }}>
        Tap "Alert" on any signal card. NEXUS monitors the entry price and notifies you when it's hit.
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: "20px", color: T.text, marginBottom: "3px" }}>Price Alerts</div>
          <div style={{ fontSize: "11px", color: T.sub, fontFamily: "'JetBrains Mono',monospace" }}>Notification fires when price is within 0.3% of entry</div>
        </div>
        <span style={{ background: T.accent, color: "#fff", padding: "4px 12px", borderRadius: "99px", fontSize: "11px", fontWeight: 700 }}>
          {alerts.length} active
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {alerts.map(a => {
          const cur  = liveP[a.symbol] ?? a.entryPrice;
          const dist = (((cur - a.entryPrice) / a.entryPrice) * 100).toFixed(2);

          // Fix: was inverted. Now: alert fires when price is within 0.3% of entry (either direction)
          const hit  = Math.abs((cur - a.entryPrice) / a.entryPrice) <= 0.003;
          const col  = a.direction === "LONG" ? T.long : T.short;
          const prox = Math.min(100, Math.max(0, 100 - Math.abs(parseFloat(dist)) * 20));

          return (
            <div
              key={a.id}
              style={{ background: hit ? `linear-gradient(135deg,${col}12,${T.card})` : T.card, border: `1.5px solid ${hit ? col : T.border}`, borderRadius: "14px", padding: "18px 20px", display: "flex", alignItems: "center", gap: "14px" }}
            >
              {hit && <div style={{ fontSize: "20px", animation: "pulse 0.8s infinite" }}>🔔</div>}
              <div style={{ width: "40px", height: "40px", background: `${col}15`, border: `1.5px solid ${col}`, borderRadius: "10px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "10px", fontWeight: 800, color: col }}>{a.symbol.slice(0, 4)}</span>
                <span style={{ fontSize: "8px", color: col }}>{a.direction}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontWeight: 700, fontSize: "14px", color: T.text }}>
                    {a.symbol} <span style={{ color: col, fontSize: "11px" }}>({a.direction})</span>
                  </span>
                  {hit && <span style={{ background: col, color: "#000", padding: "2px 9px", borderRadius: "99px", fontSize: "9px", fontWeight: 800 }}>🎯 ENTRY HIT</span>}
                </div>
                <div style={{ display: "flex", gap: "16px", fontSize: "11px", fontFamily: "'JetBrains Mono',monospace", marginBottom: "8px" }}>
                  <span style={{ color: T.sub }}>Target <span style={{ color: T.amber, fontWeight: 700 }}>{fmtP(a.entryPrice)}</span></span>
                  <span style={{ color: T.sub }}>Now <span style={{ color: T.text, fontWeight: 700 }}>{fmtP(cur)}</span></span>
                  <span style={{ color: T.sub }}>Δ <span style={{ color: parseFloat(dist) <= 0 ? T.long : T.short, fontWeight: 700 }}>{dist}%</span></span>
                </div>
                <div style={{ background: T.panel, borderRadius: "99px", height: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${prox}%`, height: "100%", background: `linear-gradient(90deg,${col}50,${col})`, borderRadius: "99px" }} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <a
                  href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(findTV(a.symbol))}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ background: `${T.accent}10`, border: `1px solid ${T.accent}30`, color: T.accent, padding: "5px 10px", borderRadius: "7px", textDecoration: "none", fontSize: "10px", textAlign: "center" }}
                >
                  📈
                </a>
                <button
                  onClick={() => onRemove(a.id)}
                  style={{ background: `${T.short}10`, border: `1px solid ${T.short}25`, color: T.short, padding: "5px 10px", borderRadius: "7px", cursor: "pointer", fontSize: "10px" }}
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════
// TAB: PORTFOLIO
// ════════════════════════════════════════════════════
const PortfolioTab = ({ trades, onRemove, liveP }) => {
  const [expandedChart, setExpandedChart] = useState(null);

  if (!trades.length) return (
    <div style={{ textAlign: "center", padding: "70px 24px" }}>
      <div style={{ fontSize: "50px", marginBottom: "16px" }}>📂</div>
      <div style={{ fontWeight: 800, fontSize: "20px", color: T.sub, marginBottom: "8px" }}>No Trades Tracked</div>
      <div style={{ fontSize: "12px", color: T.dim, maxWidth: "340px", margin: "0 auto", lineHeight: "1.7", fontFamily: "'JetBrains Mono',monospace" }}>
        Click "Track" on any signal card to add it here.
      </div>
    </div>
  );

  const avgPnl = (
    trades.reduce((sum, t) => {
      const cur = liveP[t.symbol] ?? t.entryPrice;
      const raw = t.direction === "LONG"
        ? (cur - t.entryPrice) / t.entryPrice
        : (t.entryPrice - cur) / t.entryPrice;
      return sum + raw * t.leverage * 100;
    }, 0) / trades.length
  ).toFixed(2);

  return (
    <div>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: "16px", padding: "20px 24px", marginBottom: "20px", display: "flex", gap: "28px", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: "10px", color: T.sub, fontFamily: "'JetBrains Mono',monospace", marginBottom: "3px" }}>OPEN TRADES</div>
          <div style={{ fontWeight: 800, fontSize: "28px", color: T.accent }}>{trades.length}</div>
        </div>
        <div>
          <div style={{ fontSize: "10px", color: T.sub, fontFamily: "'JetBrains Mono',monospace", marginBottom: "3px" }}>AVG LEVERAGED PnL</div>
          <div style={{ fontWeight: 800, fontSize: "28px", color: parseFloat(avgPnl) >= 0 ? T.long : T.short }}>
            {parseFloat(avgPnl) >= 0 ? "+" : ""}{avgPnl}%
          </div>
        </div>
        <div style={{ flex: 1, fontSize: "9px", color: T.dim, fontFamily: "'JetBrains Mono',monospace", alignSelf: "flex-end" }}>
          PnL = ((Current−Entry)/Entry) × Leverage × 100
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {trades.map(t => {
          const cur    = liveP[t.symbol] ?? t.entryPrice;
          const raw    = t.direction === "LONG"
            ? (cur - t.entryPrice) / t.entryPrice
            : (t.entryPrice - cur) / t.entryPrice;
          const levPnl = (raw * t.leverage * 100).toFixed(2);
          const col    = t.direction === "LONG" ? T.long : T.short;
          const tpHit  = t.direction === "LONG" ? cur >= t.take_profit  : cur <= t.take_profit;
          const slHit  = t.direction === "LONG" ? cur <= t.stop_loss    : cur >= t.stop_loss;
          const status = tpHit ? "🎯 TP HIT" : slHit ? "⛔ SL HIT" : "⏳ OPEN";
          const sCol   = tpHit ? T.long : slHit ? T.short : T.amber;
          const isExp  = expandedChart === t.id;

          return (
            <div key={t.id} style={{ background: T.card, border: `1.5px solid ${slHit ? T.short : tpHit ? T.long : T.border}`, borderRadius: "14px", overflow: "hidden" }}>
              <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "44px", height: "44px", background: `${col}15`, border: `1.5px solid ${col}`, borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "10px", fontWeight: 800, color: col }}>{t.symbol.slice(0, 4)}</span>
                      <span style={{ fontSize: "8px", color: col }}>⚡{t.leverage}×</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "16px", color: T.text }}>{t.symbol}</div>
                      <div style={{ fontSize: "10px", color: col, fontWeight: 700 }}>{t.direction} · {t.leverage}× Leverage</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: "22px", color: parseFloat(levPnl) >= 0 ? T.long : T.short }}>
                      {parseFloat(levPnl) >= 0 ? "+" : ""}{levPnl}%
                    </div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: sCol }}>{status}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "12px" }}>
                  {[["ENTRY", fmtP(t.entryPrice), T.sky], ["NOW", fmtP(cur), T.amber], ["TP", fmtP(t.take_profit), T.long], ["SL", fmtP(t.stop_loss), T.short]].map(([l, v, c]) => (
                    <div key={l} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: "8px", padding: "7px", textAlign: "center" }}>
                      <div style={{ fontSize: "8px", color: T.dim, letterSpacing: "1px", marginBottom: "2px", fontFamily: "'JetBrains Mono',monospace" }}>{l}</div>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: c, fontFamily: "'JetBrains Mono',monospace" }}>{v}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "7px" }}>
                  <button
                    onClick={() => setExpandedChart(isExp ? null : t.id)}
                    style={{ flex: 1, background: isExp ? `${T.accent}20` : `${T.accent}10`, border: `1px solid ${isExp ? T.accent : T.accent + "35"}`, color: T.accent, padding: "7px", borderRadius: "8px", cursor: "pointer", fontSize: "11px", fontWeight: 700 }}
                  >
                    {isExp ? "✕ Hide Chart" : "📈 Live Chart"}
                  </button>
                  <a
                    href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(t.tv || findTV(t.symbol))}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ padding: "7px 12px", background: `${T.violet}10`, border: `1px solid ${T.violet}35`, color: T.violet, borderRadius: "8px", textDecoration: "none", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    ↗ TV
                  </a>
                  <button
                    onClick={() => onRemove(t.id)}
                    style={{ padding: "7px 12px", background: `${T.short}10`, border: `1px solid ${T.short}25`, color: T.short, borderRadius: "8px", cursor: "pointer", fontSize: "11px" }}
                  >
                    Remove
                  </button>
                </div>
                <div style={{ fontSize: "9px", color: T.sub, fontFamily: "'JetBrains Mono',monospace", marginTop: "8px" }}>
                  Added {new Date(t.addedAt).toLocaleString()}
                </div>
              </div>

              {isExp && (
                <div style={{ borderTop: `1px solid ${T.border}` }}>
                  <TVChart tvSymbol={t.tv || findTV(t.symbol)} defaultTf="60" height={380} showControls={true} activeInds={["rsi", "macd", "vol"]} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════
// ROOT APP
// ════════════════════════════════════════════════════
export default function App() {
  const [tab,    setTab]    = useState("scan");
  const [alerts, setAlerts] = useState([]);
  const [trades, setTrades] = useState([]);
  const [liveP,  setLiveP]  = useState({});

  // Fix: was window.storage (doesn't exist) — now uses localStorage helper
  useEffect(() => {
    const savedAlerts = storage.get("nx8_alerts");
    const savedTrades = storage.get("nx8_trades");
    if (savedAlerts) setAlerts(savedAlerts);
    if (savedTrades) setTrades(savedTrades);

    // Request notification permission once on load
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => { storage.set("nx8_alerts", alerts); }, [alerts]);
  useEffect(() => { storage.set("nx8_trades", trades); }, [trades]);

  // Fix: poll prices for tracked symbols every 30s
  // Uses CoinGecko free API (no key required) as a public price feed
  useEffect(() => {
    const symbols = [...new Set([
      ...alerts.map(a => a.symbol),
      ...trades.map(t => t.symbol),
    ])];
    if (symbols.length === 0) return;

    const idMap = {
      BTC:"bitcoin", ETH:"ethereum", BNB:"binancecoin", SOL:"solana",
      XRP:"ripple",  ADA:"cardano",  AVAX:"avalanche-2", LINK:"chainlink",
      DOT:"polkadot", NEAR:"near",   ARB:"arbitrum",     OP:"optimism",
      SUI:"sui",     INJ:"injective-protocol", APT:"aptos",  LTC:"litecoin",
      DOGE:"dogecoin", SHIB:"shiba-inu", PEPE:"pepe",    WIF:"dogwifcoin",
      BONK:"bonk",   FLOKI:"floki",   UNI:"uniswap",   TRX:"tron",
    };

    const fetchPrices = async () => {
      const ids = symbols.map(s => idMap[s]).filter(Boolean).join(",");
      if (!ids) return;
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
        );
        if (!res.ok) return;
        const data = await res.json();
        const updates = {};
        symbols.forEach(sym => {
          const id = idMap[sym];
          if (id && data[id]?.usd) updates[sym] = data[id].usd;
        });
        setLiveP(prev => ({ ...prev, ...updates }));

        // Fix: actually fire browser notifications when alert is hit
        alerts.forEach(a => {
          const price = updates[a.symbol];
          if (!price) return;
          const hit = Math.abs((price - a.entryPrice) / a.entryPrice) <= 0.003;
          if (hit && Notification.permission === "granted") {
            new Notification(`🎯 NEXUS Alert: ${a.symbol}`, {
              body: `${a.direction} entry at ${fmtP(a.entryPrice)} has been hit! Current: ${fmtP(price)}`,
              icon: "/favicon.ico",
            });
          }
        });
      } catch (e) {
        console.warn("Price poll failed:", e.message);
      }
    };

    fetchPrices(); // immediate
    const interval = setInterval(fetchPrices, 30_000);
    return () => clearInterval(interval);
  }, [alerts, trades]);

  const addAlert = useCallback(sig => {
    const a = {
      id:         `a-${Date.now()}`,
      symbol:     sig.symbol,
      tv:         sig.tv || findTV(sig.symbol),
      direction:  sig.direction,
      entryPrice: parseFloat(sig.entry_price),
      leverage:   sig.leverage,
    };
    setAlerts(p => [
      ...p.filter(x => !(x.symbol === sig.symbol && x.direction === sig.direction)),
      a,
    ]);
    setTab("alerts");
    setLiveP(p => ({ ...p, [sig.symbol]: parseFloat(sig.price) }));
  }, []);

  const addTrade = useCallback(sig => {
    const t = {
      id:          `t-${Date.now()}`,
      symbol:      sig.symbol,
      tv:          sig.tv || findTV(sig.symbol),
      direction:   sig.direction,
      leverage:    sig.leverage,
      entryPrice:  parseFloat(sig.entry_price),
      take_profit: parseFloat(sig.take_profit),
      stop_loss:   parseFloat(sig.stop_loss),
      addedAt:     Date.now(),
    };
    setTrades(p => [...p, t]);
    setTab("portfolio");
    setLiveP(p => ({ ...p, [sig.symbol]: parseFloat(sig.price) }));
  }, []);

  const TABS = [
    { id: "scan",      icon: "🛰️", label: "Market Scan"  },
    { id: "search",    icon: "🔎", label: "Token Search"  },
    { id: "charts",    icon: "📈", label: "Charts"        },
    { id: "alerts",    icon: "🔔", label: "Alerts",    badge: alerts.length || null },
    { id: "portfolio", icon: "📂", label: "Portfolio", badge: trades.length || null },
  ];

  return (
    // Fix: wrap entire app in ErrorBoundary
    <ErrorBoundary>
      <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Space Grotesk',sans-serif" }}>
        {/* Background glow */}
        <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "-10%", left: "-5%", width: "40%", height: "40%", background: `radial-gradient(circle,${T.accent}10,transparent 70%)` }} />
          <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: "35%", height: "35%", background: `radial-gradient(circle,${T.long}08,transparent 70%)` }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: "1440px", margin: "0 auto" }}>
          {/* HEADER */}
          <header style={{ padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}`, flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "13px", background: `linear-gradient(135deg,${T.accent},${T.long})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", boxShadow: `0 0 20px ${T.accent}30`, flexShrink: 0 }}>◈</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "22px", letterSpacing: "-1px", background: `linear-gradient(90deg,${T.accent},${T.sky})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NEXUS</div>
                <div style={{ fontSize: "9px", color: T.sub, fontFamily: "'JetBrains Mono',monospace" }}>Futures Intelligence · v8 · TradingView + Claude AI</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", background: T.card, border: `1px solid ${T.border}`, borderRadius: "99px", padding: "5px 12px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: T.long, animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: "9px", color: T.long, fontFamily: "'JetBrains Mono',monospace" }}>LIVE</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", background: T.card, border: `1px solid ${T.border}`, borderRadius: "99px", padding: "5px 12px" }}>
                <span style={{ fontSize: "9px", color: T.sub, fontFamily: "'JetBrains Mono',monospace" }}>📈 TradingView</span>
              </div>
            </div>
          </header>

          {/* TABS */}
          <div style={{ padding: "0 28px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: "4px", overflowX: "auto" }}>
            {TABS.map(t => {
              const on = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{ background: "transparent", border: "none", color: on ? T.accent : T.sub, padding: "14px 18px", cursor: "pointer", fontSize: "13px", fontWeight: on ? 700 : 400, borderBottom: `2px solid ${on ? T.accent : "transparent"}`, transition: "all 0.18s", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  {t.icon} {t.label}
                  {t.badge && (
                    <span style={{ background: T.accent, color: "#fff", borderRadius: "99px", padding: "1px 7px", fontSize: "9px", fontWeight: 800 }}>
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* CONTENT */}
          <div style={{ padding: "24px 28px 40px" }}>
            {tab === "scan"      && <ScanTab      onAddTrade={addTrade} onAddAlert={addAlert} />}
            {tab === "search"    && <SearchTab    onAddTrade={addTrade} onAddAlert={addAlert} />}
            {tab === "charts"    && <ChartsTab />}
            {tab === "alerts"    && <AlertsTab    alerts={alerts} onRemove={id => setAlerts(p => p.filter(a => a.id !== id))} liveP={liveP} />}
            {tab === "portfolio" && <PortfolioTab trades={trades} onRemove={id => setTrades(p => p.filter(t => t.id !== id))} liveP={liveP} />}
          </div>

          <footer style={{ padding: "14px 28px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", fontSize: "9px", color: T.dim, fontFamily: "'JetBrains Mono',monospace", flexWrap: "wrap", gap: "8px" }}>
            <span>◈ NEXUS v8 · TradingView + Claude AI</span>
            <span>⚠ Informational only · Not financial advice</span>
          </footer>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
          @keyframes pulse  { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
          @keyframes spin   { to{transform:rotate(360deg);} }
          @keyframes riseIn { from{opacity:0;transform:translateY(16px) scale(0.97);} to{opacity:1;transform:translateY(0) scale(1);} }
          * { box-sizing:border-box; margin:0; padding:0; }
          ::-webkit-scrollbar { width:5px; height:4px; }
          ::-webkit-scrollbar-track { background:#07080f; }
          ::-webkit-scrollbar-thumb { background:#1a1d38; border-radius:10px; }
          button { font-family:inherit; transition:all 0.18s; }
          button:hover:not(:disabled) { opacity:0.82; transform:translateY(-1px); }
          input { font-family:inherit; }
          input:focus { border-color:#7b68ee !important; box-shadow:0 0 0 3px #7b68ee15; }

          /* Basic mobile responsiveness */
          @media (max-width: 600px) {
            header { padding: 12px 16px !important; }
            .tab-bar { padding: 0 8px !important; }
            .content { padding: 16px 12px 32px !important; }
          }
        `}</style>
      </div>
    </ErrorBoundary>
  );
}
