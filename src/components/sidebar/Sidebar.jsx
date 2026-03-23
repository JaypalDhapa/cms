import { Link, useLocation } from "react-router-dom";
import Styles from './Sidebar.module.css';
import { Trash2, LayoutDashboard, Menu, CirclePlus, Pencil } from "lucide-react";
import SidebarToggle from "../SidebarToggle/SidebarToggle";

const Sidebar = ({ isOpen, setOpen, isMobile }) => {
  const location = useLocation();
  const handleNavClick = () => { if (isMobile) setOpen(false); };
  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`${Styles.sidebar}
      ${!isMobile && isOpen ? Styles.collapsed : ""}
      ${isMobile && isOpen ? Styles.mobileOpen : ""}
      ${isMobile && !isOpen ? Styles.mobileClosed : ""}
      `}
    >
      <div className={Styles.sidebar_header}>
        <h2 className={Styles.logo}>logo</h2>
        <SidebarToggle isOpen={isOpen} setOpen={setOpen} />
      </div>

      <nav className={Styles.sidebar_nav}>

        <div className={Styles.nav_section}>
          <span className={Styles.nav_section_lable}>OVERVIEW</span>
          <Link to="/" className={`${Styles.nav_item} ${isActive("/") ? Styles.nav_item_active : ""}`} onClick={handleNavClick}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/tutorials" className={`${Styles.nav_item} ${isActive("/tutorials") ? Styles.nav_item_active : ""}`} onClick={handleNavClick}>
            <Menu size={18} />
            <span>Tutorials</span>
          </Link>
        </div>

        <div className={Styles.nav_section}>
          <span className={Styles.nav_section_lable}>MANAGE</span>
          <Link to="/tutorial" className={`${Styles.nav_item} ${isActive("/tutorial") ? Styles.nav_item_active : ""}`} onClick={handleNavClick}>
            <CirclePlus size={18} />
            <span>Add Tutorial</span>
          </Link>
          <Link to="/tutorial/edit" className={`${Styles.nav_item} ${location.pathname.startsWith("/tutorial/edit") ? Styles.nav_item_active : ""}`} onClick={handleNavClick}>
            <Pencil size={18} />
            <span>Edit Tutorial</span>
          </Link>
          <Link to="/tutorial/delete" className={`${Styles.nav_item} ${isActive("/tutorial/delete") ? Styles.nav_item_active : ""}`} onClick={handleNavClick}>
            <Trash2 size={18} />
            <span>Delete Tutorial</span>
          </Link>
          <Link to="/" className={Styles.nav_item} onClick={handleNavClick}>
            <LayoutDashboard size={18} />
            <span>Categories</span>
          </Link>
        </div>

      </nav>
      <div className={Styles.sidebar_footer}></div>
    </aside>
  );
};

export default Sidebar;
