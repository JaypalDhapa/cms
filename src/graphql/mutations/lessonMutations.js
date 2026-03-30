import { gql } from "@apollo/client";

// ── Create new lesson ─────────────────────────────────────────
export const CREATE_LESSON = gql`
  mutation CreateLesson($input: CreateLessonInput!) {
    createLesson(input: $input) {
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

// ── Update existing lesson ────────────────────────────────────
export const UPDATE_LESSON = gql`
  mutation UpdateLesson($id: ID!, $input: UpdateLessonInput!) {
    updateLesson(id: $id, input: $input) {
      id
      title
      slug
      fullSlug
      description
      type
      order
      content
      isPublished
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

// ── Soft delete lesson ────────────────────────────────────────
export const DELETE_LESSON = gql`
  mutation DeleteLesson($id: ID!) {
    deleteLesson(id: $id) {
      success
      message
      id
    }
  }
`;

// ── Publish lesson ────────────────────────────────────────────
export const PUBLISH_LESSON = gql`
  mutation PublishLesson($id: ID!) {
    publishLesson(id: $id) {
      id
      isPublished
      publishedAt
    }
  }
`;

// ── Unpublish lesson ──────────────────────────────────────────
export const UNPUBLISH_LESSON = gql`
  mutation UnpublishLesson($id: ID!) {
    unpublishLesson(id: $id) {
      id
      isPublished
      publishedAt
    }
  }
`;