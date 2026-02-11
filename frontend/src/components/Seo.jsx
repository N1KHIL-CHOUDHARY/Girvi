import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_TITLE = 'PawnManager – Pawn Shop Management Software';
const TITLE_SUFFIX = ' | PawnManager';

function ensureMetaTag(name) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  return tag;
}

function ensureCanonicalLink() {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  return link;
}

/**
 * Simple per-page SEO helper.
 * - Sets document.title
 * - Updates meta description
 * - Manages a single canonical <link>
 * - Optionally injects JSON-LD for the page
 */
export default function Seo({ title, description, canonicalPath, jsonLd }) {
  const location = useLocation();

  useEffect(() => {
    const fullTitle = title
      ? `${title}${TITLE_SUFFIX}`
      : DEFAULT_TITLE;

    document.title = fullTitle;

    if (description) {
      const descriptionTag = ensureMetaTag('description');
      descriptionTag.setAttribute('content', description);
    }

    const canonicalUrl = `${window.location.origin}${
      canonicalPath || location.pathname
    }`;
    const canonicalLink = ensureCanonicalLink();
    canonicalLink.setAttribute('href', canonicalUrl);

    const SCRIPT_ID = 'page-structured-data';

    if (jsonLd) {
      const existing = document.getElementById(SCRIPT_ID);
      if (existing) {
        existing.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = SCRIPT_ID;
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);

      return () => {
        const cleanup = document.getElementById(SCRIPT_ID);
        if (cleanup) cleanup.remove();
      };
    }

    return undefined;
  }, [title, description, canonicalPath, location.pathname, jsonLd]);

  return null;
}

