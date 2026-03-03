import { useEffect, useRef } from "react";

export function useScrollAnimation() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1 },
    );

    const elements = element.querySelectorAll(".fade-in-up");
    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return ref;
}
