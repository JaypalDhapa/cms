import { useState, useMemo, useEffect } from "react";
import PageLayout from "../components/pageLayout/PageLayout";
import Header from "../components/header/Header";
import { CATEGORIES } from "../data/tutorialData";
import Styles from "./Categories.module.css";
import { Search, Plus, Pencil, Trash2, X, Check } from "lucide-react";

// ── Build initial state ───────────────────────────────────────
function buildInitial() {
  return Object.entries(CATEGORIES).map(([name, lessons], i) => ({
    id: i + 1,
    name,
    lessons: [...lessons],
  }));
}

// ── Toast ─────────────────────────────────────────────────────
const Toast = ({ message, type, onHide }) => {
  useState(() => {
    const t = setTimeout(onHide, 3000);
    return () => clearTimeout(t);
  });
  return (
    <div className={`${Styles.toast} ${type === "danger" ? Styles.toastDanger : ""}`}>
      {type === "success" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <Trash2 size={13} />
      )}
      {message}
    </div>
  );
};

// ── Delete Modal ──────────────────────────────────────────────
const DeleteModal = ({ category, onCancel, onConfirm }) => {
  if (!category) return null;
  return (
    <div className={Styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className={Styles.modal}>
        <div className={Styles.modalHeader}>
          <div className={Styles.modalHeaderLeft}>
            <div className={Styles.modalIconDanger}><Trash2 size={15} /></div>
            <h3>Delete Category</h3>
          </div>
          <button className={Styles.modalClose} onClick={onCancel}><X size={15} /></button>
        </div>
        <div className={Styles.modalBody}>
          <p>Delete <strong>"{category.name}"</strong>? Tutorials in this category will lose their association.</p>
          <p className={Styles.modalWarn}>This action cannot be undone.</p>
        </div>
        <div className={Styles.modalFooter}>
          <button className={Styles.btnGhost} onClick={onCancel}>Cancel</button>
          <button className={Styles.btnDanger} onClick={() => onConfirm(category.id)}>
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Edit Modal ────────────────────────────────────────────────
const EditModal = ({ category, onCancel, onSave }) => {
  const [name, setName] = useState("");
  const [lessonsInput, setLessonsInput] = useState("");
  const [nameErr, setNameErr] = useState("");

  // Fill form whenever a new category is passed in
  useEffect(() => {
    if (category) {
      setName(category.name);
      setLessonsInput(category.lessons.join(", "));
      setNameErr("");
    }
  }, [category]);

  if (!category) return null;

  const handleSave = () => {
    if (!name.trim()) { setNameErr("Category name is required"); return; }
    const lessons = lessonsInput.split(",").map((l) => l.trim()).filter(Boolean);
    onSave({ ...category, name: name.trim(), lessons });
  };

  return (
    <div className={Styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className={Styles.modal}>
        <div className={Styles.modalHeader}>
          <div className={Styles.modalHeaderLeft}>
            <div className={Styles.modalIconEdit}><Pencil size={15} /></div>
            <h3>Edit Category</h3>
          </div>
          <button className={Styles.modalClose} onClick={onCancel}><X size={15} /></button>
        </div>

        <div className={Styles.modalBody}>
          <div className={Styles.formGroup}>
            <label className={Styles.label}>
              Category Name <span className={Styles.req}>*</span>
            </label>
            <input
              className={`${Styles.input} ${nameErr ? Styles.inputErr : ""}`}
              placeholder="e.g. TypeScript"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameErr(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              autoFocus
            />
            {nameErr && <span className={Styles.errMsg}>{nameErr}</span>}
          </div>

          <div className={Styles.formGroup} style={{ marginBottom: 0 }}>
            <label className={Styles.label}>
              Lessons
              <span className={Styles.labelHint}>comma separated</span>
            </label>
            <textarea
              className={Styles.textarea}
              placeholder="Introduction, Basics, Advanced"
              value={lessonsInput}
              onChange={(e) => setLessonsInput(e.target.value)}
              rows={4}
            />
            {lessonsInput && (
              <span className={Styles.hintText}>
                {lessonsInput.split(",").filter((l) => l.trim()).length} lessons
              </span>
            )}
          </div>
        </div>

        <div className={Styles.modalFooter}>
          <button className={Styles.btnGhost} onClick={onCancel}>Cancel</button>
          <button className={Styles.btnPrimary} onClick={handleSave}>
            <Check size={13} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────
const CategoriesPage = () => {
  const [categories, setCategories] = useState(buildInitial);
  const [search, setSearch] = useState("");

  // Add form state
  const [newName, setNewName] = useState("");
  const [newLessons, setNewLessons] = useState("");
  const [newNameErr, setNewNameErr] = useState("");

  // Modal states
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  // ── Filter ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.lessons.some((l) => l.toLowerCase().includes(q))
    );
  }, [categories, search]);

  // ── Add ───────────────────────────────────────────────────
  const handleAdd = () => {
    const trimName = newName.trim();
    if (!trimName) { setNewNameErr("Category name is required"); return; }
    if (categories.find((c) => c.name.toLowerCase() === trimName.toLowerCase())) {
      setNewNameErr("Category already exists"); return;
    }
    const lessons = newLessons.split(",").map((l) => l.trim()).filter(Boolean);
    setCategories((prev) => [...prev, { id: Date.now(), name: trimName, lessons }]);
    setNewName("");
    setNewLessons("");
    setNewNameErr("");
    setToast({ message: `"${trimName}" added!`, type: "success" });
  };

  // ── Edit save ─────────────────────────────────────────────
  const handleEditSave = (updated) => {
    // check duplicate name (excluding self)
    const dup = categories.find(
      (c) => c.name.toLowerCase() === updated.name.toLowerCase() && c.id !== updated.id
    );
    if (dup) return; // EditModal handles its own error for name
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setEditTarget(null);
    setToast({ message: `"${updated.name}" updated!`, type: "success" });
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDeleteConfirm = (id) => {
    const cat = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setDeleteTarget(null);
    setToast({ message: `"${cat.name}" deleted.`, type: "danger" });
  };

  return (
    <PageLayout>
      {({ isMobile, isOpen, setOpen }) => (
        <>
          <Header isMobile={isMobile} isOpen={isOpen} setOpen={setOpen} title="Categories" />

          <div className={Styles.wrapper}>
            <div className={Styles.pageHeader}>
              <div>
                <h2>Categories</h2>
                <p>Manage your tutorial categories and lessons.</p>
              </div>
            </div>

            <div className={Styles.layout}>

              {/* ── LEFT: Add Form ── */}
              <div className={Styles.formCard}>
                <div className={Styles.cardHeader}>
                  <span className={Styles.cardTitle}>Add Category</span>
                </div>

                <div className={Styles.formGroup}>
                  <label className={Styles.label}>
                    Category Name <span className={Styles.req}>*</span>
                  </label>
                  <input
                    className={`${Styles.input} ${newNameErr ? Styles.inputErr : ""}`}
                    placeholder="e.g. TypeScript"
                    value={newName}
                    onChange={(e) => { setNewName(e.target.value); setNewNameErr(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                  />
                  {newNameErr && <span className={Styles.errMsg}>{newNameErr}</span>}
                </div>

                <div className={Styles.formGroup}>
                  <label className={Styles.label}>
                    Lessons
                    <span className={Styles.labelHint}>comma separated</span>
                  </label>
                  <textarea
                    className={Styles.textarea}
                    placeholder="Introduction, Basics, Advanced"
                    value={newLessons}
                    onChange={(e) => setNewLessons(e.target.value)}
                    rows={4}
                  />
                </div>

                <button className={Styles.addBtn} onClick={handleAdd}>
                  <Plus size={14} /> Add Category
                </button>
              </div>

              {/* ── RIGHT: Table ── */}
              <div className={Styles.tableCard}>
                <div className={Styles.cardHeader}>
                  <span className={Styles.cardTitle}>All Categories</span>
                  <span className={Styles.totalCount}>{categories.length} total</span>
                </div>

                {/* Search */}
                <div className={Styles.tableControls}>
                  <div className={Styles.searchWrap}>
                    <Search size={14} className={Styles.searchIcon} />
                    <input
                      className={Styles.searchInput}
                      placeholder="Search categories or lessons…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <button className={Styles.clearBtn} onClick={() => setSearch("")}>
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Table */}
                <div className={Styles.tableWrap}>
                  <table className={Styles.table}>
                    <thead>
                      <tr>
                        <th><div className={Styles.thInner}>Category</div></th>
                        <th><div className={Styles.thInner}>Lessons</div></th>
                        <th><div className={Styles.thInner}>Tutorials</div></th>
                        <th><div className={Styles.thInner}>Actions</div></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={4}>
                            <div className={Styles.empty}>
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                              <p>{search ? "No categories match your search." : "No categories yet."}</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filtered.map((cat) => (
                          <tr key={cat.id} className={Styles.tr}>
                            <td className={Styles.tdName}>{cat.name}</td>
                            <td className={Styles.tdLessons}>
                              {cat.lessons.length} lesson{cat.lessons.length !== 1 ? "s" : ""}
                            </td>
                            <td>
                              <span className={Styles.countBadge}>0</span>
                            </td>
                            <td>
                              <div className={Styles.actionBtns}>
                                <button
                                  className={Styles.actionBtn}
                                  onClick={() => setEditTarget(cat)}
                                >
                                  <Pencil size={13} /> Edit
                                </button>
                                <button
                                  className={`${Styles.actionBtn} ${Styles.actionBtnDel}`}
                                  onClick={() => setDeleteTarget(cat)}
                                >
                                  <Trash2 size={13} /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>

          {/* ── Edit overlay modal ── */}
          <EditModal
            category={editTarget}
            onCancel={() => setEditTarget(null)}
            onSave={handleEditSave}
          />

          {/* ── Delete overlay modal ── */}
          <DeleteModal
            category={deleteTarget}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleDeleteConfirm}
          />

          {/* ── Toast ── */}
          {toast && (
            <Toast message={toast.message} type={toast.type} onHide={() => setToast(null)} />
          )}
        </>
      )}
    </PageLayout>
  );
};

export default CategoriesPage;