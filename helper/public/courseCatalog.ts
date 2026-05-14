import type { CourseCatalogPayload } from "@/types/courseCatalog";

type PublicCourseCatalogResponse = {
  success?: boolean;
  data?: CourseCatalogPayload;
};

export const getPublicCourseCatalog = async (courseSlug?: string): Promise<CourseCatalogPayload | null> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return null;
  }

  try {
    const endpoint = courseSlug
      ? `${apiUrl}/public/course-catalog/${encodeURIComponent(courseSlug)}`
      : `${apiUrl}/public/course-catalog`;

    const response = await fetch(endpoint, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as PublicCourseCatalogResponse;

    return payload.success && payload.data ? payload.data : null;
  } catch {
    return null;
  }
};
