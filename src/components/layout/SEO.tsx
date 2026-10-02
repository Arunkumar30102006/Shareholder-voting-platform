import { Head } from 'vite-react-ssg';
import { SITE_URL, SEO_CONFIG } from '@/config/seoConfig';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: string;
  name?: string;
  image?: string;
  /** @deprecated keywords meta tag is ignored by Google — not rendered */
  keywords?: string;
  schema?: object;
  schemas?: object[];
  noindex?: boolean;
}

export const SEO = ({
  title,
  description,
  canonical,
  type,
  name = 'Vote India Secure',
  image,
  schema,
  schemas,
  noindex = false,
}: SEOProps) => {
  // Normalize canonical path
  const normalizedPath = canonical
    ? (canonical.startsWith('http')
        ? canonical.replace(SITE_URL, '')
        : (canonical === '/' ? '/' : (canonical.startsWith('/') ? canonical : `/${canonical}`)))
    : '/';

  // Lookup route configuration fallback
  const config = SEO_CONFIG[normalizedPath];

  const resolvedTitle = title || config?.title || 'E-Voting Platform for AGM & EGM | Vote India Secure';
  const resolvedDescription = description || config?.description || 'Secure e-voting software for AGMs, EGMs and postal ballots in India. SHA-256 sealed ballots, Section 108 workflows and MGT-13 aligned scrutinizer reports.';
  const resolvedType = type || config?.ogType || 'website';
  const resolvedImage = image || config?.ogImage || `${SITE_URL}/og-image.jpg`;

  // Ensure canonical URL is always absolute and normalized to production domain
  const canonicalUrl = `${SITE_URL}${normalizedPath === '/' ? '/' : normalizedPath}`;

  // Prevent duplicate brand name if title already includes it
  const hasBranding = resolvedTitle.includes('Vote India Secure') || resolvedTitle.includes('Vote Secure');
  const fullTitle = hasBranding ? resolvedTitle : `${resolvedTitle} | Vote India Secure`;

  // Full image URL
  const imageUrl = resolvedImage.startsWith('http') ? resolvedImage : `${SITE_URL}${resolvedImage.startsWith('/') ? resolvedImage : `/${resolvedImage}`}`;

  // Merge single schema and schemas array
  const allSchemas: object[] = [];
  if (schema) allSchemas.push(schema);
  if (schemas) allSchemas.push(...schemas);

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta name="author" content={name} />

      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <>
          <link rel="canonical" href={canonicalUrl} />
          <link rel="alternate" hrefLang="en-IN" href={canonicalUrl} />
          <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
          <meta name="geo.region" content="IN" />
          <meta name="content-language" content="en-IN" />
          <meta
            name="robots"
            content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
          />
        </>
      )}

      {/* Open Graph / Social */}
      <meta property="og:locale" content="en_IN" />
      <meta property="og:type" content={resolvedType} />
      {!noindex && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:alt" content={`${name} — Secure Corporate E-Voting Platform`} />
      <meta property="og:site_name" content={name} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={`${name} — Secure Corporate E-Voting Platform`} />

      {/* JSON-LD Schemas (Only rendered for indexable public pages without noindex) */}
      {!noindex &&
        allSchemas.map((s, i) => (
          <script key={`schema-${i}`} type="application/ld+json">
            {JSON.stringify(s)}
          </script>
        ))}
    </Head>
  );
};

export default SEO;
