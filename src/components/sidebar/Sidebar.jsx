
import { Link } from "react-router-dom";
import Styles from './Sidebar.module.css';
import { Trash2,LayoutDashboard,Menu,CirclePlus,Pencil} from "lucide-react";
import SidebarToggle from "../SidebarToggle/SidebarToggle";





const Sidebar = ({isOpen,setOpen,isMobile}) => {
  const handleNavClick = () => {
    if (isMobile) setOpen(false);
  };

  return (
    <>
     

    {/* Sidebar  */}
    <aside 
  className={`${Styles.sidebar} 
  ${!isMobile && isOpen ? Styles.collapsed : ""}
  ${isMobile && isOpen ? Styles.mobileOpen : ""}
  ${isMobile && !isOpen ? Styles.mobileClosed : ""}
  `}
>


    {/* header  */}
    <div className={Styles.sidebar_header}>
      <h2 className={Styles.logo}>logo</h2>
      
      <SidebarToggle isOpen={isOpen} setOpen={setOpen}/>
    </div>


    {/* navmenu */}
    <nav className={Styles.sidebar_nav}>

    {/* fisr section  */}
    <div className={Styles.nav_section}>
        <span className={Styles.nav_section_lable}>OVERVIEW</span>
        <Link to="/" className={Styles.nav_item} onClick={handleNavClick} >
        <LayoutDashboard />
        <span>Dashboard</span>
        </Link>
        <Link to="/" className={Styles.nav_item} onClick={handleNavClick} >
        <Menu />
        <span>Tutorials</span>
        </Link>
      </div>


      {/* second section  */}
      <div className={Styles.nav_section}>
        <span className={Styles.nav_section_lable}>MANAGE</span>

        <Link to="/" className={Styles.nav_item} onClick={handleNavClick} >
        <CirclePlus />
        <span>Add Tutorial</span>
        </Link>

        <Link to="/" className={Styles.nav_item} onClick={handleNavClick} >
        <Pencil />
        <span>Update tutorial</span>
        </Link>

        <Link to="/" className={Styles.nav_item} onClick={handleNavClick} >
        <Trash2 />
        <span>Delete</span>
        </Link>

        <Link to="/" className={Styles.nav_item} onClick={handleNavClick} >
        <LayoutDashboard />
        <span>Categories</span>
        </Link>

      </div>

    </nav>
    <div className={Styles.sidebar_footer}></div>
  </aside>
  </>

)
}

export default Sidebar
