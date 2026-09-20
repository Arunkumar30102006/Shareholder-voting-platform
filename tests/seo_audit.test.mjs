import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const BANNED_PATTERNS = [
  /AES-256\s+ballot\s+encryption/i,
  /AES-256\s+encryption\s+for\s+every\s+vote/i,
  /SEBI\s+approved/i,
  /MCA\s+approved/i,
  /Government\s+approved/i,
  /CDSL\s+affiliated/i,
  /NSDL\s+affiliated/i,
  /SOC\s*2\s+(Type\s+II\s+)?certified/i,
  /ISO\s*27001\s+certified/i,
  /100%\s+secure/i,
  /bank[\s-]grade/i,
  /military[\s-]grade/i,
  /99\.99%\s+uptime\s+guarantee/i,
  /48-hour\s+minimum\s+statutory/i,
  /Bandra\s+Kurla\s+Complex/i,
  /\bBKC\b.*Mumbai/i,
];

test("Rule 21: Prohibited regulatory and security claims are not present in public pages", () => {
  const publicDirs = [
    path.join(ROOT_DIR, "src", "pages", "seo"),
    path.join(ROOT_DIR, "src", "pages", "legal"),
    path.join(ROOT_DIR, "src", "pages", "resources"),
    path.join(ROOT_DIR, "src", "components", "home"),
  ];

  const singleFiles = [
    path.join(ROOT_DIR, "src", "pages", "Index.tsx"),
    path.join(ROOT_DIR, "src", "pages", "Features.tsx"),
    path.join(ROOT_DIR, "src", "components", "Navbar.tsx"),
    path.join(ROOT_DIR, "src", "components", "Footer.tsx"),
    path.join(ROOT_DIR, "src", "config", "seoConfig.ts"),
  ];

  const filesToScan = [...singleFiles];

  for (const dir of publicDirs) {
    if (fs.existsSync(dir)) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))) {
          filesToScan.push(path.join(dir, entry.name));
        }
      }
    }
  }

  const violations = [];

  for (const file of filesToScan) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, "utf-8");
    const relPath = path.relative(ROOT_DIR, file);

    for (const pattern of BANNED_PATTERNS) {
      if (pattern.test(content)) {
        violations.push(`${relPath} matched prohibited pattern: ${pattern}`);
      }
    }
  }

  assert.deepEqual(
    violations,
    [],
    `Found prohibited marketing claims in public files:\n${violations.join("\n")}`
  );
});

test("Canonical URLs are normalized to https://www.shareholdervoting.in with no trailing slash except root", async () => {
  const seoConfigFile = path.join(ROOT_DIR, "src", "config", "seoConfig.ts");
  assert.ok(fs.existsSync(seoConfigFile), "seoConfig.ts must exist");

  const content = fs.readFileSync(seoConfigFile, "utf-8");

  // Check SITE_URL
  assert.match(
    content,
    /export const SITE_URL = 'https:\/\/www\.shareholdervoting\.in';/,
    "SITE_URL must be production canonical domain"
  );

  // Extract canonical definitions
  const canonicalMatches = content.matchAll(/canonical:\s*`\${SITE_URL}([^`]*)`/g);
  for (const match of canonicalMatches) {
    const route = match[1];
    if (route === "/") {
      // Root is allowed trailing slash
      continue;
    }
    assert.ok(
      !route.endsWith("/"),
      `Canonical URL for ${route} must not have trailing slash`
    );
  }
});

test("Public sitemap.xml contains essential commercial, statutory, and resource routes", () => {
  const sitemapPath = path.join(ROOT_DIR, "public", "sitemap.xml");
  assert.ok(fs.existsSync(sitemapPath), "public/sitemap.xml must exist");

  const sitemap = fs.readFileSync(sitemapPath, "utf-8");

  const expectedRoutes = [
    "https://www.shareholdervoting.in/",
    "https://www.shareholdervoting.in/shareholder-e-voting",
    "https://www.shareholdervoting.in/agm-voting",
    "https://www.shareholdervoting.in/egm-voting",
    "https://www.shareholdervoting.in/corporate-voting",
    "https://www.shareholdervoting.in/proxy-voting",
    "https://www.shareholdervoting.in/scrutinizer-tools",
    "https://www.shareholdervoting.in/regulatory-framework",
    "https://www.shareholdervoting.in/resources",
    "https://www.shareholdervoting.in/resources/what-is-shareholder-e-voting",
    "https://www.shareholdervoting.in/resources/how-agm-e-voting-works",
    "https://www.shareholdervoting.in/resources/how-egm-e-voting-works",
    "https://www.shareholdervoting.in/resources/how-proxy-voting-works",
    "https://www.shareholdervoting.in/resources/record-date-and-voting-entitlement",
    "https://www.shareholdervoting.in/resources/ordinary-vs-special-resolution",
    "https://www.shareholdervoting.in/resources/scrutinizer-voting-workflow",
  ];

  for (const url of expectedRoutes) {
    assert.ok(
      sitemap.includes(`<loc>${url}</loc>`),
      `sitemap.xml must include canonical route: ${url}`
    );
  }
});

test("robots.txt does not disallow private HTML pages so crawlers discover noindex tags", () => {
  const robotsPath = path.join(ROOT_DIR, "public", "robots.txt");
  assert.ok(fs.existsSync(robotsPath), "public/robots.txt must exist");

  const robots = fs.readFileSync(robotsPath, "utf-8");

  // Private HTML routes should NOT be in robots.txt Disallow
  assert.ok(!robots.includes("Disallow: /shareholder-login"), "robots.txt must NOT disallow /shareholder-login");
  assert.ok(!robots.includes("Disallow: /company-login"), "robots.txt must NOT disallow /company-login");
  assert.ok(!robots.includes("Disallow: /company-dashboard"), "robots.txt must NOT disallow /company-dashboard");
  assert.ok(!robots.includes("Disallow: /voting-dashboard"), "robots.txt must NOT disallow /voting-dashboard");

  // API paths SHOULD be in robots.txt Disallow
  assert.ok(robots.includes("Disallow: /api/"), "robots.txt must disallow /api/");
  assert.ok(robots.includes("Disallow: /supabase-proxy/"), "robots.txt must disallow /supabase-proxy/");
});

test("Statutory resource articles have required attribution fields", async () => {
  const articlesPath = path.join(ROOT_DIR, "src", "pages", "resources", "articlesData.ts");
  assert.ok(fs.existsSync(articlesPath), "articlesData.ts must exist");

  const content = fs.readFileSync(articlesPath, "utf-8");

  const expectedSlugs = [
    "what-is-shareholder-e-voting",
    "how-agm-e-voting-works",
    "how-egm-e-voting-works",
    "how-proxy-voting-works",
    "record-date-and-voting-entitlement",
    "ordinary-vs-special-resolution",
    "scrutinizer-voting-workflow",
  ];

  for (const slug of expectedSlugs) {
    assert.ok(
      content.includes(`'${slug}':`),
      `articlesData.ts must define article for slug: ${slug}`
    );
  }

  // Verify all articles carry 2026-09-20 lastReviewedDate
  assert.ok(
    content.includes("lastReviewedDate: '2026-09-20'"),
    "All statutory articles must carry lastReviewedDate 2026-09-20"
  );
});
