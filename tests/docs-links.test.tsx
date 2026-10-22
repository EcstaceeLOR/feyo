import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, test } from "node:test";

// Dynamically import ESM check-docs-links module into test runner
async function getModule() {
  return await import("../scripts/check-docs-links.mjs");
}

describe("MDX documentation internal link validation (issue #2)", () => {
  test("validates all real documentation pages and links in the repository without error", async () => {
    const { checkDocsLinks } = await getModule();
    const result = checkDocsLinks({ silent: true });

    assert.equal(result.success, true);
    assert.deepEqual(result.errors, []);
    assert.ok(result.stats.pagesCount >= 8, `Expected at least 8 doc pages, got ${result.stats.pagesCount}`);
    assert.ok(result.stats.linksChecked >= 10, `Expected at least 10 internal links checked, got ${result.stats.linksChecked}`);
    assert.ok(result.stats.externalLinksSkipped >= 4, `Expected external links to be skipped, got ${result.stats.externalLinksSkipped}`);
  });

  test("slugifyHeading generates consistent URL slugs from heading text", async () => {
    const { slugifyHeading } = await getModule();

    assert.equal(slugifyHeading("Developer API"), "developer-api");
    assert.equal(slugifyHeading("Proposed shape"), "proposed-shape");
    assert.equal(slugifyHeading("A good pull request"), "a-good-pull-request");
    assert.equal(slugifyHeading("Heading with <code>tags</code>"), "heading-with-tags");
    assert.equal(slugifyHeading("Heading with [link text](/url)"), "heading-with-link-text");
    assert.equal(slugifyHeading("Stellar-native. Product-minded."), "stellar-native-product-minded");
    assert.equal(slugifyHeading("   Padded   Heading   "), "padded-heading");
  });

  test("isExternalLink identifies external links and skips HTTP requests", async () => {
    const { isExternalLink } = await getModule();

    assert.equal(isExternalLink("https://github.com/Feyo-Protocol/feyo"), true);
    assert.equal(isExternalLink("http://example.com/page"), true);
    assert.equal(isExternalLink("//cdn.example.com/script.js"), true);
    assert.equal(isExternalLink("mailto:security@feyo.dev"), true);
    assert.equal(isExternalLink("tel:+1234567890"), true);
    assert.equal(isExternalLink("javascript:void(0)"), true);

    // Internal links should not be classified as external
    assert.equal(isExternalLink("/docs"), false);
    assert.equal(isExternalLink("/docs/getting-started"), false);
    assert.equal(isExternalLink("./contributing"), false);
    assert.equal(isExternalLink("../stellar"), false);
    assert.equal(isExternalLink("#prerequisites"), false);
  });

  test("extractLinks parses markdown, tag, and layout links with correct line numbers", async () => {
    const { extractLinks } = await getModule();
    const sample = [
      "# Sample Page",
      "",
      "A normal line with [First Link](/docs/first) and [Second Link](/docs/second).",
      "An image ![Alt text](/image.png) should not be treated as a page link.",
      '<Link href="/docs/third">JSX Link</Link>',
      '<a href="/docs/fourth">HTML Link</a>',
      "```bash",
      "[Fake Link inside code](/docs/ignored)",
      "<a href=\"/docs/ignored\">Ignored</a>",
      "```",
      "After code fence: [Fifth Link](/docs/fifth)",
      "",
      "[ref-link]: /docs/ref",
    ].join("\n");

    const links = extractLinks("sample/page.mdx", sample);

    assert.deepEqual(
      links.map((l: { rawHref: string; line: number }) => ({ href: l.rawHref, line: l.line })),
      [
        { href: "/docs/first", line: 3 },
        { href: "/docs/second", line: 3 },
        { href: "/docs/third", line: 5 },
        { href: "/docs/fourth", line: 6 },
        { href: "/docs/fifth", line: 11 },
        { href: "/docs/ref", line: 13 },
      ]
    );
  });

  test("validateLink verifies valid routes, fragments, and relative paths", async () => {
    const { validateLink } = await getModule();
    const mockRoutes = new Map([
      ["/", { filePath: "page.tsx", anchors: new Set(["developers"]) }],
      ["/docs", { filePath: "docs/page.mdx", anchors: new Set(["feyo-documentation", "start-here"]) }],
      ["/docs/architecture", { filePath: "docs/architecture/page.mdx", anchors: new Set(["architecture", "trust-model"]) }],
      ["/docs/getting-started", { filePath: "docs/getting-started/page.mdx", anchors: new Set(["getting-started", "prerequisites"]) }],
    ]);

    // Valid absolute links
    const res1 = validateLink("/docs/architecture", "/docs", mockRoutes);
    assert.equal(res1.valid, true);
    assert.equal(res1.targetRoute, "/docs/architecture");

    // Valid absolute link with fragment
    const res2 = validateLink("/docs/architecture#trust-model", "/docs", mockRoutes);
    assert.equal(res2.valid, true);
    assert.equal(res2.fragment, "trust-model");

    // Valid in-page fragment
    const res3 = validateLink("#prerequisites", "/docs/getting-started", mockRoutes);
    assert.equal(res3.valid, true);
    assert.equal(res3.targetRoute, "/docs/getting-started");
    assert.equal(res3.fragment, "prerequisites");

    // Valid relative link
    const res4 = validateLink("../architecture", "/docs/getting-started", mockRoutes);
    assert.equal(res4.valid, true);
    assert.equal(res4.targetRoute, "/docs/architecture");

    // External link skipped
    const resExt = validateLink("https://github.com", "/docs", mockRoutes);
    assert.equal(resExt.valid, true);
    assert.equal(resExt.external, true);
  });

  test("validateLink reports non-existent route and missing anchor", async () => {
    const { validateLink } = await getModule();
    const mockRoutes = new Map([
      ["/docs", { filePath: "docs/page.mdx", anchors: new Set(["overview"]) }],
      ["/docs/architecture", { filePath: "docs/architecture/page.mdx", anchors: new Set(["architecture"]) }],
    ]);

    // Non-existent route
    const resBrokenRoute = validateLink("/docs/non-existent-page", "/docs", mockRoutes);
    assert.equal(resBrokenRoute.valid, false);
    assert.match(resBrokenRoute.reason ?? "", /Target route "\/docs\/non-existent-page" does not exist/);

    // Missing anchor on valid route
    const resBrokenAnchor = validateLink("/docs/architecture#missing-anchor", "/docs", mockRoutes);
    assert.equal(resBrokenAnchor.valid, false);
    assert.match(resBrokenAnchor.reason ?? "", /Anchor "#missing-anchor" does not exist on route "\/docs\/architecture"/);

    // Missing in-page anchor
    const resBrokenSelfAnchor = validateLink("#missing-self-anchor", "/docs", mockRoutes);
    assert.equal(resBrokenSelfAnchor.valid, false);
    assert.match(resBrokenSelfAnchor.reason ?? "", /Anchor "#missing-self-anchor" does not exist on route "\/docs"/);
  });

  test("checkDocsLinks fails when a broken link is deliberately introduced", async () => {
    const { checkDocsLinks } = await getModule();

    // Create temporary isolated test tree
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "feyo-docs-test-"));
    try {
      const appDir = path.join(tempDir, "src/app");
      const docsDir = path.join(appDir, "docs");
      fs.mkdirSync(docsDir, { recursive: true });

      // Valid root docs page
      fs.writeFileSync(
        path.join(docsDir, "page.mdx"),
        "# Docs Home\n\nLink to [Valid Page](/docs/valid) and [Broken Link](/docs/does-not-exist)."
      );

      // Valid nested page
      const validSubDir = path.join(docsDir, "valid");
      fs.mkdirSync(validSubDir, { recursive: true });
      fs.writeFileSync(
        path.join(validSubDir, "page.mdx"),
        "# Valid Page\n\n## Sub Section\n\nLink to [Broken Anchor](/docs/valid#missing-heading)."
      );

      const result = checkDocsLinks({
        rootDir: tempDir,
        appDir,
        docsDir,
        silent: true,
      });

      assert.equal(result.success, false);
      assert.equal(result.errors.length, 2);

      // Error 1: broken route
      const routeErr = result.errors.find((e: { rawHref: string }) => e.rawHref === "/docs/does-not-exist");
      assert.ok(routeErr);
      assert.match(routeErr.reason, /Target route "\/docs\/does-not-exist" does not exist/);

      // Error 2: broken anchor
      const anchorErr = result.errors.find((e: { rawHref: string }) => e.rawHref === "/docs/valid#missing-heading");
      assert.ok(anchorErr);
      assert.match(anchorErr.reason, /Anchor "#missing-heading" does not exist/);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test("CLI command node scripts/check-docs-links.mjs exits 0 on valid docs", () => {
    const scriptPath = path.resolve(__dirname, "../../scripts/check-docs-links.mjs");
    const output = execFileSync(process.execPath, [scriptPath], {
      cwd: path.resolve(__dirname, "../.."),
      encoding: "utf8",
    });

    assert.match(output, /✓ \[docs:check\] Validated \d+ documentation pages/);
  });
});
