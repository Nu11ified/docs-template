// src/shared/blog/AuthorCard.tsx
import type { BlogAuthor } from "../types";

interface AuthorCardProps {
  author: BlogAuthor;
}

export function AuthorCard({ author }: AuthorCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-[var(--site-text)]/10 bg-[var(--site-surface)] p-5">
      {author.avatar && (
        <img
          src={author.avatar}
          alt={author.name}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-[var(--site-primary)]/20"
        />
      )}
      <div className="min-w-0">
        <p className="font-semibold text-[var(--site-text)] font-[var(--site-font-heading)]">
          {author.name}
        </p>
        {author.bio && (
          <p className="mt-0.5 text-sm text-[var(--site-text)]/60 leading-relaxed">
            {author.bio}
          </p>
        )}
        {author.links && (
          <div className="mt-2 flex items-center gap-3">
            {author.links.twitter && (
              <a
                href={author.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--site-primary)] hover:underline"
              >
                Twitter
              </a>
            )}
            {author.links.github && (
              <a
                href={author.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--site-primary)] hover:underline"
              >
                GitHub
              </a>
            )}
            {author.links.website && (
              <a
                href={author.links.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--site-primary)] hover:underline"
              >
                Website
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
