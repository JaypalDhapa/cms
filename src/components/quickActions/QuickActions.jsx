import { Link } from "react-router-dom";
import Styles from "./QuickActions.module.css";
import { Plus,BookAudio } from "lucide-react";

function QuickAcitonBtn({ title, icon,to }) {
  const Icon = icon.component;
  return (
    
    <Link to={to} className={Styles.quickBtn}>
      <div
        className={Styles.quickBtn_icon}
        style={{
          backgroundColor: icon.bg,
        }}
      >
        {/* <ClipboardList color="white" size={20} /> */}
        {Icon && <Icon size={20} color={icon.color} />}
      </div>
        <p className={Styles.title}>{title}</p>
    </Link>
  );
}

const QuickActions = () => {
  return (
    <>
      <h3 style={{marginBottom:"24px", color:"#daddd8"}}>Quck Action</h3>
    <div className={Styles.quick_actions}>
      <QuickAcitonBtn
        to="/tutorial"
        title="Add tutorial"
        icon={{
          component: Plus,
          bg: "#EEF2FF",
          color: "#4F46E5",
        }}
      />
       <QuickAcitonBtn
        to="/tutorials"
        title="View all"
        icon={{
          component: BookAudio,
          bg: "#a5e4a5",
          color: "#057432",
        }}
      />
       <QuickAcitonBtn
        to="/categories"
        title="Categories"
        icon={{
          component: Plus,
          bg: "red",
          color: "yellow",
        }}
      />
       <QuickAcitonBtn
        title="Settings"
        icon={{
          component: Plus,
          bg: "red",
          color: "yellow",
        }}
      />
    </div>
    </>
  );
};

export default QuickActions;
