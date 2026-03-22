import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CreateTutorial from "./pages/CreateTutorial";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/tutorial" element={<CreateTutorial />} />
    </Routes>
  );
};

export default App;
