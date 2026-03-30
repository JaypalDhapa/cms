// ─────────────────────────────────────────────────────────────────────────────
// src/utils/tutorials.js
//
// Shared helper functions used across multiple pages and components.
// Keeping them here means: fix once → fixed everywhere.
// ─────────────────────────────────────────────────────────────────────────────

import { TUTORIALS_DB } from "../data/tutorialData";

// ── getAllTutorials ───────────────────────────────────────────────────────────
// Flattens the nested TUTORIALS_DB object into a simple flat array.
//
// TUTORIALS_DB looks like this:
//   {
//     JavaScript: {
//       Introduction: [tutorial, tutorial],
//       Variables: [tutorial],
//     },
//     React: { ... },
//   }
//
// This function returns:
//   [tutorial, tutorial, tutorial, ...]  ← one flat list of everything
//
// Used on: Tutorials page, EditTutorial page, DeleteTutorial page, Dashboard.
// ─────────────────────────────────────────────────────────────────────────────
export function getAllTutorials() {
  const all = [];

  // Loop over each category (JavaScript, React, CSS, ...)
  Object.values(TUTORIALS_DB).forEach((lessons) => {
    // Loop over each lesson inside that category (Introduction, Variables, ...)
    Object.values(lessons).forEach((tutorialsInLesson) => {
      // Add every tutorial in this lesson to our flat array
      all.push(...tutorialsInLesson);
    });
  });

  return all;
}

// ── getDashboardStats ─────────────────────────────────────────────────────────
// Returns the four numbers shown in the StatsGrid on the Dashboard.
//
// Instead of the current hardcoded 0s, this computes real counts from data.
//
// Returns an object like:
//   { total: 8, published: 6, draft: 2, categories: 5 }
// ─────────────────────────────────────────────────────────────────────────────
export function getDashboardStats() {
  const all = getAllTutorials();

  return {
    total:      all.length,
    published:  all.filter((t) => t.status === "Published").length,
    draft:      all.filter((t) => t.status === "Draft").length,
    categories: Object.keys(TUTORIALS_DB).length,
  };
}

// ── getRecentTutorials ────────────────────────────────────────────────────────
// Returns the N most recently updated tutorials, sorted newest first.
//
// Used on: DashboardGrid "Recent Tutorials" table.
//
// Example:
//   getRecentTutorials(5) → the 5 newest tutorials
// ─────────────────────────────────────────────────────────────────────────────
export function getRecentTutorials(count = 5) {
  return getAllTutorials()
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, count);
}

// ── slugify ───────────────────────────────────────────────────────────────────
// Converts a plain string into a URL-safe slug.
//
// Example:
//   slugify("Getting Started with React!") → "getting-started-with-react"
//
// How it works step by step:
//   1. Make everything lowercase
//   2. Trim spaces from start and end
//   3. Replace any non-letter, non-number characters with a dash
//   4. Remove any dashes that ended up at the very start or end
//
// Used on: TutorialForm (auto-generates slug from title as you type).
// ─────────────────────────────────────────────────────────────────────────────
export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric chars with dash
    .replace(/^-|-$/g, "");       // remove leading/trailing dashes
}