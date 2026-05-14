"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BsStars } from "react-icons/bs";
import { useQuery } from "@tanstack/react-query";
import {
  FaArrowRight,
  FaClock,
  FaCompass,
  FaFireAlt,
  FaRegNewspaper,
  FaTags,
  FaThLarge,
} from "react-icons/fa";
import { RiAdminLine } from "react-icons/ri";
import { CiCalendar, CiSearch } from "react-icons/ci";

import { getAllBlogs } from "@/apis/frontend/blog.api";
import ContentLoader from "@/components/loader/ContentLoader";
import ClientStructuredData from "@/components/seo/ClientStructuredData";
import {
  estimateBlogReadTime,
  formatBlogPublishDate,
  getBlogAuthorName,
  getBlogCategoryLabel,
  getBlogExcerpt,
  getBlogImage,
  getBlogTags,
} from "@/helper/blog/public";
import {
  buildBreadcrumbSchema,
  buildSchemaGraph,
  buildWebPageSchema,
  organizationSchema,
} from "@/helper/seo/site";
import type { Blog, Blogs } from "@/types/blog";

const pageShellClass =
  "min-h-screen bg-gradient-to-br from-opsh-background via-opsh-white-pure to-opsh-grey-light";
const cardClass =
  "rounded-xl border border-opsh-grey border-2 bg-white/95  backdrop-blur-sm";

function HeroStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-opsh-lg border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-opsh-text/65">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-opsh-text">{value}</p>
    </div>
  );
}

function BlogMetaRow({ blog }: { blog: Blogs }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-opsh-muted sm:text-sm">
      <span className="inline-flex items-center gap-1.5">
        <RiAdminLine />
        {getBlogAuthorName(blog)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <CiCalendar />
        {formatBlogPublishDate(blog.publishDate || blog.publish_date)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <FaClock className="text-[11px]" />
        {estimateBlogReadTime(blog.content)}
      </span>
    </div>
  );
}

function BlogListCard({ blog }: { blog: Blogs }) {
  return (
    <article className={`${cardClass} group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-opsh-lg`}>
      <Link href={`/blog/details/${blog.slug}`} className="block">
        <div className="relative overflow-hidden">
          <img
            src={getBlogImage(blog)}
            alt={blog.title}
            className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-opsh-black-dark/70 via-transparent to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-opsh-primary px-3 py-1 text-xs font-semibold text-opsh-text shadow-opsh-primary">
            {getBlogCategoryLabel(blog)}
          </span>
        </div>

        <div className="p-5">
          <BlogMetaRow blog={blog} />
          <h2 className="mt-4 line-clamp-2 text-xl font-semibold leading-snug text-opsh-black transition-colors group-hover:text-opsh-primary">
            {blog.title}
          </h2>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-opsh-text-dark">
            {getBlogExcerpt(blog, 150)}
          </p>
          <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-opsh-secondary transition-transform group-hover:translate-x-1">
            Read article
            <FaArrowRight className="text-xs" />
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const structuredData = buildSchemaGraph(
    organizationSchema,
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
    ]),
    buildWebPageSchema({
      title: "KTM Test Prep Blog",
      description:
        "Read KTM Test Preparation Centre updates on IELTS, PTE, mock-test practice, exam booking support, and online class preparation.",
      path: "/blog",
      type: "CollectionPage",
    })
  );

  const blogsQuery = useQuery<Blog>({
    queryKey: ["public-blog-list", 1],
    queryFn: () => getAllBlogs(1, {}),
  });

  const blogs = useMemo<Blogs[]>(() => blogsQuery.data?.data ?? [], [blogsQuery.data]);

  const categories = useMemo(() => {
    const values = Array.from(new Set(blogs.map((blog) => getBlogCategoryLabel(blog))));
    return ["All", ...values];
  }, [blogs]);

  const popularTags = useMemo(() => {
    return Array.from(new Set(blogs.flatMap((blog) => getBlogTags(blog.tags)))).slice(0, 10);
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return blogs.filter((blog) => {
      const matchesCategory =
        activeCategory === "All" || getBlogCategoryLabel(blog).toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch =
        normalizedQuery.length === 0 ||
        [blog.title, getBlogExcerpt(blog, 300), getBlogAuthorName(blog), getBlogCategoryLabel(blog)]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, blogs, searchQuery]);

  const featuredBlog = filteredBlogs[0] ?? null;
  const gridBlogs = featuredBlog ? filteredBlogs.slice(1) : [];
  const recentBlogs = blogs.slice(0, 4);
  const featuredTopics = popularTags.slice(0, 5);

  if (blogsQuery.isPending) {
    return (
      <>
        <ClientStructuredData data={structuredData} />
        <div className={pageShellClass}>
          <div className="mx-auto max-w-opsh px-4 py-10 sm:px-6 lg:px-8">
            <div className="space-y-6">
              <div className={`${cardClass} h-64 bg-white/80`} />
              <ContentLoader variant="grid" count={6} columns={2} />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (blogsQuery.isError) {
    return (
      <>
        <ClientStructuredData data={structuredData} />
        <div className={pageShellClass}>
          <div className="mx-auto max-w-opsh px-4 py-16 sm:px-6 lg:px-8">
            <div className={`${cardClass} px-6 py-14 text-center`}>
              <FaRegNewspaper className="mx-auto text-4xl text-opsh-muted" />
              <h1 className="mt-5 text-2xl font-semibold text-opsh-black">Blog page could not be loaded</h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-opsh-text">
                Try again in a moment. The blog feed did not return a usable response.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ClientStructuredData data={structuredData} />
      <div className={pageShellClass}>
        <div className="mx-auto max-w-8xl px-4 py-4 sm:px-6 lg:px-8">


          <section className={`${cardClass} p-4 sm:p-5`}>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr),auto] lg:items-center">
              <div className="relative">
                <CiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-opsh-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search articles, topics, or author names"
                  className="w-full rounded border border-opsh-grey bg-opsh-background-muted/50 py-3 pl-12 pr-4 text-sm text-opsh-black outline-none transition-colors focus:border-opsh-primary focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`rounded px-4 py-2 text-sm font-medium transition-colors ${activeCategory === category
                      ? "bg-opsh-primary text-opsh-text "
                      : "bg-opsh-background text-opsh-text-dark hover:bg-opsh-background-dark"
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-opsh-grey pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm text-opsh-muted">
                <span className="inline-flex items-center gap-2 rounded bg-opsh-primary/20 px-3 py-1 font-medium text-opsh-text-dark">
                  <FaCompass className="text-xs text-opsh-primary" />
                  {filteredBlogs.length} result{filteredBlogs.length === 1 ? "" : "s"}
                </span>
                {activeCategory !== "All" ? (
                  <span className="inline-flex items-center gap-2 rounded bg-opsh-primary/20 px-3 py-1 font-medium text-opsh-primary">
                    Category: {activeCategory}
                  </span>
                ) : null}
                {searchQuery.trim() ? (
                  <span className="inline-flex items-center gap-2 rounded bg-opsh-secondary/10 px-3 py-1 font-medium text-opsh-secondary">
                    Search: {searchQuery.trim()}
                  </span>
                ) : null}
              </div>

              {(activeCategory !== "All" || searchQuery.trim()) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                  className="text-sm font-semibold text-opsh-secondary transition-colors hover:text-opsh-secondary-hover"
                >
                  Reset filters
                </button>
              )}
            </div>
          </section>

          {filteredBlogs.length === 0 ? (
            <section className={`${cardClass} mt-6 px-6 py-16 text-center`}>
              <FaThLarge className="mx-auto text-4xl text-opsh-muted" />
              <h2 className="mt-5 text-2xl font-semibold text-opsh-black">No articles match those filters</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-opsh-text">
                Try another keyword or switch back to all categories to browse the full journal.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
                className="mt-6 rounded-opsh-lg bg-opsh-primary px-5 py-3 text-sm font-semibold text-opsh-text hover:bg-opsh-primary-hover"
              >
                Clear filters
              </button>
            </section>
          ) : (
            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr),320px]">
              <div className="space-y-6">
                {featuredBlog ? (
                  <section className={`${cardClass} overflow-hidden`}>
                    <div className="grid gap-0 lg:grid-cols-[1.05fr,0.95fr]">
                      <div className="relative min-h-[300px] overflow-hidden">
                        <img
                          src={getBlogImage(featuredBlog)}
                          alt={featuredBlog.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-opsh-black-dark/60 via-opsh-black-dark/15 to-transparent" />
                        <div className="absolute left-5 top-5">
                          <span className="rounded bg-opsh-primary px-3 py-1 text-xs font-semibold text-opsh-text">
                            Featured Story
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between p-6 sm:p-8">
                        <div>
                          <span className="rounded bg-opsh-primary/30 px-3 py-1 text-xs font-semibold text-opsh-primary">
                            {getBlogCategoryLabel(featuredBlog)}
                          </span>
                          <h2 className="mt-2 text-2xl font-semibold leading-tight text-opsh-black sm:text-[2rem]">
                            {featuredBlog.title}
                          </h2>
                          <p className="mt-2 text-sm leading-7 text-opsh-text-dark sm:text-base">
                            {getBlogExcerpt(featuredBlog, 240)}
                          </p>
                        </div>

                        <div className="mt-4">
                          <BlogMetaRow blog={featuredBlog} />
                          <Link
                            href={`/blog/details/${featuredBlog.slug}`}
                            className="mt-4 inline-flex items-center gap-2 rounded bg-opsh-secondary px-5 py-3 text-sm font-semibold text-opsh-text transition-colors hover:bg-opsh-secondary-hover"
                          >
                            Read featured article
                            <FaArrowRight className="text-xs" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </section>
                ) : null}

                <section>
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-opsh-secondary">
                        Editorial Picks
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-opsh-black">
                        Browse the latest stories
                      </h2>
                    </div>
                    <p className="max-w-md text-sm leading-6 text-opsh-text-dark">
                      A cleaner feed of IELTS, PTE, exam booking, mock-test practice, and online class updates.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    {gridBlogs.map((blog) => (
                      <BlogListCard key={blog.id} blog={blog} />
                    ))}
                  </div>
                </section>
              </div>

              <aside className="space-y-5">
                <section className={`${cardClass} p-5`}>
                  <div className="flex items-center gap-3 justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-opsh-primary">Latest Stories</h2>
                    </div>
                    <div className="text-muted-foreground text-xxs font-normal flex items-center">
                      <BsStars />
                      <span>
                        Powered AI
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {recentBlogs.map((blog) => (
                      <Link
                        key={blog.id}
                        href={`/blog/details/${blog.slug}`}
                        className="group flex gap-3 rounded-opsh-lg p-2 transition-colors hover:bg-opsh-background-muted/60"
                      >
                        <img
                          src={getBlogImage(blog)}
                          alt={blog.title}
                          className="h-20 w-20 rounded-opsh-md object-cover"
                        />
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-semibold leading-6 text-opsh-black transition-colors group-hover:text-opsh-primary">
                            {blog.title}
                          </p>
                          <p className="mt-2 text-xs text-opsh-muted">
                            {formatBlogPublishDate(blog.publishDate || blog.publish_date)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>

                <section className={`${cardClass} p-5`}>
                  <h2 className="text-lg font-semibold text-opsh-primary">Browse Categories</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {categories
                      .filter((category) => category !== "All")
                      .map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setActiveCategory(category)}
                          className="rounded border border-opsh-primary px-3 py-2 text-xs font-semibold text-opsh-text-dark transition-colors hover:text-opsh-primary"
                        >
                          {category}
                        </button>
                      ))}
                  </div>
                </section>

                <section className={`${cardClass} p-5`}>
                  <div className="flex items-center gap-3 justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-opsh-primary">Trending Filters</h2>
                    </div>
                    <div className="text-muted-foreground text-xxs font-normal flex items-center">
                      <BsStars />
                      <span>
                        Powered AI
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {featuredTopics.length > 0 ? (
                      featuredTopics.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setSearchQuery(tag)}
                          className="rounded border border-opsh-primary px-3 py-2 text-xs font-semibold text-opsh-primary transition-colors hover:border-opsh-secondary hover:text-opsh-secondary"
                        >
                          #{tag}
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-opsh-muted">Topics will appear here as posts are tagged.</p>
                    )}
                  </div>
                </section>

                <section className="rounded-xl bg-opsh-primary p-5 text-opsh-text">
                  <div className="flex items-center gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">Popular Topics</h2>
                      <p className="text-sm text-opsh-text/75">Keywords appearing across current articles.</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {popularTags.length > 0 ? (
                      popularTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-opsh-text/90"
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-opsh-text/75">Topics will appear here as posts are tagged.</p>
                    )}
                  </div>
                </section>
              </aside>
            </div>
          )}

          <section className="mt-8 overflow-hidden rounded-xl bg-opsh-primary px-6 py-8 text-opsh-text shadow-opsh-lg sm:px-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),auto] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-opsh-text">
                  Continue Exploring
                </p>
                <h2 className="font-brand mt-3 text-2xl font-semibold sm:text-3xl">
                  Stay on top of IELTS, PTE, and student support updates.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-opsh-text">
                  Use the category and topic filters to move between IELTS, PTE, mock-test, exam booking, and student support updates.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-opsh-lg bg-white px-5 py-3 text-sm font-semibold text-opsh-primary transition-colors hover:bg-opsh-white-off"
              >
                Contact KTM Test Prep
                <FaArrowRight className="text-xs" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
