import type { Metadata } from "next";

import MockTestsClient from "@/components/public/mock-tests/MockTestsClient";
import StandardPageStructuredData from "@/components/seo/StandardPageStructuredData";
import { buildPageMetadata, buildWebPageSchema } from "@/helper/seo/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Alfa Mock Test Practice",
  description:
    "Buy Alfa IELTS and Alfa PTE mock-test practice packages from KTM Test Preparation Centre.",
  path: "/mock-tests",
  keywords: ["Alfa IELTS mock test", "Alfa PTE mock test", "IELTS mock practice Nepal"],
});

export default function MockTestsPage() {
  return (
    <>
      <StandardPageStructuredData
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Mock Tests", path: "/mock-tests" },
        ]}
        schemas={[
          buildWebPageSchema({
            title: "Alfa Mock Test Practice",
            description: "Alfa IELTS and Alfa PTE mock-test purchase workflow.",
            path: "/mock-tests",
          }),
        ]}
      />
      <MockTestsClient />
    </>
  );
}
