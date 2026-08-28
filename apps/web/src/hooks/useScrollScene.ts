import { useEffect, useRef } from "react";

/**
 * Scroll-linked animation, as opposed to scroll-triggered.
 *
 * The reveal hook fires an animation once when an element appears, which is
 * why sections still read as blocks stacking up: the motion is unrelated to
 * what the reader is doing. This instead reports how far through a section
 * the reader has scrolled, as 0 → 1, and writes it to a CSS custom property.
 * Styles can then be driven by scroll position — the thing that makes a page
 * feel authored rather than merely animated.
 *
 * Writes `--p` (0 → 1) and `--p-signed` (-1 → 1, zero at centre) on the
 * element. CSS does the rest, so nothing re-renders on scroll.
 *
 * Values are written inside requestAnimationFrame and only when the element
 * is on screen, so an off-screen scene costs nothing.
 */
export function useScrollScene<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Park it at the resting state rather than leaving styles unset.
      el.style.setProperty("--p", "1");
      el.style.setProperty("--p-signed", "0");
      return;
    }

    let visible = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 when the element's top reaches the bottom of the viewport,
      // 1 when its bottom reaches the top.
      const total = rect.height + vh;
      const travelled = vh - rect.top;
      const p = Math.min(1, Math.max(0, travelled / total));
      el.style.setProperty("--p", p.toFixed(4));
      el.style.setProperty("--p-signed", (p * 2 - 1).toFixed(4));
    };

    const onScroll = () => {
      if (!visible || frame) return;
      frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) update();
      },
      { threshold: 0 }
    );

    observer.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return ref;
}
