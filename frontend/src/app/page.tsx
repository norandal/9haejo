"use client";

import { useState } from "react";

const TICKER_DATA = [
  { symbol: "S&P500", value: "5,912.17", change: "+0.40%", up: true },
  { symbol: "NASDAQ", value: "19,175.87", change: "+0.39%", up: true },
  { symbol: "DOW", value: "42,215.73", change: "+0.28%", up: true },
  { symbol: "NVDA", value: "$139.16", change: "+3.25%", up: true },
  { symbol: "AAPL", value: "$199.16", change: "-0.23%", up: false },
  { symbol: "TSLA", value: "$358.43", change: "+0.43%", up: true },
  { symbol: "USD/KRW", value: "1,373.6", change: "-0.09%", up: false },
  { symbol: "VIX", value: "19.18", change: "-0.67%", up: false },
  { symbol: "반도체", value: "SOXX", change: "+0.41%", up: true },
  { symbol: "에너지", value: "XLE", change: "+0.75%", up: true },
];

const FEATURES = [
  {
    icon: "📊",
    title: "매일 아침 8시 브리핑",
    desc: "미국 장 마감 후 핵심만 추려 전달. 복잡한 차트 대신 AI가 정리한 3줄 요약.",
  },
  {
    icon: "🌐",
    title: "섹터별 등락 분석",
    desc: "반도체·IT·에너지 등 6개 섹터 흐름과 한국 주식에 미치는 영향까지 분석.",
  },
  {
    icon: "💱",
    title: "환율 & 한국 영향",
    desc: "달러/원 환율 변동과 코스피 예상 흐름. 외국인 수급까지 한눈에.",
  },
  {
    icon: "🔍",
    title: "종목 즉시 분석",
    desc: "텔레그램에 '삼성전자' 또는 'NVDA' 입력하면 실시간 분석 리포트 즉시 발송.",
  },
];

const STEPS = [
  { num: "01", title: "텔레그램 봇 시작", desc: "@goohaejo_bot 에서 /start 입력" },
  { num: "02", title: "Chat ID 확인", desc: "봇이 자동으로 ID를 알려줍니다" },
  { num: "03", title: "구독 신청", desc: "아래 폼에 Chat ID 입력 후 완료" },
];

export default function Home() {
  const [chatId, setChatId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatId.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>

      {/* 실시간 티커 */}
      <div className="border-b overflow-hidden" style={{ borderColor: "#1e1e2e", background: "#0d0d15" }}>
        <div className="flex animate-ticker whitespace-nowrap py-2">
          {[...TICKER_DATA, ...TICKER_DATA].map((item, i) => (
            <span key={i} className="flex items-center gap-2 px-6 text-sm">
              <span style={{ color: "#6b6b80" }}>{item.symbol}</span>
              <span style={{ color: "#e8e8f0" }} className="font-mono">{item.value}</span>
              <span style={{ color: item.up ? "#00ff88" : "#ff4466" }} className="font-mono font-bold">
                {item.change}
              </span>
              <span style={{ color: "#1e1e2e" }} className="ml-4">|</span>
            </span>
          ))}
        </div>
      </div>

      {/* 헤더 */}
      <header className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: "#1e1e2e" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: "linear-gradient(135deg, #00ff88, #0088ff)" }}>
            9
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ color: "#e8e8f0" }}>구해조</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: "#1e1e2e", color: "#00ff88" }}>BETA</span>
        </div>
        <a
          href="https://t.me/goohaejo_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-sm px-5 py-2 rounded-full"
        >
          지금 시작하기 →
        </a>
      </header>

      {/* 히어로 */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 overflow-hidden">

        {/* 배경 글로우 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #00ff88 0%, transparent 70%)" }} />
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full opacity-5"
            style={{ background: "radial-gradient(circle, #0088ff 0%, transparent 70%)" }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-8 font-mono"
            style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", color: "#00ff88" }}>
            <span className="w-2 h-2 rounded-full animate-pulse-glow" style={{ background: "#00ff88" }} />
            매일 오전 8시 • AI 시장 브리핑
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-none">
            <span style={{ color: "#e8e8f0" }}>월가의 밤을</span><br />
            <span className="gradient-text">아침에 받아보세요</span>
          </h1>

          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed" style={{ color: "#6b6b80" }}>
            미국 증시 마감 데이터를 AI가 분석해 한국 투자자 맞춤 브리핑으로 전달합니다.
            <br />섹터별 등락, 대형주 동향, 환율까지 — 텔레그램 하나로.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://t.me/goohaejo_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-8 py-4 rounded-2xl text-lg inline-flex items-center gap-2"
            >
              <span>📱</span> 텔레그램으로 구독
            </a>
            <a href="#how"
              className="px-8 py-4 rounded-2xl text-lg inline-flex items-center gap-2 transition-all hover:-translate-y-1"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#e8e8f0" }}>
              <span>↓</span> 이용 방법 보기
            </a>
          </div>
        </div>

        {/* 미리보기 카드 */}
        <div className="relative z-10 mt-20 w-full max-w-lg mx-auto animate-float">
          <div className="glass-card rounded-3xl p-6 text-left"
            style={{ border: "1px solid rgba(0,255,136,0.15)" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: "#1e1e2e" }}>🤖</div>
              <div>
                <div className="font-bold text-sm" style={{ color: "#e8e8f0" }}>구해조 브리핑</div>
                <div className="text-xs" style={{ color: "#6b6b80" }}>오늘 08:00</div>
              </div>
              <div className="ml-auto text-xs px-2 py-1 rounded-full" style={{ background: "rgba(0,255,136,0.1)", color: "#00ff88" }}>LIVE</div>
            </div>
            <div className="space-y-2 text-sm" style={{ color: "#e8e8f0" }}>
              <p>🇺🇸 <strong>미국증시 마감 브리핑</strong></p>
              <p>📈 S&P500 <span style={{ color: "#00ff88" }}>▲0.40%</span> &nbsp; 나스닥 <span style={{ color: "#00ff88" }}>▲0.39%</span></p>
              <p>💾 반도체 <span style={{ color: "#00ff88" }}>▲0.41%</span> &nbsp; ⛽ 에너지 <span style={{ color: "#00ff88" }}>▲0.75%</span></p>
              <p>🚀 엔비디아 <span style={{ color: "#00ff88" }}>▲3.25%</span> ($139.16)</p>
              <p>💵 달러/원 <span style={{ color: "#ff4466" }}>1,373.6원</span></p>
              <div className="mt-3 pt-3 border-t" style={{ borderColor: "#1e1e2e" }}>
                <p style={{ color: "#00ff88" }}>💡 반도체 강세 → 삼성·하이닉스 상승 출발 기대</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 기능 */}
      <section className="px-6 py-24" style={{ background: "#0d0d15" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              <span className="gradient-text">스마트한 투자자</span>를 위한 브리핑
            </h2>
            <p style={{ color: "#6b6b80" }}>복잡한 시장 데이터, AI가 핵심만 골라 전달합니다</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 flex gap-4">
                <div className="text-3xl flex-shrink-0">{f.icon}</div>
                <div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: "#e8e8f0" }}>{f.title}</h3>
                  <p style={{ color: "#6b6b80" }} className="leading-relaxed text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 종목 검색 미리보기 */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-xs font-mono mb-4 px-3 py-1 rounded-full inline-block" style={{ background: "rgba(0,136,255,0.1)", color: "#0088ff", border: "1px solid rgba(0,136,255,0.2)" }}>
                NEW FEATURE
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight" style={{ color: "#e8e8f0" }}>
                궁금한 종목, <br /><span className="gradient-text-gold">바로 물어보세요</span>
              </h2>
              <p className="leading-relaxed mb-6" style={{ color: "#6b6b80" }}>
                텔레그램 봇에 회사 이름이나 티커를 입력하면 AI가 즉시 분석합니다. 주가 동향, 최근 뉴스, 섹터 포지션까지.
              </p>
              <div className="space-y-3">
                {['"삼성전자 분석해줘"', '"NVDA"', '"테슬라 최근 소식"'].map((ex, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm px-4 py-3 rounded-xl" style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.1)" }}>
                    <span style={{ color: "#ffd700" }}>💬</span>
                    <span style={{ color: "#e8e8f0" }}>{ex}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 채팅 미리보기 */}
            <div className="glass-card rounded-3xl p-5" style={{ border: "1px solid rgba(255,215,0,0.15)" }}>
              <div className="space-y-4 text-sm">
                <div className="flex justify-end">
                  <div className="px-4 py-2 rounded-2xl rounded-tr-sm max-w-xs" style={{ background: "#0088ff", color: "#fff" }}>
                    NVDA 분석해줘
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm" style={{ background: "#1e1e2e" }}>🤖</div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex-1" style={{ background: "#1e1e2e", color: "#e8e8f0" }}>
                    <p className="font-bold mb-2" style={{ color: "#ffd700" }}>⚡ NVIDIA (NVDA) 분석</p>
                    <p>현재가 <span style={{ color: "#00ff88" }}>$139.16 (+3.25%)</span></p>
                    <p className="mt-1" style={{ color: "#6b6b80" }}>52주 고가: $153.13</p>
                    <p className="mt-2">AI 반도체 수요 급증으로 데이터센터 매출 전년比 +220%. 블랙웰 GPU 공급 확대 예정.</p>
                    <p className="mt-2" style={{ color: "#00ff88" }}>💡 단기 모멘텀 강세, AI 사이클 핵심주</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 이용 방법 */}
      <section id="how" className="px-6 py-24" style={{ background: "#0d0d15" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: "#e8e8f0" }}>
            3단계로 <span className="gradient-text">시작하기</span>
          </h2>
          <p className="mb-16" style={{ color: "#6b6b80" }}>1분이면 충분합니다</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {STEPS.map((s, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 text-left">
                <div className="font-black text-4xl mb-4 gradient-text font-mono">{s.num}</div>
                <h3 className="font-bold mb-2" style={{ color: "#e8e8f0" }}>{s.title}</h3>
                <p className="text-sm" style={{ color: "#6b6b80" }}>{s.desc}</p>
              </div>
            ))}
          </div>

          {/* 구독 폼 */}
          <div className="glass-card rounded-3xl p-8" style={{ border: "1px solid rgba(0,255,136,0.15)" }}>
            {!submitted ? (
              <>
                <h3 className="text-2xl font-black mb-2" style={{ color: "#e8e8f0" }}>지금 구독 신청</h3>
                <p className="text-sm mb-6" style={{ color: "#6b6b80" }}>
                  텔레그램 Chat ID를 입력하면 매일 오전 8시에 브리핑이 전송됩니다
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    placeholder="텔레그램 Chat ID (예: 123456789)"
                    className="input-field flex-1 px-5 py-4 rounded-2xl text-sm"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary px-8 py-4 rounded-2xl whitespace-nowrap"
                  >
                    {loading ? "처리 중..." : "구독 시작 →"}
                  </button>
                </form>
                <p className="text-xs mt-4" style={{ color: "#6b6b80" }}>
                  Chat ID를 모르시면{" "}
                  <a href="https://t.me/goohaejo_bot" target="_blank" className="underline" style={{ color: "#00ff88" }}>
                    @goohaejo_bot
                  </a>
                  에서 /start 입력 후 확인하세요
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-black mb-2 gradient-text">구독 완료!</h3>
                <p style={{ color: "#6b6b80" }}>내일 오전 8시에 첫 브리핑이 도착합니다</p>
                <a
                  href="https://t.me/goohaejo_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-block mt-6 px-8 py-3 rounded-2xl"
                >
                  봇으로 이동 →
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="px-6 py-10 border-t text-center" style={{ borderColor: "#1e1e2e" }}>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-sm font-bold" style={{ background: "linear-gradient(135deg, #00ff88, #0088ff)" }}>9</div>
          <span className="font-bold" style={{ color: "#e8e8f0" }}>구해조</span>
        </div>
        <p className="text-sm" style={{ color: "#6b6b80" }}>
          KOI 2026 Spring · AI 기반 시장 요약 서비스
        </p>
        <p className="text-xs mt-2" style={{ color: "#3a3a4a" }}>
          본 서비스는 투자 권유가 아닙니다. 투자 판단은 본인 책임입니다.
        </p>
      </footer>

    </div>
  );
}
