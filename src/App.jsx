import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TutorialsPage from "./pages/Tutorials";
import CreateTutorial from "./pages/CreateTutorial";
import EditTutorialPage from "./pages/EditTutorial";
import EditTutorialForm from "./pages/EditTutorialForm";
import DeleteTutorialPage from "./pages/DeleteTutorial";
import CategoriesPage from "./pages/Categories";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/tutorial" element={<CreateTutorial />} />
      <Route path="/tutorial/edit" element={<EditTutorialPage />} />
      <Route path="/tutorial/edit-form" element={<EditTutorialForm />} />
      <Route path="/tutorial/delete" element={<DeleteTutorialPage />} />
      <Route path="/tutorials" element={<TutorialsPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
    </Routes>
  );
};

export default App;
