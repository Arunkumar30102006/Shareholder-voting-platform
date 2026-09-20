/**
 * generate-sitemap.cjs
 * 
 * Post-build script that generates dist/sitemap.xml and public/sitemap.xml
 * with all canonical public routes.
 * 
 * Usage: node scripts/generate-sitemap.cjs
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.shareholdervoting.in';
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'public');

const routeEntries = [
  // Homepage
  { path: '/', lastmod: '2026-09-20', changefreq: 'weekly', priority: '1.0' },

  // E-Voting Core Solutions
  { path: '/shareholder-e-voting', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.9' },
  { path: '/agm-voting', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.9' },
  { path: '/egm-voting', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.9' },
  { path: '/corporate-voting', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.9' },
  { path: '/proxy-voting', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.9' },
  { path: '/scrutinizer-tools', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.9' },
  { path: '/remote-e-voting', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.8' },
  { path: '/online-e-voting', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.8' },
  { path: '/secure-voting', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.8' },

  // Trust, Security & Compliance
  { path: '/security', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.8' },
  { path: '/regulatory-framework', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.8' },
  { path: '/compliance', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.8' },
  { path: '/data-protection', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.8' },
  { path: '/how-it-works', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.8' },
  { path: '/features', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.7' },
  { path: '/faqs', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.7' },
  { path: '/about', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.7' },
  { path: '/services', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.7' },
  { path: '/pricing', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.7' },
  { path: '/demo', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.6' },

  // Interactive & Contact
  { path: '/contact', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.7' },
  { path: '/live-demo', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.6' },

  // Resources & Educational Guides
  { path: '/resources', lastmod: '2026-09-20', changefreq: 'weekly', priority: '0.8' },
  { path: '/resources/what-is-shareholder-e-voting', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.8' },
  { path: '/resources/how-agm-e-voting-works', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.8' },
  { path: '/resources/how-egm-e-voting-works', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.8' },
  { path: '/resources/how-proxy-voting-works', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.8' },
  { path: '/resources/record-date-and-voting-entitlement', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.8' },
  { path: '/resources/ordinary-vs-special-resolution', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.8' },
  { path: '/resources/scrutinizer-voting-workflow', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.8' },

  // Blog & Secondary Guides
  { path: '/blog', lastmod: '2026-09-20', changefreq: 'weekly', priority: '0.7' },
  { path: '/blog/sebi-compliant-evoting-guide', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.7' },
  { path: '/blog/role-of-scrutinizer-form-mgt-13', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.7' },
  { path: '/blog/agm-remote-evoting-timeline-checklist', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.7' },
  { path: '/blog/how-online-shareholder-voting-works', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.7' },
  { path: '/blog/agm-evoting-vs-physical-meeting', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.7' },
  { path: '/blog/benefits-electronic-voting-shareholders', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.7' },

  // Legal
  { path: '/privacy-policy', lastmod: '2026-08-01', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms-of-service', lastmod: '2026-08-01', changefreq: 'yearly', priority: '0.3' },
  { path: '/sebi-compliance', lastmod: '2026-09-20', changefreq: 'monthly', priority: '0.5' },
];

const urlEntries = routeEntries.map(({ path: routePath, lastmod, changefreq, priority }) => {
  const loc = routePath === '/' ? SITE_URL + '/' : SITE_URL + routePath;
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

if (fs.existsSync(DIST_DIR)) {
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap, 'utf-8');
}

if (fs.existsSync(PUBLIC_DIR)) {
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemap, 'utf-8');
}

console.log(`✅ sitemap.xml generated with ${routeEntries.length} URLs → dist/sitemap.xml & public/sitemap.xml`);
