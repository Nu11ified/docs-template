import type { HeroSection } from "../types";

export function Hero({ title, subtitle, primaryCTA, secondaryCTA, image }: HeroSection) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--site-primary)]/10 via-[var(--site-background)] to-[var(--site-background)] py-20 px-6 md:py-32">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center gap-12">
        {/* Text content */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--site-text)] font-[var(--site-font-heading)]">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-6 text-lg md:text-xl text-[var(--site-text)]/70 max-w-2xl">
              {subtitle}
            </p>
          )}

          {(primaryCTA || secondaryCTA) && (
            <div className="mt-10 flex flex-wrap gap-4 justify-center md:justify-start">
              {primaryCTA && (
                <a
                  href={primaryCTA.href}
                  className="inline-flex items-center px-6 py-3 rounded-[var(--site-radius)] bg-[var(--site-primary)] text-white font-semibold text-base hover:opacity-90 transition-opacity"
                >
                  {primaryCTA.label}
                </a>
              )}
              {secondaryCTA && (
                <a
                  href={secondaryCTA.href}
                  className="inline-flex items-center px-6 py-3 rounded-[var(--site-radius)] border-2 border-[var(--site-primary)] text-[var(--site-primary)] font-semibold text-base hover:bg-[var(--site-primary)]/10 transition-colors"
                >
                  {secondaryCTA.label}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Optional hero image */}
        {image && (
          <div className="flex-1 flex justify-center">
            <img
              src={image}
              alt=""
              className="max-w-full h-auto rounded-[var(--site-radius)] shadow-xl"
            />
          </div>
        )}
      </div>
    </section>
  );
}
