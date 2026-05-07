import type { NextConfig } from "next";

const buildRemotePattern = (value?: string) => {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    return {
      protocol: url.protocol.replace(":", ""),
      hostname: url.hostname,
      port: url.port,
      pathname: "/**",
    };
  } catch {
    return null;
  }
};

const remotePatterns = [
  {
    protocol: "http",
    hostname: "127.0.0.1",
    port: "8000",
    pathname: "/**",
  },
  {
    protocol: "http",
    hostname: "localhost",
    port: "8000",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "samriddhirealestate.com",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "www.samriddhirealestate.com",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "api.hellolalpurja.com",
    pathname: "/**",
  },
  buildRemotePattern(process.env.NEXT_PUBLIC_API_URL),
  buildRemotePattern(process.env.NEXT_PUBLIC_SITE_URL),
].filter(Boolean);

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    removeConsole: {
      exclude: ["error"], // keep only console.error
    },
  },
  images: {
    remotePatterns,
  },
  async redirects() {
    return [
      {
        source: "/aboutUs",
        destination: "/about-us",
        permanent: true,
      },
      {
        source: "/contactUs",
        destination: "/contact-us",
        permanent: true,
      },
      {
        source: "/forget",
        destination: "/forgot-password",
        permanent: true,
      },
      {
        source: "/ourServices",
        destination: "/services",
        permanent: true,
      },
      {
        source: "/buy",
        destination: "/properties-list",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; base-uri 'self'; form-action 'self' http: https:; frame-ancestors 'self'; img-src 'self' data: blob: http: https:; font-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:; connect-src 'self' http: https: ws: wss:; frame-src 'self' https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
