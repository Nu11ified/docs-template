import type { ReactNode } from "react";
import type { FullConfig } from "../types";

interface LandingLayoutProps {
  config: FullConfig;
  children: ReactNode;
}

export function LandingLayout({ config, children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08]"
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <nav className="mx-auto max-w-6xl h-16 px-6 grid grid-cols-3 items-center">
          {/* Left: Logo */}
          <div className="flex items-center">
            <a
              href="/"
              className="text-white font-semibold text-base tracking-tight"
            >
              {config.site.name}
            </a>
          </div>

          {/* Center: Links */}
          <div className="hidden md:flex items-center justify-center gap-1">
            {config.nav.links.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="px-3 py-1.5 rounded-md text-sm text-slate-400 hover:text-white transition-colors"
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right: CTA */}
          <div className="flex items-center justify-end gap-3">
            <a
              href="/docs"
              className="inline-flex items-center px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "#6366f1" }}
            >
              Get Started
            </a>
          </div>
        </nav>
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer
        className="border-t border-white/[0.06] py-8 px-6"
        style={{ backgroundColor: "#0f172a" }}
      >
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} {config.site.name}
          </span>
          <div className="flex items-center gap-6">
            {config.nav.links.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
