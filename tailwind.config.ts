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
        // Odoo ERP inspired color palette
        background: "#F7F7F7",
        card: "#FFFFFF",
        odoo: {
          bg: "#F7F7F7",
          panel: "#FFFFFF",
          border: "#DEE2E6",
          borderLight: "#E9ECEF",
          text: "#212529",
          muted: "#6C757D",
          primary: "#714B67",
          primaryHover: "#5E3E55",
          primaryActive: "#4D3145",
          primaryLight: "#F1ECEF",
          primarySubtle: "#E8DFE5",
          secondary: "#FFFFFF",
          secondaryHover: "#F8F9FA",
          success: "#2E7D32",
          successBg: "#E8F5E9",
          successBorder: "#C8E6C9",
          warning: "#E65100",
          warningBg: "#FFF3E0",
          warningBorder: "#FFE0B2",
          danger: "#C62828",
          dangerBg: "#FFEBEE",
          dangerBorder: "#FFCDD2",
          info: "#0D6EFD",
          infoBg: "#E7F1FF",
          infoBorder: "#B6D4FE",
        },
        primary: {
          DEFAULT: "#714B67",
          hover: "#5E3E55",
          light: "#F1ECEF",
          50: "#FAF7F9",
          100: "#F1ECEF",
          200: "#E8DFE5",
          500: "#714B67",
          600: "#5E3E55",
          700: "#4D3145",
          900: "#361F30",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "4px",
        md: "4px",
        lg: "6px",
        xl: "8px",
        full: "9999px",
      },
      boxShadow: {
        none: "none",
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        card: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        modal: "0 4px 16px 0 rgba(0, 0, 0, 0.12)",
        dropdown: "0 2px 8px 0 rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
