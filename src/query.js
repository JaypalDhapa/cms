import { gql } from "@apollo/client";

export const GET_LESSON = gql`
    query{
  lessons {
    edges {
      node {
        id
        slug
        title
        fullSlug

      }
    }
  }
}
`