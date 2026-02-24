import type { TestimonialsSection } from "../types";

export function Testimonials({ title, items }: TestimonialsSection) {
  return (
    <section className="py-24 px-6" style={{ backgroundColor: "#0f172a", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="mx-auto max-w-6xl">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-14 tracking-tight">
            {title}
          </h2>
        )}

        <div className="columns-1 md:columns-2 gap-4 space-y-4">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="break-inside-avoid rounded-xl p-5"
              style={{ backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-sm text-slate-300 leading-relaxed">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                  {item.author.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{item.author}</div>
                  <div className="text-xs text-slate-500">{item.handle || item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
