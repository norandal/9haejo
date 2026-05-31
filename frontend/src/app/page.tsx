"use client";
import { useState, useEffect, useRef } from "react";

const API = "https://outstanding-upliftment-production-5b02.up.railway.app";

const C = {
  bg: "#07070f",
  surface: "#0d0d1a",
  card: "#111120",
  border: "#1a1a2e",
  green: "#00d97e",
  red: "#ff4466",
  blue: "#3b82f6",
  text: "#e8e8f0",
  muted: "#6b6b80",
  grad: "linear-gradient(135deg,#00d97e 0%,#3b82f6 100%)",
};

function useMarketSession() {
  const [session, setSession] = useState({ label: "", color: "#6b6b80", nyTime: "" });
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const ny = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
      const h = ny.getHours(), m = ny.getMinutes(), d = ny.getDay();
      const t = h * 60 + m;
      const nyStr = ny.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "America/New_York" });
      let label = "장 마감", color = "#6b6b80";
      if (d === 0 || d === 6) { label = "주말 휴장"; color = "#6b6b80"; }
      else if (t >= 240 && t < 570) { label = "Pre-Market"; color = "#f59e0b"; }
      else if (t >= 570 && t < 960) { label = "정규장 운영중"; color = "#00d97e"; }
      else if (t >= 960 && t < 1080) { label = "After-Hours"; color = "#3b82f6"; }
      setSession({ label, color, nyTime: nyStr + " ET" });
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);
  return session;
}

function useCountUp(target: number | null, duration = 1200) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (target === null) return;
    const start = Date.now();
    const startVal = 0;
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startVal + (target - startVal) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return display;
}

function StatCard({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div style={{ padding: "20px 24px", borderRadius: 16, background: C.card, border: `1px solid ${C.border}`, textAlign: "center", flex: "1 1 140px" }}>
      <div style={{ fontSize: 28, fontWeight: 900, background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{value}</div>
      <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

function BriefingCard({ text, index }: { text: string; index: number }) {
  const labels = ["시장 요약", "섹터 분석", "주목 종목", "한국 영향", "내일 전망"];
  const colors = [C.green, "#a78bfa", "#f59e0b", "#3b82f6", "#ec4899"];
  return (
    <div style={{ padding: "20px", borderRadius: 14, background: C.card, border: `1px solid ${C.border}`, borderLeft: `3px solid ${colors[index] || C.green}` }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: colors[index] || C.green, marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>
        {labels[index] || `Part ${index + 1}`}
      </div>
      <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{text}</p>
    </div>
  );
}

function FearGauge({ score, label }: { score: number; label: string }) {
  const pct = Math.max(0, Math.min(100, score));
  const angle = -90 + (pct / 100) * 180;
  const r = 54;
  const cx = 70; const cy = 70;
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const needleX = cx + r * Math.cos(rad(angle - 90));
  const needleY = cy + r * Math.sin(rad(angle - 90));
  const zones = [
    { color: "#ff4466", end: 25 },
    { color: "#f59e0b", end: 45 },
    { color: "#6b6b80", end: 55 },
    { color: "#00b88a", end: 75 },
    { color: "#00d97e", end: 100 },
  ];
  const arcPath = (startPct: number, endPct: number) => {
    const startAngle = -180 + (startPct / 100) * 180;
    const endAngle = -180 + (endPct / 100) * 180;
    const x1 = cx + r * Math.cos(rad(startAngle));
    const y1 = cy + r * Math.sin(rad(startAngle));
    const x2 = cx + r * Math.cos(rad(endAngle));
    const y2 = cy + r * Math.sin(rad(endAngle));
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };
  let prev = 0;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={140} height={80} viewBox="0 0 140 80">
        {zones.map((z) => {
          const p = arcPath(prev, z.end);
          prev = z.end;
          return <path key={z.end} d={p} fill="none" stroke={z.color} strokeWidth={10} strokeLinecap="round" opacity={0.25} />;
        })}
        <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#e8e8f0" strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={4} fill="#e8e8f0" />
        <text x={cx} y={cy + 18} textAnchor="middle" fill="#e8e8f0" fontSize="14" fontWeight="900">{score}</text>
      </svg>
      <div style={{ fontSize: 12, color: score >= 75 ? "#00d97e" : score >= 55 ? "#00b88a" : score >= 45 ? "#6b6b80" : score >= 25 ? "#f59e0b" : "#ff4466", fontWeight: 700 }}>{label}</div>
    </div>
  );
}

function IndexTicker({ name, data }: { name: string; data: { price: number; change_pct: number } | null }) {
  if (!data) return null;
  const up = data.change_pct >= 0;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, background: "#08081a", border: "1px solid #1a1a2e" }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#e8e8f0" }}>{name}</span>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#e8e8f0" }}>{data.price.toLocaleString()}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: up ? "#00d97e" : "#ff4466" }}>{up ? "+" : ""}{data.change_pct.toFixed(2)}%</div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ padding: "20px", borderRadius: 14, background: C.card, border: `1px solid ${C.border}` }}>
      <div style={{ height: 12, width: "30%", borderRadius: 6, background: C.border, marginBottom: 12 }} />
      <div style={{ height: 10, width: "100%", borderRadius: 4, background: C.border, marginBottom: 8 }} />
      <div style={{ height: 10, width: "80%", borderRadius: 4, background: C.border }} />
    </div>
  );
}

export default function Home() {
  const [chatId, setChatId] = useState("");
  const [subState, setSubState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [subMsg, setSubMsg] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const toggleTheme = () => {
    setIsDark(p => {
      const next = !p;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };
  const [briefing, setBriefing] = useState<string[]>([]);
  const [briefingLoading, setBriefingLoading] = useState(true);
  const [subCount, setSubCount] = useState<number | null>(null);
  const [news, setNews] = useState<{ title: string; source: string; sentiment: string; url: string }[]>([]);
  const [adminStats, setAdminStats] = useState<{ total_price_alerts?: number; total_watchlist_items?: number } | null>(null);
  const [marketData, setMarketData] = useState<{
    indices: Record<string, { price: number; change_pct: number }>;
    fx: Record<string, { price: number; change_pct: number }>;
    fear_greed: { score: number; label_kr: string };
  } | null>(null);
  const marketRef = useRef<NodeJS.Timeout | null>(null);
  const animatedCount = useCountUp(subCount);
  const marketSession = useMarketSession();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    const saved = localStorage.getItem("theme");
    if (saved === "light") setIsDark(false);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // 브리핑 미리보기
    fetch(`${API}/summary/latest`)
      .then(r => r.json())
      .then(d => {
        if (d.tweets?.length) setBriefing(d.tweets);
      })
      .catch(() => {})
      .finally(() => setBriefingLoading(false));

    // 구독자 수
    fetch(`${API}/subscribers/count`)
      .then(r => r.json())
      .then(d => setSubCount(d.count))
      .catch(() => {});

    // 실시간 시장 데이터 (30초마다 갱신)
    const loadMarket = () => {
      fetch(`${API}/market/live`)
        .then(r => r.json())
        .then(d => setMarketData(d))
        .catch(() => {});
    };
    loadMarket();
    marketRef.current = setInterval(loadMarket, 30000);

    // 관리자 통계
    fetch(`${API}/admin/stats`)
      .then(r => r.json())
      .then(d => setAdminStats(d))
      .catch(() => {});

    // 뉴스
    fetch(`${API}/news/latest`)
      .then(r => r.json())
      .then(d => { if (d.news?.length) setNews(d.news.slice(0, 5)); })
      .catch(() => {});

    return () => { if (marketRef.current) clearInterval(marketRef.current); };
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatId.trim()) return;
    setSubState("loading");
    try {
      const r = await fetch(`${API}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId.trim() }),
      });
      const d = await r.json();
      setSubMsg(d.message || "완료");
      setSubState("done");
      if (d.total_subscribers) setSubCount(d.total_subscribers);
    } catch {
      setSubState("error");
      setSubMsg("오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className={isDark ? "" : "light-mode"} style={{ background: C.bg, minHeight: "100vh", color: C.text }}>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(7,7,15,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: C.grad, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: "#07070f" }}>9</div>
            <span style={{ fontWeight: 800, fontSize: 16 }}>구해조</span>
            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#0a1f14", color: C.green, border: `1px solid ${C.green}30`, fontFamily: "monospace" }}>BETA</span>
            {marketSession.label && (
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: `${marketSession.color}15`, color: marketSession.color, border: `1px solid ${marketSession.color}30`, fontFamily: "monospace" }}>
                {marketSession.label}
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={toggleTheme} style={{ padding: "6px 12px", borderRadius: 8, background: "transparent", border: `1px solid ${C.border}`, color: C.muted, fontSize: 14, cursor: "pointer" }}>
              {isDark ? "☀️" : "🌙"}
            </button>
            <a href="#subscribe" style={{ padding: "8px 18px", borderRadius: 10, background: C.grad, color: "#07070f", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
              무료 구독하기
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "80px 24px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(#1a1a2e15 1px,transparent 1px),linear-gradient(90deg,#1a1a2e15 1px,transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 500, background: "radial-gradient(ellipse,rgba(0,217,126,0.05) 0%,transparent 65%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999, background: "rgba(0,217,126,0.07)", border: `1px solid rgba(0,217,126,0.2)`, fontSize: 12, color: C.green, fontFamily: "monospace" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, display: "inline-block", animation: "pulse 2s infinite" }} />
              매일 08:00 KST · AI 미국 증시 브리핑
            </div>
          </div>

          <h1 style={{ textAlign: "center", fontSize: "clamp(36px,7vw,72px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-2px", marginBottom: 24 }}>
            <span style={{ color: C.text }}>월가의 밤,</span><br />
            <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>당신의 아침에</span>
          </h1>

          <p style={{ textAlign: "center", fontSize: 18, color: C.muted, lineHeight: 1.7, maxWidth: 520, margin: "0 auto 44px" }}>
            미국 증시 마감 후 Claude AI가 분석하고,<br />
            <strong style={{ color: C.text }}>매일 오전 8시</strong> 텔레그램으로 브리핑을 전달합니다.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 60, flexWrap: "wrap" }}>
            <a href="https://t.me/goohaejo_bot" target="_blank" rel="noopener noreferrer"
              style={{ padding: "14px 32px", borderRadius: 12, background: C.grad, color: "#07070f", fontWeight: 800, fontSize: 15, textDecoration: "none", boxShadow: "0 8px 32px rgba(0,217,126,0.25)" }}>
              📱 텔레그램 시작하기
            </a>
            <a href="#subscribe" style={{ padding: "14px 24px", borderRadius: 12, background: C.card, border: `1px solid ${C.border}`, color: C.muted, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
              Chat ID로 구독 ↓
            </a>
          </div>

          {/* 지표 */}
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <StatCard value={subCount !== null ? `${animatedCount}명` : "-"} label="구독자" sub="실시간" />
            <StatCard value={adminStats?.total_watchlist_items != null ? `${adminStats.total_watchlist_items}개` : "200+"} label="관심종목 등록" sub="누적" />
            <StatCard value={adminStats?.total_price_alerts != null ? `${adminStats.total_price_alerts}개` : "0"} label="가격 알림" sub="활성" />
            <StatCard value="08:00" label="발송 시각" sub="KST 매일" />
          </div>
        </div>
      </section>

      {/* LIVE MARKET WIDGET */}
      {marketData && (
        <section style={{ background: C.surface, borderTop: `1px solid ${C.border}`, padding: "40px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, display: "inline-block", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 11, color: C.green, fontFamily: "monospace", letterSpacing: 3 }}>LIVE MARKET</span>
              <span style={{ fontSize: 11, color: C.muted, marginLeft: 4 }}>30초마다 갱신</span>
              {marketSession.nyTime && <span style={{ fontSize: 11, color: marketSession.color, marginLeft: 8, fontFamily: "monospace" }}>{marketSession.nyTime} · {marketSession.label}</span>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 16 }}>
              {/* 지수 */}
              <div style={{ padding: "20px", borderRadius: 16, background: C.card, border: `1px solid ${C.border}` }}>
                <p style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", letterSpacing: 2, marginBottom: 14 }}>US INDICES</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {Object.entries(marketData.indices).map(([name, d]) => (
                    <IndexTicker key={name} name={name} data={d} />
                  ))}
                </div>
              </div>
              {/* 환율 */}
              <div style={{ padding: "20px", borderRadius: 16, background: C.card, border: `1px solid ${C.border}` }}>
                <p style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", letterSpacing: 2, marginBottom: 14 }}>FX RATES</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {Object.entries(marketData.fx).map(([name, d]) => (
                    <IndexTicker key={name} name={name} data={d} />
                  ))}
                </div>
                <div style={{ marginTop: 16, padding: "12px", borderRadius: 10, background: "#08081a", border: "1px solid #1a1a2e" }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>USD/KRW</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: C.text }}>
                    {marketData.fx["USD/KRW"]?.price ? `${Math.round(marketData.fx["USD/KRW"].price).toLocaleString()}원` : "-"}
                  </div>
                </div>
              </div>
              {/* 공포탐욕 */}
              <div style={{ padding: "20px", borderRadius: 16, background: C.card, border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", letterSpacing: 2, marginBottom: 14, alignSelf: "flex-start" }}>FEAR & GREED</p>
                <FearGauge score={marketData.fear_greed.score} label={marketData.fear_greed.label_kr} />
                <p style={{ fontSize: 11, color: C.muted, marginTop: 12, textAlign: "center" }}>CNN Fear & Greed Index</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TODAY'S BRIEFING */}
      <section style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "60px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 11, color: C.green, fontFamily: "monospace", letterSpacing: 3, marginBottom: 8 }}>TODAY'S BRIEFING</p>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: C.text }}>오늘의 AI 브리핑</h2>
            <p style={{ color: C.muted, marginTop: 6, fontSize: 14 }}>매일 아침 8시 전송되는 실제 브리핑 내용입니다</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
            {briefingLoading
              ? [0,1,2,3,4].map(i => <SkeletonCard key={i} />)
              : briefing.length > 0
                ? briefing.map((t, i) => <BriefingCard key={i} text={t} index={i} />)
                : <div style={{ color: C.muted, gridColumn: "1/-1", textAlign: "center", padding: 40 }}>
                    브리핑 데이터를 불러오는 중입니다. 잠시 후 새로고침 해주세요.
                  </div>
            }
          </div>
        </div>
      </section>

      {/* LIVE STOCK DEMO */}
      {marketData && (
        <section style={{ padding: "60px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <p style={{ fontSize: 11, color: C.green, fontFamily: "monospace", letterSpacing: 3, marginBottom: 8, textAlign: "center" }}>STOCK ANALYSIS</p>
            <h2 style={{ fontSize: 28, fontWeight: 900, textAlign: "center", marginBottom: 8, color: C.text }}>텔레그램에서 즉시 조회</h2>
            <p style={{ color: C.muted, textAlign: "center", marginBottom: 36, fontSize: 14 }}>종목명이나 티커를 입력하면 AI 분석 리포트를 즉시 받아보세요</p>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
              {[
                { name: "NVIDIA", ticker: "NVDA", emoji: "🟢", desc: "AI 반도체 1위" },
                { name: "TESLA", ticker: "TSLA", emoji: "⚡", desc: "전기차·AI 로보틱스" },
                { name: "APPLE", ticker: "AAPL", emoji: "🍎", desc: "빅테크 시총 1위" },
              ].map(({ name, ticker, emoji, desc }) => (
                <div key={ticker} style={{ padding: "20px", borderRadius: 16, background: C.card, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ fontSize: 28 }}>{emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, color: C.text, fontSize: 15 }}>{name}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{desc}</div>
                    <div style={{ fontFamily: "monospace", fontSize: 12, color: C.green }}>@goohaejo_bot &gt; <b>{ticker}</b></div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center" }}>
              <a href="https://t.me/goohaejo_bot" target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-block", padding: "12px 28px", borderRadius: 12, background: C.grad, color: "#07070f", fontWeight: 800, fontSize: 14, textDecoration: "none" }}>
                텔레그램에서 직접 해보기 →
              </a>
            </div>
          </div>
        </section>
      )}

      {/* NEWS SECTION */}
      {news.length > 0 && (
        <section style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "60px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <p style={{ fontSize: 11, color: C.green, fontFamily: "monospace", letterSpacing: 3, marginBottom: 8 }}>WALL STREET NEWS</p>
            <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, color: C.text }}>오늘의 월가 뉴스</h2>
            <p style={{ color: C.muted, marginBottom: 28, fontSize: 14 }}>Alpha Vantage 뉴스 감성 분석</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {news.map((n, i) => {
                const sentColor = n.sentiment === "Bullish" || n.sentiment === "Somewhat-Bullish" ? C.green : n.sentiment === "Bearish" || n.sentiment === "Somewhat-Bearish" ? C.red : C.muted;
                const sentLabel = n.sentiment === "Bullish" ? "긍정" : n.sentiment === "Somewhat-Bullish" ? "다소긍정" : n.sentiment === "Bearish" ? "부정" : n.sentiment === "Somewhat-Bearish" ? "다소부정" : "중립";
                return (
                  <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 12, background: C.card, border: `1px solid ${C.border}`, textDecoration: "none" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: `${sentColor}20`, color: sentColor, whiteSpace: "nowrap" }}>{sentLabel}</span>
                    <span style={{ fontSize: 13, color: C.text, flex: 1, fontWeight: 500 }}>{n.title}</span>
                    <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>{n.source}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* FEATURES */}
      <section style={{ padding: "60px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 11, color: C.green, fontFamily: "monospace", letterSpacing: 3, marginBottom: 8, textAlign: "center" }}>FEATURES</p>
          <h2 style={{ fontSize: 28, fontWeight: 900, textAlign: "center", marginBottom: 40, color: C.text }}>한국 투자자를 위한 서비스</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
            {[
              { icon: "🤖", title: "AI 브리핑", desc: "Claude AI가 200개 이상의 데이터 포인트를 분석해 핵심만 전달. 지수·섹터·환율·한국 영향까지.", color: C.green },
              { icon: "🔍", title: "종목 즉시 분석", desc: "텔레그램에 'NVDA' 또는 '삼성전자' 입력 → AI 분석 리포트 즉시 발송. 실시간 데이터 기반.", color: "#a78bfa" },
              { icon: "📋", title: "관심종목 알림", desc: "/watchlist add NVDA 로 추가. 매일 아침 관심종목 현황을 함께 받아보세요.", color: "#f59e0b" },
              { icon: "🌏", title: "한국 투자자 맞춤", desc: "USD/KRW 환율 영향, 삼성·하이닉스·카카오·네이버 등 한국 주식에 미치는 영향 분석.", color: "#3b82f6" },
              { icon: "⚡", title: "빠른 시황", desc: "/시황 커맨드로 현재 주요 지수와 빅테크 현황을 즉시 확인.", color: "#ec4899" },
              { icon: "📊", title: "섹터 분석", desc: "/sector 반도체 처럼 섹터별 흐름을 한국어로 쉽게 받아보세요.", color: "#06b6d4" },
            ].map((f, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div style={{ padding: "24px", borderRadius: 16, background: C.card, border: `1px solid ${C.border}`, borderTop: `2px solid ${f.color}30` }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* HOW TO */}
      <section style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "60px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: C.green, fontFamily: "monospace", letterSpacing: 3, marginBottom: 8 }}>HOW TO START</p>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 40, color: C.text }}>30초면 시작합니다</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { n: "01", title: "텔레그램 열기", desc: "@goohaejo_bot 검색 후 /start 입력", color: C.green },
              { n: "02", title: "/구독 입력", desc: "구독 커맨드 입력 → 즉시 완료. 또는 아래 Chat ID 폼 사용", color: "#a78bfa" },
              { n: "03", title: "내일 8시 확인", desc: "다음 날 오전 8시에 첫 브리핑이 도착합니다", color: "#f59e0b" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 24px", borderRadius: 14, background: C.card, border: `1px solid ${C.border}`, textAlign: "left" }}>
                <span style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 22, color: s.color, minWidth: 32 }}>{s.n}</span>
                <div>
                  <div style={{ fontWeight: 700, color: C.text, marginBottom: 3 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUBSCRIBE FORM */}
      <section id="subscribe" style={{ padding: "60px 24px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <p style={{ fontSize: 11, color: C.green, fontFamily: "monospace", letterSpacing: 3, marginBottom: 8, textAlign: "center" }}>SUBSCRIBE</p>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, textAlign: "center", color: C.text }}>지금 구독하기</h2>
          <p style={{ color: C.muted, textAlign: "center", marginBottom: 36, fontSize: 14 }}>
            텔레그램 Chat ID를 입력하면 매일 8시에 브리핑이 전송됩니다
          </p>

          <div style={{ padding: "36px", borderRadius: 20, background: C.card, border: `1px solid rgba(0,217,126,0.2)` }}>
            {subState === "done" ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h3 style={{ fontSize: 22, fontWeight: 900, color: C.green, marginBottom: 8 }}>구독 완료!</h3>
                <p style={{ color: C.muted }}>{subMsg}</p>
                <a href="https://t.me/goohaejo_bot" target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-block", marginTop: 20, padding: "12px 28px", borderRadius: 12, background: C.grad, color: "#07070f", fontWeight: 800, textDecoration: "none" }}>
                  텔레그램 열기 →
                </a>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubscribe} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <input
                    value={chatId}
                    onChange={e => setChatId(e.target.value)}
                    placeholder="Chat ID 입력 (예: 123456789)"
                    style={{ flex: "1 1 180px", padding: "13px 16px", borderRadius: 10, background: "#08081a", border: `1px solid ${C.border}`, color: C.text, fontSize: 14, fontFamily: "monospace", outline: "none" }}
                  />
                  <button type="submit" disabled={subState === "loading"}
                    style={{ padding: "13px 24px", borderRadius: 10, background: C.grad, color: "#07070f", fontWeight: 800, border: "none", cursor: "pointer", fontSize: 14, whiteSpace: "nowrap", opacity: subState === "loading" ? 0.7 : 1 }}>
                    {subState === "loading" ? "처리 중..." : "구독하기 →"}
                  </button>
                </form>
                {subState === "error" && (
                  <p style={{ color: C.red, fontSize: 13, marginTop: 8 }}>{subMsg}</p>
                )}
                <p style={{ fontSize: 12, color: "#2a2a44", marginTop: 14 }}>
                  Chat ID 모르시면{" "}
                  <a href="https://t.me/goohaejo_bot" target="_blank" rel="noopener noreferrer" style={{ color: `${C.green}80`, textDecoration: "underline" }}>@goohaejo_bot</a>
                  {" "}에서 /start 입력 후 확인하세요
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "40px 24px 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 24, marginBottom: 28 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: C.grad, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: "#07070f" }}>9</div>
                <span style={{ fontWeight: 800, fontSize: 16, color: C.text }}>구해조</span>
              </div>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, maxWidth: 260 }}>
                미국 증시 AI 브리핑 서비스.<br />
                Claude AI 기반, 매일 오전 8시 KST.
              </p>
            </div>
            <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>서비스</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <a href="https://t.me/goohaejo_bot" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>텔레그램 봇</a>
                  <a href="#subscribe" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>구독하기</a>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>기술 스택</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {["FastAPI · Railway", "Next.js · Vercel", "Claude AI · yfinance"].map(t => (
                    <span key={t} style={{ fontSize: 13, color: C.muted }}>{t}</span>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>링크</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <a href="https://github.com/norandal/9haejo" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>GitHub</a>
                  <a href="https://t.me/goohaejo_bot" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>@goohaejo_bot</a>
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <p style={{ fontSize: 11, color: "#22224a" }}>© 2026 구해조. KOI Spring.</p>
            <p style={{ fontSize: 11, color: "#22224a" }}>본 서비스는 투자 권유가 아닙니다. 투자 판단은 본인 책임입니다.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 6px #00d97e} 50%{opacity:.4;box-shadow:none} }
        .light-mode { filter: invert(1) hue-rotate(180deg); }
        .light-mode img, .light-mode video, .light-mode svg { filter: invert(1) hue-rotate(180deg); }
      `}</style>
    </div>
  );
}
