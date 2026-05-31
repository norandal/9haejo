"use client";
import { useState, useEffect } from "react";

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

function StatCard({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div style={{ padding: "20px 24px", borderRadius: 16, background: C.card, border: `1px solid ${C.border}`, textAlign: "center", flex: "1 1 140px" }}>
      <div style={{ fontSize: 28, fontWeight: 900, background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{value}</div>
      <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>}
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
  const [briefing, setBriefing] = useState<string[]>([]);
  const [briefingLoading, setBriefingLoading] = useState(true);
  const [subCount, setSubCount] = useState<number | null>(null);

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
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(7,7,15,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: C.grad, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: "#07070f" }}>9</div>
            <span style={{ fontWeight: 800, fontSize: 16 }}>구해조</span>
            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#0a1f14", color: C.green, border: `1px solid ${C.green}30`, fontFamily: "monospace" }}>BETA</span>
          </div>
          <a href="#subscribe" style={{ padding: "8px 18px", borderRadius: 10, background: C.grad, color: "#07070f", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
            무료 구독하기
          </a>
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
            <StatCard value={subCount !== null ? `${subCount}명` : "-"} label="구독자" sub="실시간" />
            <StatCard value="200+" label="분석 데이터" sub="매일 수집" />
            <StatCard value="08:00" label="발송 시각" sub="KST 매일" />
            <StatCard value="무료" label="요금" sub="완전 무료" />
          </div>
        </div>
      </section>

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
              <div key={i} style={{ padding: "24px", borderRadius: 16, background: C.card, border: `1px solid ${C.border}`, borderTop: `2px solid ${f.color}30` }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
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
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "32px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: C.grad, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, color: "#07070f" }}>9</div>
            <span style={{ fontWeight: 800 }}>구해조</span>
            <span style={{ fontSize: 12, color: "#22224a" }}>KOI 2026 Spring</span>
          </div>
          <p style={{ fontSize: 12, color: "#22224a", textAlign: "center" }}>
            본 서비스는 투자 권유가 아닙니다. 투자 판단은 본인 책임입니다.
          </p>
          <a href="https://t.me/goohaejo_bot" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#22224a", textDecoration: "none" }}>@goohaejo_bot</a>
        </div>
      </footer>

      <style>{`@keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 6px #00d97e} 50%{opacity:.4;box-shadow:none} }`}</style>
    </div>
  );
}
