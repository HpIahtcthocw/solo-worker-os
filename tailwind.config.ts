import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        accent: '#fbbf24',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '0.9' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        'cursor-blink': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
      },
      animation: {
        'fade-up':      'fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-down':   'slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in':     'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        'float':        'float 4s ease-in-out infinite',
        'shimmer':      'shimmer 2s linear infinite',
        'spin-slow':    'spin-slow 2s linear infinite',
        'glow-pulse':   'glow-pulse 2.5s ease-in-out infinite',
        'pulse-soft':   'pulse-soft 2s ease-in-out infinite',
        'cursor-blink': 'cursor-blink 1s step-end infinite',
      },
      transitionTimingFunction: {
        'expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      boxShadow: {
        'glow-amber':   '0 0 24px rgba(251,191,36,0.25)',
        'glow-teal':    '0 0 24px rgba(45,212,191,0.2)',
        'glow-violet':  '0 0 24px rgba(167,139,250,0.2)',
        'glow-emerald': '0 0 24px rgba(52,211,153,0.2)',
        'glow-coral':   '0 0 24px rgba(248,113,113,0.2)',
        'inner-top':    'inset 0 1px 0 rgba(255,255,255,0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
