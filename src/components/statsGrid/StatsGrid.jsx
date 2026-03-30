import Styles from './StatsGrid.module.css';
import { NotebookPen,BookCheck,ClipboardList , Trash2} from "lucide-react";

function StatGrid({stat,title,icon}){
  const Icon = icon.component;
    return (
      <div className={Styles.stat_card}>
        <div className={Styles.stat_icon}
      style={{
        backgroundColor: icon.bg
      }}
    >
      {/* <ClipboardList color="white" size={20} /> */}
      {Icon && <Icon size={20} color={icon.iconColor}/>}
    </div>
        <div className={Styles.stat_content}>
          <h2>{stat}</h2>
          <p className={Styles.title}>{title}</p>
        </div>
      </div>
    )
}

const StatsGrid = () => {
  return (
    <div className={Styles.stats_grid}>
     <StatGrid
     stat={0}
     title="tutorial"
     icon={{
      component:ClipboardList, 
      bg:" var(--color-bg-icon1)",
      iconColor:'rgb(255, 255, 255)'
    }}
      />

<StatGrid
     stat={0}
     title="Published"
     icon={{
      component:BookCheck, 
      bg:" var(--color-bg-icon2)",
      iconColor:'rgb(250, 250, 250)'
    }}
      />

<StatGrid
     stat={0}
     title="Darft"
     icon={{
      component:NotebookPen, 
      bg:"rgba(232, 166, 166, 0.27)",
      iconColor:'#ff5f5f'
    }}
      />

<StatGrid
     stat={0}
     title="Categories"
     icon={{
      component:ClipboardList, 
      bg:" var(--color-bg-icon4)",
      iconColor:'rgb(255, 255, 255)'
    }}
      />
    </div>
  )
}

export default StatsGrid
