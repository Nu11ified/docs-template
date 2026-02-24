import type { ReactNode } from "react";
import type { FullConfig } from "./types";
import { generateThemeCSS } from "./theme";
import { Island } from "./Island";
import { Search } from "../client/components/Search";

// ---------------------------------------------------------------------------
// ShellProps — props for the HTML document shell
// ---------------------------------------------------------------------------

interface ShellProps {
  title: string;
  description?: string;
  config: FullConfig;
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// buildGoogleFontsURL — construct a Google Fonts stylesheet URL from the
// configured font families (heading, body, code).
// ---------------------------------------------------------------------------

function buildGoogleFontsURL(fonts: FullConfig["theme"]["fonts"]): string {
  const families = new Set([fonts.heading, fonts.body, fonts.code]);
  const params = [...families]
    .map((f) => `family=${encodeURIComponent(f)}:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

// ---------------------------------------------------------------------------
// Shell — renders the full <html> document wrapper.
// Used during SSR to produce the complete page HTML.
//
// NOTE: The dangerouslySetInnerHTML usage below is safe because the content
// comes from generateThemeCSS(), which produces CSS custom-property
// declarations derived solely from the site operator's own configuration
// file (site.yaml). It never contains user-supplied input.
// ---------------------------------------------------------------------------

export function Shell({ title, description, config, children }: ShellProps) {
  const themeCSS = generateThemeCSS(config.theme);
  const googleFontsURL = buildGoogleFontsURL(config.theme.fonts);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
        <link rel="stylesheet" href="/static/assets/styles.css" />
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem("theme");if(!t)t=window.matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";if(t==="dark"){document.documentElement.setAttribute("data-theme","dark");document.documentElement.classList.add("dark")}})()` }} />
        <link rel="stylesheet" href={googleFontsURL} />
        <link rel="icon" href={config.site.favicon} />
      </head>
      <body className="bg-[var(--site-background)] text-[var(--site-text)] font-[var(--site-font-body)]">
        {children}
        <Island name="Search" component={Search} props={{}} />
        <script dangerouslySetInnerHTML={{ __html: `document.addEventListener("click",function(e){if(e.target.closest("[data-open-search]")){e.preventDefault();document.dispatchEvent(new KeyboardEvent("keydown",{key:"k",metaKey:true,bubbles:true}))}})` }} />
        <script src="/static/assets/entry.js" type="module" defer />
      </body>
    </html>
  );
}
