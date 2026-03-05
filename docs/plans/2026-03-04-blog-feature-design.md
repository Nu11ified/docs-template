# Blog Feature Design

## Overview

Add a modern blog to the docs-template project, extending the existing MDX pipeline. The blog supports multiple authors with profiles, large cover images, tag-based filtering, and a responsive card grid listing page.

## Approach

Extend the existing MDX compilation pipeline (Approach A). Blog posts are MDX files in `content/blog/`, compiled through the same system as docs with richer frontmatter. No external dependencies or separate pipelines.

## Content Structure

Blog posts live in `content/blog/` as MDX files:

```
content/
  blog/
    meta.json              # Blog-level config (categories list)
    hello-world.mdx
    building-v2.mdx
    images/
      hello-world-cover.jpg
```

Post frontmatter:

```yaml
---
title: "Building V2: What Changed"
description: "A deep dive into our V2 architecture decisions"
date: 2026-03-01
author: jane-doe
coverImage: /blog/images/building-v2-cover.jpg
tags: [engineering, architecture]
featured: true
draft: false
---
```

Authors defined in `site.yaml` under `blog.authors`:

```yaml
blog:
  enabled: true
  title: "Blog"
  description: "Latest updates and articles"
  postsPerPage: 12
  authors:
    jane-doe:
      name: Jane Doe
      avatar: /assets/authors/jane.jpg
      bio: "Lead engineer. Loves Bun and TypeScript."
      links:
        twitter: https://twitter.com/janedoe
        github: https://github.com/janedoe
```

## Routes

| Route | Page | Description |
|---|---|---|
| `/blog` | Blog listing | Cards grid with tag filtering, featured post pinned |
| `/blog/:slug` | Blog post | Full post with cover image, author card, content |

## Blog Listing Page (`/blog`)

- Header with title and optional subtitle
- Featured post as a large hero card at top
- Responsive card grid (2-col md, 3-col lg)
- Each card: cover image, title, description, date, author avatar+name, tags
- Tag filter bar to filter posts by tag
- Posts sorted by date (newest first), drafts excluded in production

## Blog Post Page (`/blog/:slug`)

- Large cover image at top (contained within content width, ~720px max)
- Title, date, reading time, tags below image
- Author card: avatar, name, bio, social links
- MDX content with same prose styling as docs
- "Back to blog" link
- Prev/next post navigation at bottom

## New Files

| File | Purpose |
|---|---|
| `src/server/routes/blog.tsx` | ElysiaJS route handlers |
| `src/shared/layouts/BlogLayout.tsx` | Single post layout |
| `src/shared/layouts/BlogListingLayout.tsx` | Cards grid with filtering |
| `src/shared/blog/PostCard.tsx` | Blog post card component |
| `src/shared/blog/AuthorCard.tsx` | Author profile component |
| `src/shared/blog/TagFilter.tsx` | Tag filter bar (server) |
| `src/client/components/TagFilter.tsx` | Tag filter client island |

## Modified Files

| File | Changes |
|---|---|
| `src/server/index.ts` | Register blog routes |
| `src/server/mdx/compiler.ts` | Compile blog MDX files |
| `src/shared/types.ts` | Zod schemas for blog frontmatter & authors |
| `src/client/entry.tsx` | Register TagFilter island |
| `site.yaml` | Add blog config section |

## Architecture

- Only `TagFilter` needs client-side hydration (island architecture preserved)
- Blog metadata included in `.cache/manifest.json`
- Compiled blog content cached at `.cache/content/blog/`
- Search index can optionally include blog posts
- Same CSS variable theme system applies to blog pages
