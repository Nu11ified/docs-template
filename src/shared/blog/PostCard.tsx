// src/shared/blog/PostCard.tsx

interface PostCardProps {
  slug: string;
  title: string;
  description: string;
  date: string;
  coverImage?: string;
  authorName: string;
  authorAvatar?: string;
  tags: string[];
}

export function PostCard({
  slug,
  title,
  description,
  date,
  coverImage,
  authorName,
  authorAvatar,
  tags,
}: PostCardProps) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <a
      href={`/blog/${slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-[var(--site-text)]/10 bg-[var(--site-surface)] transition-all hover:border-[var(--site-primary)]/30 hover:shadow-lg hover:shadow-[var(--site-primary)]/5"
    >
      {/* Cover Image */}
      {coverImage && (
        <div className="aspect-[16/9] overflow-hidden bg-[var(--site-text)]/5">
          <img
            src={coverImage}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-[var(--site-primary)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--site-primary)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-semibold text-[var(--site-text)] font-[var(--site-font-heading)] group-hover:text-[var(--site-primary)] transition-colors leading-snug">
          {title}
        </h3>

        {/* Description */}
        <p className="mt-2 flex-1 text-sm text-[var(--site-text)]/60 leading-relaxed line-clamp-2">
          {description}
        </p>

        {/* Footer: Author + Date */}
        <div className="mt-4 flex items-center gap-3 pt-4 border-t border-[var(--site-text)]/5">
          {authorAvatar && (
            <img
              src={authorAvatar}
              alt={authorName}
              className="h-6 w-6 rounded-full object-cover"
            />
          )}
          <span className="text-sm font-medium text-[var(--site-text)]/70">
            {authorName}
          </span>
          <span className="text-[var(--site-text)]/30">&middot;</span>
          <time className="text-sm text-[var(--site-text)]/50">{formattedDate}</time>
        </div>
      </div>
    </a>
  );
}
