// src/components/layout/Header.jsx
import Styles from "./Header.module.css";
import SidebarToggle from "./SidebarToggle";

const Header = ({ isMobile, isOpen, setOpen, title = "Dashboard" }) => {
  return (
    <div className={Styles.header}>
      <div className={Styles.left}>
        {isMobile && (
          <SidebarToggle isOpen={isOpen} setOpen={setOpen} />
        )}
        <h1 className={Styles.title}>{title}</h1>
      </div>
      <div className={Styles.right}>
        <button className={Styles.iconBtn}>🔔</button>
        <div className={Styles.avatar}>A</div>
      </div>
    </div>
  );
};

export default Header;