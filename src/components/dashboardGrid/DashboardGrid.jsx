import Styles from './DashboardGrid.module.css';
import { Link } from 'react-router-dom';

const DashboardGrid = () => {
  const rows = [
    { title: 'JavaScript Async/Await', category: 'JavaScript', status: 'Published', date: '2025-02-05' },
    { title: 'React Hooks Deep Dive', category: 'React', status: 'Published', date: '2025-02-10' },
    { title: 'CSS Grid Mastery', category: 'CSS', status: 'Draft', date: '2025-02-15' },
    { title: 'Node.js REST APIs', category: 'Node.js', status: 'Published', date: '2025-02-18' },
    { title: 'TypeScript Generics', category: 'TypeScript', status: 'Review', date: '2025-02-20' },
  ];

  const statusClass = (status) => {
    if (status === 'Published') return Styles.badge_published;
    if (status === 'Draft') return Styles.badge_draft;
    return Styles.badge_review;
  };

  return (
    <div className={Styles.dashboard_grid}>

      {/* Recent Tutorials Card */}
      <div className={Styles.recent_table_card}>
        <div className={Styles.card_header}>
          <span className={Styles.card_title}>Recent Tutorials</span>
          <Link to="/tutorials" className={Styles.view_all_btn}>View all</Link>
        </div>

        {/* table_wrap handles horizontal scroll on mobile */}
        <div className={Styles.table_wrap}>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={Styles.table_row}>
                  <td className={Styles.td_title}>{row.title}</td>
                  <td>
                    <span className={`${Styles.badge} ${Styles.badge_category}`}>
                      {row.category}
                    </span>
                  </td>
                  <td>
                    <span className={`${Styles.badge} ${statusClass(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className={Styles.td_date}>{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Card */}
      <div className={Styles.activity_card}>
        <div className={Styles.card_header}>
          <span className={Styles.card_title}>Activity</span>
        </div>
        <div className={Styles.activity_placeholder}>
          No recent activity
        </div>
      </div>

    </div>
  );
};

export default DashboardGrid;