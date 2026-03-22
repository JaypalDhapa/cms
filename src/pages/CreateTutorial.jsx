import PageLayout from "../components/pageLayout/PageLayout";
import Header from "../components/header/Header";
import TutorialForm from "../components/tutorialForm/TutorialForm";

const CreateTutorial = () => {
  return (
    <PageLayout>
      {({ isMobile, isOpen, setOpen }) => (
        <>
          <Header isMobile={isMobile} isOpen={isOpen} setOpen={setOpen} title="Add Tutorial" />
          <TutorialForm />
        </>
      )}
    </PageLayout>
  );
};

export default CreateTutorial;
