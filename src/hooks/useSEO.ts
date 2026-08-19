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

    // Dynamic Title according to route
    const defaultTitle = isEditor
      ? 'CodeMotion Editor — Visual Code Snippet & Motion Generator'
      : 'CodeMotion — Turn Code into High-Res Images & Animated Videos';
    
    document.title = title || defaultTitle;

    // Dynamic Meta Description
    const defaultDesc = isEditor
      ? 'Customize themes, background canvas, fonts, window frames, and trigger animated typing motion for your code snippet.'
      : 'Zero-friction developer tool to turn plain source code into aesthetic, high-resolution snippet images and typing motion videos.';

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description || defaultDesc);
    }

    // Dynamic Canonical Link
    const currentUrl = `https://codemotion.biz.id${location.pathname}`;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', canonicalUrl || currentUrl);
    }
  }, [location.pathname, title, description, canonicalUrl]);
}
