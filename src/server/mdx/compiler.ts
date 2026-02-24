/**
 * MDX Compilation Pipeline
 *
 * Build script that compiles all MDX content files into cached JS and JSON
 * artifacts. Run via `bun run build:content` (i.e., `bun src/server/mdx/compiler.ts`).
 *
 * For each MDX file found under content/<version>/docs/, it:
 *   1. Extracts frontmatter with gray-matter
 *   2. Compiles the MDX to function-body format using @mdx-js/mdx
 *   3. Extracts headings (h2, h3) for table-of-contents generation
 *   4. Strips markdown syntax to produce plain text for search indexing
 *   5. Writes compiled JS and metadata JSON to .cache/content/
 *   6. Writes a manifest and per-version search index to .cache/
 */

import { compile } from "@mdx-js/mdx";
import matter from "gray-matter";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeShiki from "@shikijs/rehype";
import { mkdir } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import { Glob } from "bun";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Heading = {
  id: string;
  text: string;
  level: number;
};

type ManifestEntry = {
  slug: string[];
  title: string;
  description: string;
};

type Manifest = Record<string, ManifestEntry[]>;

type SearchEntry = {
  slug: string;
  title: string;
  description: string;
  content: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a file path like `content/v1/docs/getting-started/installation.mdx`
 *  into { version: "v1", slug: ["getting-started", "installation"] }. */
function parseFilePath(filePath: string): { version: string; slug: string[] } {
  // Normalise to forward slashes and make relative to content/
  const rel = relative("content", filePath).split(sep).join("/");
  // rel looks like "v1/docs/getting-started/installation.mdx"
  const parts = rel.replace(/\.mdx$/, "").split("/");
  const version = parts[0]; // "v1"
  // Skip the "docs" segment (parts[1]) -- the rest is the slug
  const slug = parts.slice(2);
  return { version, slug };
}

/** Extract h2 and h3 headings from raw markdown content. */
function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    // Generate an id the same way rehype-slug would (lowercase, hyphenated)
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    headings.push({ id, text, level });
  }
  return headings;
}

/** Strip markdown syntax to produce plain text for search indexing. */
function stripMarkdown(markdown: string): string {
  return (
    markdown
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, "")
      // Remove inline code
      .replace(/`[^`]+`/g, "")
      // Remove headings markers
      .replace(/^#{1,6}\s+/gm, "")
      // Remove bold/italic markers
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
      .replace(/_{1,3}([^_]+)_{1,3}/g, "$1")
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Remove images
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
      // Remove horizontal rules
      .replace(/^[-*_]{3,}\s*$/gm, "")
      // Remove HTML tags
      .replace(/<[^>]+>/g, "")
      // Remove list markers
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      // Collapse whitespace
      .replace(/\n{2,}/g, "\n")
      .trim()
  );
}

// ---------------------------------------------------------------------------
// Main compilation pipeline
// ---------------------------------------------------------------------------

async function compileAll() {
  console.log("MDX Compilation Pipeline");
  console.log("========================\n");

  const glob = new Glob("content/**/docs/**/*.mdx");
  const files: string[] = [];

  for await (const file of glob.scan({ cwd: ".", absolute: false })) {
    files.push(file);
  }

  if (files.length === 0) {
    console.log("No MDX files found. Nothing to compile.");
    return;
  }

  console.log(`Found ${files.length} MDX file(s).\n`);

  const manifest: Manifest = {};
  const searchData: Record<string, SearchEntry[]> = {};

  let shikiPluginFailed = false;

  for (const filePath of files) {
    const { version, slug } = parseFilePath(filePath);
    const slugPath = slug.join("/");
    console.log(`Compiling: ${filePath} -> ${version}/docs/${slugPath}`);

    // 1. Read file and extract frontmatter
    const raw = await Bun.file(filePath).text();
    const { data: frontmatter, content } = matter(raw);

    // 2. Compile MDX
    let compiledCode: string;
    try {
      const rehypePlugins: import("unified").PluggableList = [rehypeSlug, rehypeAutolinkHeadings];

      // Try with shiki first; fall back without it if it fails
      if (!shikiPluginFailed) {
        rehypePlugins.push([rehypeShiki, { theme: "github-dark" }]);
      }

      const compiled = await compile(content, {
        outputFormat: "function-body",
        remarkPlugins: [remarkGfm],
        rehypePlugins,
      });
      compiledCode = String(compiled);
    } catch (err) {
      if (!shikiPluginFailed) {
        // Retry without shiki
        console.warn(
          `  Warning: Shiki plugin failed, retrying without syntax highlighting...`
        );
        shikiPluginFailed = true;
        const compiled = await compile(content, {
          outputFormat: "function-body",
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
        });
        compiledCode = String(compiled);
      } else {
        throw err;
      }
    }

    // 3. Extract headings
    const headings = extractHeadings(content);

    // 4. Extract plain text for search
    const plainText = stripMarkdown(content);

    // 5. Ensure output directories exist
    const jsOutPath = join(".cache", "content", version, "docs", `${slugPath}.js`);
    const jsonOutPath = join(".cache", "content", version, "docs", `${slugPath}.json`);
    await mkdir(dirname(jsOutPath), { recursive: true });

    // 6. Write compiled JS
    await Bun.write(jsOutPath, compiledCode);

    // 7. Write metadata JSON
    await Bun.write(
      jsonOutPath,
      JSON.stringify({ frontmatter, headings, plainText }, null, 2)
    );

    console.log(`  -> ${jsOutPath}`);
    console.log(`  -> ${jsonOutPath}`);

    // 8. Accumulate manifest entry
    if (!manifest[version]) manifest[version] = [];
    manifest[version].push({
      slug,
      title: (frontmatter.title as string) || slugPath,
      description: (frontmatter.description as string) || "",
    });

    // 9. Accumulate search entry
    if (!searchData[version]) searchData[version] = [];
    searchData[version].push({
      slug: slugPath,
      title: (frontmatter.title as string) || slugPath,
      description: (frontmatter.description as string) || "",
      content: plainText,
    });
  }

  // Write manifest
  const manifestPath = join(".cache", "manifest.json");
  await mkdir(dirname(manifestPath), { recursive: true });
  await Bun.write(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest -> ${manifestPath}`);

  // Write search data (one file per version)
  for (const [version, entries] of Object.entries(searchData)) {
    const searchDir = join(".cache", "search");
    await mkdir(searchDir, { recursive: true });
    const searchPath = join(searchDir, `${version}.json`);
    await Bun.write(searchPath, JSON.stringify(entries, null, 2));
    console.log(`Search index -> ${searchPath}`);
  }

  console.log("\nDone! All content compiled successfully.");
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

if (import.meta.main) {
  compileAll().catch((err) => {
    console.error("Compilation failed:", err);
    process.exit(1);
  });
}

export { compileAll, parseFilePath, extractHeadings, stripMarkdown };
