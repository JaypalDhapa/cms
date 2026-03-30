// src/components/layout/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Menu, CirclePlus, Pencil, Trash2, FolderOpen } from "lucide-react";
import Styles from "./Sidebar.module.css";
import SidebarToggle from "./SidebarToggle";

const NAV_LINKS = [
  {
    section: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/tutorials", label: "Tutorials", icon: Menu },
    ],
  },
  {
    section: "Manage",
    items: [
      { to: "/tutorial", label: "Add Tutorial", icon: CirclePlus },
      { to: "/tutorial/edit", label: "Edit Tutorial", icon: Pencil },
      { to: "/tutorial/delete", label: "Delete Tutorial", icon: Trash2 },
      { to: "/categories", label: "Categories", icon: FolderOpen },
    ],
  },
];

const Sidebar = ({ isOpen, setOpen, isMobile }) => {
  const location = useLocation();

  const isActive = (to) =>
    to === "/tutorial/edit"
      ? location.pathname.startsWith("/tutorial/edit")
      : location.pathname === to;

  const handleNavClick = () => {
    if (isMobile) setOpen(false);
  };

  return (
    <aside
      className={`
        ${Styles.sidebar}
        ${!isMobile && isOpen ? Styles.collapsed : ""}
        ${isMobile && isOpen ? Styles.mobileOpen : ""}
        ${isMobile && !isOpen ? Styles.mobileClosed : ""}
      `}
    >
      <div className={Styles.header}>
        <h2 className={Styles.logo}>CMS</h2>
        <SidebarToggle isOpen={isOpen} setOpen={setOpen} />
      </div>

      <nav className={Styles.nav}>
        {NAV_LINKS.map(({ section, items }) => (
          <div key={section} className={Styles.section}>
            <span className={Styles.sectionLabel}>{section.toUpperCase()}</span>
            {items.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={handleNavClick}
                className={`${Styles.navItem} ${isActive(to) ? Styles.navItemActive : ""}`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;