'use client';

type ClientStructuredDataProps = {
  data: Record<string, unknown>;
};

export default function ClientStructuredData({
  data,
}: ClientStructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
