import { Elysia } from "elysia";
import { renderToReadableStream } from "react-dom/server";
import { loadConfig } from "../config";
import { Shell } from "../../shared/Shell";
import { DocsLayout } from "../../shared/layouts/DocsLayout";
import { getPage, getPages, loadManifest } from "../mdx/loader";
import type { SidebarItem } from "../../client/components/Sidebar";

// ---------------------------------------------------------------------------
// Sidebar tree builder
// ---------------------------------------------------------------------------

/**
 * Build a sidebar tree from the manifest and meta.json files for a given
 * version. The meta.json files define page ordering and folder titles;
 * the manifest provides slugs/titles for each compiled page.
 */
async function buildSidebarTree(version: string): Promise<SidebarItem[]> {
  const entries = await getPages(version);
  const config = loadConfig();

  // Build a lookup from slug string to title
  const titleMap = new Map<string, string>();
  for (const entry of entries) {
    titleMap.set(entry.slug.join("/"), entry.title);
  }

  // Read meta.json files to determine ordering
  async function readMeta(
    dirPath: string
  ): Promise<{ title?: string; pages?: string[] } | null> {
    try {
      const file = Bun.file(`content/${version}/docs/${dirPath}meta.json`);
      return (await file.json()) as { title?: string; pages?: string[] };
    } catch {
      return null;
    }
  }

  // Recursively build the tree from a directory
  async function buildLevel(prefix: string): Promise<SidebarItem[]> {
    const meta = await readMeta(prefix);
    if (!meta || !meta.pages) return [];

    const items: SidebarItem[] = [];

    for (const page of meta.pages) {
      const slugPath = prefix ? `${prefix}${page}` : page;

      // Check if this is a folder (has its own meta.json)
      const subMeta = await readMeta(`${slugPath}/`);

      if (subMeta) {
        // It's a folder with children
        const children = await buildLevel(`${slugPath}/`);
        items.push({
          title: subMeta.title || page,
          children,
        });
      } else {
        // It's a leaf page
        const title = titleMap.get(slugPath) || page;
        items.push({
          title,
          href: slugPath === "index" ? "/docs" : `/docs/${slugPath}`,
        });
      }
    }

    return items;
  }

  return buildLevel("");
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

export const docsRoutes = new Elysia()
  // Docs index (no wildcard) - render default version index
  .get("/docs", async () => {
    const config = loadConfig();
    const version = config.docs.defaultVersion;

    const page = await getPage(version, ["index"]);
    if (!page) {
      return new Response("Page not found", { status: 404 });
    }

    const { Component, data } = page;
    const sidebarItems = await buildSidebarTree(version);
    const collapsible = config.docs.sidebar?.collapsible ?? true;

    const sidebarProps = {
      items: sidebarItems,
      currentPath: "/docs",
      collapsible,
    };

    const tocProps = {
      headings: data.headings,
    };

    const stream = await renderToReadableStream(
      <Shell
        title={`${data.frontmatter.title} - ${config.site.name}`}
        config={config}
      >
        <DocsLayout
          sidebar={sidebarProps}
          toc={tocProps}
          config={config}
          currentVersion={version}
        >
          <Component />
        </DocsLayout>
      </Shell>
    );

    return new Response(stream, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  })
  // Docs wildcard - version detection + slug routing
  .get("/docs/*", async ({ params }) => {
    const config = loadConfig();
    const wildcard = params["*"] || "";
    const segments = wildcard.split("/").filter(Boolean);

    // Determine version: check if first segment matches a known version path
    const knownVersionPaths = config.docs.versions.map((v) => v.path);
    let version: string;
    let slugParts: string[];

    if (segments.length > 0 && knownVersionPaths.includes(segments[0])) {
      version = segments[0];
      slugParts = segments.slice(1);
    } else {
      version = config.docs.defaultVersion;
      slugParts = segments;
    }

    // Default to index if empty
    if (slugParts.length === 0) {
      slugParts = ["index"];
    }

    const page = await getPage(version, slugParts);
    if (!page) {
      return new Response("Page not found", { status: 404 });
    }

    const { Component, data } = page;
    const sidebarItems = await buildSidebarTree(version);
    const collapsible = config.docs.sidebar?.collapsible ?? true;

    // Build the current path for sidebar highlighting
    const slugJoined = slugParts.join("/");
    const currentPath = slugJoined === "index" ? "/docs" : `/docs/${slugJoined}`;

    const sidebarProps = {
      items: sidebarItems,
      currentPath,
      collapsible,
    };

    const tocProps = {
      headings: data.headings,
    };

    const stream = await renderToReadableStream(
      <Shell
        title={`${data.frontmatter.title} - ${config.site.name}`}
        config={config}
      >
        <DocsLayout
          sidebar={sidebarProps}
          toc={tocProps}
          config={config}
          currentVersion={version}
        >
          <Component />
        </DocsLayout>
      </Shell>
    );

    return new Response(stream, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  });
