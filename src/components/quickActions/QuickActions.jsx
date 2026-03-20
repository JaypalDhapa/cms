import Styles from "./QuickActions.module.css";
import { Plus,BookAudio } from "lucide-react";

function QuickAcitonBtn({ title, icon }) {
  const Icon = icon.component;
  return (
    <div className={Styles.quickBtn}>
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
    </div>
  );
}

const QuickActions = () => {
  return (
    <>
      <h3 style={{marginBottom:"24px", color:"#daddd8"}}>Quck Action</h3>
    <div className={Styles.quick_actions}>
      <QuickAcitonBtn
        title="Add tutorial"
        icon={{
          component: Plus,
          bg: "#EEF2FF",
          color: "#4F46E5",
        }}
      />
       <QuickAcitonBtn
        title="View all"
        icon={{
          component: BookAudio,
          bg: "#a5e4a5",
          color: "#057432",
        }}
      />
       <QuickAcitonBtn
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
