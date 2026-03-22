import Header from "../header/Header";
import Styles from './Dashboard.module.css';
import PageContent from "../PageContent/PageContent";

const Dashboard = ({isOpen,setOpen,isMobile}) => {
  return (
    <div
     className={
      `${Styles.dashboard_container}
      ${isOpen ? Styles.expanded : ""}
      ${isMobile ? Styles.mobile : ""}
     `}>
      <Header isMobile={isMobile} isOpen={isOpen} setOpen={setOpen}/>

      <PageContent />


    
    
    </div>
  )
}

export default Dashboard
