import type { CTASection } from "../types";

export function CTA({ title, description, button }: CTASection) {
  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--site-text)] font-[var(--site-font-heading)]">
          {title}
        </h2>

        {description && (
          <p className="mt-4 text-lg text-[var(--site-text)]/70">
            {description}
          </p>
        )}

        <div className="mt-8">
          <a
            href={button.href}
            className="inline-flex items-center px-6 py-3 rounded-[var(--site-radius)] bg-[var(--site-primary)] text-white font-semibold text-base hover:opacity-90 transition-opacity"
          >
            {button.label}
          </a>
        </div>
      </div>
    </section>
  );
}
