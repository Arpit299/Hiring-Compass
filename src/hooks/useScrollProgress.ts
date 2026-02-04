import { useScroll, useTransform, MotionValue } from 'framer-motion';
import { useRef } from 'react';

/**
 * Hook to map scroll progress to animation values
 * Calculates scroll position relative to a target element
 * and maps it to a normalized 0-1 progress value
 */
export const useScrollProgress = (
  options?: {
    offset?: [
      'start end' | 'center end' | 'end end',
      'start start' | 'center start' | 'end start'
    ];
  }
) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: options?.offset ?? ['start end', 'end start'],
  });

  return { ref, scrollYProgress };
};

/**
 * Map scroll progress to animation values (fade in/out)
 * inputRange: [0, fadeInEnd, fadeOutStart, 1]
 * outputRange: [startOpacity, midOpacity, midOpacity, endOpacity]
 */
export const useScrollFade = (
  scrollProgress: MotionValue<number>,
  startOpacity = 0,
  endOpacity = 1,
  fadeInPoint = 0.3,
  fadeOutPoint = 0.9
) => {
  return useTransform(scrollProgress, [0, fadeInPoint, fadeOutPoint, 1], [
    startOpacity,
    endOpacity,
    endOpacity,
    startOpacity,
  ]);
};

/**
 * Map scroll progress to translateY (slide up/down)
 */
export const useScrollSlide = (scrollProgress: MotionValue<number>, distance = 40) => {
  return useTransform(scrollProgress, [0, 0.3, 1], [distance, 0, -distance]);
};

/**
 * Map scroll progress to scale (zoom in/out)
 */
export const useScrollScale = (scrollProgress: MotionValue<number>, minScale = 0.95, maxScale = 1.05) => {
  return useTransform(scrollProgress, [0, 0.5, 1], [minScale, maxScale, minScale]);
};

/**
 * Map scroll progress to rotation
 */
export const useScrollRotate = (scrollProgress: MotionValue<number>, maxRotate = 45) => {
  return useTransform(scrollProgress, [0, 0.5, 1], [-maxRotate, 0, maxRotate]);
};

/**
 * Map scroll progress to multiple values (combined animation)
 * Note: All hooks are called unconditionally to comply with React rules
 */
export const useScrollMulti = (
  scrollProgress: MotionValue<number>,
  keys: Array<'fade' | 'slide' | 'scale' | 'rotate'>,
  config?: {
    fadeStart?: number;
    fadeEnd?: number;
    slideDistance?: number;
    scaleMin?: number;
    scaleMax?: number;
    rotateMax?: number;
  }
) => {
  // Call all hooks unconditionally (required by React Hooks rules)
  const fadeValue = useScrollFade(
    scrollProgress,
    0,
    1,
    config?.fadeStart ?? 0.3,
    config?.fadeEnd ?? 0.9
  );
  
  const slideValue = useScrollSlide(scrollProgress, config?.slideDistance ?? 40);
  
  const scaleValue = useScrollScale(
    scrollProgress,
    config?.scaleMin ?? 0.95,
    config?.scaleMax ?? 1.05
  );
  
  const rotateValue = useScrollRotate(scrollProgress, config?.rotateMax ?? 45);

  // Build result object based on requested keys
  const result: Record<string, MotionValue<number>> = {};
  
  if (keys.includes('fade')) {
    result.opacity = fadeValue;
  }
  if (keys.includes('slide')) {
    result.y = slideValue;
  }
  if (keys.includes('scale')) {
    result.scale = scaleValue;
  }
  if (keys.includes('rotate')) {
    result.rotate = rotateValue;
  }

  return result;
};

