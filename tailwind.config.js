/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(220, 20%, 95%)',
        accent: 'hsl(200, 80%, 60%)',
        primary: 'hsl(150, 70%, 50%)',
        surface: 'hsl(0, 0%, 100%)',
        text: {
          primary: 'hsl(220, 15%, 25%)',
          secondary: 'hsl(220, 10%, 45%)'
        }
      },
      borderRadius: {
        lg: '16px',
        md: '10px',
        sm: '6px'
      },
      boxShadow: {
        lg: '0 10px 15px hsla(0,0%,0%,0.1), 0 4px 6px hsla(0,0%,0%,0.05)',
        md: '0 4px 6px hsla(0,0%,0%,0.1), 0 2px 4px hsla(0,0%,0%,0.06)',
        sm: '0 1px 3px hsla(0,0%,0%,0.1), 0 1px 2px hsla(0,0%,0%,0.06)'
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '20px',
        xl: '32px'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      animation: {
        'pulse-glow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.22,1,0.36,1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.22,1,0.36,1)'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}