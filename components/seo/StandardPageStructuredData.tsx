import StructuredData from "@/components/seo/StructuredData";
import {
  type BreadcrumbItem,
  buildBreadcrumbSchema,
  buildSchemaGraph,
  organizationSchema,
} from "@/helper/seo/site";

type StandardPageStructuredDataProps = {
  breadcrumbs: BreadcrumbItem[];
  schemas: Array<Record<string, unknown>>;
};

export default function StandardPageStructuredData({
  breadcrumbs,
  schemas,
}: StandardPageStructuredDataProps) {
  return (
    <StructuredData
      data={buildSchemaGraph(
        organizationSchema,
        buildBreadcrumbSchema(breadcrumbs),
        ...schemas
      )}
    />
  );
}
