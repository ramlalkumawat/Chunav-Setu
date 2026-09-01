import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7F6F2",
        card: "#FFFFFF",
        primary: {
          DEFAULT: "#1F3A5F",
          hover: "#172E4C",
          light: "#EAEFF5",
          50: "#F0F4F8",
          100: "#DCE6F1",
          500: "#1F3A5F",
          600: "#182E4C",
          700: "#12233A",
          900: "#0B1524",
        },
        chunav: {
          bg: "#F7F6F2",
          card: "#FFFFFF",
          navy: "#1F3A5F",
          navyHover: "#172E4C",
          text: "#172033",
          muted: "#64748B",
          border: "#E5E2DC",
          borderLight: "#F0EDE8",
          success: "#2F6B4F",
          successLight: "#EAF3EE",
          warning: "#B7791F",
          warningLight: "#FEF7EC",
          danger: "#B94A48",
          dangerLight: "#FDF2F2",
          surface: "#FBFBF9",
        },
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        modal: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
