import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Start each new page at the top.
 *
 * A browser resets scroll on a normal page load, but a single-page app never
 * reloads — React Router swaps the component and leaves the window exactly
 * where it was. So following a footer link to the privacy policy opened it
 * scrolled to its own footer, and signing in dropped you into the new page at
 * whatever offset the old one had.
 *
 * Back and forward are deliberately excluded. Returning to a long list should
 * put you back where you left it, which is what the browser already does for a
 * POP navigation — overriding that would be its own bug.
 *
 * Hash links are excluded too, so an in-page anchor still works.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "POP") return;
    if (hash) return;

    // "instant" rather than smooth: a new page should already be at the top,
    // not visibly travel there.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash, navigationType]);

  return null;
};

export default ScrollToTop;
