// v2 - ガチャガチャマシン
// コメント = コインを入れて回す → 次のバージョンが生まれる

'use client'
import { useState, useEffect } from 'react'

const CAPSULE_COLORS = [
  '#FF6B6B', '#FECA57', '#48DBFB', '#FF9FF3', '#54A0FF',
  '#5F27CD', '#01A3A4', '#F368E0', '#FF6348', '#7BED9F',
]

function FloatingCapsule({ color, delay, left, size }: { color: string; delay: number; left: number; size: number }) {
  return (
    <div
      className="absolute rounded-full opacity-40 pointer-events-none"
      style={{
        backgroundColor: color,
        width: size,
        height: size * 1.3,
        left: `${left}%`,
        bottom: -40,
        animation: `floatUp ${8 + delay}s ease-in infinite`,
        animationDelay: `${delay}s`,
        borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
      }}
    />
  )
}

export default function Home() {
  const [sent, setSent] = useState(false)
  const [text, setText] = useState('')
  const [isSpinning, setIsSpinning] = useState(false)
  const [capsuleOut, setCapsuleOut] = useState(false)
  const [bouncePhase, setBouncePhase] = useState(0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || isSpinning) return
    setIsSpinning(true)

    await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment: text.trim() }),
    })

    setTimeout(() => {
      setCapsuleOut(true)
      setBouncePhase(1)
      setTimeout(() => setBouncePhase(2), 300)
      setTimeout(() => setBouncePhase(3), 600)
      setTimeout(() => {
        setIsSpinning(false)
        setSent(true)
        setText('')
        setCapsuleOut(false)
        setBouncePhase(0)
      }, 1500)
    }, 1200)
  }

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const floatingCapsules = Array.from({ length: 12 }, (_, i) => ({
    color: CAPSULE_COLORS[i % CAPSULE_COLORS.length],
    delay: i * 1.5,
    left: (i * 8.3) % 100,
    size: 14 + (i % 4) * 6,
  }))

  return (
    <main className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #FFF5E4 0%, #FFE3E3 40%, #FFD1DC 100%)',
    }}>
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
          50% { opacity: 0.6; }
          100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes handleTurn {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(180deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes capsuleDrop {
          0% { transform: translateY(-20px) scale(0); opacity: 0; }
          30% { transform: translateY(10px) scale(1.2); opacity: 1; }
          50% { transform: translateY(-5px) scale(0.95); }
          70% { transform: translateY(5px) scale(1.05); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes machineShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px) rotate(-0.5deg); }
          75% { transform: translateX(3px) rotate(0.5deg); }
        }
        @keyframes fadeInUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes sparkle {
          0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1) rotate(180deg); opacity: 1; }
        }
        @keyframes gentleBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      {/* Floating capsules background */}
      {mounted && floatingCapsules.map((c, i) => (
        <FloatingCapsule key={i} {...c} />
      ))}

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Title */}
        <div
          className="text-center mb-6"
          style={{ animation: mounted ? 'fadeInUp 0.8s ease-out' : 'none' }}
        >
          <p className="text-xs tracking-[0.3em] mb-1" style={{ color: '#C084A0' }}>
            buildinpublic.jp
          </p>
          <h1 className="text-2xl font-black" style={{
            color: '#6B3A5B',
            letterSpacing: '0.05em',
          }}>
            ガチャガチャ
          </h1>
          <p className="text-xs mt-1" style={{ color: '#B07A94' }}>
            きみの一言がサイトの未来を変える
          </p>
        </div>

        {/* Gacha Machine */}
        <div
          className="relative"
          style={{
            width: 260,
            animation: isSpinning ? 'machineShake 0.15s ease-in-out infinite' : 'none',
          }}
        >
          {/* Machine top dome (capsule window) */}
          <div className="relative mx-auto" style={{
            width: 220,
            height: 200,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,220,230,0.8) 100%)',
            borderRadius: '110px 110px 20px 20px',
            border: '4px solid #E8A0B8',
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(200,100,140,0.2), inset 0 -20px 40px rgba(255,180,200,0.3)',
          }}>
            {/* Capsules inside machine */}
            {CAPSULE_COLORS.map((color, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 28 + (i % 3) * 8,
                  height: (28 + (i % 3) * 8) * 1.2,
                  backgroundColor: color,
                  left: 15 + (i * 19) % 170,
                  top: 30 + (i * 23) % 130,
                  borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                  opacity: 0.85,
                  boxShadow: `inset -3px -3px 6px rgba(0,0,0,0.15), inset 3px 3px 6px rgba(255,255,255,0.4)`,
                  animation: `gentleBob ${2 + i * 0.3}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}

            {/* Glass reflection */}
            <div className="absolute top-4 left-6 w-16 h-24 rounded-full opacity-20"
              style={{ background: 'linear-gradient(135deg, white 0%, transparent 100%)' }}
            />
          </div>

          {/* Machine body */}
          <div className="relative mx-auto" style={{
            width: 240,
            marginTop: -4,
            background: 'linear-gradient(180deg, #FF8FAB 0%, #E85D8A 100%)',
            borderRadius: '8px 8px 16px 16px',
            padding: '16px 20px 20px',
            boxShadow: '0 8px 32px rgba(200,60,100,0.3)',
          }}>
            {/* Label plate */}
            <div className="text-center py-1 px-3 mx-auto mb-3 rounded-md" style={{
              background: 'linear-gradient(180deg, #FFF5C0 0%, #FFE066 100%)',
              border: '2px solid #E8C030',
              maxWidth: 160,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>
              <p className="text-xs font-bold" style={{ color: '#8B6914' }}>
                1回 = あなたの一言
              </p>
            </div>

            {/* Handle area */}
            <div className="flex items-center justify-center gap-3">
              {/* Coin slot (textarea) — hidden visually, the form is below */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: isSpinning
                    ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                    : 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)',
                  border: '3px solid #606060',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.3)',
                  animation: isSpinning ? 'handleTurn 0.6s ease-in-out infinite' : 'none',
                }}
              >
                <div className="w-2 h-6 rounded-sm" style={{ backgroundColor: '#404040' }} />
              </div>
            </div>

            {/* Capsule outlet */}
            <div className="mx-auto mt-3 flex items-end justify-center" style={{
              width: 80,
              height: 50,
              background: '#1a1a2e',
              borderRadius: '4px 4px 40px 40px',
              border: '3px solid #404060',
              overflow: 'visible',
              position: 'relative',
            }}>
              {capsuleOut && (
                <div
                  className="absolute rounded-full"
                  style={{
                    width: 40,
                    height: 48,
                    background: `linear-gradient(180deg, ${CAPSULE_COLORS[Math.floor(Math.random() * CAPSULE_COLORS.length)]} 50%, rgba(255,255,255,0.3) 50%)`,
                    borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                    bottom: -10,
                    left: '50%',
                    marginLeft: -20,
                    animation: 'capsuleDrop 0.8s ease-out forwards',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.1), inset 2px 2px 4px rgba(255,255,255,0.3)',
                  }}
                />
              )}
            </div>
          </div>

          {/* Machine legs */}
          <div className="flex justify-between px-12 -mt-1">
            <div style={{ width: 12, height: 16, background: '#808080', borderRadius: '0 0 4px 4px' }} />
            <div style={{ width: 12, height: 16, background: '#808080', borderRadius: '0 0 4px 4px' }} />
          </div>
        </div>

        {/* Sparkles when capsule comes out */}
        {capsuleOut && [0, 1, 2, 3, 4, 5].map(i => (
          <div
            key={`sparkle-${i}`}
            className="absolute pointer-events-none"
            style={{
              left: `${40 + Math.cos(i * 1.05) * 20}%`,
              top: `${55 + Math.sin(i * 1.05) * 10}%`,
              width: 12,
              height: 12,
              background: CAPSULE_COLORS[i],
              borderRadius: '2px',
              animation: `sparkle 0.6s ease-out ${i * 0.1}s forwards`,
              transform: 'rotate(45deg)',
            }}
          />
        ))}

        {/* Input area */}
        <div
          className="w-full max-w-xs mt-6"
          style={{ animation: mounted ? 'fadeInUp 0.8s ease-out 0.3s both' : 'none' }}
        >
          {sent ? (
            <div className="text-center space-y-3">
              <div className="text-4xl" style={{ animation: 'gentleBob 1s ease-in-out infinite' }}>🎉</div>
              <p className="font-bold text-base" style={{ color: '#6B3A5B' }}>
                ガチャ完了！
              </p>
              <p className="text-xs" style={{ color: '#B07A94' }}>
                きみの一言はAIに届いた。次の進化をお楽しみに。
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-2 px-5 py-2 rounded-full text-xs font-bold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #FF8FAB 0%, #FF6B8A 100%)',
                  color: 'white',
                  boxShadow: '0 3px 12px rgba(255,100,140,0.4)',
                }}
              >
                もう1回まわす
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="サイトの未来に一言..."
                  rows={3}
                  className="w-full rounded-2xl p-3 text-sm resize-none focus:outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.85)',
                    border: '3px solid #FFB8CC',
                    color: '#5A2D45',
                    boxShadow: '0 4px 16px rgba(255,150,180,0.2)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#FF6B8A'
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,100,140,0.3)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#FFB8CC'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,150,180,0.2)'
                  }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSpinning}
                className="w-full py-3 rounded-full font-bold text-sm transition-all active:scale-95"
                style={{
                  background: isSpinning
                    ? 'linear-gradient(135deg, #CCC 0%, #AAA 100%)'
                    : 'linear-gradient(135deg, #FF6B8A 0%, #FF4571 100%)',
                  color: 'white',
                  boxShadow: isSpinning
                    ? 'none'
                    : '0 4px 16px rgba(255,70,110,0.4)',
                  letterSpacing: '0.1em',
                }}
              >
                {isSpinning ? 'ガチャガチャ...' : 'まわす！'}
              </button>
            </form>
          )}
        </div>

        {/* Version link */}
        <div
          className="mt-8"
          style={{ animation: mounted ? 'fadeInUp 0.8s ease-out 0.5s both' : 'none' }}
        >
          <a
            href="/versions"
            className="text-xs transition-colors"
            style={{ color: '#C084A0' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#8B3A6B'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#C084A0'}
          >
            これまでの進化 →
          </a>
        </div>
      </div>
    </main>
  )
}
