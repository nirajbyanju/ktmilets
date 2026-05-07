const PRIVATE_HOST_PATTERNS = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
];

const isPrivateHostname = (hostname: string) =>
  hostname === "localhost" ||
  hostname === "::1" ||
  PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname));

export const shouldBypassNextImageOptimization = (src?: string | null) => {
  if (!src) {
    return false;
  }

  try {
    const { hostname } = new URL(src);
    return isPrivateHostname(hostname);
  } catch {
    return false;
  }
};
