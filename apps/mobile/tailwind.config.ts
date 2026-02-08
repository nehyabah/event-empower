import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        wedding: {
          cream: '#F8F5F0',
          gold: '#D4AF37',
          sage: '#C9D4C5',
          blush: '#F7D8D5',
          navy: '#1D3557',
          burgundy: '#8B2635',
        },
        primary: {
          DEFAULT: '#D4AF37',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F8F5F0',
          foreground: '#1D3557',
        },
      },
      fontFamily: {
        serif: ['serif'],
        sans: ['System'],
      },
    },
  },
  plugins: [],
} satisfies Config;
