import { Route,Routes,Link } from "react-router-dom";
import Layout from "./Layout";
import { useEffect,useState } from "react";
import Dashboard from "./pages/Dashboard";
import CreateTutorial from "./pages/CreateTutorial";


const getWindowWidth = () => {
    if (typeof window === "undefined") return 1024;
    return window.innerWidth;
  };
  
  const isMobileWidth = (width) => width < 767;

const App = () => {

  const [windowWidth, setWindowWidth] = useState(getWindowWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // BUG FIX 2: Close sidebar automatically when resizing down to mobile
  useEffect(() => {
    if (isMobileWidth(windowWidth)) {
      setOpen(false);
    }
  }, [windowWidth]);

  const isMobile = isMobileWidth(windowWidth);
  const [isOpen, setOpen] = useState(() => !isMobileWidth(getWindowWidth()));

  return (
    <Routes>
      <Route path="/" element={<Dashboard isMobileWidth={isMobileWidth} getWindowWidth={getWindowWidth} isMobile={isMobile} isOpen={isOpen} setOpen={setOpen}/>} />
      <Route path="/tutorial" element={<CreateTutorial isOpen={isOpen} isMobile={isMobile} setOpen={setOpen}/>} />
    </Routes>
  )
}

export default App
