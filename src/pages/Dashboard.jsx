import PageLayout from "../components/pageLayout/PageLayout";
import Header from "../components/header/Header";
import PageContent from "../components/PageContent/PageContent";

const Dashboard = () => {
  return (
    <PageLayout>
      {({ isMobile, isOpen, setOpen }) => (
        <>
          <Header isMobile={isMobile} isOpen={isOpen} setOpen={setOpen} title="Dashboard" />
          <PageContent />
        </>
      )}
    </PageLayout>
  );
};

export default Dashboard;
