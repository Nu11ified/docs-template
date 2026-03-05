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
              props={{ tags: allTags } as TagFilterProps}
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
