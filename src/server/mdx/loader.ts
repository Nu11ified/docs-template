/**
 * Content Loader
 *
 * Runtime module used by the server to load compiled MDX content from the
 * .cache/ directory produced by the compiler (compiler.ts).
 *
 * Provides:
 *   - loadManifest()  -- returns the full content manifest
 *   - getPage()       -- loads a single page (component + metadata)
 *   - getPages()      -- lists all pages for a given version
 */

import { run } from "@mdx-js/mdx";
import type { ComponentType } from "react";
import * as runtime from "react/jsx-runtime";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The React component returned by MDX compilation. */
export type MDXComponent = ComponentType<Record<string, unknown>>;

/** Metadata extracted from an MDX page during compilation. */
export type PageData = {
  frontmatter: Record<string, unknown>;
  headings: Array<{ id: string; text: string; level: number }>;
  plainText?: string;
};

export type ManifestEntry = {
  slug: string[];
  title: string;
  description: string;
};

export type Manifest = Record<string, ManifestEntry[]>;

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

let manifest: Manifest | null = null;
const pageCache = new Map<string, { Component: MDXComponent; data: PageData }>();

type BlogManifestEntry = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  coverImage?: string;
  tags: string[];
  featured: boolean;
  draft: boolean;
};

let blogManifest: BlogManifestEntry[] | null = null;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Load (and cache) the content manifest from .cache/manifest.json. */
export async function loadManifest(): Promise<Manifest> {
  if (manifest) return manifest;
  manifest = (await Bun.file(".cache/manifest.json").json()) as Manifest;
  return manifest!;
}

/** Load a single documentation page by version and slug parts.
 *  Returns the React component and associated page data, or null if not found. */
export async function getPage(
  version: string,
  slugParts: string[]
): Promise<{ Component: MDXComponent; data: PageData } | null> {
  const slug = slugParts.join("/") || "index";
  const cacheKey = `${version}/${slug}`;

  if (pageCache.has(cacheKey)) return pageCache.get(cacheKey)!;

  const codePath = `.cache/content/${version}/docs/${slug}.js`;
  const dataPath = `.cache/content/${version}/docs/${slug}.json`;

  try {
    const [code, data] = await Promise.all([
      Bun.file(codePath).text(),
      Bun.file(dataPath).json() as Promise<PageData>,
    ]);

    const mod = await run(code, {
      ...(runtime as unknown as Parameters<typeof run>[1]),
      baseUrl: import.meta.url,
    });
    const result = { Component: mod.default, data };
    pageCache.set(cacheKey, result);
    return result;
  } catch {
    return null; // Page not found
  }
}

/** Get all manifest entries for a given version. */
export async function getPages(version: string): Promise<ManifestEntry[]> {
  const m = await loadManifest();
  return m[version] || [];
}

/** Load (and cache) the blog manifest from .cache/blog-manifest.json. */
export async function loadBlogManifest(): Promise<BlogManifestEntry[]> {
  if (blogManifest) return blogManifest;
  try {
    blogManifest = (await Bun.file(".cache/blog-manifest.json").json()) as BlogManifestEntry[];
  } catch {
    blogManifest = [];
  }
  return blogManifest!;
}

/** Load a single blog post by slug. */
export async function getBlogPost(
  slug: string
): Promise<{ Component: MDXComponent; data: PageData } | null> {
  const cacheKey = `blog/${slug}`;
  if (pageCache.has(cacheKey)) return pageCache.get(cacheKey)!;

  const codePath = `.cache/content/blog/${slug}.js`;
  const dataPath = `.cache/content/blog/${slug}.json`;

  try {
    const [code, data] = await Promise.all([
      Bun.file(codePath).text(),
      Bun.file(dataPath).json() as Promise<PageData>,
    ]);

    const mod = await run(code, {
      ...(runtime as unknown as Parameters<typeof run>[1]),
      baseUrl: import.meta.url,
    });
    const result = { Component: mod.default, data };
    pageCache.set(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}

/** Get all blog posts, optionally filtering out drafts. */
export async function getBlogPosts(includeDrafts = false): Promise<BlogManifestEntry[]> {
  const entries = await loadBlogManifest();
  if (includeDrafts) return entries;
  return entries.filter((e) => !e.draft);
}

export type { BlogManifestEntry };