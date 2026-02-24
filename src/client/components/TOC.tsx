import { useState, useEffect } from "react";

export interface TOCProps {
  headings: Array<{ id: string; text: string; level: number }>;
}

export function TOC({ headings }: TOCProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined" || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first heading that is intersecting
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0,
      }
    );

    // Observe all heading elements
    const elements: Element[] = [];
    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) {
        observer.observe(el);
        elements.push(el);
      }
    }

    return () => {
      for (const el of elements) {
        observer.unobserve(el);
      }
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="Table of contents">
      <h3 className="mb-3 text-sm font-semibold text-[var(--site-text)]">
        On this page
      </h3>
      <ul className="space-y-1 text-sm">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          const indent = heading.level === 3 ? "pl-4" : "";

          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={`block py-1 transition-colors ${indent} ${
                  isActive
                    ? "text-[var(--site-primary)] font-medium"
                    : "text-[var(--site-text)]/50 hover:text-[var(--site-text)]/80"
                }`}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
