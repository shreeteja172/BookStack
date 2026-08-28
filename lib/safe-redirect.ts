const DEFAULT_REDIRECT = "/dashboard";

export function safeRedirectPath(
  value: string | string[] | undefined,
  fallback: string = DEFAULT_REDIRECT,
): string {
  const path = Array.isArray(value) ? value[0] : value;

  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }

  return path;
}
