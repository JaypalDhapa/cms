import { useState, useEffect } from "react";
import Sidebar from "../sidebar/Sidebar";
import Styles from "./PageLayout.module.css";

const getWindowWidth = () => {
  if (typeof window === "undefined") return 1024;
  return window.innerWidth;
};

const isMobileWidth = (width) => width < 767;

const PageLayout = ({ children }) => {
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

  const isMobile = isMobileWidth(windowWidth);

  return (
    <div className={Styles.layout}>
      <Sidebar isMobile={isMobile} isOpen={isOpen} setOpen={setOpen} />

      {isMobile && isOpen && (
        <div
          className={Styles.sidebar_overlay}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`
          ${Styles.page_container}
          ${!isMobile && isOpen ? Styles.expanded : ""}
          ${isMobile ? Styles.mobile : ""}
        `}
      >
        {children({ isMobile, isOpen, setOpen })}
      </div>
    </div>
  );
};

export default PageLayout;
