/**
 * Mirrors theme.extend.colors in tailwind.config.js, key for key.
 *
 * Why this file exists: NativeWind className strings can't be built
 * dynamically from a variable, and some props -- Ionicons `color`, SVG
 * `fill`, `tintColor`, inline `style={{ color: ... }}` -- only accept raw
 * hex, not classNames. To keep ONE source of truth, edit colors in
 * tailwind.config.js ONLY, then update this file to match.
 */
export const COLORS = {
  accentOrange: "#D4622A",
  amber: "#F59E0B",
  amber600: "#D97706",
  bgSoft: "#F8FAF9",
  blue: "#3B82F6",
  blush: "#FAF3EE",
  blushBorder: "#F0DDD4",
  border: "#DCE8E1",
  brown: "#92400E",
  cardBg: "#F4F2EE",
  cream: "#FDFAF4",
  danger: "#EF4444",
  dangerBg: "#FEE2E2",
  darkBlue: "#1B2A49",
  emerald: "#10B981",
  espresso: "#3D3830",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray50: "#F9FAFB",
  green400: "#4ADE80",
  green600: "#16A34A",
  green700: "#155436",
  green900: "#14532D",
  ink: "#111827",
  inkSoft: "#2C2C2C",
  mint: "#A7D3BB",
  mintBg: "#EAF4EE",
  mintDeep: "#3D8A5E",
  mintLight: "#9DD6B7",
  mintPale: "#E8F5EE",
  muted: "#6B7280",
  mutedLight: "#9CA3AF",
  neutral: "#AAAAAA",
  offWhite: "#FAFAFA",
  peachBg: "#FFF4EE",
  pink: "#EC4899",
  primary: "#1E6B45",
  primaryDeep: "#2D6A4F",
  purple: "#8B5CF6",
  red600: "#DC2626",
  redDeep: "#C0392B",
  rose: "#E11D48",
  sand: "#B0A898",
  sandBg: "#F5EDD6",
  slate: "#374151",
  slateDark: "#1F2937",
  tan: "#E8E4DC",
  taupe: "#7A7068",
  warnBrown: "#D08C60",
  warning: "#E8A020",
  warningBg: "#FEF3E2",
  white: "#FFFFFF",
} as const;

export type ColorToken = keyof typeof COLORS;

// ── Status/badge semantic colors (used by components/StatusBadge.tsx) ──
export const STATUS_COLORS = {
  success: COLORS.primary,
  successBg: COLORS.mintBg,
  warning: COLORS.warning,
  warningBg: COLORS.warningBg,
  danger: COLORS.danger,
  dangerBg: COLORS.dangerBg,
  neutral: COLORS.muted,
  neutralBg: COLORS.cardBg,
} as const;

export type StatusTone = "success" | "warning" | "danger" | "neutral";

export const STATUS_CLASS = {
  success: { bg: "bg-status-successBg", text: "text-status-success" },
  warning: { bg: "bg-status-warningBg", text: "text-status-warning" },
  danger: { bg: "bg-status-dangerBg", text: "text-status-danger" },
  neutral: { bg: "bg-status-neutralBg", text: "text-status-neutral" },
} as const;
