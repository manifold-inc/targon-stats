import { useEffect, useState } from "react";

export function useIsLgOrLarger() {
  const [isLgOrLarger, setIsLgOrLarger] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkSize = () => {
      setIsLgOrLarger(window.innerWidth >= 1024);
    };

    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  if (!mounted) {
    return false;
  }

  return isLgOrLarger;
}
