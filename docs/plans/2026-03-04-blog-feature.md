# Blog Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a modern blog with cover images, multi-author profiles, tag filtering, and a responsive card grid listing page to the docs-template project.

**Architecture:** Extend the existing MDX compilation pipeline to handle blog posts in `content/blog/`. Blog posts use richer frontmatter (coverImage, author, tags, date, featured, draft). New ElysiaJS routes at `/blog` and `/blog/:slug`. A `BlogLayout` and `BlogListingLayout` join the existing layout system. Only the `TagFilter` component needs client-side hydration (island).

**Tech Stack:** Bun, ElysiaJS, React 19 SSR, MDX, Tailwind CSS 4, Zod, lucide-react

---

## Task 1: Add Blog Zod Schemas to types.ts

**Files:**
- Modify: `src/shared/types.ts:220-229`

**Step 1: Add blog author and post schemas after the Nav section (~line 215)**

Add these schemas before the FullConfigSchema:

```typescript
// ---------------------------------------------------------------------------
// Blog configuration
// ---------------------------------------------------------------------------

export const BlogAuthorLinksSchema = z.object({
  twitter: z.string().url().optional(),
  github: z.string().url().optional(),
  website: z.string().url().optional(),
});

export type BlogAuthorLinks = z.infer<typeof BlogAuthorLinksSchema>;

export const BlogAuthorSchema = z.object({
  name: z.string(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  links: BlogAuthorLinksSchema.optional(),
});

export type BlogAuthor = z.infer<typeof BlogAuthorSchema>;

export const BlogConfigSchema = z.object({
  enabled: z.boolean().default(true),
  title: z.string().default("Blog"),
  description: z.string().optional(),
  postsPerPage: z.number().int().min(1).default(12),
  authors: z.record(z.string(), BlogAuthorSchema).default({}),
});

export type BlogConfig = z.infer<typeof BlogConfigSchema>;

export const BlogFrontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  author: z.string(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
});

export type BlogFrontmatter = z.infer<typeof BlogFrontmatterSchema>;
```

**Step 2: Update FullConfigSchema to include blog**

Change the existing `FullConfigSchema` to add blog as optional:

```typescript
export const FullConfigSchema = z.object({
  site: SiteConfigSchema,
  theme: ThemeSchema,
  landing: LandingSchema,
  docs: DocsConfigSchema,
  blog: BlogConfigSchema.optional(),
  nav: NavSchema,
});
```

**Step 3: Verify**

Run: `bun run build:client`
Expected: Builds successfully (TypeScript compilation passes)

**Step 4: Commit**

```bash
git add src/shared/types.ts
git commit -m "feat(blog): add Zod schemas for blog config, authors, and frontmatter"
```

---

## Task 2: Update site.yaml with Blog Config

**Files:**
- Modify: `site.yaml:93-102`

**Step 1: Add blog section before the nav section (before line 96)**

Insert between the `docs:` block and the `nav:` block:

```yaml
# Blog configuration
blog:
  enabled: true
  title: "Blog"
  description: "Latest updates, tutorials, and announcements"
  postsPerPage: 12
  authors:
    team:
      name: "The Team"
      bio: "Building great developer tools."
```

**Step 2: Add Blog nav link**

Update the nav links to include Blog:

```yaml
nav:
  links:
    - label: "Docs"
      href: "/docs"
    - label: "Blog"
      href: "/blog"
    - label: "GitHub"
      href: "https://github.com/Nu11ified/docs-template"
      external: true
```

**Step 3: Verify**

Run: `bun run build:client`
Expected: Builds successfully

**Step 4: Commit**

```bash
git add site.yaml
git commit -m "feat(blog): add blog config and nav link to site.yaml"
```

---

## Task 3: Extend MDX Compiler for Blog Posts

**Files:**
- Modify: `src/server/mdx/compiler.ts:120-256`

The compiler currently only globs `content/**/docs/**/*.mdx`. We need to also compile `content/blog/*.mdx` with a different parsing strategy (no version, no "docs" segment).

**Step 1: Add blog file path parser**

After the existing `parseFilePath` function (~line 66), add:

```typescript
/** Parse a blog file path like `content/blog/hello-world.mdx`
 *  into { slug: "hello-world" }. */
function parseBlogFilePath(filePath: string): { slug: string } {
  const rel = relative("content", filePath).split(sep).join("/");
  // rel looks like "blog/hello-world.mdx"
  const slug = rel.replace(/^blog\//, "").replace(/\.mdx$/, "");
  return { slug };
}
```

**Step 2: Add blog manifest types**

Update the `Manifest` type area (~line 36-42) to include blog:

```typescript
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
```

**Step 3: Add blog compilation to compileAll()**

After the existing docs compilation loop ends (~line 225), before writing the manifest (~line 228), add blog compilation:

```typescript
  // -------------------------------------------------------------------
  // Blog compilation
  // -------------------------------------------------------------------

  const blogGlob = new Glob("content/blog/**/*.mdx");
  const blogFiles: string[] = [];
  for await (const file of blogGlob.scan({ cwd: ".", absolute: false })) {
    blogFiles.push(file);
  }

  const blogManifest: BlogManifestEntry[] = [];

  if (blogFiles.length > 0) {
    console.log(`\nFound ${blogFiles.length} blog post(s).\n`);

    for (const filePath of blogFiles) {
      const { slug } = parseBlogFilePath(filePath);
      console.log(`Compiling blog: ${filePath} -> blog/${slug}`);

      const raw = await Bun.file(filePath).text();
      const { data: frontmatter, content } = matter(raw);

      let compiledCode: string;
      try {
        const rehypePlugins: import("unified").PluggableList = [rehypeSlug, rehypeAutolinkHeadings];
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
          console.warn(`  Warning: Shiki plugin failed for blog post, retrying without...`);
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

      const headings = extractHeadings(content);
      const plainText = stripMarkdown(content);

      const jsOutPath = join(".cache", "content", "blog", `${slug}.js`);
      const jsonOutPath = join(".cache", "content", "blog", `${slug}.json`);
      await mkdir(dirname(jsOutPath), { recursive: true });

      await Bun.write(jsOutPath, compiledCode);
      await Bun.write(
        jsonOutPath,
        JSON.stringify({ frontmatter, headings, plainText }, null, 2)
      );

      console.log(`  -> ${jsOutPath}`);
      console.log(`  -> ${jsonOutPath}`);

      blogManifest.push({
        slug,
        title: (frontmatter.title as string) || slug,
        description: (frontmatter.description as string) || "",
        date: (frontmatter.date as string) || new Date().toISOString(),
        author: (frontmatter.author as string) || "team",
        coverImage: (frontmatter.coverImage as string) || undefined,
        tags: (frontmatter.tags as string[]) || [],
        featured: (frontmatter.featured as boolean) || false,
        draft: (frontmatter.draft as boolean) || false,
      });
    }
  }
```

**Step 4: Write blog manifest alongside docs manifest**

Update the manifest writing section. Change the manifest write to also include blog data:

```typescript
  // Write manifests
  const manifestPath = join(".cache", "manifest.json");
  await mkdir(dirname(manifestPath), { recursive: true });
  await Bun.write(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest -> ${manifestPath}`);

  // Write blog manifest
  if (blogManifest.length > 0) {
    const blogManifestPath = join(".cache", "blog-manifest.json");
    // Sort by date descending
    blogManifest.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    await Bun.write(blogManifestPath, JSON.stringify(blogManifest, null, 2));
    console.log(`Blog manifest -> ${blogManifestPath}`);
  }
```

**Step 5: Update exports**

Update the export line at the bottom:

```typescript
export { compileAll, parseFilePath, parseBlogFilePath, extractHeadings, stripMarkdown };
```

**Step 6: Verify**

Run: `bun run build:content`
Expected: Compiles successfully, prints "Found 0 blog post(s)" or skips if no blog content yet

**Step 7: Commit**

```bash
git add src/server/mdx/compiler.ts
git commit -m "feat(blog): extend MDX compiler to compile blog posts"
```

---

## Task 4: Extend MDX Loader for Blog Content

**Files:**
- Modify: `src/server/mdx/loader.ts`

**Step 1: Add blog manifest types and cache**

After the existing cache variables (~line 44), add:

```typescript
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
```

**Step 2: Add blog loading functions**

After the existing `getPages` function (~line 93), add:

```typescript
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
```

**Step 3: Verify**

Run: `bun run build:client`
Expected: Builds successfully

**Step 4: Commit**

```bash
git add src/server/mdx/loader.ts
git commit -m "feat(blog): add blog manifest loader and post retrieval functions"
```

---

## Task 5: Create Blog Components (AuthorCard, PostCard)

**Files:**
- Create: `src/shared/blog/AuthorCard.tsx`
- Create: `src/shared/blog/PostCard.tsx`

**Step 1: Create AuthorCard component**

```tsx
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
```

**Step 2: Create PostCard component**

```tsx
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
```

**Step 3: Verify**

Run: `bun run build:client`
Expected: Builds successfully

**Step 4: Commit**

```bash
git add src/shared/blog/AuthorCard.tsx src/shared/blog/PostCard.tsx
git commit -m "feat(blog): add AuthorCard and PostCard components"
```

---

## Task 6: Create TagFilter Client Island

**Files:**
- Create: `src/client/components/TagFilter.tsx`
- Modify: `src/client/entry.tsx:1-16`

**Step 1: Create TagFilter component**

This is the only client-side interactive component for the blog. It filters post cards by tag without a page reload.

```tsx
// src/client/components/TagFilter.tsx
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
```

**Step 2: Register TagFilter island in entry.tsx**

Add to `src/client/entry.tsx` after the existing imports and registrations:

```typescript
import { TagFilter } from "./components/TagFilter";

// ...after other registerIsland calls:
registerIsland("TagFilter", TagFilter);
```

**Step 3: Verify**

Run: `bun run build:client`
Expected: Builds successfully, entry.js bundle includes TagFilter

**Step 4: Commit**

```bash
git add src/client/components/TagFilter.tsx src/client/entry.tsx
git commit -m "feat(blog): add TagFilter client island for tag-based filtering"
```

---

## Task 7: Create BlogListingLayout

**Files:**
- Create: `src/shared/layouts/BlogListingLayout.tsx`

**Step 1: Create the layout**

This layout renders the `/blog` page: header, tag filter, featured post hero card, and responsive card grid.

```tsx
// src/shared/layouts/BlogListingLayout.tsx
import type { FullConfig, BlogAuthor } from "../types";
import type { BlogManifestEntry } from "../../server/mdx/loader";
import { PostCard } from "../blog/PostCard";
import { Island } from "../Island";
import { TagFilter, type TagFilterProps } from "../../client/components/TagFilter";
import { Nav } from "../components/Nav";

interface BlogListingLayoutProps {
  config: FullConfig;
  posts: BlogManifestEntry[];
  allTags: string[];
  authors: Record<string, BlogAuthor>;
}

export function BlogListingLayout({
  config,
  posts,
  allTags,
  authors,
}: BlogListingLayoutProps) {
  const blogConfig = config.blog;
  const featured = posts.find((p) => p.featured);
  const regularPosts = posts.filter((p) => p !== featured);

  function resolveAuthor(authorKey: string): BlogAuthor {
    return authors[authorKey] || { name: authorKey };
  }

  return (
    <>
      <Nav config={config} />

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[var(--site-text)] font-[var(--site-font-heading)]">
            {blogConfig?.title || "Blog"}
          </h1>
          {blogConfig?.description && (
            <p className="mt-3 text-lg text-[var(--site-text)]/60 max-w-2xl">
              {blogConfig.description}
            </p>
          )}
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="mb-10">
            <Island
              name="TagFilter"
              component={TagFilter}
              props={{ tags: allTags } satisfies TagFilterProps}
            />
          </div>
        )}

        {/* Featured Post */}
        {featured && (
          <div className="mb-12" data-blog-featured data-blog-tags={featured.tags.join(",")}>
            <a
              href={`/blog/${featured.slug}`}
              className="group grid md:grid-cols-2 gap-6 overflow-hidden rounded-2xl border border-[var(--site-text)]/10 bg-[var(--site-surface)] transition-all hover:border-[var(--site-primary)]/30 hover:shadow-xl hover:shadow-[var(--site-primary)]/5"
            >
              {featured.coverImage && (
                <div className="aspect-[16/9] md:aspect-auto overflow-hidden bg-[var(--site-text)]/5">
                  <img
                    src={featured.coverImage}
                    alt={featured.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex flex-col justify-center p-8">
                <span className="inline-flex items-center self-start rounded-full bg-[var(--site-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--site-primary)] mb-4">
                  Featured
                </span>
                {featured.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {featured.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[var(--site-text)]/5 px-2.5 py-0.5 text-xs text-[var(--site-text)]/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <h2 className="text-2xl font-bold text-[var(--site-text)] font-[var(--site-font-heading)] group-hover:text-[var(--site-primary)] transition-colors leading-tight">
                  {featured.title}
                </h2>
                <p className="mt-3 text-[var(--site-text)]/60 leading-relaxed line-clamp-3">
                  {featured.description}
                </p>
                <div className="mt-5 flex items-center gap-3">
                  {(() => {
                    const a = resolveAuthor(featured.author);
                    return (
                      <>
                        {a.avatar && (
                          <img src={a.avatar} alt={a.name} className="h-7 w-7 rounded-full object-cover" />
                        )}
                        <span className="text-sm font-medium text-[var(--site-text)]/70">{a.name}</span>
                      </>
                    );
                  })()}
                  <span className="text-[var(--site-text)]/30">&middot;</span>
                  <time className="text-sm text-[var(--site-text)]/50">
                    {new Date(featured.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </div>
              </div>
            </a>
          </div>
        )}

        {/* Post Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {regularPosts.map((post) => {
            const author = resolveAuthor(post.author);
            return (
              <div key={post.slug} data-blog-tags={post.tags.join(",")}>
                <PostCard
                  slug={post.slug}
                  title={post.title}
                  description={post.description}
                  date={post.date}
                  coverImage={post.coverImage}
                  authorName={author.name}
                  authorAvatar={author.avatar}
                  tags={post.tags}
                />
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {posts.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg text-[var(--site-text)]/40">No blog posts yet.</p>
          </div>
        )}
      </div>
    </>
  );
}
```

**Step 2: Verify**

Run: `bun run build:client`
Expected: Builds successfully

**Step 3: Commit**

```bash
git add src/shared/layouts/BlogListingLayout.tsx
git commit -m "feat(blog): add BlogListingLayout with featured hero and card grid"
```

---

## Task 8: Create BlogLayout (Single Post)

**Files:**
- Create: `src/shared/layouts/BlogLayout.tsx`

**Step 1: Create the layout**

```tsx
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
```

**Step 2: Verify**

Run: `bun run build:client`
Expected: Builds successfully

**Step 3: Commit**

```bash
git add src/shared/layouts/BlogLayout.tsx
git commit -m "feat(blog): add BlogLayout for single post pages with author card and prev/next"
```

---

## Task 9: Create Blog Routes

**Files:**
- Create: `src/server/routes/blog.tsx`
- Modify: `src/server/index.ts:1-26`

**Step 1: Create blog routes**

```tsx
// src/server/routes/blog.tsx
import { Elysia } from "elysia";
import { renderToReadableStream } from "react-dom/server";
import { loadConfig } from "../config";
import { Shell } from "../../shared/Shell";
import { BlogListingLayout } from "../../shared/layouts/BlogListingLayout";
import { BlogLayout } from "../../shared/layouts/BlogLayout";
import { getBlogPost, getBlogPosts } from "../mdx/loader";
import type { BlogAuthor } from "../../shared/types";

/** Estimate reading time from plain text (avg 200 words/min). */
function estimateReadingTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export const blogRoutes = new Elysia()
  // Blog listing
  .get("/blog", async () => {
    const config = loadConfig();
    if (!config.blog?.enabled) {
      return new Response("Blog is not enabled", { status: 404 });
    }

    const isProduction = Bun.env.NODE_ENV === "production";
    const posts = await getBlogPosts(!isProduction);
    const authors: Record<string, BlogAuthor> = config.blog.authors || {};

    // Collect all unique tags
    const allTags = [...new Set(posts.flatMap((p) => p.tags))].sort();

    const stream = await renderToReadableStream(
      <Shell
        title={`${config.blog.title || "Blog"} - ${config.site.name}`}
        description={config.blog.description}
        config={config}
      >
        <BlogListingLayout
          config={config}
          posts={posts}
          allTags={allTags}
          authors={authors}
        />
      </Shell>
    );

    return new Response(stream, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  })
  // Single blog post
  .get("/blog/:slug", async ({ params }) => {
    const config = loadConfig();
    if (!config.blog?.enabled) {
      return new Response("Blog is not enabled", { status: 404 });
    }

    const { slug } = params;
    const post = await getBlogPost(slug);

    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    const { Component, data } = post;
    const frontmatter = data.frontmatter as Record<string, unknown>;

    // Resolve author
    const authorKey = (frontmatter.author as string) || "team";
    const authors: Record<string, BlogAuthor> = config.blog.authors || {};
    const author: BlogAuthor = authors[authorKey] || { name: authorKey };

    // Reading time
    const readingTime = estimateReadingTime(data.plainText || "");

    // Prev/Next
    const isProduction = Bun.env.NODE_ENV === "production";
    const allPosts = await getBlogPosts(!isProduction);
    const currentIndex = allPosts.findIndex((p) => p.slug === slug);
    const prevPost = currentIndex < allPosts.length - 1
      ? { slug: allPosts[currentIndex + 1].slug, title: allPosts[currentIndex + 1].title }
      : null;
    const nextPost = currentIndex > 0
      ? { slug: allPosts[currentIndex - 1].slug, title: allPosts[currentIndex - 1].title }
      : null;

    const stream = await renderToReadableStream(
      <Shell
        title={`${frontmatter.title} - ${config.site.name}`}
        description={frontmatter.description as string}
        config={config}
      >
        <BlogLayout
          config={config}
          title={frontmatter.title as string}
          description={frontmatter.description as string}
          date={String(frontmatter.date)}
          coverImage={frontmatter.coverImage as string | undefined}
          tags={(frontmatter.tags as string[]) || []}
          author={author}
          readingTime={readingTime}
          prevPost={prevPost}
          nextPost={nextPost}
        >
          <Component />
        </BlogLayout>
      </Shell>
    );

    return new Response(stream, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  });
```

**Step 2: Register blog routes in server index**

In `src/server/index.ts`, add the blog route import and usage:

Add import after line 5:
```typescript
import { blogRoutes } from "./routes/blog";
```

Add `.use(blogRoutes)` after `.use(docsRoutes)` on line 22:
```typescript
.use(blogRoutes)
```

**Step 3: Verify**

Run: `bun run build:client && bun run build:content`
Expected: Builds successfully

**Step 4: Commit**

```bash
git add src/server/routes/blog.tsx src/server/index.ts
git commit -m "feat(blog): add blog listing and single post routes"
```

---

## Task 10: Serve Blog Images via Static Plugin

**Files:**
- Modify: `src/server/index.ts`

The blog images live in `content/blog/images/`. We need to serve them at `/blog/images/`.

**Step 1: Add static route for blog images**

After the existing `staticPlugin` usage on line 20, add another static plugin for blog content images:

```typescript
.use(staticPlugin({ prefix: "/blog/images", assets: "content/blog/images", noCache: Bun.env.NODE_ENV !== "production" }))
```

**Step 2: Create the images directory**

```bash
mkdir -p content/blog/images
```

**Step 3: Verify**

Run: `bun src/server/index.ts`
Expected: Server starts without errors

**Step 4: Commit**

```bash
git add src/server/index.ts content/blog/images/.gitkeep
git commit -m "feat(blog): serve blog images from content/blog/images/"
```

---

## Task 11: Create Sample Blog Posts

**Files:**
- Create: `content/blog/welcome.mdx`
- Create: `content/blog/building-with-bun.mdx`

**Step 1: Create first blog post**

```mdx
---
title: "Welcome to Our Blog"
description: "Introducing the blog — a place for updates, tutorials, and deep dives into what we're building."
date: 2026-03-01
author: team
coverImage: https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80
tags: [announcements]
featured: true
draft: false
---

## Hello, world!

We're excited to launch our blog. This is where we'll share product updates, engineering deep dives, tutorials, and more.

### What to expect

- **Product updates** — New features, improvements, and what's coming next.
- **Tutorials** — Step-by-step guides to help you get the most out of our tools.
- **Engineering deep dives** — How we build things under the hood.

Stay tuned for more posts. We have a lot planned.
```

**Step 2: Create second blog post**

```mdx
---
title: "Why We Chose Bun"
description: "A look at why Bun is the perfect runtime for our documentation platform — and what it means for performance."
date: 2026-02-20
author: team
coverImage: https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80
tags: [engineering, architecture]
draft: false
---

## The runtime decision

When we set out to build this documentation platform, we had a key decision: which JavaScript runtime should power it?

### Why not Node.js?

Node.js is battle-tested and has a massive ecosystem. But we wanted something faster out of the box — especially for server-side rendering React components.

### Enter Bun

Bun gave us everything we needed:

- **Fast startup** — The server starts in milliseconds, not seconds.
- **Built-in bundler** — No need for webpack, esbuild, or vite as separate tools.
- **TypeScript native** — No transpilation step required.
- **npm compatible** — All our favorite packages just work.

### The results

Our documentation pages render in under 5ms server-side. The entire build (MDX compilation + client bundle + CSS) completes in seconds.

```typescript
// This is all it takes to start the server
const app = new Elysia()
  .use(staticPlugin())
  .use(docsRoutes)
  .listen(3000);
```

Bun was the right call. If you're building a content-heavy site with SSR, give it a try.
```

**Step 3: Build and verify**

Run: `bun run build:content && bun run build:client && bun run build:css`
Expected: Blog posts appear in compilation output, blog-manifest.json created in .cache/

Run: `bun src/server/index.ts`
Then visit `http://localhost:3000/blog` — should see the listing page with both posts.
Visit `http://localhost:3000/blog/welcome` — should see the full post with cover image.

**Step 4: Commit**

```bash
git add content/blog/welcome.mdx content/blog/building-with-bun.mdx
git commit -m "feat(blog): add sample blog posts"
```

---

## Task 12: Final Integration Verification

**Step 1: Full build**

Run: `bun run build`
Expected: All three build steps pass (content, client, css)

**Step 2: Manual smoke test**

Run: `bun run start`

Verify:
- `http://localhost:3000/` — Landing page loads, nav has "Blog" link
- `http://localhost:3000/blog` — Blog listing shows, featured post hero card, regular post cards
- `http://localhost:3000/blog/welcome` — Full post renders with cover image, author card, back link
- `http://localhost:3000/blog/building-with-bun` — Second post renders, prev/next navigation works
- Tag filter: clicking "engineering" filters to only posts with that tag
- Dark mode toggle works on blog pages
- Responsive: blog cards reflow correctly on mobile widths

**Step 3: Commit all remaining changes**

```bash
git add -A
git commit -m "feat(blog): complete blog feature with listing, posts, authors, and tag filtering"
```
