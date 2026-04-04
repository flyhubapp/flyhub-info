import { useEffect, useRef } from 'react';

/**
 * useCountUp — animates a number from 0 to `end` when the element enters viewport.
 * Returns a ref to attach to the display element.
 *
 * @param {number} end      - target number
 * @param {number} duration - animation duration in ms
 * @param {string} suffix   - text appended after number (e.g. 'K+', '%')
 */
const useCountUp = (end, duration = 1800, suffix = '') => {
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            el.textContent = Math.floor(eased * end) + suffix;
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, suffix]);

  return ref;
};

export default useCountUp;
