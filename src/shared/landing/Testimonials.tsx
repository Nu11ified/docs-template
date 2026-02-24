import type { TestimonialsSection } from "../types";

export function Testimonials({ items }: TestimonialsSection) {
  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="bg-[var(--site-surface)] rounded-[var(--site-radius)] p-6 shadow-sm"
            >
              <p className="italic text-[var(--site-text)]/80 leading-relaxed">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="mt-4">
                <span className="font-bold text-[var(--site-text)]">
                  {item.author}
                </span>
                {item.role && (
                  <span className="text-[var(--site-text)]/50 text-sm ml-2">
                    {item.role}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
