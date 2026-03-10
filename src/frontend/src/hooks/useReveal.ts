import { useEffect, useRef } from "react";

/**
 * Attaches an IntersectionObserver to the returned ref.
 * Any child element with class `reveal-hidden` will gain `reveal-visible`
 * when it scrolls into view, triggering the CSS transition defined in index.css.
 *
 * Usage:
 *   const ref = useReveal();
 *   <section ref={ref}>
 *     <h2 className="reveal-hidden">Title</h2>
 *     <p  className="reveal-hidden reveal-delay-1">Body</p>
 *   </section>
 */
export function useReveal<T extends HTMLElement = HTMLElement>(
  threshold = 0.12,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold },
    );

    // Observe direct .reveal-hidden children as well as nested ones
    const targets = container.querySelectorAll(".reveal-hidden");
    for (const el of targets) {
      observer.observe(el);
    }

    // Also observe .scroll-animate children (legacy class)
    const legacy = container.querySelectorAll(".scroll-animate");
    for (const el of legacy) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
