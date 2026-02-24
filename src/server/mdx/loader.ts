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
import * as runtime from "react/jsx-runtime";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PageData = {
  frontmatter: Record<string, any>;
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
const pageCache = new Map<string, { Component: any; data: PageData }>();

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
): Promise<{ Component: any; data: PageData } | null> {
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
      ...(runtime as any),
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