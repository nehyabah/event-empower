import { useEffect } from "react";

/**
 * Reveals elements as they scroll into view.
 *
 * The wedding site had no scroll motion at all — every section was simply
 * present, which is most of why the templates read as flat regardless of
 * palette. Elements marked `data-reveal` start hidden and get their theme's
 * reveal animation the first time they enter the viewport.
 *
 * Done with IntersectionObserver rather than a scroll listener so it costs
 * nothing while scrolling, and each element is unobserved once shown so a
 * long page does not keep re-triggering.
 *
 * Respects prefers-reduced-motion: those visitors get the content
 * immediately, unanimated, rather than a page that appears empty.
 */
export function useScrollReveal(deps: unknown[] = []) {
  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (nodes.length === 0) return;

    if (reduced) {
      nodes.forEach((n) => n.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          // Staggering by position within its group is what makes a gallery
          // or a card row feel composed rather than everything landing at once.
          const delay = Number(el.dataset.revealDelay || 0);
          if (delay) el.style.animationDelay = `${delay}ms`;
          el.classList.add("is-revealed");
          observer.unobserve(el);
        }
      },
      // Fires a little before the element is fully on screen, so the motion
      // is already underway by the time it is properly in view.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
