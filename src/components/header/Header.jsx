import { useState, useEffect, useRef } from 'react';
import Styles from './Header.module.css';
import SidebarToggle from '../SidebarToggle/SidebarToggle';

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const SystemIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

const THEME_OPTIONS = [
  { key: 'light', label: 'Light', Icon: SunIcon },
  { key: 'dark', label: 'Dark', Icon: MoonIcon },
  { key: 'system', label: 'System default', Icon: SystemIcon },
];

const getActiveIcon = (theme) => {
  if (theme === 'dark') return MoonIcon;
  if (theme === 'system') return SystemIcon;
  return SunIcon;
};

const Header = ({ isMobile, isOpen, setOpen, title = "Dashboard" }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Apply theme to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (key) => {
    setTheme(key);
    setDropdownOpen(false);
  };

  const ActiveIcon = getActiveIcon(theme);

  return (
    <div className={Styles.topbar}>
      <div className={Styles.topbar_left}>
        {isMobile && (
          <SidebarToggle isOpen={isOpen} setOpen={setOpen} isMobile={isMobile} />
        )}
        <h1 className={Styles.page_title}>{title}</h1>
      </div>
      <div className={Styles.topbar_right}>

        {/* Theme Toggle */}
        <div className={Styles.theme_wrapper} ref={dropdownRef}>
          <button
            className={`${Styles.icon_btn} ${dropdownOpen ? Styles.icon_btn_active : ''}`}
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-label="Toggle theme"
            title="Change theme"
          >
            <ActiveIcon />
          </button>

          {dropdownOpen && (
            <div className={Styles.theme_dropdown}>
              {THEME_OPTIONS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  className={`${Styles.theme_option} ${theme === key ? Styles.theme_option_active : ''}`}
                  onClick={() => handleSelect(key)}
                >
                  <span className={Styles.theme_option_icon}><Icon /></span>
                  <span className={Styles.theme_option_label}>{label}</span>
                  {theme === key && (
                    <span className={Styles.theme_check}>✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={Styles.topbar_avatar}>A</div>
      </div>
    </div>
  );
};

export default Header;