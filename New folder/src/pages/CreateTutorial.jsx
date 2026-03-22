import React from 'react'
import Sidebar from '../components/sidebar/Sidebar'

const CreateTutorial = ({isOpen,isMobile,setOpen}) => {
  return (
    <>
      <Sidebar isMobile={isMobile} isOpen={isOpen} setOpen={setOpen} />
        {isMobile && isOpen ? (
          <div
            className="sidebar_overlay"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        ) : null}



        <div style={{
          padding:"28px",
          flex:"1",
          }}>

            {/* page header  */}
          <div style={{
            display:"flex",
            alignItems:"center",
            justifyContent:"space-between",
            marginBottom:"22px",
            flexWrap:"wrap",
            gap:"12px"
          }}>
            <div style={{

            }}>
              <h2>Add New Tutorial</h2>
              <p>Fill in the details to create a new tutorial.</p>
            </div>
          </div>


          {/* Multi step layout  */}
          <div style={{
            display:"grid",
            gridTemplateColumns:"220px 1fr",
            gap:"20px",
            alignItems:"start",
          }}>

            {/* step sidebare  */}

            <div>
              
            </div>
          </div>
        </div>
    </>
  )
}

export default CreateTutorial