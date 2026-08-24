import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
}

export function useSEO({ title, description, canonicalUrl }: SEOProps = {}) {
  const location = useLocation();

  useEffect(() => {
    const isEditor = location.pathname.startsWith('/editor');

    // Dynamic Title optimized for search intent and AI discoverability (GEO)
    const defaultTitle = isEditor
      ? 'CodeMotion Editor | Create Animated Code Videos & Snippets'
      : 'CodeMotion | Animated Code Snippet & Video Generator (MP4 & GIF)';

    document.title = title || defaultTitle;

    // Dynamic Meta Description
    const defaultDesc = isEditor
      ? 'Customize themes, background canvas, fonts, window frames, and trigger 60FPS animated typing motion for your code snippet.'
      : 'Free developer tool to convert source code into high-resolution images (2x/3x DPI), vector SVGs, and 60FPS animated typing motion videos (MP4 & GIF).';

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description || defaultDesc);
    }

    // Dynamic Canonical Link
    const currentUrl = `https://codemotion.biz.id${location.pathname}`;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', canonicalUrl || currentUrl);
    }
  }, [location.pathname, title, description, canonicalUrl]);
}
