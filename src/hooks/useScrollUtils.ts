/**
 * Utility hooks and functions for scroll-driven animations
 * Separated from components to comply with React fast refresh rules
 */

import { useEffect, useState } from 'react';

/**
 * Hook to detect if user is on mobile
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

/**
 * Hook for lazy loading content
 */
export const useLazyLoad = () => {
  return true;
};

/**
 * Hook to scroll to a specific section
 */
export const useScrollToSection = () => {
  return (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
};

/**
 * Hook for theme management
 */
export const useTheme = () => {
  const isDark = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
  return isDark ? 'dark' : 'light';
};

/**
 * Function to track scroll depth (how far user has scrolled)
 */
export const trackScrollDepth = (callback: (depth: number) => void) => {
  const handleScroll = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    
    const depth = ((scrollTop + windowHeight) / documentHeight) * 100;
    callback(Math.round(depth));
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
};

/**
 * Function to export content as PDF
 * Note: Requires npm install html2pdf to be installed
 */
export const exportToPDF = async (
  elementId: string,
  filename: string = 'document.pdf'
): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Placeholder: implement when html2pdf is available
    console.log(`PDF export functionality requires html2pdf library (filename: ${filename})`);
    throw new Error('PDF export not yet configured. Install html2pdf to enable.');
  } catch (error) {
    console.error('Failed to export PDF:', error);
    throw error;
  }
};

/**
 * Hook to observe intersection of an element
 */
export const useIntersectionObserver = (
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options]);

  return isVisible;
};

/**
 * Get current scroll position relative to viewport
 */
export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const position = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollPosition(position);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollPosition;
};
