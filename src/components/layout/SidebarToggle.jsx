// src/components/layout/SidebarToggle.jsx
import { PanelLeft } from "lucide-react";
import Styles from "./SidebarToggle.module.css";

const SidebarToggle = ({ isOpen, setOpen }) => {
  return (
    <button className={Styles.toggle} onClick={() => setOpen(!isOpen)}>
      <PanelLeft size={18} />
    </button>
  );
};

export default SidebarToggle;