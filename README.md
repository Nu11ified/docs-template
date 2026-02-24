# docs-template

A lightweight, fast documentation site template built on **Bun + ElysiaJS + React**.

YAML-configurable landing page, full-featured docs with MDX, server-side search, versioning, and dark mode — all in a single, minimal stack.

## Quick Start

```bash
bunx degit org/docs-template my-docs
cd my-docs
bun install
bun run build
bun run dev
```

Open http://localhost:3000

## Customization

Edit `site.yaml` to configure everything:

- **Site metadata** — name, tagline, logo, favicon, URLs
- **Theme** — colors (primary, secondary, background, surface, text), fonts, border radius, dark mode
- **Landing page** — ordered sections (hero, features, CTA, testimonials) with full content control
- **Docs** — default version, version list, search settings, sidebar/TOC behavior
- **Navigation** — top nav links with external link support

## Adding Documentation

Drop MDX files into `content/{version}/docs/`:

```
content/
  v1/
    docs/
      meta.json          # Page ordering
      index.mdx           # Root doc page
      getting-started/
        meta.json
        installation.mdx
  v2/
    docs/
      ...
```

Each `meta.json` defines page order:
```json
{
  "title": "Getting Started",
  "pages": ["installation", "configuration"]
}
```

Rebuild after adding content: `bun run build:content`

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start dev server with hot reload |
| `bun run start` | Start production server |
| `bun run build` | Build everything (content + client + CSS) |
| `bun run build:content` | Compile MDX + build search index |
| `bun run build:client` | Bundle client-side JavaScript |
| `bun run build:css` | Compile Tailwind CSS |

## Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **Server**: [ElysiaJS](https://elysiajs.com)
- **UI**: React 19 (SSR with selective hydration)
- **Styling**: Tailwind CSS 4
- **Content**: MDX with remark/rehype plugins
- **Syntax Highlighting**: Shiki
- **Search**: FlexSearch (server-side)
- **Config**: YAML + Zod validation

## Project Structure

```
src/
  server/           # ElysiaJS server + routes
    routes/         # Landing, docs, API endpoints
    mdx/            # MDX compiler + runtime loader
    search/         # FlexSearch indexing
  client/           # Client-side hydration
    components/     # Interactive components (Search, Sidebar, TOC, etc.)
  shared/           # Components used by both server and client
    layouts/        # Page layouts (Landing, Docs)
    landing/        # Landing page section components
    components/     # Shared UI (Nav)
content/            # MDX documentation files (versioned)
public/             # Static assets
site.yaml           # Site configuration
```

## License

MIT
