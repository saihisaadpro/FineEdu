import { useEffect, useRef, useState } from 'react';

/**
 * Smoothly animates a number from its previous value to the target value
 * using requestAnimationFrame. No external dependencies.
 */
export function useAnimatedNumber(target: number, duration = 600): number {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);

  useEffect(() => {
    const from = prevRef.current;
    if (from === target) return;

    const start = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (target - from) * eased));

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        prevRef.current = target;
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return display;
}
