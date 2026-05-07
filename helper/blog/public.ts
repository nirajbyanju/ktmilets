import type { Blogs, TableOfContentsItem } from "@/types/blog";

const toText = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }

  return "";
};

const flattenToc = (items: TableOfContentsItem[]): TableOfContentsItem[] =>
  items.flatMap((item) => [item, ...flattenToc(item.children ?? [])]);

const createHeadingId = (text: string, counter: Record<string, number>) => {
  const baseId =
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim() || "section";

  if (counter[baseId] !== undefined) {
    counter[baseId] += 1;
    return `${baseId}-${counter[baseId]}`;
  }

  counter[baseId] = 0;
  return baseId;
};

const nestHeadings = (items: TableOfContentsItem[]): TableOfContentsItem[] => {
  const result: TableOfContentsItem[] = [];
  const stack: TableOfContentsItem[] = [];

  items.forEach((heading) => {
    const nextHeading: TableOfContentsItem = {
      ...heading,
      children: [],
    };

    while (stack.length > 0 && stack[stack.length - 1].level >= nextHeading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      result.push(nextHeading);
    } else {
      stack[stack.length - 1].children.push(nextHeading);
    }

    stack.push(nextHeading);
  });

  return result;
};

export const stripBlogHtml = (html: string): string =>
  toText(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export const formatBlogPublishDate = (value?: string | Date | null): string => {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-NP", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const estimateBlogReadTime = (content?: string | null): string => {
  const cleanText = stripBlogHtml(content || "");
  const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.ceil(wordCount / 220));
  return `${minutes} min read`;
};

export const getBlogCategoryLabel = (blog?: Blogs | null): string =>
  toText(blog?.category?.label ?? blog?.category?.name) || "Real Estate";

export const getBlogImage = (blog?: Blogs | null): string =>
  toText(blog?.thumbnail) || "/images/default-blog.png";

export const getBlogExcerpt = (blog?: Blogs | null, maxLength = 180): string => {
  const preferred = toText(blog?.excerpt);
  const rawText = preferred || stripBlogHtml(blog?.content || "");

  if (!rawText) {
    return "Explore practical real estate insight, market observations, and property guidance from our editorial team.";
  }

  if (rawText.length <= maxLength) {
    return rawText;
  }

  return `${rawText.slice(0, maxLength).trim()}...`;
};

export const getBlogAuthorName = (blog?: Blogs | null): string =>
  toText(blog?.user?.full_name ?? blog?.user?.username ?? blog?.author) || "Samriddhi Editorial";

export const getBlogTags = (tags?: string | null): string[] =>
  toText(tags)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

export const prepareBlogContent = (
  content: string,
  apiToc: TableOfContentsItem[] = []
): { html: string; toc: TableOfContentsItem[] } => {
  const normalizedContent = toText(content);
  if (!normalizedContent) {
    return {
      html: "<p>No content available.</p>",
      toc: apiToc,
    };
  }

  if (typeof window === "undefined") {
    return {
      html: normalizedContent,
      toc: apiToc,
    };
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(normalizedContent, "text/html");
    const headings = Array.from(doc.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    const flatApiToc = flattenToc(apiToc);
    const idCounter: Record<string, number> = {};
    const generatedToc: TableOfContentsItem[] = [];

    headings.forEach((heading, index) => {
      const text = toText(heading.textContent);
      if (!text) {
        return;
      }

      const apiHeading = flatApiToc[index];
      const fallbackId = createHeadingId(text, idCounter);
      const headingId = apiHeading?.id || heading.id || fallbackId;

      heading.id = headingId;

      generatedToc.push({
        id: headingId,
        text,
        level: Number(heading.tagName.substring(1)),
        index,
        children: [],
      });
    });

    return {
      html: doc.body.innerHTML,
      toc: apiToc.length > 0 ? apiToc : nestHeadings(generatedToc),
    };
  } catch {
    return {
      html: normalizedContent,
      toc: apiToc,
    };
  }
};
