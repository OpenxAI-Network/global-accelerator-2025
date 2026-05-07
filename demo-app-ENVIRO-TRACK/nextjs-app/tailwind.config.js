/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom sidebar color palette
        sidebar: {
          primary: '#0f172a',      // slate-900
          secondary: '#1e293b',    // slate-800
          tertiary: '#334155',     // slate-700
          accent: '#475569',       // slate-600
          text: {
            primary: '#f8fafc',    // slate-50
            secondary: '#cbd5e1',  // slate-300
            muted: '#94a3b8',      // slate-400
          }
        },
        // Refined button colors - more subtle
        button: {
          primary: {
            DEFAULT: '#3730a3',    // indigo-700
            hover: '#4338ca',      // indigo-600
            light: '#6366f1',      // indigo-500
          },
          secondary: {
            DEFAULT: '#374151',    // gray-700
            hover: '#4b5563',      // gray-600
            light: '#6b7280',      // gray-500
          },
          accent: {
            DEFAULT: '#0f766e',    // teal-700
            hover: '#0d9488',      // teal-600
            light: '#14b8a6',      // teal-500
          }
        }
      },
      fontSize: {
        // Reduced font sizes (90% of standard)
        'xs-sm': ['0.68rem', { lineHeight: '0.9rem' }],    // ~90% of xs
        'sm-sm': ['0.79rem', { lineHeight: '1.08rem' }],   // ~90% of sm
        'base-sm': ['0.9rem', { lineHeight: '1.35rem' }],  // ~90% of base
        'lg-sm': ['1.02rem', { lineHeight: '1.53rem' }],   // ~90% of lg
        'xl-sm': ['1.13rem', { lineHeight: '1.62rem' }],   // ~90% of xl
      },
      spacing: {
        // Reduced spacing (90% of standard)
        '0.5-sm': '0.113rem',  // ~90% of 0.5 (2px)
        '1-sm': '0.225rem',    // ~90% of 1 (4px)
        '1.5-sm': '0.338rem',  // ~90% of 1.5 (6px)
        '2-sm': '0.45rem',     // ~90% of 2 (8px)
        '2.5-sm': '0.563rem',  // ~90% of 2.5 (10px)
        '3-sm': '0.675rem',    // ~90% of 3 (12px)
        '3.5-sm': '0.788rem',  // ~90% of 3.5 (14px)
        '4-sm': '0.9rem',      // ~90% of 4 (16px)
        '5-sm': '1.125rem',    // ~90% of 5 (20px)
        '6-sm': '1.35rem',     // ~90% of 6 (24px)
      }
    },
  },
  plugins: [],
}
