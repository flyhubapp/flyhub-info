import { useEffect, useRef } from 'react';

/**
 * useScrollReveal — attaches an IntersectionObserver to a ref.
 * The element (or its children matching `selector`) gets class `visible`
 * when it enters the viewport.
 *
 * @param {object} options
 * @param {string}  options.selector   - CSS selector for child targets (optional)
 * @param {number}  options.threshold  - 0–1, how much of element must be visible
 * @param {string}  options.rootMargin - e.g. '0px 0px -60px 0px'
 * @param {boolean} options.once       - if true, unobserve after first reveal
 */
const useScrollReveal = ({
  selector = null,
  threshold = 0.15,
  rootMargin = '0px 0px -60px 0px',
  once = true,
} = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const targets = selector
      ? Array.from(container.querySelectorAll(selector))
      : [container];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove('visible');
          }
        });
      },
      { threshold, rootMargin }
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [selector, threshold, rootMargin, once]);

  return ref;
};

export default useScrollReveal;
