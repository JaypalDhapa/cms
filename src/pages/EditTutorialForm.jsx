import { useLocation, useNavigate } from "react-router-dom";
import PageLayout from "../components/pageLayout/PageLayout";
import Header from "../components/header/Header";
import TutorialForm from "../components/tutorialForm/TutorialForm";

// Role simulation — in a real app read from auth context / localStorage
// Set to "editor" to test editor-only mode, "admin" for full access
const USER_ROLE = "admin"; // change to "editor" to test

const EditTutorialForm = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const tutorial = state?.tutorial ?? null;

  if (!tutorial) {
    return (
      <PageLayout>
        {({ isMobile, isOpen, setOpen }) => (
          <>
            <Header isMobile={isMobile} isOpen={isOpen} setOpen={setOpen} title="Edit Tutorial" />
            <div style={{ padding: 40, textAlign: "center", color: "#64748B" }}>
              <p>No tutorial selected.</p>
              <button
                onClick={() => navigate("/tutorial/edit")}
                style={{
                  marginTop: 12, padding: "8px 20px", background: "#4F46E5",
                  color: "#fff", border: "none", borderRadius: 8, cursor: "pointer",
                  fontFamily: "inherit", fontSize: "0.875rem"
                }}
              >
                ← Back to Edit Tutorial
              </button>
            </div>
          </>
        )}
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {({ isMobile, isOpen, setOpen }) => (
        <>
          <Header
            isMobile={isMobile}
            isOpen={isOpen}
            setOpen={setOpen}
            title="Edit Tutorial"
          />
          <TutorialForm
            initialData={tutorial}
            isEditing={true}
            isEditor={USER_ROLE === "editor"}
          />
        </>
      )}
    </PageLayout>
  );
};

export default EditTutorialForm;
