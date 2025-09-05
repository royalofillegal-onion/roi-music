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
				music: {
					primary: 'hsl(var(--music-primary))',
					secondary: 'hsl(var(--music-secondary))',
					accent: 'hsl(var(--music-accent))',
					muted: 'hsl(var(--music-muted))',
					'gradient-start': 'hsl(var(--music-gradient-start))',
					'gradient-end': 'hsl(var(--music-gradient-end))',
				},
			},
			backgroundSize: {
				'size-200': '200% 200%',
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
					from: { opacity: '0', transform: 'translateY(10px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					from: { opacity: '1', transform: 'translateY(0)' },
					to: { opacity: '0', transform: 'translateY(10px)' }
				},
				'slide-up': {
					from: { transform: 'translateY(20px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-in': {
					from: { transform: 'translateX(-20px)', opacity: '0' },
					to: { transform: 'translateX(0)', opacity: '1' }
				},
				'scale-in': {
					from: { transform: 'scale(0.95)', opacity: '0' },
					to: { transform: 'scale(1)', opacity: '1' }
				},
				'scale-out': {
					from: { transform: 'scale(1)', opacity: '1' },
					to: { transform: 'scale(0.95)', opacity: '0' }
				},
				'orange-pulse': {
					'0%, 100%': { 
						boxShadow: '0 0 20px hsl(25, 95%, 53%), 0 0 40px hsl(25, 95%, 53%)',
						transform: 'scale(1)'
					},
					'50%': { 
						boxShadow: '0 0 30px hsl(14, 100%, 57%), 0 0 60px hsl(14, 100%, 57%)',
						transform: 'scale(1.05)'
					}
				},
				'blob-float': {
					'0%, 100%': { 
						transform: 'translate(0, 0) scale(1)',
						borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%'
					},
					'25%': { 
						transform: 'translate(20px, -30px) scale(1.1)',
						borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%'
					},
					'50%': { 
						transform: 'translate(-10px, -40px) scale(0.9)',
						borderRadius: '40% 70% 60% 30% / 40% 50% 60% 50%'
					},
					'75%': { 
						transform: 'translate(-20px, -20px) scale(1.05)',
						borderRadius: '70% 30% 40% 60% / 30% 70% 40% 60%'
					}
				},
				'rainbow-slide': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				'glitch-1': {
					'0%, 100%': { 
						transform: 'translate(0, 0)',
						opacity: '0'
					},
					'10%': { 
						transform: 'translate(-2px, -1px)',
						opacity: '0.3'
					},
					'20%': { 
						transform: 'translate(2px, 1px)',
						opacity: '0'
					},
					'30%': { 
						transform: 'translate(-1px, 2px)',
						opacity: '0.3'
					}
				},
				'glitch-2': {
					'0%, 100%': { 
						transform: 'translate(0, 0)',
						opacity: '0'
					},
					'15%': { 
						transform: 'translate(1px, -2px)',
						opacity: '0.3'
					},
					'25%': { 
						transform: 'translate(-2px, 1px)',
						opacity: '0'
					},
					'35%': { 
						transform: 'translate(2px, -1px)',
						opacity: '0.3'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'scale-out': 'scale-out 0.2s ease-out',
				'orange-pulse': 'orange-pulse 2s ease-in-out infinite',
				'blob-float': 'blob-float 6s ease-in-out infinite',
				'rainbow-slide': 'rainbow-slide 3s ease-in-out infinite',
				'glitch-1': 'glitch-1 2s infinite',
				'glitch-2': 'glitch-2 2.5s infinite',
				'enter': 'fade-in 0.3s ease-out, scale-in 0.2s ease-out',
				'exit': 'fade-out 0.3s ease-out, scale-out 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
