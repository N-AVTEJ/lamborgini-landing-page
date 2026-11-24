import { useState, useEffect } from 'react';

/**
 * Hook to detect user preference for reduced motion.
 * Respects CSS media query `(prefers-reduced-motion: reduce)`.
 * Listens for dynamic changes at runtime.
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return Boolean(window.matchMedia('(prefers-reduced-motion: reduce)')?.matches);
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = (event) => {
      setPrefersReducedMotion(Boolean(event.matches));
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateMotionPreference);
      return () => mediaQuery.removeEventListener('change', updateMotionPreference);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(updateMotionPreference);
      return () => mediaQuery.removeListener(updateMotionPreference);
    }
  }, []);

  return prefersReducedMotion;
}
