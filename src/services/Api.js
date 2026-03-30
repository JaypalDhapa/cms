// ── API Service Layer ─────────────────────────────────────────
// Replace BASE_URL with your actual backend URL
// const BASE_URL = import.meta.env.VITE_API_URL || "https://tutorialsbackend-production.up.railway.app/tutorial/api";
const BASE_URL = "https://tutorialsbackend-production.up.railway.app/tutorial/api";

// Generic fetch wrapper with error handling
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: { "Content-Type": "application/json" },
    ...options,
  };

  const res = await fetch(url, config);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || "API request failed");
  }

  // 204 No Content (e.g. DELETE success)
  if (res.status === 204) return null;

  return res.json();
}

// ── Categories API ────────────────────────────────────────────
export const categoriesApi = {
  // GET /api/categories → { JavaScript: ["Introduction","Variables",...], React: [...] }
  getAll: () => request("/getTutorials"),

  // GET /api/categories/:name/lessons → ["Introduction","Variables",...]
  getLessons: (categoryName) =>
    request(`/categories/${encodeURIComponent(categoryName)}/lessons`),

  // POST /api/categories → body: { name, lessons: [] }
  create: (data) => request("/categories", { method: "POST", body: JSON.stringify(data) }),

  // PUT /api/categories/:name → body: { lessons: [...] }
  update: (name, data) =>
    request(`/categories/${encodeURIComponent(name)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // DELETE /api/categories/:name
  delete: (name) =>
    request(`/categories/${encodeURIComponent(name)}`, { method: "DELETE" }),
};

// ── Tutorials API ─────────────────────────────────────────────
export const tutorialsApi = {
  // GET /api/tutorials → all tutorials (flat array)
  getAll: () => request("/tutorials"),

  // GET /api/tutorials?category=React&lesson=Hooks
  getByFilter: (category, lesson) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (lesson) params.set("lesson", lesson);
    return request(`/tutorials?${params.toString()}`);
  },

  // GET /api/tutorials/:id
  getById: (id) => request(`/tutorials/${id}`),

  // POST /api/tutorials → body: tutorial object (no id)
  create: (data) =>
    request("/tutorials", { method: "POST", body: JSON.stringify(data) }),

  // PUT /api/tutorials/:id → body: updated fields
  update: (id, data) =>
    request(`/tutorials/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // DELETE /api/tutorials/:id
  delete: (id) => request(`/tutorials/${id}`, { method: "DELETE" }),
};