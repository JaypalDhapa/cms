// import SearchableDropdown from "../components/ui/SearchableDropdown"

// const Dropdown = () => {
//   return (
//     <div style={{
//       width:"500px"
//     }}>
//       <SearchableDropdown />
//     </div>
//   )
// }

// export default Dropdown

import { useQuery } from "@apollo/client/react";
import { GET_LESSON } from "../query";

const Dropdown = () => {
  const {data,loading,error} = useQuery(GET_LESSON);

  if(loading) return <p> Loading....</p>
  if(error) return <p>Error ...</p>

  return (
    <div>
      <h1>Lessons</h1>

      {data.lessons.edges.map((l)=>(
        <div key={l.node.id}> {l.node.title} </div>
      ))}
    </div>
  )
}

export default Dropdown
