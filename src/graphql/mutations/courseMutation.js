import { gql } from "@apollo/client";

// ── Create new course ─────────────────────────────────────────
export const CREATE_COURSE = gql`
  mutation CreateCourse($input: CreateCourseInput!) {
    createCourse(input: $input) {
      id
      name
      slug
      order
      isPublished
      createdAt
      updatedAt
    }
  }
`;

// ── Update existing course ────────────────────────────────────
export const UPDATE_COURSE = gql`
  mutation UpdateCourse($id: ID!, $input: UpdateCourseInput!) {
    updateCourse(id: $id, input: $input) {
      id
      name
      slug
      order
      isPublished
      createdAt
      updatedAt
    }
  }
`;

// ── Soft delete course ────────────────────────────────────────
export const DELETE_COURSE = gql`
  mutation DeleteCourse($id: ID!) {
    deleteCourse(id: $id) {
      success
      message
      id
    }
  }
`;

// ── Restore deleted course ────────────────────────────────────
export const RESTORE_COURSE = gql`
  mutation RestoreCourse($id: ID!) {
    restoreCourse(id: $id) {
      id
      name
      slug
      isPublished
    }
  }
`;