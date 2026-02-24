import type { FullConfig } from "../types";
import { Island } from "../Island";
import { ThemeToggle } from "../../client/components/ThemeToggle";
import { VersionPicker } from "../../client/components/VersionPicker";

interface NavProps {
  config: FullConfig;
  showVersionPicker?: boolean;
  currentVersion?: string;
}

export function Nav({ config, showVersionPicker, currentVersion }: NavProps) {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-[var(--site-text)]/10 bg-[var(--site-background)]/80 backdrop-blur-sm">
      <nav className="mx-auto flex h-full max-w-[90rem] items-center justify-between px-4 sm:px-6">
        {/* Left: Site name */}
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-2 text-[var(--site-text)] font-bold text-lg font-[var(--site-font-heading)]"
          >
            {config.site.logo && (
              <img src={config.site.logo} alt="" className="h-8 w-8" />
            )}
            {config.site.name}
          </a>

          {showVersionPicker && (
            <Island
              name="VersionPicker"
              component={VersionPicker}
              props={{
                versions: config.docs.versions,
                currentVersion: currentVersion || config.docs.defaultVersion,
              }}
            />
          )}
        </div>

        {/* Right: Nav links + search + theme toggle */}
        <div className="flex items-center gap-1 sm:gap-4">
          {/* Search trigger */}
          <button
            type="button"
            data-open-search
            className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-[var(--site-text)]/10 bg-[var(--site-surface)] px-3 py-1.5 text-sm text-[var(--site-text)]/50 hover:border-[var(--site-text)]/20 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span>Search...</span>
            <kbd className="ml-2 hidden rounded bg-[var(--site-text)]/5 px-1.5 py-0.5 text-[10px] font-medium text-[var(--site-text)]/40 sm:inline-block">
              {"⌘K"}
            </kbd>
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-4">
            {config.nav.links.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="text-[var(--site-text)]/70 hover:text-[var(--site-text)] transition-colors text-sm font-medium"
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.label}
              </a>
            ))}
          </div>

          <Island name="ThemeToggle" component={ThemeToggle} props={{}} />

          {/* Mobile hamburger menu */}
          <button
            type="button"
            className="inline-flex md:hidden items-center justify-center rounded-md p-2 text-[var(--site-text)]/70 hover:text-[var(--site-text)] hover:bg-[var(--site-text)]/5 transition-colors"
            aria-label="Open menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}
