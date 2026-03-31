import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import PageLayout from "../components/pageLayout/PageLayout";
import Header from "../components/header/Header";
import Styles from "./Categories.module.css";
import { Search, Plus, Pencil, Trash2, X, Check, ChevronDown, Loader } from "lucide-react";
import { GET_COURSES } from "../graphql/queries/courseQueries.js";
import { CREATE_COURSE, UPDATE_COURSE, DELETE_COURSE } from "../graphql/mutations/courseMutation.js";

// ── Helpers ───────────────────────────────────────────────────
const toSlug = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

// Normalise a course edge node into a flat shape the UI uses
const normalise = (node) => ({
  id: node.id,
  name: node.name,
  slug: node.slug,
  isPublished: node.isPublished,
  order: node.order,
});

// ── Custom Order Dropdown ─────────────────────────────────────
const OrderDropdown = ({ value, onChange, disabled }) => {
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
        disabled={disabled}
        className={`${Styles.dropdownTrigger} ${open ? Styles.dropdownTriggerOpen : ""} ${disabled ? Styles.dropdownTriggerDisabled : ""}`}
        onClick={() => !disabled && setOpen((o) => !o)}
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
  useEffect(() => {
    const t = setTimeout(onHide, 3000);
    return () => clearTimeout(t);
  }, [onHide]);

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
const DeleteModal = ({ category, loading, onCancel, onConfirm }) => {
  if (!category) return null;
  return (
    <div className={Styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className={Styles.modal}>
        <div className={Styles.modalHeader}>
          <div className={Styles.modalHeaderLeft}>
            <div className={Styles.modalIconDanger}><Trash2 size={15} /></div>
            <h3>Delete Category</h3>
          </div>
          <button className={Styles.modalClose} onClick={onCancel} disabled={loading}><X size={15} /></button>
        </div>
        <div className={Styles.modalBody}>
          <p>Delete <strong>"{category.name}"</strong>? Tutorials in this category will lose their association.</p>
          <p className={Styles.modalWarn}>This action cannot be undone.</p>
        </div>
        <div className={Styles.modalFooter}>
          <button className={Styles.btnGhost} onClick={onCancel} disabled={loading}>Cancel</button>
          <button
            className={Styles.btnDanger}
            onClick={() => onConfirm(category.id)}
            disabled={loading}
          >
            {loading ? <Loader size={13} className={Styles.spinIcon} /> : <Trash2 size={13} />}
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Edit Modal ────────────────────────────────────────────────
const EditModal = ({ category, totalCount, loading, onCancel, onSave }) => {
  const [form, setFormState] = useState(null);
  const [errors, setErrors] = useState({});
  const slugManual = useRef(false);

  useEffect(() => {
    if (category) {
      slugManual.current = true;
      setFormState({
        name: category.name,
        slug: category.slug || toSlug(category.name),
        isPublished: category.isPublished ?? false,
        orderMode: "custom",
        order: String(category.order ?? ""),
      });
      setErrors({});
    }
  }, [category]);

  // Auto-slug when name changes and slug hasn't been manually edited
  useEffect(() => {
    if (!form || slugManual.current) return;
    setFormState((f) => ({ ...f, slug: toSlug(f.name) }));
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
      id: category.id,
      name: form.name.trim(),
      slug: form.slug || toSlug(form.name),
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
          <button className={Styles.modalClose} onClick={onCancel} disabled={loading}><X size={15} /></button>
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
              disabled={loading}
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
                disabled={loading}
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
                    disabled={loading}
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
              disabled={loading}
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
                  disabled={loading}
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
          <button className={Styles.btnGhost} onClick={onCancel} disabled={loading}>Cancel</button>
          <button className={Styles.btnPrimary} onClick={handleSave} disabled={loading}>
            {loading ? <Loader size={13} className={Styles.spinIcon} /> : <Check size={13} />}
            {loading ? "Saving…" : "Save Changes"}
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
  const slugManual = useRef(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  // ── GraphQL: Fetch courses ────────────────────────────────
  const { data, loading: queryLoading, error: queryError } = useQuery(GET_COURSES, {
    variables: { filters: {} },
    fetchPolicy: "cache-and-network",
  });

  const categories = useMemo(
    () => data?.courses?.edges?.map((e) => normalise(e.node)) ?? [],
    [data]
  );

  // ── GraphQL: Mutations ────────────────────────────────────
  const [createCourse, { loading: creating }] = useMutation(CREATE_COURSE, {
    refetchQueries: [{ query: GET_COURSES, variables: { filters: {} } }],
  });

  const [updateCourse, { loading: updating }] = useMutation(UPDATE_COURSE, {
    refetchQueries: [{ query: GET_COURSES, variables: { filters: {} } }],
  });

  const [deleteCourse, { loading: deleting }] = useMutation(DELETE_COURSE, {
    refetchQueries: [{ query: GET_COURSES, variables: { filters: {} } }],
  });

  // ── Auto-slug from name ───────────────────────────────────
  useEffect(() => {
    if (!slugManual.current) {
      setForm((f) => ({ ...f, slug: toSlug(f.name) }));
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
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, search]);

  // ── Add ───────────────────────────────────────────────────
  const handleAdd = async () => {
    const errors = {};
    const trimName = form.name.trim();
    if (!trimName) errors.name = "Category name is required";
    else if (categories.find((c) => c.name.toLowerCase() === trimName.toLowerCase()))
      errors.name = "Category already exists";
    if (form.orderMode === "custom" && !form.order.toString().trim())
      errors.order = "Order value is required";

    if (Object.keys(errors).length) { setFormErrors(errors); return; }

    try {
      await createCourse({
        variables: {
          input: {
            name: trimName,
            slug: form.slug || toSlug(trimName),
            isPublished: form.isPublished,
            order:
              form.orderMode === "auto"
                ? categories.length + 1
                : parseInt(form.order, 10),
          },
        },
      });

      slugManual.current = false;
      setForm(EMPTY_FORM);
      setFormErrors({});
      setToast({ message: `"${trimName}" added!`, type: "success" });
    } catch (err) {
      setToast({ message: err.message ?? "Failed to create category", type: "danger" });
    }
  };

  // ── Edit save ─────────────────────────────────────────────
  const handleEditSave = async ({ id, name, slug, isPublished, order }) => {
    try {
      await updateCourse({
        variables: {
          id,
          input: { name, slug, isPublished, order },
        },
      });
      setEditTarget(null);
      setToast({ message: `"${name}" updated!`, type: "success" });
    } catch (err) {
      setToast({ message: err.message ?? "Failed to update category", type: "danger" });
    }
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDeleteConfirm = async (id) => {
    const cat = categories.find((c) => c.id === id);
    try {
      await deleteCourse({ variables: { id } });
      setDeleteTarget(null);
      setToast({ message: `"${cat.name}" deleted.`, type: "danger" });
    } catch (err) {
      setToast({ message: err.message ?? "Failed to delete category", type: "danger" });
    }
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

            {/* Query error banner */}
            {queryError && (
              <div className={Styles.errorBanner}>
                Failed to load categories: {queryError.message}
              </div>
            )}

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
                    disabled={creating}
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
                      disabled={creating}
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
                          disabled={creating}
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
                    disabled={creating}
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
                        disabled={creating}
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

                <button className={Styles.addBtn} onClick={handleAdd} disabled={creating}>
                  {creating
                    ? <><Loader size={14} className={Styles.spinIcon} /> Adding…</>
                    : <><Plus size={14} /> Add Category</>
                  }
                </button>
              </div>

              {/* ── RIGHT: Table ── */}
              <div className={Styles.tableCard}>
                <div className={Styles.cardHeader}>
                  <span className={Styles.cardTitle}>All Categories</span>
                  <span className={Styles.totalCount}>
                    {queryLoading ? "…" : `${categories.length} total`}
                  </span>
                </div>

                <div className={Styles.tableControls}>
                  <div className={Styles.searchWrap}>
                    <Search size={14} className={Styles.searchIcon} />
                    <input
                      className={Styles.searchInput}
                      placeholder="Search categories…"
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
                        <th><div className={Styles.thInner}>Slug</div></th>
                        <th><div className={Styles.thInner}>Status</div></th>
                        <th><div className={Styles.thInner}>Order</div></th>
                        <th><div className={Styles.thInner}>Actions</div></th>
                      </tr>
                    </thead>
                    <tbody>
                      {queryLoading && categories.length === 0 ? (
                        <tr>
                          <td colSpan={5}>
                            <div className={Styles.loadingState}>
                              <Loader size={20} className={Styles.spinIcon} />
                              <p>Loading categories…</p>
                            </div>
                          </td>
                        </tr>
                      ) : filtered.length === 0 ? (
                        <tr>
                          <td colSpan={5}>
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
                            <td className={Styles.tdSlug}>{cat.slug}</td>
                            <td>
                              <span className={`${Styles.statusBadge} ${cat.isPublished ? Styles.statusPublished : Styles.statusDraft}`}>
                                {cat.isPublished ? "Published" : "Draft"}
                              </span>
                            </td>
                            <td className={Styles.tdOrder}>{cat.order ?? "—"}</td>
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
            loading={updating}
            onCancel={() => setEditTarget(null)}
            onSave={handleEditSave}
          />

          <DeleteModal
            category={deleteTarget}
            loading={deleting}
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