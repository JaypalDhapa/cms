import { PanelLeft } from "lucide-react"
import Styles from './SidebarToggle.module.css';

const SidebarToggle = ({isOpen,setOpen}) => {
  return (
    <div
    className={Styles.sidebar_toggle}
    onClick={()=> setOpen(!isOpen)}
    >
      <PanelLeft />
    </div>
  )
}

export default SidebarToggle
