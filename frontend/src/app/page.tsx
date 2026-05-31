"use client";

import { useState, useEffect, useRef } from "react";

const TICKERS = [
  { s: "S&P 500", v: "5,912.17", c: "+0.40%", up: true },
  { s: "NASDAQ", v: "19,175.87", c: "+0.39%", up: true },
  { s: "DOW", v: "42,215.73", c: "+0.28%", up: true },
  { s: "VIX", v: "19.18", c: "-0.67%", up: false },
  { s: "NVDA", v: "$139.16", c: "+3.25%", up: true },
  { s: "AAPL", v: "$199.16", c: "-0.23%", up: false },
  { s: "TSLA", v: "$358.43", c: "+0.43%", up: true },
  { s: "AMZN", v: "$197.12", c: "+1.12%", up: true },
  { s: "USD/KRW", v: "1,373.6", c: "-0.09%", up: false },
  { s: "BTC", v: "$107,842", c: "+2.14%", up: true },
  { s: "SOXX", v: "$238.51", c: "+0.41%", up: true },
  { s: "XLE", v: "$91.23", c: "+0.75%", up: true },
];

const STATS = [
  { label: "분석 데이터 포인트", value: "200+", sub: "매일 수집" },
  { label: "브리핑 발송 시각", value: "08:00", sub: "KST 매일" },
  { label: "AI 분석 모델", value: "Claude", sub: "Anthropic" },
  { label: "분석 가능 종목", value: "∞", sub: "글로벌 전체" },
];

const BRIEFING_MSGS = [
  { delay: 0, text: "🇺🇸 미국 증시 마감 브리핑 — 5월 29일 (목)" },
  { delay: 400, text: "📈 S&P500 ▲0.40% · 나스닥 ▲0.39% · 다우 ▲0.28%" },
  { delay: 800, text: "💾 반도체(SOXX) ▲0.41% — 엔비디아 ▲3.25% 주도" },
  { delay: 1200, text: "💵 달러/원 1,373.6원 · VIX 19.18 (안정권)" },
  { delay: 1600, text: "💡 반도체 강세 → 삼성·하이닉스 상승 출발 기대" },
];

function TerminalCard() {
  const [visible, setVisible] = useState<number[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          BRIEFING_MSGS.forEach(({ delay }, i) => {
            setTimeout(() => setVisible((p) => [...p, i]), delay + 400);
          });
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="terminal-card rounded-2xl overflow-hidden">
      {/* title bar */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#161622", borderBottom: "1px solid #1e1e30" }}>
        <span className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
        <span className="ml-3 text-xs font-mono" style={{ color: "#555577" }}>goohaejo_bot — 텔레그램</span>
      </div>
      <div className="px-5 py-5 space-y-3 min-h-[180px]" style={{ background: "#0e0e1a" }}>
        {BRIEFING_MSGS.map((msg, i) => (
          <div
            key={i}
            className="flex items-start gap-3 text-sm font-mono transition-all duration-500"
            style={{
              opacity: visible.includes(i) ? 1 : 0,
              transform: visible.includes(i) ? "translateY(0)" : "translateY(8px)",
              color: i === 4 ? "#00ff88" : "#c8c8e0",
            }}
          >
            <span style={{ color: "#3a3a5a", flexShrink: 0 }}>›</span>
            <span>{msg.text}</span>
          </div>
        ))}
        {visible.length === BRIEFING_MSGS.length && (
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs font-mono" style={{ color: "#3a3a5a" }}>›</span>
            <span className="w-2 h-4 ml-1 animate-pulse" style={{ background: "#00ff88" }} />
          </div>
        )}
      </div>
    </div>
  );
}

function ChatDemo() {
  const msgs = [
    { from: "user", text: "NVDA 분석해줘" },
    {
      from: "bot",
      lines: [
        { t: "⚡ NVIDIA (NVDA) 분석", c: "#ffd700", bold: true },
        { t: "$139.16  ▲+3.25%", c: "#00ff88" },
        { t: "52주 고가 $153.13 · 저가 $78.32", c: "#6b6b80" },
        { t: "AI 반도체 수요 급증으로 데이터센터\n매출 전년比 +220%. 블랙웰 GPU\n공급 확대 — 단기 모멘텀 강세", c: "#c8c8e0" },
        { t: "⚠️ 본 정보는 투자 권유가 아닙니다.", c: "#555577" },
      ],
    },
  ];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#0e0e1a", border: "1px solid #1e1e30" }}>
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#161622", borderBottom: "1px solid #1e1e30" }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm" style={{ background: "linear-gradient(135deg,#00ff88,#0088ff)" }}>9</div>
        <div>
          <div className="text-xs font-bold" style={{ color: "#e8e8f0" }}>구해조 봇</div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00ff88" }} />
            <span className="text-xs" style={{ color: "#00ff88" }}>온라인</span>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {msgs.map((m, i) =>
          m.from === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="px-4 py-2 rounded-2xl rounded-tr-sm text-sm max-w-[70%]" style={{ background: "#0066cc", color: "#fff" }}>
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="flex gap-3">
              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs" style={{ background: "linear-gradient(135deg,#00ff88,#0088ff)" }}>9</div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm flex-1" style={{ background: "#161622", border: "1px solid #1e1e30" }}>
                {m.lines!.map((l, j) => (
                  <p key={j} className={`${j > 0 ? "mt-1.5" : ""} ${l.bold ? "font-bold" : ""} whitespace-pre-line text-xs leading-relaxed`} style={{ color: l.c }}>
                    {l.t}
                  </p>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [chatId, setChatId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 50);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatId.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div style={{ background: "#080810", minHeight: "100vh", color: "#e8e8f0" }}>

      {/* ── TICKER TAPE ── */}
      <div style={{ background: "#0a0a16", borderBottom: "1px solid #14142a" }} className="overflow-hidden">
        <div className="flex whitespace-nowrap" style={{ animation: "ticker 40s linear infinite" }}>
          {[...TICKERS, ...TICKERS].map((t, i) => (
            <div key={i} className="inline-flex items-center gap-2 px-5 py-2 text-xs font-mono">
              <span style={{ color: "#444466" }}>{t.s}</span>
              <span style={{ color: "#aaaacc" }}>{t.v}</span>
              <span style={{ color: t.up ? "#00d97e" : "#ff4466", fontWeight: 700 }}>{t.c}</span>
              <span style={{ color: "#1a1a2e", margin: "0 8px" }}>|</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-8 py-4" style={{ borderBottom: "1px solid #10101e" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
            style={{ background: "linear-gradient(135deg,#00ff88,#0088ff)", color: "#080810" }}>9</div>
          <span className="font-black tracking-tight text-lg">구해조</span>
          <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: "#14142a", color: "#00ff88", border: "1px solid #00ff8830" }}>v0.1</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#how" className="text-sm hidden sm:block" style={{ color: "#555577" }}>이용방법</a>
          <a href="https://t.me/goohaejo_bot" target="_blank" rel="noopener noreferrer"
            className="text-sm px-4 py-2 rounded-lg font-bold transition-all"
            style={{ background: "linear-gradient(135deg,#00ff88,#0088ff)", color: "#080810" }}>
            텔레그램 시작 →
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative px-6 pt-24 pb-16 overflow-hidden">
        {/* grid bg */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(#10102030 1px,transparent 1px),linear-gradient(90deg,#10102030 1px,transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
        {/* glow */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div style={{
            width: 700, height: 500,
            background: "radial-gradient(ellipse at center,rgba(0,255,136,0.06) 0%,transparent 65%)",
          }} />
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-10"
            style={{ background: "rgba(0,255,136,0.07)", border: "1px solid rgba(0,255,136,0.2)", color: "#00ff88" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00ff88", boxShadow: "0 0 6px #00ff88", animation: "pulseGlow 2s infinite" }} />
            AI 기반 미국 시장 브리핑 · 매일 08:00 KST
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-6">
                월가의 밤을<br />
                <span style={{
                  background: "linear-gradient(135deg,#00ff88 0%,#0088ff 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                }}>
                  아침에 받아보세요
                </span>
              </h1>
              <p className="text-base leading-relaxed mb-8" style={{ color: "#666688" }}>
                미국 증시 마감 후 S&P500·나스닥·섹터별 흐름을 Claude AI가 분석해
                한국 투자자 맞춤 브리핑으로 전달합니다.
                <br /><br />
                궁금한 종목은 텔레그램에 바로 물어보세요.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="https://t.me/goohaejo_bot" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg,#00ff88,#0088ff)", color: "#080810", boxShadow: "0 8px 32px rgba(0,255,136,0.25)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  텔레그램으로 구독
                </a>
                <a href="#how"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
                  style={{ background: "#12121e", border: "1px solid #1e1e30", color: "#aaaacc" }}>
                  이용방법 보기
                </a>
              </div>

              {/* mini stats */}
              <div className="grid grid-cols-4 gap-3 mt-10">
                {STATS.map((s, i) => (
                  <div key={i} className="rounded-xl p-3 text-center" style={{ background: "#0c0c1a", border: "1px solid #14142a" }}>
                    <div className="font-black text-lg" style={{
                      background: "linear-gradient(135deg,#00ff88,#0088ff)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                    }}>{s.value}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#444466" }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* terminal preview */}
            <div className="flex flex-col gap-4">
              <TerminalCard />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ background: "#0a0a14", borderTop: "1px solid #10101e", borderBottom: "1px solid #10101e" }} className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-mono mb-3" style={{ color: "#00ff88" }}>FEATURES</p>
            <h2 className="text-3xl font-black">
              스마트한 투자자를 위한{" "}
              <span style={{
                background: "linear-gradient(135deg,#00ff88,#0088ff)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
              }}>
                데이터 브리핑
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: "◈",
                iconColor: "#00ff88",
                title: "매일 아침 8시 브리핑",
                desc: "미국 장 마감 후 핵심만 추려 전달. 복잡한 차트 대신 AI가 정리한 3줄 요약.",
                tag: "DAILY",
              },
              {
                icon: "◉",
                iconColor: "#0088ff",
                title: "섹터별 등락 분석",
                desc: "반도체·IT·에너지 등 6개 섹터 흐름과 한국 주식에 미치는 영향까지 분석.",
                tag: "SECTOR",
              },
              {
                icon: "◆",
                iconColor: "#ffd700",
                title: "환율 & 한국 영향",
                desc: "달러/원 환율 변동과 코스피 예상 흐름. 외국인 수급까지 한눈에.",
                tag: "FX",
              },
              {
                icon: "◐",
                iconColor: "#ff6b6b",
                title: "종목 즉시 분석",
                desc: "텔레그램에 '삼성전자' 또는 'NVDA' 입력하면 실시간 분석 리포트 즉시 발송.",
                tag: "AI",
              },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl p-6 flex gap-5 transition-all hover:border-opacity-50 group"
                style={{ background: "#0c0c1a", border: "1px solid #14142a" }}>
                <div className="text-2xl font-mono flex-shrink-0 mt-0.5" style={{ color: f.iconColor }}>{f.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold" style={{ color: "#e8e8f0" }}>{f.title}</h3>
                    <span className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ background: `${f.iconColor}15`, color: f.iconColor }}>{f.tag}</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#555577" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STOCK QUERY ── */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-mono mb-3" style={{ color: "#0088ff" }}>STOCK ANALYSIS</p>
              <h2 className="text-3xl font-black mb-5 leading-tight" style={{ color: "#e8e8f0" }}>
                궁금한 종목,<br />
                <span style={{
                  background: "linear-gradient(135deg,#ffd700,#ff8800)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                }}>
                  바로 물어보세요
                </span>
              </h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "#555577" }}>
                텔레그램 봇에 회사 이름이나 티커를 입력하면 Claude AI가 즉시 분석합니다. 주가 동향, 섹터 포지션, 투자 포인트까지.
              </p>
              <div className="space-y-2">
                {[
                  { ex: "삼성전자", label: "한국 종목" },
                  { ex: "NVDA", label: "미국 티커" },
                  { ex: "테슬라 분석해줘", label: "자연어" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl text-sm"
                    style={{ background: "#0c0c1a", border: "1px solid #14142a" }}>
                    <div className="flex items-center gap-3">
                      <span style={{ color: "#444466" }}>$</span>
                      <span className="font-mono" style={{ color: "#c8c8e0" }}>{item.ex}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: "#14142a", color: "#555577" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <ChatDemo />
          </div>
        </div>
      </section>

      {/* ── HOW TO ── */}
      <section id="how" style={{ background: "#0a0a14", borderTop: "1px solid #10101e" }} className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-mono mb-3" style={{ color: "#00ff88" }}>GET STARTED</p>
            <h2 className="text-3xl font-black" style={{ color: "#e8e8f0" }}>
              1분이면 충분합니다
            </h2>
          </div>

          <div className="flex flex-col gap-4 mb-14">
            {[
              { n: "01", title: "텔레그램 봇 시작", desc: "@goohaejo_bot 에서 /start 입력", accent: "#00ff88" },
              { n: "02", title: "Chat ID 확인", desc: "봇이 자동으로 나의 Chat ID를 알려줍니다", accent: "#0088ff" },
              { n: "03", title: "구독 신청", desc: "아래 폼에 Chat ID를 입력하면 완료", accent: "#ffd700" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-5 px-6 py-5 rounded-2xl"
                style={{ background: "#0c0c1a", border: "1px solid #14142a" }}>
                <div className="font-black text-2xl font-mono flex-shrink-0" style={{ color: s.accent }}>{s.n}</div>
                <div>
                  <div className="font-bold text-sm" style={{ color: "#e8e8f0" }}>{s.title}</div>
                  <div className="text-sm mt-0.5" style={{ color: "#555577" }}>{s.desc}</div>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.accent }} />
              </div>
            ))}
          </div>

          {/* SUBSCRIBE FORM */}
          <div className="rounded-2xl p-8" style={{ background: "#0c0c1a", border: "1px solid rgba(0,255,136,0.2)" }}>
            {!submitted ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: "#00ff88" }} />
                  <h3 className="font-black text-xl" style={{ color: "#e8e8f0" }}>구독 신청</h3>
                </div>
                <p className="text-sm mb-6" style={{ color: "#555577" }}>
                  Chat ID를 입력하면 매일 오전 8시 브리핑이 전송됩니다
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    placeholder="Chat ID 입력 (예: 123456789)"
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-mono"
                    style={{
                      background: "#08081a",
                      border: "1px solid #1e1e30",
                      color: "#e8e8f0",
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 whitespace-nowrap"
                    style={{
                      background: "linear-gradient(135deg,#00ff88,#0088ff)",
                      color: "#080810",
                      boxShadow: "0 4px 24px rgba(0,255,136,0.2)",
                    }}
                  >
                    {loading ? "처리 중…" : "구독 시작 →"}
                  </button>
                </form>
                <p className="text-xs mt-4" style={{ color: "#333355" }}>
                  Chat ID 모르시면{" "}
                  <a href="https://t.me/goohaejo_bot" target="_blank" rel="noopener noreferrer"
                    className="underline" style={{ color: "#00ff8890" }}>
                    @goohaejo_bot
                  </a>{" "}
                  에서 /start 입력 후 확인하세요
                </p>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="text-4xl mb-4">✦</div>
                <h3 className="text-2xl font-black mb-2" style={{
                  background: "linear-gradient(135deg,#00ff88,#0088ff)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                }}>구독 완료!</h3>
                <p className="text-sm mb-6" style={{ color: "#555577" }}>내일 오전 8시에 첫 브리핑이 도착합니다</p>
                <a href="https://t.me/goohaejo_bot" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
                  style={{ background: "linear-gradient(135deg,#00ff88,#0088ff)", color: "#080810" }}>
                  봇으로 이동 →
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-8 py-10" style={{ borderTop: "1px solid #10101e" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md flex items-center justify-center font-black text-sm"
              style={{ background: "linear-gradient(135deg,#00ff88,#0088ff)", color: "#080810" }}>9</div>
            <span className="font-black" style={{ color: "#e8e8f0" }}>구해조</span>
            <span className="text-xs" style={{ color: "#333355" }}>KOI 2026 Spring</span>
          </div>
          <div className="text-xs text-center" style={{ color: "#333355" }}>
            본 서비스는 투자 권유가 아닙니다. 투자 판단은 본인 책임입니다.
          </div>
          <a href="https://t.me/goohaejo_bot" target="_blank" rel="noopener noreferrer"
            className="text-xs" style={{ color: "#333355" }}>
            @goohaejo_bot
          </a>
        </div>
      </footer>

    </div>
  );
}
