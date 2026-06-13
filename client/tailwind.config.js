/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        garamond: ['Cormorant Garamond', 'serif'],
        caveat: ['Caveat', 'cursive'],
        typewriter: ['Special Elite', 'monospace'],
      },
      colors: {
        desk: '#1A1412',          // Dark Wood Desk base color
        parchment: '#FAF6EE',     // Soft Warm Parchment Notebook base
        ink: '#2A2421',          // Sepia Dark Ink
        inkRed: '#B84A39',       // Terracotta stamp red ink
        inkGreen: '#3A6E4D',     // Sage success stamp green ink
        brass: '#C19D53',        // Antique Gold/Brass accent
      },
      boxShadow: {
        'notebook-page': '0 4px 24px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)',
        'stacked-page': '3px 3px 0px 0px #FAF6EE, 4px 4px 0px 0px #C8A96B, 6px 6px 15px rgba(0,0,0,0.35)',
        'dossier': '2px 4px 12px rgba(0, 0, 0, 0.25)',
      }
    },
  },
  plugins: [],
}