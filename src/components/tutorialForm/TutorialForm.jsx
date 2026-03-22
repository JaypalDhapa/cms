import Styles from './TutorialForm.module.css';

const TutorialForm = () => {
  return (
    <div className={Styles.wrapper}>
      <div className={Styles.page_header}>
        <h2>Add New Tutorial</h2>
        <p>Fill in the details to create a new tutorial.</p>
      </div>
      {/* Multi-step form goes here — coming next! */}
    </div>
  );
};

export default TutorialForm;
