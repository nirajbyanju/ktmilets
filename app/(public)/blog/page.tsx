import type { Metadata } from "next";
import BlogPageClient from "@/components/public/blog/BlogPageClient";

export const metadata: Metadata = {
  title: "Blog | KTM Test Preparation Centre",
  description:
    "Read KTM Test Preparation Centre updates on IELTS, PTE, mock-test practice, exam booking support, and online class preparation.",
  openGraph: {
    title: "Blog | KTM Test Preparation Centre",
    description:
      "Stay up to date with IELTS, PTE, and student support tips from KTM Test Prep.",
    url: "/blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | KTM Test Preparation Centre",
    description:
      "Stay up to date with IELTS, PTE, and student support tips from KTM Test Prep.",
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
