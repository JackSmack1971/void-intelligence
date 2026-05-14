/**
 * Void Intelligence Design Tokens
 * Extracted 1:1 from docs/DESIGN.md
 */

export const tokens = {
  colors: {
    background: "#030712",
    surface01: "#111827",
    surface02: "#1F2937",
    surface03: "#374151",
    textPrimary: "#F3F4F6",
    textSecondary: "#D1D5DB",
    textMuted: "#9CA3AF",
    accentBlue: "#2563EB",
    accentBlueLight: "#60A5FA",
    accentPurple: "#6D28D9",
    accentPurpleLight: "#A855F7",
    accentPink: "#DB2777",
    accentPinkLight: "#EC4899",
    success: "#34D399",
    error: "#EF4444",
    borderSubtle: "#374151",
    borderGlass: "#1F2937",
  },
  typography: {
    fontStack: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
    display: {
      fontSize: "3.052rem",
      fontWeight: "800",
      lineHeight: "1.1",
      letterSpacing: "-0.02em",
    },
    headline: {
      fontSize: "2.441rem",
      fontWeight: "700",
      lineHeight: "1.2",
      letterSpacing: "-0.015em",
    },
    titleLg: {
      fontSize: "1.563rem",
      fontWeight: "600",
      lineHeight: "1.2",
    },
    titleMd: {
      fontSize: "1.25rem",
      fontWeight: "600",
      lineHeight: "1.3",
    },
    bodyLg: {
      fontSize: "1.25rem",
      fontWeight: "400",
      lineHeight: "1.5",
    },
    bodyMd: {
      fontSize: "1rem",
      fontWeight: "400",
      lineHeight: "1.5",
    },
    bodyXs: {
      fontSize: "0.875rem",
      fontWeight: "400",
      lineHeight: "1.5",
    },
    labelMd: {
      fontSize: "1rem",
      fontWeight: "500",
      lineHeight: "1.4",
      letterSpacing: "0.02em",
    },
    labelSm: {
      fontSize: "0.875rem",
      fontWeight: "600",
      lineHeight: "1.4",
      letterSpacing: "0.02em",
    },
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
    "4xl": "6rem",
  },
  rounded: {
    none: "0px",
    xs: "4px",
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  },
  components: {
    glass: {
      backgroundColor: "rgba(31, 41, 55, 0.5)",
      backdropFilter: "blur(4px)",
      border: "1px solid rgba(55,65,81,0.3)",
    },
    brandGradient: "linear-gradient(to right, #2563EB, #6D28D9, #DB2777)",
  },
};
