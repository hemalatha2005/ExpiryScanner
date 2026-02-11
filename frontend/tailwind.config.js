module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        "plate-spin": "plateSpin 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        plateSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
