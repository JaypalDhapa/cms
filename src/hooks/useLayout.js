// src/hooks/useLayout.js
import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 767;
const isMobileWidth = (width) => width < MOBILE_BREAKPOINT;
const getWindowWidth = () => (typeof window === "undefined" ? 1024 : window.innerWidth);

export function useLayout() {
  const [windowWidth, setWindowWidth] = useState(getWindowWidth);
  const [isOpen, setOpen] = useState(() => !isMobileWidth(getWindowWidth()));

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobileWidth(windowWidth)) setOpen(false);
  }, [windowWidth]);

  return {
    isMobile: isMobileWidth(windowWidth),
    isOpen,
    setOpen,
  };
}