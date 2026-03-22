import Sidebar from "../components/sidebar/Sidebar.jsx";
import Dashboard from "../components/dashboard/Dashboard.jsx";
import { useState, useEffect } from "react";


// Safe helper — works even if window isn't ready yet

  
  const Layout = ({isMobileWidth,getWindowWidth,isMobile,isOpen,setOpen}) => {
  
    // BUG FIX 1: Start sidebar CLOSED on mobile, open on desktop
    // Previously was always useState(true) which auto-opened on mobile
  
   
  
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
  