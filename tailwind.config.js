/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "serif"], // "Art of"
        script: ["var(--font-script)", "serif"], // "Opportunity"
      },
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        // IndieKonnect hero tokens
        ink: {
          950: "#0A1220",
          900: "#0E1830",
          800: "#141F3A",
        },
        gold: {
          400: "#F0C463",
          DEFAULT: "#E9AC3C",
          600: "#D89A2A",
        },
        cream: "#F6F1E7",
        crimson: {
          DEFAULT: "#C11F2E",
          600: "#A81A28",
        },
        mist: "#C7CCD6",
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
