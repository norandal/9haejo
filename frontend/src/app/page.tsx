"use client";
import { useState, useEffect, useRef } from "react";

/* ── 상수 ─────────────────────────────── */
const TICKERS = [
  { s: "S&P 500", v: "5,912.17", c: "+0.40%", up: true },
  { s: "NASDAQ",  v: "19,175.87", c: "+0.39%", up: true },
  { s: "DOW",     v: "42,215.73", c: "+0.28%", up: true },
  { s: "VIX",     v: "19.18",    c: "-0.67%", up: false },
  { s: "NVDA",    v: "$139.16",  c: "+3.25%", up: true },
  { s: "AAPL",    v: "$199.16",  c: "-0.23%", up: false },
  { s: "TSLA",    v: "$358.43",  c: "+0.43%", up: true },
  { s: "AMZN",    v: "$197.12",  c: "+1.12%", up: true },
  { s: "USD/KRW", v: "1,373.6",  c: "-0.09%", up: false },
  { s: "BTC",     v: "$107,842", c: "+2.14%", up: true },
  { s: "SOXX",    v: "$238.51",  c: "+0.41%", up: true },
  { s: "XLE",     v: "$91.23",   c: "+0.75%", up: true },
];

const BRIEFING = [
  "🇺🇸 미국 증시 마감 브리핑 — 5월 29일 (목)",
  "📈 S&P500 ▲0.40% · 나스닥 ▲0.39% · 다우 ▲0.28%",
  "💾 반도체(SOXX) ▲0.41% — 엔비디아 ▲3.25% 주도",
  "💵 달러/원 1,373.6원 · VIX 19.18 (안정권)",
  "💡 반도체 강세 → 삼성·하이닉스 상승 출발 기대",
];

const PAIN_POINTS = [
  { icon: "😮‍💨", text: "밤새 미국 장 확인하느라 수면 부족" },
  { icon: "📉", text: "중요한 뉴스 놓쳐서 손실 경험" },
  { icon: "🤯", text: "쏟아지는 정보 중 뭐가 핵심인지 모름" },
];

const FEATURES = [
  { icon: "⏰", title: "매일 오전 8시", desc: "미국 장 마감 후 핵심만 정리해 아침에 전달" },
  { icon: "🧠", title: "AI 분석", desc: "Claude AI가 200개 이상의 데이터 포인트를 분석" },
  { icon: "🌏", title: "한국 투자자 맞춤", desc: "환율·코스피 영향까지 한국어로 해석" },
  { icon: "🔍", title: "종목 즉시 분석", desc: "텔레그램에 종목명 입력 → AI 리포트 즉시 발송" },
];

/* ── 컴포넌트 ─────────────────────────── */

function TickerTape() {
  const items = [...TICKERS, ...TICKERS];
  return (
    <div style={{ background: "#09091a", borderBottom: "1px solid #12122a", overflow: "hidden" }}>
      <div className="ticker-wrap" style={{ display: "flex", whiteSpace: "nowrap" }}>
        {items.map((t, i) => (
          <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 20px", fontSize: 12, fontFamily: "monospace" }}>
            <span style={{ color: "#33334d" }}>{t.s}</span>
            <span style={{ color: "#9999bb" }}>{t.v}</span>
            <span style={{ color: t.up ? "#00d97e" : "#ff4466", fontWeight: 700 }}>{t.c}</span>
            <span style={{ color: "#15152a", marginLeft: 8 }}>|</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BriefingTerminal() {
  const [shown, setShown] = useState<number[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !fired.current) {
        fired.current = true;
        BRIEFING.forEach((_, i) => setTimeout(() => setShown(p => [...p, i]), i * 500 + 300));
      }
    }, { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="float" style={{
      background: "#0c0c1e",
      border: "1px solid #1e1e38",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 0 0 1px #00ff8810, 0 32px 80px rgba(0,0,0,0.7)",
      maxWidth: 480,
      width: "100%",
    }}>
      {/* 타이틀바 */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 16px", background: "#0a0a1a", borderBottom: "1px solid #12122a" }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ marginLeft: 8, fontSize: 11, fontFamily: "monospace", color: "#33334d" }}>goohaejo_bot — 텔레그램</span>
      </div>
      {/* 메시지 */}
      <div style={{ padding: "20px 20px 24px", minHeight: 180 }}>
        {BRIEFING.map((line, i) => (
          <div key={i} style={{
            display: "flex", gap: 10, fontSize: 13, fontFamily: "monospace",
            marginTop: i > 0 ? 10 : 0,
            opacity: shown.includes(i) ? 1 : 0,
            transform: shown.includes(i) ? "translateY(0)" : "translateY(6px)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
            color: i === 4 ? "#00ff88" : "#c0c0dd",
          }}>
            <span style={{ color: "#22223a", flexShrink: 0 }}>›</span>
            <span>{line}</span>
          </div>
        ))}
        {shown.length === BRIEFING.length && (
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ color: "#22223a", fontSize: 13, fontFamily: "monospace" }}>›</span>
            <span className="cursor" style={{ display: "inline-block", width: 8, height: 14, background: "#00ff88", marginLeft: 4 }} />
          </div>
        )}
      </div>
    </div>
  );
}

function ChatDemo() {
  return (
    <div style={{
      background: "#0c0c1e",
      border: "1px solid #1e1e38",
      borderRadius: 16,
      overflow: "hidden",
      maxWidth: 440,
      width: "100%",
    }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "#0a0a1a", borderBottom: "1px solid #12122a" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#00ff88,#0088ff)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: "#07070f" }}>9</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e8e8f0" }}>구해조 봇</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d97e" }} />
            <span style={{ fontSize: 11, color: "#00d97e" }}>온라인</span>
          </div>
        </div>
      </div>
      {/* 대화 */}
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        {/* 유저 */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ padding: "8px 14px", borderRadius: "18px 18px 4px 18px", background: "#0055cc", color: "#fff", fontSize: 13 }}>
            NVDA 분석해줘
          </div>
        </div>
        {/* 봇 */}
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#00ff88,#0088ff)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, color: "#07070f" }}>9</div>
          <div style={{ padding: "12px 14px", borderRadius: "4px 18px 18px 18px", background: "#13132a", border: "1px solid #1e1e38", fontSize: 12, lineHeight: 1.7, flex: 1 }}>
            <p style={{ color: "#ffd700", fontWeight: 700, marginBottom: 6 }}>⚡ NVIDIA (NVDA) 분석</p>
            <p style={{ color: "#00d97e" }}>$139.16 &nbsp;▲+3.25%</p>
            <p style={{ color: "#666688", fontSize: 11 }}>52주 고가 $153.13 · 저가 $78.32</p>
            <p style={{ color: "#c0c0dd", marginTop: 8 }}>AI 반도체 수요 급증으로 데이터센터 매출 전년比 +220%. 블랙웰 GPU 공급 확대 — 단기 모멘텀 강세</p>
            <p style={{ color: "#33334d", fontSize: 11, marginTop: 8 }}>⚠️ 본 정보는 투자 권유가 아닙니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 메인 ─────────────────────────────── */
const C = {
  green: "#00ff88",
  blue: "#0088ff",
  gold: "#ffd700",
  bg: "#07070f",
  surface: "#0c0c1e",
  border: "#1a1a30",
  text: "#e8e8f0",
  muted: "#555577",
  grad: "linear-gradient(135deg,#00ff88 0%,#0088ff 100%)",
  gradGold: "linear-gradient(135deg,#ffd700 0%,#ff8800 100%)",
};

const MAX = 1100;

export default function Home() {
  const [chatId, setChatId] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatId.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setDone(true);
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>

      {/* ① 티커 테이프 */}
      <TickerTape />

      {/* ② 네비게이션 */}
      <nav style={{ borderBottom: `1px solid ${C.border}`, padding: "0 32px" }}>
        <div style={{ maxWidth: MAX, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: C.grad, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: C.bg }}>9</div>
            <span style={{ fontWeight: 900, fontSize: 17, color: C.text }}>구해조</span>
            <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "#0d1f14", color: C.green, border: `1px solid #00ff8825`, fontFamily: "monospace" }}>BETA</span>
          </div>
          <a href="https://t.me/goohaejo_bot" target="_blank" rel="noopener noreferrer"
            style={{ padding: "9px 20px", borderRadius: 10, background: C.grad, color: C.bg, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
            텔레그램 시작 →
          </a>
        </div>
      </nav>

      {/* ③ HERO — 후킹 */}
      <section style={{ padding: "100px 32px 80px", position: "relative", overflow: "hidden" }}>
        {/* 배경 그리드 */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(#10102820 1px,transparent 1px),linear-gradient(90deg,#10102820 1px,transparent 1px)",
          backgroundSize: "56px 56px",
        }} />
        {/* 그린 글로우 */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-60%)", width: 800, height: 600, background: "radial-gradient(ellipse,rgba(0,255,136,0.055) 0%,transparent 65%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: MAX, margin: "0 auto", position: "relative" }}>
          {/* 뱃지 */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 999, background: "rgba(0,255,136,0.07)", border: "1px solid rgba(0,255,136,0.22)", fontSize: 12, color: C.green, fontFamily: "monospace" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, animation: "pulseGlow 2s infinite" }} />
              AI 기반 미국 시장 브리핑 · 매일 08:00 KST
            </div>
          </div>

          {/* 헤드라인 */}
          <h1 className="fade-up" style={{ textAlign: "center", fontSize: "clamp(40px,7vw,78px)", fontWeight: 900, lineHeight: 1.06, letterSpacing: "-2px", marginBottom: 28 }}>
            <span style={{ color: C.text }}>매일 밤 </span>
            <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>미국 증시</span>
            <br />
            <span style={{ color: C.text }}>확인하세요? </span>
            <span style={{ background: C.gradGold, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>이제 그만</span>
          </h1>

          {/* 서브 */}
          <p style={{ textAlign: "center", fontSize: 18, color: C.muted, lineHeight: 1.7, maxWidth: 560, margin: "0 auto 44px" }}>
            AI가 밤새 분석하고, 당신은 아침 8시에 <strong style={{ color: C.text }}>3줄 요약</strong>만 받으면 됩니다.<br />
            텔레그램 구독 한 번으로 끝.
          </p>

          {/* CTA */}
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", marginBottom: 72 }}>
            <a href="https://t.me/goohaejo_bot" target="_blank" rel="noopener noreferrer"
              style={{ padding: "15px 34px", borderRadius: 14, background: C.grad, color: C.bg, fontWeight: 800, fontSize: 16, textDecoration: "none", boxShadow: "0 8px 36px rgba(0,255,136,0.28)", transition: "transform .2s" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
              📱 무료로 시작하기
            </a>
            <a href="#how"
              style={{ padding: "15px 28px", borderRadius: 14, background: "#0f0f20", border: `1px solid ${C.border}`, color: "#9999bb", fontWeight: 700, fontSize: 16, textDecoration: "none" }}>
              이용방법 보기 ↓
            </a>
          </div>

          {/* 터미널 카드 */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <BriefingTerminal />
          </div>
        </div>
      </section>

      {/* ④ PAIN → 공감 */}
      <section style={{ background: "#09091a", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "64px 32px" }}>
        <div style={{ maxWidth: MAX, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 13, fontFamily: "monospace", color: C.muted, marginBottom: 20, letterSpacing: 2 }}>SOUND FAMILIAR?</p>
          <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, color: C.text, marginBottom: 48 }}>
            이런 경험, 있지 않으신가요?
          </h2>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
            {PAIN_POINTS.map((p, i) => (
              <div key={i} style={{ padding: "24px 28px", borderRadius: 14, background: "#0c0c1e", border: `1px solid ${C.border}`, fontSize: 15, color: "#9999bb", display: "flex", alignItems: "center", gap: 12, flex: "1 1 240px", maxWidth: 320 }}>
                <span style={{ fontSize: 28 }}>{p.icon}</span>
                <span>{p.text}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 40, fontSize: 20, fontWeight: 700, color: C.text }}>
            구해조가 <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>대신 해결</span>해드립니다.
          </p>
        </div>
      </section>

      {/* ⑤ FEATURES */}
      <section style={{ padding: "80px 32px" }}>
        <div style={{ maxWidth: MAX, margin: "0 auto" }}>
          <p style={{ fontSize: 12, fontFamily: "monospace", color: C.green, letterSpacing: 3, textAlign: "center", marginBottom: 16 }}>FEATURES</p>
          <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, textAlign: "center", color: C.text, marginBottom: 52 }}>
            스마트한 투자자를 위한<br />
            <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>데이터 브리핑</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 18 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ padding: "28px 24px", borderRadius: 16, background: "#0c0c1e", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑥ STOCK ANALYSIS */}
      <section style={{ background: "#09091a", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "80px 32px" }}>
        <div style={{ maxWidth: MAX, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 60, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            {/* 텍스트 */}
            <div style={{ flex: "1 1 340px", maxWidth: 480 }}>
              <p style={{ fontSize: 12, fontFamily: "monospace", color: "#0088ff", letterSpacing: 3, marginBottom: 16 }}>STOCK ANALYSIS</p>
              <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, color: C.text, lineHeight: 1.15, marginBottom: 20 }}>
                궁금한 종목,<br />
                <span style={{ background: C.gradGold, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>바로 물어보세요</span>
              </h2>
              <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, marginBottom: 28 }}>
                텔레그램 봇에 회사 이름 또는 티커를 입력하면 Claude AI가 즉시 분석합니다. 주가 동향, 섹터 포지션, 투자 포인트까지.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "한국 종목", ex: "삼성전자" },
                  { label: "미국 티커", ex: "NVDA" },
                  { label: "자연어", ex: "테슬라 분석해줘" },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, background: "#0c0c1e", border: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: "#22224a", fontFamily: "monospace" }}>$</span>
                      <span style={{ fontFamily: "monospace", fontSize: 14, color: "#c0c0dd" }}>{r.ex}</span>
                    </div>
                    <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "#12122a", color: C.muted }}>{r.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* 채팅 데모 */}
            <div style={{ flex: "1 1 320px", maxWidth: 440, display: "flex", justifyContent: "center" }}>
              <ChatDemo />
            </div>
          </div>
        </div>
      </section>

      {/* ⑦ HOW TO + 구독 폼 */}
      <section id="how" style={{ padding: "80px 32px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 12, fontFamily: "monospace", color: C.green, letterSpacing: 3, marginBottom: 16 }}>GET STARTED</p>
          <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, color: C.text, marginBottom: 52 }}>
            1분이면 충분합니다
          </h2>

          {/* 스텝 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 52 }}>
            {[
              { n: "01", title: "텔레그램 봇 시작", desc: "@goohaejo_bot 에서 /start 입력", color: C.green },
              { n: "02", title: "Chat ID 확인", desc: "봇이 자동으로 나의 Chat ID를 알려줍니다", color: C.blue },
              { n: "03", title: "구독 신청", desc: "아래 폼에 Chat ID를 입력하면 완료!", color: C.gold },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 24px", borderRadius: 14, background: "#0c0c1e", border: `1px solid ${C.border}`, textAlign: "left" }}>
                <span style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 24, color: s.color, minWidth: 36 }}>{s.n}</span>
                <div>
                  <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>{s.desc}</div>
                </div>
                <span style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
              </div>
            ))}
          </div>

          {/* 구독 폼 */}
          <div style={{ padding: "40px 36px", borderRadius: 20, background: "#0c0c1e", border: "1px solid rgba(0,255,136,0.22)" }}>
            {!done ? (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, animation: "pulseGlow 2s infinite" }} />
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: C.text }}>구독 신청</h3>
                </div>
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>Chat ID를 입력하면 매일 오전 8시 브리핑이 전송됩니다</p>
                <form onSubmit={submit} style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                  <input
                    value={chatId}
                    onChange={e => setChatId(e.target.value)}
                    placeholder="Chat ID 입력 (예: 123456789)"
                    style={{ flex: "1 1 200px", padding: "14px 18px", borderRadius: 12, background: "#08081a", border: `1px solid ${C.border}`, color: C.text, fontSize: 14, fontFamily: "monospace", outline: "none" }}
                  />
                  <button type="submit" disabled={loading}
                    style={{ padding: "14px 28px", borderRadius: 12, background: C.grad, color: C.bg, fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 4px 24px rgba(0,255,136,0.22)" }}>
                    {loading ? "처리 중…" : "구독 시작 →"}
                  </button>
                </form>
                <p style={{ fontSize: 12, color: "#2a2a44", marginTop: 16 }}>
                  Chat ID 모르시면{" "}
                  <a href="https://t.me/goohaejo_bot" target="_blank" rel="noopener noreferrer" style={{ color: "#00ff8870", textDecoration: "underline" }}>@goohaejo_bot</a>
                  {" "}에서 /start 입력 후 확인하세요
                </p>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
                <h3 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8, background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>구독 완료!</h3>
                <p style={{ color: C.muted, marginBottom: 24 }}>내일 오전 8시에 첫 브리핑이 도착합니다</p>
                <a href="https://t.me/goohaejo_bot" target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-block", padding: "13px 30px", borderRadius: 12, background: C.grad, color: C.bg, fontWeight: 800, textDecoration: "none" }}>
                  봇으로 이동 →
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ⑧ 풋터 */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "32px" }}>
        <div style={{ maxWidth: MAX, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: C.grad, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, color: C.bg }}>9</div>
            <span style={{ fontWeight: 900, color: C.text }}>구해조</span>
            <span style={{ fontSize: 12, color: "#22224a" }}>KOI 2026 Spring</span>
          </div>
          <p style={{ fontSize: 12, color: "#22224a", textAlign: "center" }}>본 서비스는 투자 권유가 아닙니다. 투자 판단은 본인 책임입니다.</p>
          <a href="https://t.me/goohaejo_bot" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#22224a", textDecoration: "none" }}>@goohaejo_bot</a>
        </div>
      </footer>

    </div>
  );
}
