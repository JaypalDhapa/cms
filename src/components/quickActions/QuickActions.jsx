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
      <h3 style={{marginBottom:"24px", color:"var(--quick-heading-color)"}}>Quck Action</h3>
    <div className={Styles.quick_actions}>
      <QuickAcitonBtn
        to="/tutorial"
        title="Add tutorial"
        icon={{
          component: Plus,
          bg: "var(--quick-btn-add-bg)",
          color: "var(--quick-btn-add-color)",
        }}
      />
       <QuickAcitonBtn
        to="/tutorials"
        title="View all"
        icon={{
          component: BookAudio,
          bg: "var(--quick-btn-view-bg)",
          color: "var(--quick-btn-view-color)",
        }}
      />
       <QuickAcitonBtn
        to="/categories"
        title="Categories"
        icon={{
          component: Plus,
          bg: "var(--quick-btn-cat-bg)",
          color: "var(--quick-btn-cat-color)",
        }}
      />
       <QuickAcitonBtn
        title="Settings"
        icon={{
          component: Plus,
          bg: "var(--quick-btn-settings-bg)",
          color: "var(--quick-btn-settings-color)",
        }}
      />
    </div>
    </>
  );
};

export default QuickActions;