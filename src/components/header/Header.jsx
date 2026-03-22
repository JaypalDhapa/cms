import Styles from './Header.module.css';
import SidebarToggle from '../SidebarToggle/SidebarToggle';

const Header = ({ isMobile, isOpen, setOpen, title = "Dashboard" }) => {
  return (
    <div className={Styles.topbar}>
      <div className={Styles.topbar_left}>
        {isMobile && (
          <SidebarToggle isOpen={isOpen} setOpen={setOpen} isMobile={isMobile} />
        )}
        <h1 className={Styles.page_title}>{title}</h1>
      </div>
      <div className={Styles.topbar_right}>
        <button className={Styles.icon_btn}>🔔</button>
        <div className={Styles.topbar_avatar}>A</div>
      </div>
    </div>
  );
};

export default Header;
