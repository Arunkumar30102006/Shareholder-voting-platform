/**
 * Centralized SEO Configuration
 * Single Source of Truth for Route Metadata, Canonical URLs, and Open Graph tags.
 * Production Domain: https://www.shareholdervoting.in
 *
 * Rules enforced:
 *  – title  ≤ 60 characters (including brand suffix)
 *  – description ≤ 155 characters
 *  – primary keyword near the start of both title and description
 *  – every route targets a DISTINCT primary keyword (no overlap/cannibalization)
 */

export const SITE_URL = 'https://www.shareholdervoting.in';

export interface RouteSEOConfig {
  title: string;
  description: string;
  canonical: string;
  h1: string;
  robots?: string;
  ogType?: string;
  ogImage?: string;
  contentUpdatedAt: string; // YYYY-MM-DD representing last substantial content revision
}

export const SEO_CONFIG: Record<string, RouteSEOConfig> = {
  /* ─── Homepage ─── */
  '/': {
    title: 'E-Voting Platform for AGM & EGM | Vote India Secure',
    description: 'Secure e-voting software for AGMs, EGMs and postal ballots in India. SHA-256 sealed ballots, Section 108 workflows and MGT-13 aligned scrutinizer reports.',
    canonical: `${SITE_URL}/`,
    h1: 'Shareholder E-Voting Platform for Companies',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },

  /* ─── SEO Landing Pages ─── */
  '/shareholder-e-voting': {
    title: 'Shareholder E-Voting Software India | Vote India Secure',
    description: 'Online shareholder e-voting with OTP authentication, weighted share voting and SHA-256 ballot receipts. Section 108 compliant platform for Indian companies.',
    canonical: `${SITE_URL}/shareholder-e-voting`,
    h1: 'Shareholder E-Voting Software',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/agm-voting': {
    title: 'AGM Voting Software | Section 96 Compliant',
    description: 'Annual General Meeting voting platform with pre-AGM remote polls, InstaPoll venue voting and Form MGT-13 scrutinizer exports. Section 96 & 108 aligned.',
    canonical: `${SITE_URL}/agm-voting`,
    h1: 'AGM E-Voting Platform for Companies',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/egm-voting': {
    title: 'EGM E-Voting for Special Resolutions | Vote India Secure',
    description: 'Extraordinary General Meeting e-voting for urgent Section 100 requisitions and special resolutions. Statutory timelines, quorum tracking and audit logs.',
    canonical: `${SITE_URL}/egm-voting`,
    h1: 'Extraordinary General Meeting E-Voting Platform',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/corporate-voting': {
    title: 'Corporate Governance Voting Platform | Vote India Secure',
    description: 'Board election and resolution voting software with tamper-evident audit logs, SEBI LODR Regulation 44 mapping and institutional governance workflows.',
    canonical: `${SITE_URL}/corporate-voting`,
    h1: 'Corporate Governance Voting Platform',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/proxy-voting': {
    title: 'Proxy Voting Software | Section 105 & MGT-11',
    description: 'Digital proxy voting under Section 105 with Form MGT-11 tracking, 48-hour deposit windows and dual-vote prevention for shareholder general meetings.',
    canonical: `${SITE_URL}/proxy-voting`,
    h1: 'Corporate Proxy Voting Software',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/scrutinizer-tools': {
    title: 'Scrutinizer Report & Audit Tools | Vote India Secure',
    description: 'Independent scrutinizer portal with dual-witness unblocking, Merkle audit trail verification and Form MGT-13 aligned report generation for general meetings.',
    canonical: `${SITE_URL}/scrutinizer-tools`,
    h1: 'Scrutinizer Voting Reports & Audit Tools',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/remote-e-voting': {
    title: 'Remote E-Voting Under Rule 20 | Vote India Secure',
    description: 'Remote e-voting platform for pre-meeting shareholder ballots under Rule 20(4). Three-day voting window, cut-off date validation and encrypted submissions.',
    canonical: `${SITE_URL}/remote-e-voting`,
    h1: 'Remote E-Voting Under Rule 20',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/online-e-voting': {
    title: 'Online Voting for General Meetings | Vote India Secure',
    description: 'Online electronic voting platform for listed and unlisted companies. Mobile-first PWA with real-time quorum tracking and encrypted ballot submission.',
    canonical: `${SITE_URL}/online-e-voting`,
    h1: 'Online E-Voting for General Meetings',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/secure-voting': {
    title: 'Secure Voting Architecture | Vote India Secure',
    description: 'Cryptographic voting security with SHA-256 hashing, Merkle audit trees, TLS 1.3 encryption and PostgreSQL Row-Level Security for tamper-proof ballots.',
    canonical: `${SITE_URL}/secure-voting`,
    h1: 'Secure Voting Architecture',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },

  /* ─── Public Pages ─── */
  '/security': {
    title: 'Voting Security Architecture | Vote India Secure',
    description: 'Transparent security model: SHA-256 ballot hashing, Merkle audit trees, PostgreSQL RLS, TLS 1.3 encryption and secret ballot preservation.',
    canonical: `${SITE_URL}/security`,
    h1: 'Shareholder Voting Security Architecture',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/pricing': {
    title: 'E-Voting Pricing Plans | Vote India Secure',
    description: 'Transparent pricing tiers for corporate e-voting software. Plans for startups, growing companies and large enterprises conducting AGMs and EGMs.',
    canonical: `${SITE_URL}/pricing`,
    h1: 'Corporate Voting Software Pricing',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/about': {
    title: 'About Us | Vote India Secure',
    description: 'Meet the team behind Vote India Secure: our engineering mission, cryptographic security model and statutory alignment for Indian shareholder e-voting.',
    canonical: `${SITE_URL}/about`,
    h1: 'About Vote India Secure',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/contact': {
    title: 'Contact Support | Vote India Secure',
    description: 'Reach the Vote India Secure governance and technical support team for platform demos, event configuration and corporate voting inquiries.',
    canonical: `${SITE_URL}/contact`,
    h1: 'Contact Governance & Technology Support',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/features': {
    title: 'Platform Features & Capabilities | Vote India Secure',
    description: 'Weighted voting, real-time quorum monitoring, mobile PWA access, scrutinizer audit exports and end-to-end cryptographic ballot integrity.',
    canonical: `${SITE_URL}/features`,
    h1: 'Enterprise Voting Platform Capabilities',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/how-it-works': {
    title: 'How E-Voting Works | 5-Step Process',
    description: 'Step-by-step e-voting workflow: roster ingestion, OTP authentication, weighted ballot casting, SHA-256 sealing and scrutinizer verification.',
    canonical: `${SITE_URL}/how-it-works`,
    h1: 'How Corporate E-Voting Works',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/compliance': {
    title: 'SEBI & MCA Compliance Matrix | Vote India Secure',
    description: 'Detailed compliance mapping to SEBI LODR Regulation 44, Companies Act Section 108 and Rule 20 requirements for electronic shareholder voting.',
    canonical: `${SITE_URL}/compliance`,
    h1: 'Statutory Compliance Matrix',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/demo': {
    title: 'Request a Demo | Vote India Secure',
    description: 'Schedule a guided demonstration of the Vote India Secure e-voting platform. See weighted voting, scrutinizer tools and audit reports in action.',
    canonical: `${SITE_URL}/demo`,
    h1: 'Request a Platform Demo',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/live-demo': {
    title: 'Interactive Live Demo | Vote India Secure',
    description: 'Try the live interactive demo: cast sample ballots, explore scrutinizer unblocking and generate Form MGT-13 reports without registration.',
    canonical: `${SITE_URL}/live-demo`,
    h1: 'Interactive Live Demo',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/services': {
    title: 'E-Voting Services | Vote India Secure',
    description: 'End-to-end corporate e-voting services: event setup, shareholder roster management, real-time monitoring and post-meeting scrutinizer reporting.',
    canonical: `${SITE_URL}/services`,
    h1: 'E-Voting Services',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },

  /* ─── FAQs ─── */
  '/faqs': {
    title: 'E-Voting FAQs | Companies Act & SEBI',
    description: 'FAQs on Indian corporate e-voting: Section 108 mandates, cut-off dates, DP ID logins, scrutinizer Form MGT-13 procedures and ballot security.',
    canonical: `${SITE_URL}/faqs`,
    h1: 'Frequently Asked Questions',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },

  /* ─── Blog ─── */
  '/blog': {
    title: 'Blog & Regulatory Insights | Vote India Secure',
    description: 'Expert articles on SEBI e-voting regulations, Companies Act compliance, scrutinizer best practices and corporate governance trends in India.',
    canonical: `${SITE_URL}/blog`,
    h1: 'Blog & Regulatory Insights',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },

  /* ─── Resources ─── */
  '/resources': {
    title: 'E-Voting Statutory Guides & Resources | Vote India Secure',
    description: 'Statutory guides on Section 108 timelines, SEBI LODR Regulation 44, Form MGT-13 workflows and record date entitlements for corporate secretaries.',
    canonical: `${SITE_URL}/resources`,
    h1: 'Statutory E-Voting Knowledge Base & Resources',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/resources/what-is-shareholder-e-voting': {
    title: 'What is Shareholder E-Voting? | Statutory Guide',
    description: 'Primer on electronic voting under Companies Act Section 108: legal mandate, physical vs remote comparison, benefits and technical prerequisites.',
    canonical: `${SITE_URL}/resources/what-is-shareholder-e-voting`,
    h1: 'What is Shareholder E-Voting?',
    ogType: 'article',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/resources/how-agm-e-voting-works': {
    title: 'How AGM E-Voting Works | Section 108 Guide',
    description: 'AGM e-voting timeline: 21 clear days notice, remote voting window, venue ballot mechanics and quorum rules under Section 108 and Rule 20.',
    canonical: `${SITE_URL}/resources/how-agm-e-voting-works`,
    h1: 'How AGM E-Voting Works Under Section 108',
    ogType: 'article',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/resources/how-egm-e-voting-works': {
    title: 'How EGM E-Voting Works | Section 100 Guide',
    description: 'EGM e-voting procedures: Board and member requisitions under Section 100, short notice provisions and special resolution voting workflows.',
    canonical: `${SITE_URL}/resources/how-egm-e-voting-works`,
    h1: 'How EGM E-Voting Works Under Section 100',
    ogType: 'article',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/resources/how-proxy-voting-works': {
    title: 'Proxy Voting Under Section 105 | Statutory Guide',
    description: 'Legal rights and technical mechanisms of proxy voting: Form MGT-11 appointment, entitlement limits and dual-voting prevention under Section 105.',
    canonical: `${SITE_URL}/resources/how-proxy-voting-works`,
    h1: 'How Corporate Proxy Voting Works Under Section 105',
    ogType: 'article',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/resources/record-date-and-voting-entitlement': {
    title: 'Record Date & Voting Entitlement | Rule 20 Guide',
    description: 'Cut-off date determination under Rule 20(4)(vii), depository registry coordination and weighted shareholding calculation mechanics.',
    canonical: `${SITE_URL}/resources/record-date-and-voting-entitlement`,
    h1: 'Record Date & Voting Entitlement Mechanics',
    ogType: 'article',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/resources/ordinary-vs-special-resolution': {
    title: 'Ordinary vs Special Resolutions | Section 114',
    description: 'Statutory formulas and procedural differences between Ordinary and Special Resolutions under Section 114 of the Companies Act 2013.',
    canonical: `${SITE_URL}/resources/ordinary-vs-special-resolution`,
    h1: 'Ordinary vs Special Resolutions Under Section 114',
    ogType: 'article',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/resources/scrutinizer-voting-workflow': {
    title: 'Scrutinizer Workflow & Form MGT-13 | Guide',
    description: 'Role of the scrutinizer under Rule 20(4)(ix): unblocking votes before two witnesses, register maintenance and MGT-13 aligned reporting.',
    canonical: `${SITE_URL}/resources/scrutinizer-voting-workflow`,
    h1: 'Independent Scrutinizer Voting Workflow',
    ogType: 'article',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },

  /* ─── Legal & Compliance ─── */
  '/regulatory-framework': {
    title: 'E-Voting Regulatory Framework India | Vote India Secure',
    description: 'How platform workflows map to Section 108, Rule 20 and SEBI LODR Regulation 44 requirements for general meeting electronic voting.',
    canonical: `${SITE_URL}/regulatory-framework`,
    h1: 'Electronic Voting Regulatory Framework',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/data-protection': {
    title: 'Data Protection & Privacy | Vote India Secure',
    description: 'Shareholder data protection: encrypted storage, data localisation, DPDP Act 2023 alignment and governance policies for voting platforms.',
    canonical: `${SITE_URL}/data-protection`,
    h1: 'Data Protection & Governance Architecture',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-09-20',
  },
  '/privacy-policy': {
    title: 'Privacy Policy | Vote India Secure',
    description: 'Privacy policy and data governance practices for the Vote India Secure shareholder e-voting and corporate meeting administration platform.',
    canonical: `${SITE_URL}/privacy-policy`,
    h1: 'Privacy Policy',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-08-01',
  },
  '/terms-of-service': {
    title: 'Terms of Service | Vote India Secure',
    description: 'Terms governing use of the Vote India Secure platform for corporate voting events, meeting administration and governance services.',
    canonical: `${SITE_URL}/terms-of-service`,
    h1: 'Terms of Service',
    ogType: 'website',
    ogImage: `${SITE_URL}/og-image.jpg`,
    contentUpdatedAt: '2026-08-01',
  },
};
