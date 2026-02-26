export const colors = {
  primary: "#6D28D9",
  primaryLight: "#8B5CF6",
  primaryDark: "#5B21B6",
  background: "#FFFFFF",
  surface: "#F9FAFB",
  surfaceAlt: "#F3F4F6",
  border: "#E5E7EB",
  text: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  error: "#EF4444",
  success: "#10B981",
  white: "#FFFFFF",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  hero: { fontSize: 32, fontWeight: "800" as const, letterSpacing: -1 },
  title: { fontSize: 24, fontWeight: "700" as const, letterSpacing: -0.5 },
  subtitle: { fontSize: 18, fontWeight: "600" as const },
  body: { fontSize: 16, fontWeight: "400" as const },
  caption: { fontSize: 13, fontWeight: "500" as const },
  label: { fontSize: 12, fontWeight: "700" as const, letterSpacing: 1, textTransform: "uppercase" as const },
};
