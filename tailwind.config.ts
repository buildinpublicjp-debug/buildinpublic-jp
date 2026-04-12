import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // 断面図ビュー カラーパレット
        night: {
          900: '#050508',
          800: '#0A0A14',
          700: '#12121F',
          600: '#1A1A2E',
          500: '#2A1F3D',
        },
        // エリアカラー
        shibuya: { base: '#8B6F9E', accent: '#FF3366', glow: '#FF69B4' },
        shinjuku: { base: '#4A3560', accent: '#FFD700', glow: '#FF8C42' },
        roppongi: { base: '#4A5568', accent: '#A0D2DB', glow: '#00BFFF' },
        // 感情フェーズカラー
        phase: {
          curious: '#87CEEB',    // 好奇心 — 水色
          flirty: '#FF69B4',     // いちゃつき — ピンク
          tension: '#FF4444',    // 緊張 — 赤
          intimate: '#FF1493',   // 親密 — ディープピンク
          afterglow: '#DDA0DD',  // 余韻 — プラム
        },
        // UI
        warm: { light: '#FFE4A0', DEFAULT: '#FFD700', dim: '#FF8C42' },
      },
      animation: {
        'dissolve-in': 'dissolveIn 0.6s ease-out forwards',
        'dissolve-out': 'dissolveOut 0.4s ease-in forwards',
        'aura-pulse': 'auraPulse 3s ease-in-out infinite',
        'hotflush': 'hotflush 2s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'neon-flicker': 'neonFlicker 2s ease-in-out infinite',
        'lantern-sway': 'lanternSway 3s ease-in-out infinite',
      },
      keyframes: {
        dissolveIn: {
          '0%': { opacity: '0', filter: 'blur(8px)' },
          '100%': { opacity: '1', filter: 'blur(0px)' },
        },
        dissolveOut: {
          '0%': { opacity: '1', filter: 'blur(0px)' },
          '100%': { opacity: '0', filter: 'blur(8px)' },
        },
        auraPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.4' },
          '50%': { transform: 'scale(1.15)', opacity: '0.7' },
        },
        hotflush: {
          '0%, 100%': { filter: 'saturate(1) brightness(1)' },
          '50%': { filter: 'saturate(1.4) brightness(1.1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        neonFlicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
          '52%': { opacity: '1' },
          '54%': { opacity: '0.8' },
        },
        lanternSway: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
