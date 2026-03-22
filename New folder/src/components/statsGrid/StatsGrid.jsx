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
      bg:"rgba(166, 211, 232, 0.27)",
      iconColor:'rgb(95, 111, 255)'
    }}
      />

<StatGrid
     stat={0}
     title="Published"
     icon={{
      component:BookCheck, 
      bg:"rgba(46, 255, 19, 0.2)",
      iconColor:'rgb(1, 157, 98)'
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
      bg:"rgba(166, 211, 232, 0.27)",
      iconColor:'rgb(95, 111, 255)'
    }}
      />
    </div>
  )
}

export default StatsGrid
