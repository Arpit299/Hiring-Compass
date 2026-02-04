/**
 * Scroll-Driven Storytelling — Code Examples & Recipes
 * 
 * This file contains copy-paste examples for extending the scroll-driven UI.
 */

// ============================================================================
// EXAMPLE 1: Create a Custom Animated Section
// ============================================================================

/**
 * Reusable section wrapper with customizable animations
 * Usage: <AnimatedSection icon={<Icon />} title="Your Title">...</AnimatedSection>
 */
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

export const AnimatedSection = ({
  children,
  icon: Icon,
  title,
  color = 'blue', // 'blue' | 'cyan' | 'emerald' | 'violet' | 'amber'
  stepNumber,
}: {
  children: React.ReactNode;
  icon: React.ComponentType<{ className: string }>;
  title: string;
  color?: string;
  stepNumber: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const colorMap = {
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', bgRing: 'bg-blue-600' },
    cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', bgRing: 'bg-cyan-600' },
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', bgRing: 'bg-emerald-600' },
    violet: { bg: 'bg-violet-500/20', text: 'text-violet-400', bgRing: 'bg-violet-600' },
    amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', bgRing: 'bg-amber-600' },
  };

  const c = colorMap[color as keyof typeof colorMap] || colorMap.blue;

  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0.7, 1]);
  const y = useTransform(scrollYProgress, [0, 0.3, 1], [40, 20, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 1], [0.95, 0.98, 1]);

  return (
    <motion.div ref={ref} style={{ opacity, y, scale }} className="mb-12">
      <motion.article className="glass-panel p-8 rounded-lg border border-white/[0.1]">
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            className={`w-10 h-10 rounded-full ${c.bg} flex items-center justify-center`}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className={`text-sm font-bold ${c.text}`}>{stepNumber}</span>
          </motion.div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {Icon && <Icon className={`w-6 h-6 ${c.text}`} />}
            {title}
          </h2>
        </div>
        {children}
      </motion.article>
    </motion.div>
  );
};

// ============================================================================
// EXAMPLE 2: Staggered List Animation
// ============================================================================

/**
 * List that reveals items one by one as you scroll past
 */
export const StaggeredList = ({
  items,
  className = '',
}: {
  items: Array<{ label: string; description?: string }>;
  className?: string;
}) => {
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((item, idx) => (
        <motion.li
          key={item.label}
          className="flex items-start gap-3 text-sm text-gray-300"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ delay: idx * 0.1, duration: 0.5 }}
        >
          <span className="text-emerald-400 font-bold mt-1">✓</span>
          <div>
            <p className="font-medium">{item.label}</p>
            {item.description && <p className="text-gray-500 mt-1">{item.description}</p>}
          </div>
        </motion.li>
      ))}
    </ul>
  );
};

// Usage:
// <StaggeredList items={[
//   { label: 'Item 1', description: 'Optional description' },
//   { label: 'Item 2' },
// ]} />

// ============================================================================
// EXAMPLE 3: Animated Stats Counter
// ============================================================================

/**
 * Number that counts up from 0 to target as section scrolls into view
 */
export const AnimatedCounter = ({
  target,
  suffix = '',
  duration = 1000,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const increment = target / (duration / 16); // 16ms per frame (~60fps)

    const animate = () => {
      countRef.current += increment;
      if (countRef.current >= target) {
        setCount(target);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      } else {
        setCount(Math.floor(countRef.current));
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [target, duration]);

  return (
    <span className="font-bold text-blue-400">
      {count}
      {suffix}
    </span>
  );
};

// Usage:
// <p>Your score: <AnimatedCounter target={87} suffix="/100" duration={1200} /></p>

// ============================================================================
// EXAMPLE 4: Animated Progress Bar (Custom)
// ============================================================================

/**
 * Horizontal progress bar that fills based on scroll progress
 */
export const AnimatedProgressBar = ({
  progress, // 0-100
  label = '',
  color = 'blue',
}: {
  progress: number;
  label?: string;
  color?: 'blue' | 'emerald' | 'amber' | 'red';
}) => {
  const colorMap = {
    blue: 'from-blue-500 to-cyan-400',
    emerald: 'from-emerald-500 to-teal-400',
    amber: 'from-amber-500 to-orange-400',
    red: 'from-red-500 to-pink-400',
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-gray-400">{label}</p>}
      <div className="w-full h-2 bg-midnight-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${colorMap[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <p className="text-xs text-gray-500 text-right">{progress}%</p>
    </div>
  );
};

// Usage:
// <AnimatedProgressBar progress={85} label="Technical Skills" color="blue" />

// ============================================================================
// EXAMPLE 5: Parallax Effect (Advanced)
// ============================================================================

/**
 * Background moves slower than foreground, creating depth illusion
 */
export const ParallaxSection = ({
  children,
  // offset parameter (unused in current implementation)
}: {
  children: React.ReactNode;
  offset?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, (value) => value * 0.5); // 50% of scroll speed

  return (
    <motion.div ref={ref} style={{ y }} className="relative">
      {children}
    </motion.div>
  );
};

// Usage:
// <ParallaxSection offset={50}>
//   <div>Your content with parallax effect</div>
// </ParallaxSection>

// ============================================================================
// EXAMPLE 6: Scroll-Snap Sections (Keyboard Support)
// ============================================================================

/**
 * SCROLL UTILITY FUNCTIONS
 * NOTE: These utilities are now in src/hooks/useScrollUtils.ts
 * Import them from there instead of this file to comply with React rules
 */

import {
  useIsMobile,
  useLazyLoad,
  useScrollToSection as getScrollToSection,
  useTheme,
  trackScrollDepth,
  exportToPDF,
} from '../hooks/useScrollUtils';

// Export the utilities for backward compatibility
// Note: utility hooks and functions are now in src/hooks/useScrollUtils.ts

/**
 * Button that smoothly scrolls to a target section
 */
export const ScrollToButton = ({
  targetId,
  children,
}: {
  targetId: string;
  children: React.ReactNode;
}) => {
  const handleClick = () => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
};

// Usage:
// <ScrollToButton targetId="section-4">Jump to Market Pulse</ScrollToButton>
// <div id="section-4">Market Pulse Content</div>

// ============================================================================
// TIPS FOR PERFORMANCE
// ============================================================================

/**
 * Best Practices:
 *
 * 1. Use useTransform instead of animate for scroll-driven animations
 *    ❌ animate={{ opacity: scrollProgress }}  // Re-renders every frame
 *    ✅ opacity: useTransform(scrollProgress, ...)  // GPU-accelerated
 *
 * 2. Limit simultaneous animations
 *    ❌ Animate 50+ elements at once = jank
 *    ✅ Stagger animations with delays = smooth
 *
 * 3. Use will-change for GPU layers
 *    <div style={{ willChange: 'transform' }}>
 *
 * 4. Respect prefers-reduced-motion
 *    if (prefersReducedMotion()) { skip animations }
 *
 * 5. Optimize images
 *    Use next/image or webp format
 *
 * 6. Lazy-load heavy content
 *    useLazyLoad() to load only when visible
 *
 * 7. Profile in DevTools
 *    Performance tab → Record scroll interaction
 *    Look for: FPS, frame time, long tasks (>50ms)
 */

export default {
  AnimatedSection,
  StaggeredList,
  AnimatedCounter,
  AnimatedProgressBar,
  ParallaxSection,
  getScrollToSection,
  exportToPDF,
  useIsMobile,
  useLazyLoad,
  useTheme,
  trackScrollDepth,
  ScrollToButton,
};

