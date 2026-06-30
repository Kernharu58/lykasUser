/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./app/globals.css",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./context/**/*.{js,jsx,ts,tsx}",
    "./utils/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ── SINGLE SOURCE OF TRUTH FOR ALL APP COLORS ──────────────
        // Edit hex values here only. Mirrored 1:1 in utils/colors.ts
        // for icon `color` props / inline `style` objects, which
        // can't consume Tailwind classNames.
        // brand
        primary: "#1E6B45",
        primaryDeep: "#2D6A4F",
        accentOrange: "#D4622A",
        warnBrown: "#D08C60",
        darkBlue: "#1B2A49",
        // text
        ink: "#111827",
        inkSoft: "#2C2C2C",
        muted: "#6B7280",
        mutedLight: "#9CA3AF",
        slate: "#374151",
        slateDark: "#1F2937",
        taupe: "#7A7068",
        sand: "#B0A898",
        espresso: "#3D3830",
        // surface
        bgSoft: "#F8FAF9",
        cream: "#FDFAF4",
        cardBg: "#F4F2EE",
        gray100: "#F3F4F6",
        gray200: "#E5E7EB",
        gray50: "#F9FAFB",
        offWhite: "#FAFAFA",
        blush: "#FAF3EE",
        blushBorder: "#F0DDD4",
        peachBg: "#FFF4EE",
        sandBg: "#F5EDD6",
        border: "#DCE8E1",
        white: "#FFFFFF",
        neutral: "#AAAAAA",
        gray300: "#D1D5DB",
        // green_scale
        mintBg: "#EAF4EE",
        mint: "#A7D3BB",
        mintLight: "#9DD6B7",
        mintDeep: "#3D8A5E",
        mintPale: "#E8F5EE",
        green400: "#4ADE80",
        green600: "#16A34A",
        green700: "#155436",
        green900: "#14532D",
        emerald: "#10B981",
        // accent
        amber: "#F59E0B",
        amber600: "#D97706",
        brown: "#92400E",
        red600: "#DC2626",
        redDeep: "#C0392B",
        rose: "#E11D48",
        pink: "#EC4899",
        purple: "#8B5CF6",
        blue: "#3B82F6",

        // Status/badge semantic colors (used by components/StatusBadge.tsx)
        status: {
          success: "#1E6B45",
          successBg: "#EAF4EE",
          warning: "#E8A020",
          warningBg: "#FEF3E2",
          danger: "#EF4444",
          dangerBg: "#FEE2E2",
          neutral: "#6B7280",
          neutralBg: "#F4F2EE",
        },
      },
    },
  },
  plugins: [],
};
