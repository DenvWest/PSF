export interface ThemeConfig {
  name: string;
  fonts: {
    primary: string;
    heading: string;
  };
  colors: {
    bg: string;
    surface: string;
    border: string;
    ink: string;
    body: string;
    muted: string;
    subtle: string;
    green: string;
    greenHover: string;
    greenLight: string;
    amber: string;
    amberLight: string;
  };
}

export const DEFAULT_THEME: ThemeConfig = {
  name: "perfectsupplement",
  fonts: {
    primary:
      'var(--font-body, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif)',
    heading: 'var(--font-heading, Georgia, "Times New Roman", serif)',
  },
  colors: {
    bg: "#f8f7f4",
    surface: "#ffffff",
    border: "#e7e5e4",
    ink: "#1c1917",
    body: "#78716c",
    muted: "#a8a29e",
    subtle: "#d6d3d1",
    green: "#2d6a4f",
    greenHover: "#1f4e3a",
    greenLight: "#e8f5ee",
    amber: "#b45309",
    amberLight: "#fef3c7",
  },
};

export function themeToCssVariables(theme: ThemeConfig): Record<string, string> {
  return {
    "--font-primary": theme.fonts.primary,
    "--font-heading-stack": theme.fonts.heading,
    "--ps-bg": theme.colors.bg,
    "--ps-surface": theme.colors.surface,
    "--ps-border": theme.colors.border,
    "--ps-ink": theme.colors.ink,
    "--ps-body": theme.colors.body,
    "--ps-muted": theme.colors.muted,
    "--ps-subtle": theme.colors.subtle,
    "--ps-green": theme.colors.green,
    "--ps-green-hover": theme.colors.greenHover,
    "--ps-green-light": theme.colors.greenLight,
    "--ps-amber": theme.colors.amber,
    "--ps-amber-light": theme.colors.amberLight,
  };
}
