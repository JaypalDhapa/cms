import Sidebar from "./components/sidebar/Sidebar.jsx";
import Dashboard from "./components/dashboard/Dashboard.jsx";
import { useState, useEffect } from "react";

// Safe helper — works even if window isn't ready yet
const getWindowWidth = () => {
  if (typeof window === "undefined") return 1024;
  return window.innerWidth;
};

const isMobileWidth = (width) => width < 767;

const Layout = () => {
  const [windowWidth, setWindowWidth] = useState(getWindowWidth);

  // BUG FIX 1: Start sidebar CLOSED on mobile, open on desktop
  // Previously was always useState(true) which auto-opened on mobile
  const [isOpen, setOpen] = useState(() => !isMobileWidth(getWindowWidth()));

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

  return (
    <div className="layout">
      <Sidebar isMobile={isMobile} isOpen={isOpen} setOpen={setOpen} />
      {isMobile && isOpen ? (
        <div
          className="sidebar_overlay"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      ) : null}
      <Dashboard isMobile={isMobile} isOpen={isOpen} setOpen={setOpen} />
    </div>
  );
};

export default Layout;



// import Sidebar from "./components/sidebar/Sidebar.jsx";
// import Dashboard from "./components/dashboard/Dashboard.jsx";
// import { useState,useEffect } from "react";

// const Layout = () => {
//   const [isOpen, setOpen] = useState(true);
//   const [windowWidth,setWindowWidth] = useState(window.innerWidth);
  
//   useEffect(() => {
//     const handleResize = () => {
//       setWindowWidth(window.innerWidth);
//     };

//     window.addEventListener("resize", handleResize);

//     // cleanup (VERY IMPORTANT)
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const isMobile = windowWidth <767;

  
//   return (
//     <div className='layout'>
//       <Sidebar
//       isMobile={isMobile}
//       isOpen={isOpen}
//       setOpen={setOpen}
//       />
//       {isMobile && isOpen ? (
//         <div
//           className="sidebar_overlay"
//           onClick={() => setOpen(false)}
//           aria-hidden="true"
//         />
//       ) : null}
//       <Dashboard 
//       isMobile={isMobile}
//       isOpen={isOpen}
//       setOpen={setOpen}
//       />
//     </div>
//   )
// }

// export default Layout
