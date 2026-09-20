export const SITE_URL = 'https://www.shareholdervoting.in';

/**
 * 1. Organization Schema (Single Source of Truth)
 * Strictly factual data only: verified identity, contact point, URL, and logo.
 * No fabricated postal addresses, social profiles, or affiliations.
 */
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Vote India Secure',
  alternateName: ['Vote India Secure Platform', 'ShareholderVoting.in'],
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/logo-48.webp`,
  image: `${SITE_URL}/og-image.jpg`,
  description: 'Secure electronic voting and corporate governance software for shareholder general meetings, AGMs, EGMs, and resolutions.',
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@shareholdervoting.in',
    contactType: 'customer support',
    areaServed: 'IN',
    availableLanguage: 'en',
  },
};

/**
 * 2. WebSite Schema with Sitelinks Searchbox
 */
export const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: 'Vote India Secure',
  alternateName: 'Shareholder Voting Platform India',
  description: 'Secure online shareholder electronic voting platform for AGMs, EGMs, postal ballots, and corporate governance.',
  publisher: {
    '@id': `${SITE_URL}/#organization`,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/resources?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
  inLanguage: 'en-IN',
};

/**
 * 3. SoftwareApplication Schema
 * Evidence-backed features only.
 * Omit fabricated pricing since pricing is customized/quote-based per corporate event.
 */
export const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Vote India Secure',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, iOS, Android',
  url: SITE_URL,
  description: 'Secure corporate voting software for AGMs, EGMs and corporate resolutions with cryptographic audit trails and independent scrutinizer reporting.',
  featureList: [
    'SHA-256 cryptographic ballot integrity',
    'Verifiable Merkle audit trail',
    'PostgreSQL Row-Level Security',
    'Companies Act 2013 Section 108 workflow mapping',
    'Form MGT-13 aligned scrutinizer reporting',
    'Secure OTP shareholder authentication',
    'Real-time quorum progression monitoring',
    'Progressive Web App',
  ],
};

/**
 * 3b. Homepage @graph schema combining SoftwareApplication + Organization
 */
export const homepageSoftwareOrgGraphSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Vote India Secure',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web, iOS, Android',
      url: SITE_URL,
      description: 'Secure corporate voting software for AGMs, EGMs and corporate resolutions with cryptographic audit trails and independent scrutinizer reporting.',
      featureList: [
        'SHA-256 cryptographic ballot integrity',
        'Verifiable Merkle audit trail',
        'PostgreSQL Row-Level Security',
        'Companies Act 2013 Section 108 workflow mapping',
        'Form MGT-13 aligned scrutinizer reporting',
        'Secure OTP shareholder authentication',
        'Real-time quorum progression monitoring',
        'Progressive Web App',
      ],
    },
    {
      '@type': 'Organization',
      name: 'Vote India Secure',
      url: SITE_URL,
      logo: `${SITE_URL}/logo-48.webp`,
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'support@shareholdervoting.in',
        contactType: 'customer support',
        areaServed: 'IN',
        availableLanguage: 'en',
      },
    },
  ],
};

/**
 * Helper: Generate BreadcrumbList Schema
 */
export const createBreadcrumbSchema = (
  items: { name: string; url: string }[]
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url.startsWith('/') ? item.url : `/${item.url}`}`,
    })),
  };
};

/**
 * Helper: Generate FAQPage Schema (Only for pages with visible, complete FAQs)
 */
export const createFaqSchema = (
  faqs: { question: string; answer: string }[]
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};

/**
 * Helper: Generate Article Schema
 */
export const createArticleSchema = ({
  title,
  description,
  url,
  datePublished,
  dateModified,
  image = `${SITE_URL}/og-image.jpg`,
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}) => {
  const fullUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    url: fullUrl,
    image: image.startsWith('http') ? image : `${SITE_URL}${image}`,
    author: {
      '@type': 'Organization',
      name: 'Vote India Secure Governance Desk',
      url: `${SITE_URL}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Vote India Secure',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo-48.webp`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': fullUrl,
    },
  };
};

/**
 * Helper: Generate WebPage Schema with embedded BreadcrumbList
 */
export const createWebPageSchema = ({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) => {
  const fullUrl = url.startsWith('http') ? url : `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: fullUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Vote India Secure',
      url: SITE_URL,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name,
          item: fullUrl,
        },
      ],
    },
  };
};

export default {
  organizationSchema,
  webSiteSchema,
  softwareAppSchema,
  homepageSoftwareOrgGraphSchema,
  createBreadcrumbSchema,
  createFaqSchema,
  createArticleSchema,
  createWebPageSchema,
};
