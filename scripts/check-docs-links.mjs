#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Converts a markdown heading text into a URL slug anchor.
 *
 * @param {string} text
 * @returns {string}
 */
export function slugifyHeading(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Tests if a URL is external (HTTP, mailto, etc.).
 *
 * @param {string} href
 * @returns {boolean}
 */
export function isExternalLink(href) {
  return /^(https?:|\/\/|mailto:|tel:|javascript:)/i.test(href);
}

/**
 * Scans src/app (and optionally src/components) to discover all valid routes and anchors.
 *
 * @param {string} appDir - Path to src/app
 * @param {string} [componentsDir] - Path to src/components
 * @returns {Map<string, { filePath: string, anchors: Set<string> }>}
 */
export function discoverRoutes(appDir, componentsDir) {
  const routes = new Map();

  function walk(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (/^page\.(mdx|tsx|jsx|js|ts)$/.test(entry.name)) {
        const rel = path.relative(appDir, currentDir);
        const route = rel === "" ? "/" : "/" + rel.split(path.sep).join("/");
        const content = fs.readFileSync(full, "utf8");
        const anchors = new Set();

        for (const line of content.split("\n")) {
          const match = line.match(/^#{1,6}\s+(.+)$/);
          if (match) {
            anchors.add(slugifyHeading(match[1]));
          }
          const idMatches = line.matchAll(/\bid=["']([^"']+)["']/g);
          for (const m of idMatches) {
            anchors.add(m[1]);
          }
        }
        routes.set(route, { filePath: full, anchors });
      }
    }
  }

  walk(appDir);

  if (componentsDir && fs.existsSync(componentsDir)) {
    const entries = fs.readdirSync(componentsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && /\.(tsx|jsx|ts|js)$/.test(entry.name)) {
        const content = fs.readFileSync(path.join(componentsDir, entry.name), "utf8");
        const idMatches = content.matchAll(/\bid=["']([^"']+)["']/g);
        for (const m of idMatches) {
          const rootRoute = routes.get("/");
          if (rootRoute) rootRoute.anchors.add(m[1]);
        }
      }
    }
  }

  return routes;
}

/**
 * Extracts links from an MDX or component file with line numbers.
 * Ignores fenced code blocks and external URLs.
 *
 * @param {string} filePath
 * @param {string} content
 * @returns {Array<{ rawHref: string, line: number, type: string }>}
 */
export function extractLinks(filePath, content) {
  const links = [];
  const lines = content.split("\n");
  let inCodeBlock = false;

  const mdLinkRegex = /\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  const tagLinkRegex = /<(?:a|Link)\s+[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
  const navHrefRegex = /\bhref:\s*["']([^"']+)["']/g;
  const mdRefDefRegex = /^\s*\[([^\]]+)\]:\s*(\S+)(?:\s+["'][^"']*["'])?\s*$/;

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      return;
    }
    if (inCodeBlock) return;

    const refMatch = trimmed.match(mdRefDefRegex);
    if (refMatch) {
      links.push({ rawHref: refMatch[2], line: idx + 1, type: "markdown-ref" });
    }

    let match;
    while ((match = mdLinkRegex.exec(line)) !== null) {
      const isImage = match.index > 0 && line[match.index - 1] === "!";
      if (!isImage) {
        links.push({ rawHref: match[2], line: idx + 1, type: "markdown" });
      }
    }

    while ((match = tagLinkRegex.exec(line)) !== null) {
      links.push({ rawHref: match[1], line: idx + 1, type: "tag" });
    }

    if (filePath.endsWith("DocsLayout.tsx") || filePath.endsWith("MarketingNav.tsx")) {
      while ((match = navHrefRegex.exec(line)) !== null) {
        links.push({ rawHref: match[1], line: idx + 1, type: "nav" });
      }
    }
  });

  return links;
}

/**
 * Validates a single link reference against known routes and anchors.
 *
 * @param {string} rawHref
 * @param {string} currentRoute
 * @param {Map<string, { filePath: string, anchors: Set<string> }>} routes
 * @returns {{ valid: boolean, targetRoute?: string, fragment?: string | null, reason?: string, external?: boolean, skipped?: boolean }}
 */
export function validateLink(rawHref, currentRoute, routes) {
  const href = rawHref.trim();
  if (!href || href === "#") {
    return { valid: true, skipped: true };
  }
  if (isExternalLink(href)) {
    return { valid: true, external: true };
  }

  const [withoutHash, fragment] = href.split("#");
  const [pathOnly] = withoutHash.split("?");

  let targetRoute;
  if (!pathOnly) {
    targetRoute = currentRoute;
  } else if (pathOnly.startsWith("/")) {
    targetRoute = pathOnly === "/" ? "/" : pathOnly.replace(/\/+$/, "");
  } else {
    const baseDir = currentRoute === "/" ? "/" : path.posix.dirname(currentRoute);
    const candidate1 = path.posix.resolve(baseDir, pathOnly);
    const candidate2 = path.posix.resolve(currentRoute, pathOnly);
    if (routes.has(candidate1)) {
      targetRoute = candidate1;
    } else if (routes.has(candidate2)) {
      targetRoute = candidate2;
    } else {
      targetRoute = candidate1;
    }
  }

  const targetInfo = routes.get(targetRoute);
  if (!targetInfo) {
    return {
      valid: false,
      targetRoute,
      reason: `Target route "${targetRoute}" does not exist`,
    };
  }

  if (fragment && fragment.length > 0) {
    if (!targetInfo.anchors.has(fragment)) {
      return {
        valid: false,
        targetRoute,
        fragment,
        reason: `Anchor "#${fragment}" does not exist on route "${targetRoute}"`,
      };
    }
  }

  return {
    valid: true,
    targetRoute,
    fragment: fragment || null,
  };
}

/**
 * Validates documentation files for internal links and anchors.
 *
 * @param {object} [options]
 * @param {string} [options.rootDir]
 * @param {string} [options.appDir]
 * @param {string} [options.docsDir]
 * @param {string} [options.componentsDir]
 * @param {boolean} [options.silent]
 * @returns {{ success: boolean, errors: Array<{ file: string, line: number, rawHref: string, reason: string }>, stats: { pagesCount: number, linksChecked: number, externalLinksSkipped: number } }}
 */
export function checkDocsLinks(options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const appDir = options.appDir || path.join(rootDir, "src/app");
  const docsDir = options.docsDir || path.join(appDir, "docs");
  const componentsDir = options.componentsDir || path.join(rootDir, "src/components");

  const routes = discoverRoutes(appDir, componentsDir);
  const errors = [];
  let linksChecked = 0;
  let externalLinksSkipped = 0;

  const docFiles = [];
  function collectFiles(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        collectFiles(full);
      } else if (entry.name.endsWith(".mdx") || entry.name === "DocsLayout.tsx") {
        docFiles.push(full);
      }
    }
  }
  collectFiles(docsDir);

  for (const file of docFiles) {
    const relFile = path.relative(rootDir, file);
    const content = fs.readFileSync(file, "utf8");
    const links = extractLinks(file, content);

    let currentRoute = "/docs";
    if (file.endsWith(".mdx")) {
      const relDir = path.relative(appDir, path.dirname(file));
      currentRoute = relDir === "" ? "/" : "/" + relDir.split(path.sep).join("/");
    }

    for (const link of links) {
      const validation = validateLink(link.rawHref, currentRoute, routes);
      if (validation.external) {
        externalLinksSkipped++;
        continue;
      }
      if (validation.skipped) {
        continue;
      }

      linksChecked++;
      if (!validation.valid) {
        errors.push({
          file: relFile,
          line: link.line,
          rawHref: link.rawHref,
          reason: validation.reason || "Invalid link",
        });
      }
    }
  }

  const result = {
    success: errors.length === 0,
    errors,
    stats: {
      pagesCount: docFiles.length,
      linksChecked,
      externalLinksSkipped,
    },
  };

  if (!options.silent) {
    if (result.success) {
      console.log(
        `✓ [docs:check] Validated ${result.stats.pagesCount} documentation pages and ${result.stats.linksChecked} internal links. All links are valid (${result.stats.externalLinksSkipped} external links skipped).`
      );
    } else {
      console.error(`✗ [docs:check] Found ${errors.length} broken link(s) across documentation:\n`);
      for (const err of errors) {
        console.error(`  - ${err.file}:${err.line} -> "${err.rawHref}" (${err.reason})`);
      }
      console.error("");
    }
  }

  return result;
}

// CLI runner when invoked directly
const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFilePath) {
  const result = checkDocsLinks();
  if (!result.success) {
    process.exit(1);
  }
}
