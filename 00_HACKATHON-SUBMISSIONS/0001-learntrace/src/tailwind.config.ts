/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Flattened color keys for easier utility usage
        'primary-light': '#A3BFFA',   // light blue
        'primary': '#4F46E5',         // indigo-600 (DEFAULT)
        'primary-dark': '#3730A3',    // indigo-800

        'secondary-light': '#C4B5FD', // light purple
        'secondary': '#8B5CF6',       // purple-500 (DEFAULT)
        'secondary-dark': '#6D28D9',  // purple-700

        'background-light': '#F9FAFB',// gray-50
        'background': '#FFFFFF',      // DEFAULT
        'background-dark': '#1E293B', // slate-800

        'text-light': '#1E293B',      // slate-800
        'text': '#334155',            // slate-700 (DEFAULT)
        'text-dark': '#F1F5F9',       // slate-100

        'border': '#E5E7EB',          // gray-200 (DEFAULT)
        'border-dark': '#374151',     // gray-700
      },
      borderRadius: {
        DEFAULT: '0.5rem',   // 8px round corners
        lg: '0.75rem',       // 12px
      },
      boxShadow: {
        'soft': '0 4px 8px rgba(79, 70, 229, 0.1)',       // subtle purple shadow
        'soft-dark': '0 4px 12px rgba(99, 102, 241, 0.4)', // stronger in dark mode
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['Fira Code', 'monospace'],
      },
      transitionTimingFunction: {
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [],
}
