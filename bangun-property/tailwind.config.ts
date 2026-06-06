import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "380px",
      },
      colors: {
        primary: "#ff385c",
        "primary-active": "#e00b41",
        "primary-disabled": "#ffd1da",
        "primary-error": "#c13515",
        // These reference CSS custom properties so dark mode just
        // overrides the vars under .dark { }
        ink: "var(--color-ink)",
        body: "var(--color-body)",
        muted: "var(--color-muted)",
        "muted-soft": "var(--color-muted-soft)",
        hairline: "var(--color-hairline)",
        "hairline-soft": "var(--color-hairline-soft)",
        "border-strong": "var(--color-border-strong)",
        canvas: "var(--color-canvas)",
        "surface-soft": "var(--color-surface-soft)",
        "surface-strong": "var(--color-surface-strong)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "sans-serif"],
      },
      borderRadius: {
        xs: "4px", sm: "8px", md: "14px", lg: "20px", xl: "32px", full: "9999px",
      },
      spacing: {
        xxs: "2px", xs: "4px", sm: "8px", md: "12px",
        base: "16px", lg: "24px", xl: "32px", xxl: "48px", section: "64px",
      },
      boxShadow: {
        card: "rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px 0, rgba(0,0,0,0.1) 0 4px 8px 0",
        sm: "0 1px 2px rgba(0,0,0,0.08)",
        lifted: "0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-in-up": { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "slide-up": { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        "spin-slow": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.45s cubic-bezier(0.16,1,0.3,1)",
        "slide-up": "slide-up 0.35s cubic-bezier(0.16,1,0.3,1)",
        shimmer: "shimmer 1.8s ease-in-out infinite",
        "spin-slow": "spin-slow 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
