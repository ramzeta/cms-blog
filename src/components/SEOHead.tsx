import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  keywords?: string[];
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  image,
  url,
  type = 'article',
  publishedTime,
  modifiedTime,
  author,
  keywords = []
}) => {
  const siteTitle = 'Modern CMS';
  const fullTitle = `${title} | ${siteTitle}`;
  const canonicalUrl = url || window.location.href;

  return (
    <Helmet>
      {/* Basic metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}

      {/* OpenGraph metadata */}
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      {image && <meta property="og:image" content={image} />}
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter Card metadata */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* JSON-LD structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': type === 'article' ? 'Article' : 'WebPage',
          headline: title,
          description: description,
          image: image,
          datePublished: publishedTime,
          dateModified: modifiedTime,
          author: author ? {
            '@type': 'Person',
            name: author
          } : undefined,
          publisher: {
            '@type': 'Organization',
            name: siteTitle,
            logo: {
              '@type': 'ImageObject',
              url: `${window.location.origin}/logo.png`
            }
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;