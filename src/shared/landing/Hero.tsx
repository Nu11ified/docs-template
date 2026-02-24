import type { HeroSection } from "../types";

export function Hero({ title, subtitle, badge, primaryCTA, secondaryCTA }: HeroSection) {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-32" style={{ backgroundColor: "#0f172a" }}>
      {/* Subtle gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-20 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, #6366f1 0%, transparent 70%)" }} />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        {/* Badge */}
        {badge && (
          <div className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border" style={{ backgroundColor: "rgba(99, 102, 241, 0.1)", borderColor: "rgba(99, 102, 241, 0.2)", color: "#818cf8" }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#818cf8" }} />
            {badge}
          </div>
        )}

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1]">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}

        {/* Search bar — opens search modal */}
        <div className="mt-10 mx-auto max-w-xl">
          <div className="relative group">
            <div className="absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)", filter: "blur(8px)" }} />
            <button
              type="button"
              data-open-search
              className="relative w-full flex items-center rounded-xl cursor-pointer text-left"
              style={{ backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-4 h-5 w-5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span className="flex-1 px-3 py-3.5 text-base text-slate-500">
                Search documentation...
              </span>
              <div className="pr-3">
                <kbd className="hidden sm:inline-flex items-center rounded border border-slate-600 bg-slate-800 px-2 py-0.5 font-mono text-xs text-slate-400">
                  ⌘K
                </kbd>
              </div>
            </button>
          </div>
        </div>

        {/* CTA buttons */}
        {(primaryCTA || secondaryCTA) && (
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            {primaryCTA && (
              <a
                href={primaryCTA.href}
                className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "#6366f1" }}
              >
                {primaryCTA.label}
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            )}
            {secondaryCTA && (
              <a
                href={secondaryCTA.href}
                className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium text-slate-300 transition-all hover:text-white border border-slate-700 hover:border-slate-500"
              >
                {secondaryCTA.label}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
