import { gql } from "@apollo/client";

// ── Tutorials page — paginated list with filters ──────────────
export const GET_LESSONS = gql`
  query GetLessons($filters: LessonFiltersInput, $first: Int, $after: String) {
    lessons(filters: $filters, first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          title
          slug
          fullSlug
          description
          type
          order
          isPublished
          publishedAt
          createdAt
          updatedAt
          course {
            id
            name
          }
          meta {
            title
            description
            keywords
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

// ── Dashboard stats — just counts, no heavy fields ────────────
export const GET_LESSONS_STATS = gql`
  query GetLessonsStats($filters: LessonFiltersInput) {
    lessons(filters: $filters, first: 1) {
      totalCount
    }
  }
`;

// ── Single lesson — for edit form pre-fill ────────────────────
export const GET_LESSON = gql`
  query GetLesson($id: ID, $slug: String) {
    lesson(id: $id, slug: $slug) {
      id
      title
      slug
      fullSlug
      description
      type
      order
      content
      isPublished
      publishedAt
      createdAt
      updatedAt
      course {
        id
        name
      }
      meta {
        title
        description
        keywords
      }
    }
  }
`;

// ── Edit page selector — lessons by courseId (no pagination) ──
export const GET_LESSONS_BY_COURSE = gql`
  query GetLessonsByCourse($courseId: ID!) {
    lessons(filters: { courseId: $courseId }, first: 100) {
      edges {
        node {
          id
          title
          slug
          isPublished
          order
        }
      }
      totalCount
    }
  }
`;