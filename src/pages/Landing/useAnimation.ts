import { useEffect, useRef, useState } from 'react';

export const useAnimation = (threshold = 0.12) => {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const animClass = (base: string, duration: string) =>
    `${base} ${duration} ${isVisible ? 'anim-visible' : ''}`;

  return { ref, isVisible, animClass };
};
