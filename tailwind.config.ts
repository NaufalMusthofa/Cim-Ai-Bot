import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        mist: "#f7f1e8",
        clay: "#d6b991",
        ember: "#b85a35",
        pine: "#1e3d34",
        sand: "#f4ddc7"
      },
      boxShadow: {
        panel: "0 24px 80px rgba(23, 23, 23, 0.12)"
      },
      borderRadius: {
        panel: "28px"
      },
      fontFamily: {
        display: ['"Iowan Old Style"', '"Palatino Linotype"', "serif"],
        body: ['"Avenir Next"', "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
