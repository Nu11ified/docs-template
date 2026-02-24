import { useState, useEffect, useRef, useCallback } from "react";

type SearchResult = {
  slug: string;
  title: string;
  description: string;
};

type SearchProps = {
  version?: string;
};

export function Search({ version }: SearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K to open, Escape to close
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

  // Auto-focus the input when the modal opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the modal is rendered
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    } else {
      // Reset state when closing
      setQuery("");
      setResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  // Debounced fetch
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

  // Close when clicking the backdrop
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setIsOpen(false);
      }
    },
    [],
  );

  // Basic focus trap: keep focus inside the modal
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

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[15vh]"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Search documentation"
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg rounded-lg border border-[var(--color-surface)] bg-[var(--color-background)] shadow-2xl"
      >
        {/* Search input */}
        <div className="border-b border-[var(--color-surface)] p-4">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search..."
            aria-label="Search documentation"
            className="w-full bg-transparent text-lg text-[var(--color-text)] outline-none placeholder:text-[var(--color-text)]/50"
          />
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {!query.trim() && (
            <div className="px-4 py-8 text-center text-sm text-[var(--color-text)]/60">
              Type to search...
            </div>
          )}

          {query.trim() && hasSearched && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-[var(--color-text)]/60">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}

          {results.map((result) => (
            <a
              key={result.slug}
              href={`/docs/${result.slug}`}
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-4 py-3 hover:bg-[var(--color-surface)] transition-colors"
            >
              <div className="font-medium text-[var(--color-text)]">
                {result.title}
              </div>
              {result.description && (
                <div className="mt-0.5 text-sm text-[var(--color-text)]/70 line-clamp-1">
                  {result.description}
                </div>
              )}
            </a>
          ))}
        </div>

        {/* Footer hint */}
        <div className="border-t border-[var(--color-surface)] px-4 py-2 text-xs text-[var(--color-text)]/50">
          <kbd className="rounded border border-[var(--color-surface)] px-1.5 py-0.5 font-mono text-[10px]">
            ESC
          </kbd>{" "}
          to close
        </div>
      </div>
    </div>
  );
}
