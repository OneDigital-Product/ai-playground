export const BASE_PATH = "/enrollment-dashboard" as const;

export function withBase(path: string): string {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${BASE_PATH}${path}`;
}

export function stripBasePath(pathname: string | null | undefined): string {
  const path = pathname ?? "/";
  return path.startsWith(BASE_PATH) ? path.slice(BASE_PATH.length) || "/" : path;
}

