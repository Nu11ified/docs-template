import type { Theme } from "./types";

// ---------------------------------------------------------------------------
// Radius enum → CSS value mapping
// ---------------------------------------------------------------------------

const RADIUS_MAP: Record<Theme["radius"], string> = {
  none: "0",
  sm: "0.125rem",
  md: "0.375rem",
  lg: "0.5rem",
  full: "9999px",
};

// ---------------------------------------------------------------------------
// generateThemeCSS — converts a Theme config object into a CSS string that
// sets custom properties on :root (light) and [data-theme="dark"] (dark).
// ---------------------------------------------------------------------------

export function generateThemeCSS(theme: Theme): string {
  const { colors, fonts, radius } = theme;

  const rootVars = [
    `  --site-primary: ${colors.primary};`,
    `  --site-secondary: ${colors.secondary};`,
    `  --site-background: ${colors.background};`,
    `  --site-surface: ${colors.surface};`,
    `  --site-text: ${colors.text};`,
    `  --site-font-heading: '${fonts.heading}', sans-serif;`,
    `  --site-font-body: '${fonts.body}', sans-serif;`,
    `  --site-font-code: '${fonts.code}', monospace;`,
    `  --site-radius: ${RADIUS_MAP[radius]};`,
  ];

  let css = `:root {\n${rootVars.join("\n")}\n}`;

  if (colors.dark) {
    const darkVars = [
      `  --site-background: ${colors.dark.background};`,
      `  --site-surface: ${colors.dark.surface};`,
      `  --site-text: ${colors.dark.text};`,
    ];
    css += `\n[data-theme="dark"] {\n${darkVars.join("\n")}\n}`;
  }

  return css;
}

// ---------------------------------------------------------------------------
// Quick smoke test — run with: bun src/shared/theme.ts
// ---------------------------------------------------------------------------

if (import.meta.main) {
  const { loadConfig } = await import("../server/config");
  const config = loadConfig();
  console.log(generateThemeCSS(config.theme));
}
