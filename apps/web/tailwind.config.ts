
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
        wedding: {
          cream: '#F8F5F0',
          gold: '#D4AF37',
          sage: '#C9D4C5',
          blush: '#F7D8D5',
          navy: '#1D3557',
          burgundy: '#8B2635',
        }
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        /* Scroll-reveal vocabulary. Each theme picks one, so motion is part
           of a template's identity rather than the same fade everywhere. */
        'reveal-rise': {
          '0%': { opacity: '0', transform: 'translateY(34px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'reveal-drift': {
          '0%': { opacity: '0', transform: 'translateY(64px) scale(0.985)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        },
        /* Editorial wipe: the content is uncovered rather than faded in. */
        'reveal-wipe': {
          '0%': { opacity: '1', clipPath: 'inset(100% 0 0 0)' },
          '100%': { opacity: '1', clipPath: 'inset(0 0 0 0)' }
        },
        'reveal-unmask': {
          '0%': { opacity: '1', clipPath: 'inset(0 100% 0 0)' },
          '100%': { opacity: '1', clipPath: 'inset(0 0 0 0)' }
        },
        'reveal-settle': {
          '0%': { opacity: '0', transform: 'translateY(28px) rotate(-1.2deg)' },
          '60%': { opacity: '1', transform: 'translateY(-4px) rotate(0.3deg)' },
          '100%': { opacity: '1', transform: 'translateY(0) rotate(0)' }
        },
        'reveal-glow': {
          '0%': { opacity: '0', transform: 'scale(0.97)', filter: 'brightness(0.6)' },
          '100%': { opacity: '1', transform: 'scale(1)', filter: 'brightness(1)' }
        },
        /* Slow hero zoom. Runs for the life of the page, not once. */
        'ken-burns': {
          '0%': { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1.16)' }
        },
        'hero-lift': {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.8s ease-out',
        'fade-in-up': 'fade-in-up 0.8s ease-out',
        'fade-in-down': 'fade-in-down 0.8s ease-out',
        'slide-in-right': 'slide-in-right 0.8s ease-out',
        'pulse-soft': 'pulse-soft 3s infinite ease-in-out',
        'float': 'float 6s infinite ease-in-out',
        /* Durations and easings differ per theme, which is most of why one
           template feels brisk and another feels unhurried. */
        'reveal-rise': 'reveal-rise 0.75s cubic-bezier(0.22, 1, 0.36, 1) both',
        'reveal-drift': 'reveal-drift 1.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'reveal-wipe': 'reveal-wipe 0.9s cubic-bezier(0.76, 0, 0.24, 1) both',
        'reveal-unmask': 'reveal-unmask 1.1s cubic-bezier(0.76, 0, 0.24, 1) both',
        'reveal-settle': 'reveal-settle 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'reveal-glow': 'reveal-glow 1.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        'ken-burns': 'ken-burns 24s ease-out forwards',
        'hero-lift': 'hero-lift 1.1s cubic-bezier(0.16, 1, 0.3, 1) both'
			},
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'elegant': '0 4px 20px -2px rgba(0,0,0,0.05)',
        'glass': '0 4px 30px rgba(0,0,0,0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
