import { useState } from "react";

export interface TagFilterProps {
  tags: string[];
}

export function TagFilter({ tags }: TagFilterProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  function handleClick(tag: string | null) {
    setActiveTag(tag);

    // Toggle visibility of post cards based on tag
    const cards = document.querySelectorAll<HTMLElement>("[data-blog-tags]");
    cards.forEach((card) => {
      if (tag === null) {
        card.style.display = "";
        return;
      }
      const cardTags = (card.getAttribute("data-blog-tags") || "").split(",");
      card.style.display = cardTags.includes(tag) ? "" : "none";
    });

    // Toggle visibility of the featured post if present
    const featured = document.querySelector<HTMLElement>("[data-blog-featured]");
    if (featured) {
      if (tag === null) {
        featured.style.display = "";
      } else {
        const featuredTags = (featured.getAttribute("data-blog-tags") || "").split(",");
        featured.style.display = featuredTags.includes(tag) ? "" : "none";
      }
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => handleClick(null)}
        className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
          activeTag === null
            ? "bg-[var(--site-primary)] text-white"
            : "bg-[var(--site-text)]/5 text-[var(--site-text)]/60 hover:bg-[var(--site-text)]/10"
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => handleClick(tag)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            activeTag === tag
              ? "bg-[var(--site-primary)] text-white"
              : "bg-[var(--site-text)]/5 text-[var(--site-text)]/60 hover:bg-[var(--site-text)]/10"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
