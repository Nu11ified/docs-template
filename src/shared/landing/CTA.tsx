import type { CTASection } from "../types";

export function CTA({ title, description, button }: CTASection) {
  return (
    <section className="py-24 px-6" style={{ backgroundColor: "#0f172a", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="mt-4 text-base text-slate-400">{description}</p>
        )}
        <div className="mt-8">
          <a
            href={button.href}
            className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "#6366f1" }}
          >
            {button.label}
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
