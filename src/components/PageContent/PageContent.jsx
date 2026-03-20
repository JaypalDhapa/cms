import Styles from './PageContent.module.css';
import StatsGrid from '../statsGrid/StatsGrid';
import QuickActions from '../quickActions/QuickActions';
import DashboardGrid from '../dashboardGrid/DashboardGrid';

const PageContent = () => {
  return (
    <div className={Styles.page_content}>
      <StatsGrid />
      <QuickActions />
      <DashboardGrid />
    </div>
  )
}

export default PageContent
