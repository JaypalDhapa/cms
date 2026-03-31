import { useState, useMemo, useEffect, useRef } from "react";
import PageLayout from "../components/pageLayout/PageLayout";
import Header from "../components/header/Header";
import { CATEGORIES } from "../data/tutorialData";
import Styles from "./Categories.module.css";
import { Search, Plus, Pencil, Trash2, X, Check, ChevronDown } from "lucide-react";

// ── Build initial state ───────────────────────────────────────
function buildInitial() {
  return Object.entries(CATEGORIES).map(([name, lessons], i) => ({
    id: i + 1,
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    lessons: [...lessons],
    isPublished: false,
    order: i + 1,
  }));
}

// ── Custom Order Dropdown ─────────────────────────────────────
const OrderDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const options = [
    { value: "auto", label: "Auto" },
    { value: "custom", label: "Custom" },
  ];

  const selected = options.find((o) => o.value === value);

  return (
    <div className={Styles.customDropdown} ref={ref}>
      <button
        type="button"
        className={`${Styles.dropdownTrigger} ${open ? Styles.dropdownTriggerOpen : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{selected?.label}</span>
        <ChevronDown
          size={14}
          className={`${Styles.dropdownChevron} ${open ? Styles.dropdownChevronOpen : ""}`}
        />
      </button>

      {open && (
        <div className={Styles.dropdownMenu}>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`${Styles.dropdownItem} ${value === opt.value ? Styles.dropdownItemActive : ""}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <span className={Styles.dropdownItemCheck}>
                {value === opt.value && <Check size={11} />}
              </span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

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
const EditModal = ({ category, totalCount, onCancel, onSave }) => {
  const [form, setFormState] = useState(null);
  const [errors, setErrors] = useState({});
  const slugManual = useRef(false);

  useEffect(() => {
    if (category) {
      slugManual.current = true;
      setFormState({
        name: category.name,
        slug: category.slug || category.name.toLowerCase().replace(/\s+/g, "-"),
        isPublished: category.isPublished ?? false,
        orderMode: "custom",
        order: String(category.order ?? ""),
      });
      setErrors({});
    }
  }, [category]);

  useEffect(() => {
    if (!form || slugManual.current) return;
    setFormState((f) => ({
      ...f,
      slug: f.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-"),
    }));
  }, [form?.name]);

  if (!category || !form) return null;

  const setField = (key, value) => {
    setFormState((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleSave = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Category name is required";
    if (form.orderMode === "custom" && !form.order.toString().trim())
      errs.order = "Order value is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    onSave({
      ...category,
      name: form.name.trim(),
      slug: form.slug,
      isPublished: form.isPublished,
      order: form.orderMode === "auto" ? totalCount : parseInt(form.order, 10),
    });
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
          {/* Name */}
          <div className={Styles.formGroup}>
            <label className={Styles.label}>
              Category Name <span className={Styles.req}>*</span>
            </label>
            <input
              className={`${Styles.input} ${errors.name ? Styles.inputErr : ""}`}
              placeholder="e.g. TypeScript"
              value={form.name}
              autoFocus
              onChange={(e) => { slugManual.current = false; setField("name", e.target.value); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            />
            {errors.name && <span className={Styles.errMsg}>{errors.name}</span>}
          </div>

          {/* Slug */}
          <div className={Styles.slug_formGroup}>
            <label className={Styles.label}>Slug</label>
            <div className={Styles.slugWrap}>
              <span className={Styles.slugPrefix}>tutorialsite.com/</span>
              <input
                className={Styles.input}
                placeholder="auto-generated-from-title"
                value={form.slug}
                onChange={(e) => { slugManual.current = true; setField("slug", e.target.value); }}
              />
            </div>
          </div>

          {/* Status */}
          <div className={Styles.formGroup}>
            <label className={Styles.label}>Status</label>
            <div className={Styles.radioGroup}>
              {["Draft", "Published"].map((s) => (
                <label key={s} className={Styles.radioLabel}>
                  <input
                    type="radio"
                    name="editStatus"
                    value={s}
                    checked={form.isPublished === (s === "Published")}
                    onChange={() => setField("isPublished", s === "Published")}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          {/* Order */}
          <div className={Styles.formGroup} style={{ marginBottom: 0 }}>
            <label className={Styles.label}>Order</label>
            <OrderDropdown
              value={form.orderMode}
              onChange={(val) => {
                setField("orderMode", val);
                if (val === "auto") setField("order", "");
              }}
            />
            {form.orderMode === "custom" && (
              <div className={Styles.orderInputWrap}>
                <input
                  className={`${Styles.input} ${errors.order ? Styles.inputErr : ""}`}
                  type="number"
                  min="1"
                  placeholder="e.g. 3"
                  value={form.order}
                  onChange={(e) => setField("order", e.target.value)}
                />
                {errors.order && <span className={Styles.errMsg}>{errors.order}</span>}
              </div>
            )}
            {form.orderMode === "auto" && (
              <span className={Styles.helpText}>Will be placed at the end</span>
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

// ── Form constants ────────────────────────────────────────────
const EMPTY_FORM = {
  name: "",
  slug: "",
  isPublished: false,
  orderMode: "auto",
  order: "",
};

// ── Main Page ─────────────────────────────────────────────────
const CategoriesPage = () => {
  const [categories, setCategories] = useState(buildInitial);
  const [search, setSearch] = useState("");
  const slugManual = useRef(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  // ── Auto slug ─────────────────────────────────────────────
  useEffect(() => {
    if (!slugManual.current) {
      setForm((f) => ({
        ...f,
        slug: f.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-"),
      }));
    }
  }, [form.name]);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setFormErrors((e) => ({ ...e, [key]: "" }));
  };

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
    const errors = {};
    const trimName = form.name.trim();
    if (!trimName) errors.name = "Category name is required";
    else if (categories.find((c) => c.name.toLowerCase() === trimName.toLowerCase()))
      errors.name = "Category already exists";
    if (form.orderMode === "custom" && !form.order.toString().trim())
      errors.order = "Order value is required";

    if (Object.keys(errors).length) { setFormErrors(errors); return; }

    setCategories((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: trimName,
        slug: form.slug || trimName.toLowerCase().replace(/\s+/g, "-"),
        lessons: [],
        isPublished: form.isPublished,
        order: form.orderMode === "auto" ? prev.length + 1 : parseInt(form.order, 10),
      },
    ]);

    slugManual.current = false;
    setForm(EMPTY_FORM);
    setFormErrors({});
    setToast({ message: `"${trimName}" added!`, type: "success" });
  };

  // ── Edit save ─────────────────────────────────────────────
  const handleEditSave = (updated) => {
    const dup = categories.find(
      (c) => c.name.toLowerCase() === updated.name.toLowerCase() && c.id !== updated.id
    );
    if (dup) return;
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

                {/* Name */}
                <div className={Styles.formGroup}>
                  <label className={Styles.label}>
                    Category Name <span className={Styles.req}>*</span>
                  </label>
                  <input
                    className={`${Styles.input} ${formErrors.name ? Styles.inputErr : ""}`}
                    placeholder="e.g. TypeScript"
                    value={form.name}
                    onChange={(e) => { slugManual.current = false; setField("name", e.target.value); }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                  />
                  {formErrors.name && <span className={Styles.errMsg}>{formErrors.name}</span>}
                </div>

                {/* Slug */}
                <div className={Styles.slug_formGroup}>
                  <label className={Styles.label}>Slug</label>
                  <div className={Styles.slugWrap}>
                    <span className={Styles.slugPrefix}>tutorialsite.com/</span>
                    <input
                      className={Styles.input}
                      placeholder="auto-generated-from-title"
                      value={form.slug}
                      onChange={(e) => { slugManual.current = true; setField("slug", e.target.value); }}
                    />
                  </div>
                  <span className={Styles.helpText}>Leave blank to auto-generate from title</span>
                </div>

                {/* Status */}
                <div className={Styles.formGroup}>
                  <label className={Styles.label}>Status</label>
                  <div className={Styles.radioGroup}>
                    {["Draft", "Published"].map((s) => (
                      <label key={s} className={Styles.radioLabel}>
                        <input
                          type="radio"
                          name="status"
                          value={s}
                          checked={form.isPublished === (s === "Published")}
                          onChange={() => setField("isPublished", s === "Published")}
                        />
                        {s}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Order */}
                <div className={Styles.formGroup}>
                  <label className={Styles.label}>Order</label>
                  <OrderDropdown
                    value={form.orderMode}
                    onChange={(val) => {
                      setField("orderMode", val);
                      if (val === "auto") setField("order", "");
                    }}
                  />
                  {form.orderMode === "custom" && (
                    <div className={Styles.orderInputWrap}>
                      <input
                        className={`${Styles.input} ${formErrors.order ? Styles.inputErr : ""}`}
                        type="number"
                        min="1"
                        placeholder="e.g. 3"
                        value={form.order}
                        onChange={(e) => setField("order", e.target.value)}
                      />
                      {formErrors.order && <span className={Styles.errMsg}>{formErrors.order}</span>}
                    </div>
                  )}
                  {form.orderMode === "auto" && (
                    <span className={Styles.helpText}>
                      Will be placed at position {categories.length + 1}
                    </span>
                  )}
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
                            <td><span className={Styles.countBadge}>0</span></td>
                            <td>
                              <div className={Styles.actionBtns}>
                                <button className={Styles.actionBtn} onClick={() => setEditTarget(cat)}>
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

          <EditModal
            category={editTarget}
            totalCount={categories.length}
            onCancel={() => setEditTarget(null)}
            onSave={handleEditSave}
          />

          <DeleteModal
            category={deleteTarget}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleDeleteConfirm}
          />

          {toast && (
            <Toast message={toast.message} type={toast.type} onHide={() => setToast(null)} />
          )}
        </>
      )}
    </PageLayout>
  );
};

export default CategoriesPage;