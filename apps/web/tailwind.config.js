/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        surface: {
          DEFAULT: '#111827',
          card: '#1E293B',
          hover: '#283548',
          border: '#334155',
        },
        empathy: {
          violet: '#8B5CF6',
          cyan: '#06B6D4',
          rose: '#F43F5E',
          emerald: '#10B981',
          amber: '#F59E0B',
          pink: {
            DEFAULT: '#F43F5E',
            light: '#FDA4AF',
            vibrant: '#EC4899',
            deep: '#BE123C',
          },
          yellow: {
            DEFAULT: '#F59E0B',
            light: '#FDE68A',
            warm: '#FBBF24',
            sun: '#EAB308',
          },
          blue: {
            DEFAULT: '#0284C7',
            sky: '#38BDF8',
            glow: '#0EA5E9',
            deep: '#0369A1',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
