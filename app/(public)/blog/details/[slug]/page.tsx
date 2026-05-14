"use client";

import DOMPurify from "dompurify";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBookOpen,
  FaCalendarAlt,
  FaClock,
  FaList,
  FaRegNewspaper,
  FaTags,
  FaUser,
} from "react-icons/fa";

import { getAllBlogs, getBlogsDetails } from "@/apis/frontend/blog.api";
import ContentLoader from "@/components/loader/ContentLoader";
import {
  estimateBlogReadTime,
  formatBlogPublishDate,
  getBlogAuthorName,
  getBlogCategoryLabel,
  getBlogExcerpt,
  getBlogImage,
  getBlogTags,
  prepareBlogContent,
} from "@/helper/blog/public";
import type { Blog, Blogs, TableOfContentsItem } from "@/types/blog";

const pageShellClass =
  "min-h-screen bg-gradient-to-br from-opsh-background via-opsh-white-pure to-opsh-grey-light";
const cardClass =
  "rounded-opsh-xl border border-opsh-grey bg-white/95 shadow-opsh-sm backdrop-blur-sm";

const blogContentClasses = `
  [&_h1]:mt-10 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:leading-tight [&_h1]:text-opsh-black
  [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:text-opsh-primary
  [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-opsh-black
  [&_h4]:mt-5 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-opsh-black
  [&_p]:mt-4 [&_p]:text-base [&_p]:leading-8 [&_p]:text-opsh-text-dark
  [&_strong]:font-semibold [&_strong]:text-opsh-black
  [&_a]:font-medium [&_a]:text-opsh-secondary [&_a]:underline-offset-4 hover:[&_a]:text-opsh-primary hover:[&_a]:underline
  [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:text-opsh-text-dark
  [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_ol]:text-opsh-text-dark
  [&_li]:pl-1 [&_li]:leading-7
  [&_blockquote]:mt-6 [&_blockquote]:rounded-r-opsh-lg [&_blockquote]:border-l-4 [&_blockquote]:border-opsh-secondary [&_blockquote]:bg-opsh-background [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:italic [&_blockquote]:text-opsh-darkgrey
  [&_img]:mt-6 [&_img]:rounded-opsh-xl [&_img]:border [&_img]:border-opsh-grey [&_img]:shadow-opsh-md
  [&_hr]:my-8 [&_hr]:border-opsh-grey
  [&_table]:mt-6 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-opsh-lg
  [&_th]:border [&_th]:border-opsh-grey [&_th]:bg-opsh-background [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:text-sm [&_th]:font-semibold [&_th]:text-opsh-black
  [&_td]:border [&_td]:border-opsh-grey [&_td]:px-4 [&_td]:py-3 [&_td]:text-sm [&_td]:text-opsh-text-dark
  [&_code]:rounded [&_code]:bg-opsh-background-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:text-opsh-secondary
  [&_pre]:mt-6 [&_pre]:overflow-x-auto [&_pre]:rounded-opsh-lg [&_pre]:bg-opsh-black-dark [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-white
`;

function TableOfContentsCard({
  toc,
  activeId,
  onItemClick,
}: {
  toc: TableOfContentsItem[];
  activeId: string;
  onItemClick: (id: string) => void;
}) {
  const renderItems = (items: TableOfContentsItem[], depth = 0) => (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onItemClick(item.id)}
            className={`flex w-full items-center gap-2 rounded-opsh-md px-3 py-2 text-left text-xxs transition-colors ${activeId === item.id
              ? "bg-opsh-primary/10 font-semibold text-opsh-primary"
              : "text-opsh-text-dark hover:bg-opsh-background-muted hover:text-opsh-black"
              }`}
            style={{ paddingLeft: `${depth * 14 + 12}px` }}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${activeId === item.id ? "bg-opsh-primary" : "bg-opsh-grey-dark"
                }`}
            />
            <span className="line-clamp-2">{item.text}</span>
          </button>
          {item.children.length > 0 ? renderItems(item.children, depth + 1) : null}
        </li>
      ))}
    </ul>
  );

  return (
    <section className={`${cardClass} p-5`}>
      <div className="flex items-center gap-3">
        <div className="rounded-opsh-md bg-opsh-primary p-3 text-opsh-white">
          <FaList />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-opsh-primary">Article Navigator</h2>
          <p className="text-sm text-opsh-muted">Jump between sections.</p>
        </div>
      </div>

      <div className="mt-5 max-h-[420px] overflow-y-auto pr-1">
        {renderItems(toc)}
      </div>
    </section>
  );
}

function BlogMetaSummary({ blog }: { blog: Blogs }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
      <span className="inline-flex items-center gap-2">
        <FaUser className="text-xs" />
        {getBlogAuthorName(blog)}
      </span>
      <span className="inline-flex items-center gap-2">
        <FaCalendarAlt className="text-xs" />
        {formatBlogPublishDate(blog.publishDate || blog.publish_date || String(blog.createdAt || ""))}
      </span>
      <span className="inline-flex items-center gap-2">
        <FaClock className="text-xs" />
        {estimateBlogReadTime(blog.content)}
      </span>
    </div>
  );
}



function RelatedArticleCard({ blog }: { blog: Blogs }) {
  return (
    <article className={`${cardClass} group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-opsh-lg`}>
      <Link href={`/blog/details/${blog.slug}`} className="block">
        <div className="relative overflow-hidden">
          <img
            src={getBlogImage(blog)}
            alt={blog.title}
            className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-opsh-black-dark/70 via-transparent to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-opsh-primary px-3 py-1 text-xs font-semibold text-white">
            {getBlogCategoryLabel(blog)}
          </span>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-opsh-muted">
            {formatBlogPublishDate(blog.publishDate || blog.publish_date)}
          </p>
          <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-snug text-opsh-black transition-colors group-hover:text-opsh-primary">
            {blog.title}
          </h3>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-opsh-text-dark">
            {getBlogExcerpt(blog, 125)}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-opsh-secondary transition-transform group-hover:translate-x-1">
            Read article
            <FaArrowRight className="text-xs" />
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function BlogDetailsPage() {
  const params = useParams();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug || "";

  const [activeHeadingId, setActiveHeadingId] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const blogQuery = useQuery<Blogs>({
    queryKey: ["public-blog-detail", slug],
    queryFn: () => getBlogsDetails(slug),
    enabled: Boolean(slug),
  });

  const blogsQuery = useQuery<Blog>({
    queryKey: ["public-blog-list", "related"],
    queryFn: () => getAllBlogs(1, {}),
  });

  const blog = blogQuery.data ?? null;
  const allBlogs = useMemo<Blogs[]>(() => blogsQuery.data?.data ?? [], [blogsQuery.data]);

  const preparedContent = useMemo(() => {
    return prepareBlogContent(blog?.contentWithIds || blog?.content || "", blog?.tocStructure || []);
  }, [blog?.content, blog?.contentWithIds, blog?.tocStructure]);

  const sanitizedContent = useMemo(() => {
    if (typeof window === "undefined") {
      return preparedContent.html;
    }

    return DOMPurify.sanitize(preparedContent.html || "<p>No content available.</p>");
  }, [preparedContent.html]);

  const tags = useMemo(() => getBlogTags(blog?.tags), [blog?.tags]);
  const sectionTitles = useMemo(
    () => preparedContent.toc.slice(0, 4).map((item) => item.text),
    [preparedContent.toc]
  );
  const relatedBlogs = useMemo(() => {
    if (!blog) {
      return allBlogs.slice(0, 4);
    }

    const category = getBlogCategoryLabel(blog).toLowerCase();

    return allBlogs
      .filter((item) => item.slug !== blog.slug)
      .sort((left, right) => {
        const leftScore = getBlogCategoryLabel(left).toLowerCase() === category ? 1 : 0;
        const rightScore = getBlogCategoryLabel(right).toLowerCase() === category ? 1 : 0;
        return rightScore - leftScore;
      })
      .slice(0, 4);
  }, [allBlogs, blog]);

  useEffect(() => {
    if (!contentRef.current || preparedContent.toc.length === 0) {
      return;
    }

    const headings = Array.from(
      contentRef.current.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]")
    );

    if (headings.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)[0];

        if (visibleEntry) {
          setActiveHeadingId((visibleEntry.target as HTMLElement).id);
        }
      },
      {
        rootMargin: "-18% 0px -65% 0px",
        threshold: [0.1, 1],
      }
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [preparedContent.html, preparedContent.toc.length]);

  const scrollToHeading = useCallback((id: string) => {
    const heading = document.getElementById(id);
    if (!heading) {
      return;
    }

    const topOffset = 120;
    const nextTop = heading.getBoundingClientRect().top + window.scrollY - topOffset;

    window.scrollTo({
      top: nextTop,
      behavior: "smooth",
    });

    setActiveHeadingId(id);
  }, []);

  if (blogQuery.isPending) {
    return (
      <div className={pageShellClass}>
        <div className="mx-auto max-w-opsh px-4 py-10 sm:px-6 lg:px-8">
          <ContentLoader variant="details" />
        </div>
      </div>
    );
  }

  if (blogQuery.isError || !blog) {
    return (
      <div className={pageShellClass}>
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className={`${cardClass} px-6 py-16`}>
            <FaBookOpen className="mx-auto text-5xl text-opsh-muted" />
            <h1 className="mt-6 text-3xl font-semibold text-opsh-black">Article not found</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-opsh-text">
              The story you requested is unavailable or may have been moved. You can return to the journal and browse the latest published articles.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-opsh-lg bg-opsh-primary px-5 py-3 text-sm font-semibold text-white hover:bg-opsh-primary-hover"
              >
                <FaArrowLeft className="text-xs" />
                Back to Blog
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-opsh-lg border border-opsh-grey bg-white px-5 py-3 text-sm font-semibold text-opsh-text hover:bg-opsh-background-muted"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const articleDate = formatBlogPublishDate(blog.publishDate || blog.publish_date || String(blog.createdAt || ""));

  return (
    <div className={pageShellClass}>
      <div className="mx-auto max-w-opsh px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-opsh-primary transition-colors hover:text-opsh-secondary"
        >
          <FaArrowLeft className="text-xs" />
          Back to all articles
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-opsh-muted">
          <Link href="/" className="transition-colors hover:text-opsh-primary">
            Home
          </Link>
          <span>/</span>
          <Link href="/blog" className="transition-colors hover:text-opsh-primary">
            Blog
          </Link>
          <span>/</span>
          <span className="font-medium text-opsh-black">{blog.title}</span>
        </div>

        <section className={`${cardClass} mt-4 overflow-hidden`}>
          <div className="relative min-h-[340px] overflow-hidden sm:min-h-[420px]">
            <img
              src={getBlogImage(blog)}
              alt={blog.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-opsh-black-dark/80 via-opsh-black-dark/45 to-opsh-black-dark/20" />
            <div className="relative flex h-full items-end px-6 py-8 sm:px-8 sm:py-10">
              <div className="max-w-4xl flex flex-col gap-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded bg-opsh-primary px-3 py-1 text-xs font-semibold text-white">
                    {getBlogCategoryLabel(blog)}
                  </span>

                  <span className="inline-flex items-center gap-2 rounded border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                    <FaRegNewspaper className="text-[10px]" />
                    Article Detail
                  </span>
                </div>

                <div>
                  <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
                    {blog.title}
                  </h1>

                  <div className="mt-5">
                    <BlogMetaSummary blog={blog} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr),320px]">
          <article className="space-y-6">
            {preparedContent.toc.length > 0 ? (
              <div className="xl:hidden">
                <TableOfContentsCard
                  toc={preparedContent.toc}
                  activeId={activeHeadingId}
                  onItemClick={scrollToHeading}
                />
              </div>
            ) : null}

            <section className={`${cardClass} p-5 sm:p-6`}>
              <div
                ref={contentRef}
                className={blogContentClasses}
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            </section>

            <section className={`${cardClass} p-5 sm:p-6`}>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-opsh-primary text-lg font-semibold text-white">
                    {getBlogAuthorName(blog).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-opsh-muted">Written By</p>
                    <h2 className="mt-1 text-xl font-semibold text-opsh-black">{getBlogAuthorName(blog)}</h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-opsh-text-dark">
                      Part of the KTM Test Prep editorial stream covering IELTS, PTE, mock-test, exam booking, and student support updates.
                    </p>
                  </div>
                </div>

                {tags.length > 0 ? (
                  <div className="max-w-md">
                    <p className="text-xs uppercase tracking-[0.18em] text-opsh-muted">Tags</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded border border-opsh-grey bg-opsh-background px-3 py-1 text-xs font-semibold text-opsh-text-dark"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            {relatedBlogs.length > 0 ? (
              <section>
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-opsh-secondary">
                      Continue Reading
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-opsh-black">
                      More stories from the blog
                    </h2>
                  </div>
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-opsh-primary transition-colors hover:text-opsh-secondary"
                  >
                    View all articles
                    <FaArrowRight className="text-xs" />
                  </Link>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {relatedBlogs.map((relatedBlog) => (
                    <RelatedArticleCard key={relatedBlog.id} blog={relatedBlog} />
                  ))}
                </div>
              </section>
            ) : null}
          </article>

          <aside className="space-y-5 xl:sticky xl:top-24 self-start">
            {preparedContent.toc.length > 0 ? (
              <div className="hidden xl:block">
                <TableOfContentsCard
                  toc={preparedContent.toc}
                  activeId={activeHeadingId}
                  onItemClick={scrollToHeading}
                />
              </div>
            ) : null}

            <section className={`${cardClass} p-5`}>
              <div className="flex items-center gap-3">
                <div className="rounded-opsh-md bg-opsh-primary p-3 text-opsh-text">
                  <FaTags />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-opsh-primary">Article Snapshot</h2>
                  <p className="text-sm text-opsh-muted">Quick facts about this story.</p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-opsh-text-dark">
                <div className="flex items-center justify-between gap-3 rounded-opsh-md bg-opsh-background px-4 py-3">
                  <span>Category</span>
                  <span className="font-semibold text-opsh-black">{getBlogCategoryLabel(blog)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-opsh-md bg-opsh-background px-4 py-3">
                  <span>Published</span>
                  <span className="font-semibold text-opsh-black">{articleDate}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-opsh-md bg-opsh-background px-4 py-3">
                  <span>Read time</span>
                  <span className="font-semibold text-opsh-black">{estimateBlogReadTime(blog.content)}</span>
                </div>
              </div>
            </section>

            <section className={`${cardClass} p-5`}>
              <div className="flex items-center gap-3">
                <div className="rounded-opsh-md bg-opsh-primary p-3 text-opsh-text">
                  <FaRegNewspaper />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-opsh-black">More Articles</h2>
                  <p className="text-sm text-opsh-muted">Keep reading from the blog feed.</p>
                </div>
              </div>

              {blogsQuery.isPending ? (
                <div className="mt-5">
                  <ContentLoader variant="list" count={3} showActions={false} />
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {relatedBlogs.map((relatedBlog) => (
                    <Link
                      key={relatedBlog.id}
                      href={`/blog/details/${relatedBlog.slug}`}
                      className="group flex gap-3 rounded-opsh-lg p-2 transition-colors hover:bg-opsh-background-muted/60"
                    >
                      <img
                        src={getBlogImage(relatedBlog)}
                        alt={relatedBlog.title}
                        className="h-20 w-20 rounded-opsh-md object-cover"
                      />
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold leading-6 text-opsh-black transition-colors group-hover:text-opsh-primary">
                          {relatedBlog.title}
                        </p>
                        <p className="mt-2 text-xs text-opsh-muted">
                          {formatBlogPublishDate(relatedBlog.publishDate || relatedBlog.publish_date)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-opsh-xl bg-opsh-primary p-5 text-white">
              <h2 className="text-xl font-semibold">Explore the full journal</h2>
              <p className="mt-3 text-sm leading-6 text-white/80">
                 Return to the main blog feed to browse more IELTS, PTE, class, exam booking, and mock-test updates.
              </p>
              <Link
                href="/blog"
                className="mt-5 inline-flex items-center gap-2 rounded-opsh-lg bg-white px-4 py-3 text-sm font-semibold text-opsh-primary transition-colors hover:bg-opsh-white-off"
              >
                Browse all articles
                <FaArrowRight className="text-xs" />
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
