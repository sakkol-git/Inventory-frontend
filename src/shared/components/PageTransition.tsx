import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Wraps page content with a smooth fade-in/slide-up animation
 * on each route change. Pure CSS — no framer-motion needed.
 */
const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [displayKey, setDisplayKey] = useState(location.key);

  useEffect(() => {
    setDisplayKey(location.key);
  }, [location.key]);

  return (
    <div key={displayKey} className="page-transition">
      {children}
    </div>
  );
};

export default PageTransition;
