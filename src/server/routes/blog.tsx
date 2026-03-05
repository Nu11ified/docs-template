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
