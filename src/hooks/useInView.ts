import { useEffect, useState, type RefObject } from 'react';

export function useInView(
  ref: RefObject<HTMLElement | null>,
  options?: IntersectionObserverInit,
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      options,
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options]);

  return inView;
}
