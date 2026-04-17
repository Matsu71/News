import path from "node:path";
import { siteConfig } from "../config/site.js";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function escapeXml(value: string): string {
  return escapeHtml(value);
}

export function absoluteUrl(route: string): string {
  const baseUrl = (process.env.SITE_BASE_URL ?? siteConfig.defaultBaseUrl).replace(/\/+$/, "");
  return `${baseUrl}${route.startsWith("/") ? route : `/${route}`}`;
}

export function relativeUrl(fromRoute: string, toRouteWithHash: string): string {
  const [toRoute, hash = ""] = toRouteWithHash.split("#");
  const normalizedFrom = normalizeRoute(fromRoute);
  const normalizedTo = normalizeRoute(toRoute);

  if (normalizedFrom === normalizedTo) {
    return hash ? `#${hash}` : "./";
  }

  const fromDir = routeDirectory(normalizedFrom);
  let target = normalizedTo;
  const isDirectoryTarget = normalizedTo.endsWith("/");

  if (isDirectoryTarget) {
    target = normalizedTo.replace(/\/$/, "") || "/";
  }

  let relative = path.posix.relative(fromDir, target);
  if (relative === "") {
    relative = ".";
  }
  if (isDirectoryTarget && relative !== "." && !relative.endsWith("/")) {
    relative += "/";
  }
  if (isDirectoryTarget && relative === ".") {
    relative = "./";
  }

  return `${relative}${hash ? `#${hash}` : ""}`;
}

export function routeToOutputPath(outDir: string, route: string): string {
  const normalized = normalizeRoute(route);
  if (normalized.endsWith("/")) {
    return path.join(outDir, normalized, "index.html");
  }
  return path.join(outDir, normalized);
}

export function displayUrlHost(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function normalizeRoute(route: string): string {
  if (route === "") {
    return "/";
  }
  const withLeadingSlash = route.startsWith("/") ? route : `/${route}`;
  return withLeadingSlash.replace(/\/{2,}/g, "/");
}

function routeDirectory(route: string): string {
  if (route === "/") {
    return "/";
  }
  if (route.endsWith("/")) {
    return route.replace(/\/$/, "") || "/";
  }
  return path.posix.dirname(route);
}
