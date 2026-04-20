/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        claude: '#3b82f6', // blue-500
        openai: '#10b981', // green-500
        gemini: '#8b5cf6', // purple-500
      }
    },
  },
  plugins: [],
}
