// src/shared/layouts/BlogLayout.tsx
import type { ReactNode } from "react";
import type { FullConfig, BlogAuthor } from "../types";
import { AuthorCard } from "../blog/AuthorCard";
import { Nav } from "../components/Nav";

interface BlogLayoutProps {
  config: FullConfig;
  title: string;
  description: string;
  date: string;
  coverImage?: string;
  tags: string[];
  author: BlogAuthor;
  readingTime: number;
  prevPost?: { slug: string; title: string } | null;
  nextPost?: { slug: string; title: string } | null;
  children: ReactNode;
}

export function BlogLayout({
  config,
  title,
  description,
  date,
  coverImage,
  tags,
  author,
  readingTime,
  prevPost,
  nextPost,
  children,
}: BlogLayoutProps) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Nav config={config} />

      <article className="mx-auto max-w-3xl px-6 py-12">
        {/* Back link */}
        <a
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--site-primary)] hover:underline mb-8"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to blog
        </a>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
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
        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--site-text)] font-[var(--site-font-heading)] leading-tight">
          {title}
        </h1>

        {/* Meta */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--site-text)]/50">
          <time>{formattedDate}</time>
          <span>&middot;</span>
          <span>{readingTime} min read</span>
        </div>

        {/* Cover Image */}
        {coverImage && (
          <div className="mt-8 overflow-hidden rounded-xl">
            <img
              src={coverImage}
              alt={title}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none mt-10">
          {children}
        </div>

        {/* Author Card */}
        <div className="mt-12 pt-8 border-t border-[var(--site-text)]/10">
          <p className="text-xs uppercase tracking-wider text-[var(--site-text)]/40 mb-3">Written by</p>
          <AuthorCard author={author} />
        </div>

        {/* Prev / Next Navigation */}
        {(prevPost || nextPost) && (
          <nav className="mt-12 pt-8 border-t border-[var(--site-text)]/10 grid grid-cols-2 gap-4">
            {prevPost ? (
              <a
                href={`/blog/${prevPost.slug}`}
                className="group flex flex-col rounded-lg border border-[var(--site-text)]/10 p-4 hover:border-[var(--site-primary)]/30 transition-colors"
              >
                <span className="text-xs text-[var(--site-text)]/40 mb-1">&larr; Previous</span>
                <span className="text-sm font-medium text-[var(--site-text)] group-hover:text-[var(--site-primary)] transition-colors">
                  {prevPost.title}
                </span>
              </a>
            ) : (
              <div />
            )}
            {nextPost ? (
              <a
                href={`/blog/${nextPost.slug}`}
                className="group flex flex-col items-end text-right rounded-lg border border-[var(--site-text)]/10 p-4 hover:border-[var(--site-primary)]/30 transition-colors"
              >
                <span className="text-xs text-[var(--site-text)]/40 mb-1">Next &rarr;</span>
                <span className="text-sm font-medium text-[var(--site-text)] group-hover:text-[var(--site-primary)] transition-colors">
                  {nextPost.title}
                </span>
              </a>
            ) : (
              <div />
            )}
          </nav>
        )}
      </article>
    </>
  );
}
