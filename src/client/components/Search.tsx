import { useState, useEffect, useRef, useCallback } from "react";

type SearchResult = {
  slug: string;
  title: string;
  description: string;
};

type SearchProps = {
  version?: string;
};

function useTheme() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () =>
      setIsDark(
        document.documentElement.getAttribute("data-theme") === "dark"
      );
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

export function Search({ version }: SearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const isDark = useTheme();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQuery("");
      setResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query });
        if (version) params.set("v", version);
        const res = await fetch(`/api/search?${params}`);
        const data = await res.json();
        setResults(data.results || []);
        setHasSearched(true);
      } catch {
        setResults([]);
        setHasSearched(true);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, version]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab" || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], button, input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  // Theme-aware colors
  const colors = isDark
    ? {
        modalBg: "#1e293b",
        modalBorder: "rgba(255, 255, 255, 0.1)",
        inputText: "#f8fafc",
        placeholder: "#64748b",
        divider: "rgba(255, 255, 255, 0.08)",
        resultHover: "rgba(255, 255, 255, 0.05)",
        titleText: "#f1f5f9",
        descText: "#94a3b8",
        hintText: "#64748b",
        kbdBg: "rgba(255, 255, 255, 0.06)",
        kbdBorder: "rgba(255, 255, 255, 0.1)",
        kbdText: "#94a3b8",
      }
    : {
        modalBg: "#ffffff",
        modalBorder: "#e2e8f0",
        inputText: "#0f172a",
        placeholder: "#94a3b8",
        divider: "#e2e8f0",
        resultHover: "#f8fafc",
        titleText: "#0f172a",
        descText: "#64748b",
        hintText: "#94a3b8",
        kbdBg: "#f8fafc",
        kbdBorder: "#e2e8f0",
        kbdText: "#94a3b8",
      };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Search documentation"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg rounded-xl overflow-hidden shadow-2xl"
        style={{
          backgroundColor: colors.modalBg,
          border: `1px solid ${colors.modalBorder}`,
        }}
      >
        {/* Search input */}
        <div className="p-4" style={{ borderBottom: `1px solid ${colors.divider}` }}>
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.placeholder}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documentation..."
              aria-label="Search documentation"
              className="w-full bg-transparent text-lg outline-none"
              style={{ color: colors.inputText }}
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {!query.trim() && (
            <div
              className="px-4 py-8 text-center text-sm"
              style={{ color: colors.placeholder }}
            >
              Start typing to search...
            </div>
          )}

          {query.trim() && hasSearched && results.length === 0 && (
            <div
              className="px-4 py-8 text-center text-sm"
              style={{ color: colors.placeholder }}
            >
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}

          {results.map((result) => (
            <a
              key={result.slug}
              href={`/docs/${result.slug}`}
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-4 py-3 transition-colors"
              style={{ ["--hover-bg" as string]: colors.resultHover }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = colors.resultHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <div className="font-medium" style={{ color: colors.titleText }}>
                {result.title}
              </div>
              {result.description && (
                <div
                  className="mt-0.5 text-sm line-clamp-1"
                  style={{ color: colors.descText }}
                >
                  {result.description}
                </div>
              )}
            </a>
          ))}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-2.5 text-xs"
          style={{
            borderTop: `1px solid ${colors.divider}`,
            color: colors.hintText,
          }}
        >
          <span>
            <kbd
              className="rounded px-1.5 py-0.5 font-mono text-[10px]"
              style={{
                backgroundColor: colors.kbdBg,
                border: `1px solid ${colors.kbdBorder}`,
                color: colors.kbdText,
              }}
            >
              ESC
            </kbd>{" "}
            to close
          </span>
          <span>
            <kbd
              className="rounded px-1.5 py-0.5 font-mono text-[10px]"
              style={{
                backgroundColor: colors.kbdBg,
                border: `1px solid ${colors.kbdBorder}`,
                color: colors.kbdText,
              }}
            >
              ↵
            </kbd>{" "}
            to select
          </span>
        </div>
      </div>
    </div>
  );
}
