import type { FAQSection } from "../types";

export function FAQ({ title, items }: FAQSection) {
  return (
    <section className="py-24 px-6" style={{ backgroundColor: "#0f172a", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="mx-auto max-w-2xl">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12 tracking-tight">
            {title}
          </h2>
        )}

        <div className="space-y-2">
          {items.map((item, idx) => (
            <details key={idx} className="group">
              <summary
                className="flex items-center justify-between cursor-pointer rounded-lg px-5 py-4 text-sm font-medium text-slate-200 transition-colors list-none hover:text-white"
                style={{ backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span>{item.question}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-slate-500 transition-transform duration-200 group-open:rotate-180 shrink-0 ml-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-4 pt-3 text-sm text-slate-400 leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
