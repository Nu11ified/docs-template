import type { ReactNode } from "react";
import type { FullConfig } from "../types";
import { Island } from "../Island";
import { ThemeToggle } from "../../client/components/ThemeToggle";

interface LandingLayoutProps {
  config: FullConfig;
  children: ReactNode;
}

export function LandingLayout({ config, children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation bar */}
      <header className="sticky top-0 z-50 border-b border-[var(--site-text)]/10 bg-[var(--site-background)]/80 backdrop-blur-sm">
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          {/* Site name / logo */}
          <a href="/" className="flex items-center gap-2 text-[var(--site-text)] font-bold text-lg font-[var(--site-font-heading)]">
            {config.site.logo && (
              <img src={config.site.logo} alt="" className="h-8 w-8" />
            )}
            {config.site.name}
          </a>

          {/* Nav links + theme toggle */}
          <div className="flex items-center gap-6">
            {config.nav.links.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="text-[var(--site-text)]/70 hover:text-[var(--site-text)] transition-colors text-sm font-medium"
                {...(link.external
                  ? { target: "_blank", rel: "noopener" }
                  : {})}
              >
                {link.label}
              </a>
            ))}
            <Island name="ThemeToggle" component={ThemeToggle} props={{}} />
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--site-text)]/10 py-8 px-6">
        <div className="mx-auto max-w-7xl text-center text-sm text-[var(--site-text)]/50">
          &copy; {new Date().getFullYear()} {config.site.name}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
