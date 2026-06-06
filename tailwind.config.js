/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-tertiary": "var(--color-text-tertiary)",
        "layer-1": "var(--color-layer-1)",
        "layer-2": "var(--color-layer-2)",
        "layer-3": "var(--color-layer-3)",
        border: "var(--color-border)",
        "border-subtle": "var(--color-border-subtle)",
        accent: "var(--color-accent)",
        "accent-hover": "var(--color-accent-hover)",
        "accent-border": "var(--color-accent-border)",
        "canvas-subtle": "var(--color-canvas-subtle)",
        rain: "var(--color-rain)",
        sun: "var(--color-sun)",
        live: "var(--color-live)",
        "accent-soft": "var(--color-accent-soft)",
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.4s ease-out",
      },
    },
  },
  plugins: [],
};
