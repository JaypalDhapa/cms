// src/components/layout/PageLayout.jsx
import Styles from "./PageLayout.module.css";
import Sidebar from "./Sidebar";
import { useLayout } from "../../hooks/useLayout";

const PageLayout = ({ children }) => {
  const { isMobile, isOpen, setOpen } = useLayout();

  return (
    <div className={Styles.layout}>
      <Sidebar isMobile={isMobile} isOpen={isOpen} setOpen={setOpen} />

      {isMobile && isOpen && (
        <div
          className={Styles.overlay}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`
          ${Styles.content}
          ${!isMobile && isOpen ? Styles.expanded : ""}
          ${isMobile ? Styles.mobile : ""}
        `}
      >
        {children}
      </div>
    </div>
  );
};

export default PageLayout;