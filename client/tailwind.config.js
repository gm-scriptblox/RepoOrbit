module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        gh: {
          bg: "#0d1117",
          surface: "#161b22",
          elevated: "#21262d",
          border: "#30363d",
          text: "#e6edf3",
          muted: "#8b949e",
          accent: "#238636",
          "accent-hover": "#2ea043",
          blue: "#1f6feb",
          "blue-hover": "#388bfd",
          danger: "#da3633",
          "danger-hover": "#f85149",
          warning: "#d29922",
          orange: "#db6d28",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        DEFAULT: "6px",
      },
    },
  },
  plugins: [],
};