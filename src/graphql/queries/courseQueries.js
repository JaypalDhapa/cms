import { gql } from "@apollo/client";

// ── All courses — for dropdowns in Create / Edit forms ────────
export const GET_COURSES = gql`
  query GetCourses($filters: CourseFiltersInput) {
    courses(filters: $filters, first: 100) {
      edges {
        node {
          id
          name
          slug
          description
          isPublished
          order
        }
      }
      totalCount
    }
  }
`;

// ── Single course — if you ever need course detail page ───────
export const GET_COURSE = gql`
  query GetCourse($id: ID, $slug: String) {
    course(id: $id, slug: $slug) {
      id
      name
      slug
      description
      isPublished
      createdAt
      updatedAt
    }
  }
`;