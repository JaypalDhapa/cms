import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/pageLayout/PageLayout";
import Header from "../components/header/Header";
import { CATEGORIES, TUTORIALS_DB } from "../data/tutorialData";
import Styles from "./Tutorials.module.css";
import {
  Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Pencil, Trash2, Plus, BookOpen, AlertTriangle, X, Check, Layers, Library,
} from "lucide-react";

// ── Flatten all tutorials ─────────────────────────────────────
function getAllTutorials() {
  const all = [];
  Object.entries(TUTORIALS_DB).forEach(([cat, lessons]) => {
    Object.entries(lessons).forEach(([lesson, tutorials]) => {
      tutorials.forEach((t) => all.push(t));
    });
  });
  return all;
}

const INITIAL_TUTORIALS = getAllTutorials();
const PER_PAGE = 6;

// ── Sort icon ─────────────────────────────────────────────────
const SortIcon = ({ col, sortCol, sortDir }) => {
  if (sortCol !== col)
    return (
      <span className={Styles.sortIconInactive}>
        <ChevronUp size={10} /><ChevronDown size={10} />
      </span>
    );
  return sortDir === "asc"
    ? <ChevronUp size={12} className={Styles.sortIconActive} />
    : <ChevronDown size={12} className={Styles.sortIconActive} />;
};

// ── Custom Searchable Dropdown ────────────────────────────────
const SearchableDropdown = ({ icon: Icon, placeholder, value, options, onChange, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const inputRef = useRef(null);

  // close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // focus search input when opened
  useEffect(() => {
    if (open) { setSearch(""); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;
  const isSelected = value !== "all" && value !== "";

  const handleSelect = (val) => { onChange(val); setOpen(false); setSearch(""); };

  return (
    <div className={`${Styles.ddWrap} ${disabled ? Styles.ddDisabled : ""}`} ref={ref}>
      {/* Trigger button */}
      <button
        className={`${Styles.ddTrigger} ${isSelected ? Styles.ddTriggerActive : ""} ${open ? Styles.ddTriggerOpen : ""}`}
        onClick={() => !disabled && setOpen((o) => !o)}
        type="button"
      >
        <Icon size={13} className={Styles.ddTriggerIcon} />
        <span className={Styles.ddTriggerLabel}>{selectedLabel}</span>
        {isSelected ? (
          <button
            className={Styles.ddClearBtn}
            onClick={(e) => { e.stopPropagation(); handleSelect("all"); }}
          >
            <X size={11} />
          </button>
        ) : (
          <ChevronDown size={13} className={`${Styles.ddChevron} ${open ? Styles.ddChevronOpen : ""}`} />
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className={Styles.ddPanel}>
          {/* Search inside dropdown */}
          <div className={Styles.ddSearch}>
            <Search size={13} className={Styles.ddSearchIcon} />
            <input
              ref={inputRef}
              className={Styles.ddSearchInput}
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className={Styles.ddSearchClear} onClick={() => setSearch("")}>
                <X size={11} />
              </button>
            )}
          </div>

          {/* Options list */}
          <div className={Styles.ddList}>
            {filtered.length === 0 ? (
              <div className={Styles.ddEmpty}>No results</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  className={`${Styles.ddOption} ${value === opt.value ? Styles.ddOptionActive : ""}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  <span>{opt.label}</span>
                  {value === opt.value && <Check size={13} className={Styles.ddOptionCheck} />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Delete Modal ──────────────────────────────────────────────
const DeleteModal = ({ tutorial, onCancel, onConfirm }) => {
  if (!tutorial) return null;
  return (
    <div className={Styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className={Styles.modal}>
        <div className={Styles.modalHeader}>
          <div className={Styles.modalHeaderLeft}>
            <div className={Styles.modalWarningIcon}><AlertTriangle size={16} /></div>
            <h3>Delete Tutorial</h3>
          </div>
          <button className={Styles.modalClose} onClick={onCancel}><X size={16} /></button>
        </div>
        <div className={Styles.modalBody}>
          <p>Are you sure you want to permanently delete <strong>"{tutorial.title}"</strong>?</p>
          <div className={Styles.modalTutorialInfo}>
            <div className={Styles.modalTutorialRow}>
              <span className={Styles.modalInfoLabel}>Category</span>
              <span className={Styles.badgeCategory}>{tutorial.category}</span>
            </div>
            <div className={Styles.modalTutorialRow}>
              <span className={Styles.modalInfoLabel}>Lesson</span>
              <span className={Styles.modalInfoValue}>{tutorial.lesson}</span>
            </div>
            <div className={Styles.modalTutorialRow}>
              <span className={Styles.modalInfoLabel}>Status</span>
              <span className={`${Styles.badge} ${tutorial.status === "Published" ? Styles.badgePublished : Styles.badgeDraft}`}>
                {tutorial.status}
              </span>
            </div>
            <div className={Styles.modalTutorialRow}>
              <span className={Styles.modalInfoLabel}>Slug</span>
              <span className={Styles.modalSlug}>/{tutorial.slug}</span>
            </div>
          </div>
          <div className={Styles.modalDangerNote}>
            <AlertTriangle size={13} /> This action cannot be undone.
          </div>
        </div>
        <div className={Styles.modalFooter}>
          <button className={Styles.modalCancelBtn} onClick={onCancel}>Cancel</button>
          <button className={Styles.modalDeleteBtn} onClick={() => onConfirm(tutorial.id)}>
            <Trash2 size={13} /> Delete Tutorial
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Toast ─────────────────────────────────────────────────────
const Toast = ({ message, onHide }) => {
  useState(() => { const t = setTimeout(onHide, 3000); return () => clearTimeout(t); });
  return (
    <div className={Styles.toast}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {message}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────
const TutorialsPage = () => {
  const navigate = useNavigate();

  const [tutorials, setTutorials] = useState(INITIAL_TUTORIALS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [lessonFilter, setLessonFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortCol, setSortCol] = useState("updatedAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  // ── Dropdown options ──────────────────────────────────────
  const categoryOptions = useMemo(() => [
    { value: "all", label: "All Categories" },
    ...Object.keys(CATEGORIES).map((c) => ({ value: c, label: c })),
  ], []);

  // Lesson options depend on selected category
  const lessonOptions = useMemo(() => {
    const base = [{ value: "all", label: "All Lessons" }];
    if (categoryFilter !== "all" && CATEGORIES[categoryFilter]) {
      return [...base, ...CATEGORIES[categoryFilter].map((l) => ({ value: l, label: l }))];
    }
    // all lessons across all categories (deduplicated)
    const all = new Set();
    Object.values(CATEGORIES).forEach((lessons) => lessons.forEach((l) => all.add(l)));
    return [...base, ...[...all].sort().map((l) => ({ value: l, label: l }))];
  }, [categoryFilter]);

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "Published", label: "Published" },
    { value: "Draft", label: "Draft" },
  ];

  // Reset lesson when category changes
  const handleCategoryChange = (val) => { setCategoryFilter(val); setLessonFilter("all"); setPage(1); };
  const handleLessonChange   = (val) => { setLessonFilter(val); setPage(1); };
  const handleStatusChange   = (val) => { setStatusFilter(val); setPage(1); };

  // ── Filter + Sort ─────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = [...tutorials];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.author.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") data = data.filter((t) => t.category === categoryFilter);
    if (lessonFilter   !== "all") data = data.filter((t) => t.lesson   === lessonFilter);
    if (statusFilter   !== "all") data = data.filter((t) => t.status.toLowerCase() === statusFilter.toLowerCase());

    data.sort((a, b) => {
      const av = (a[sortCol] || "").toString().toLowerCase();
      const bv = (b[sortCol] || "").toString().toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return data;
  }, [tutorials, search, categoryFilter, lessonFilter, statusFilter, sortCol, sortDir]);

  // ── Pagination ────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const start      = (safePage - 1) * PER_PAGE;
  const pageData   = filtered.slice(start, start + PER_PAGE);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
    setPage(1);
  };

  const handleDeleteConfirm = (id) => {
    setTutorials((prev) => prev.filter((t) => t.id !== id));
    setDeleteTarget(null);
    setToast("Tutorial deleted successfully.");
  };

  const pageButtons = () => {
    const btns = [], delta = 1, range = [];
    for (let i = Math.max(1, safePage - delta); i <= Math.min(totalPages, safePage + delta); i++) range.push(i);
    if (range[0] > 1) { btns.push(1); if (range[0] > 2) btns.push("..."); }
    range.forEach((n) => btns.push(n));
    if (range[range.length - 1] < totalPages) {
      if (range[range.length - 1] < totalPages - 1) btns.push("...");
      btns.push(totalPages);
    }
    return btns;
  };

  // active filters count for badge
  const activeFilters = [categoryFilter !== "all", lessonFilter !== "all", statusFilter !== "all"].filter(Boolean).length;

  return (
    <PageLayout>
      {({ isMobile, isOpen, setOpen }) => (
        <>
          <Header isMobile={isMobile} isOpen={isOpen} setOpen={setOpen} title="Tutorials" />

          <div className={Styles.wrapper}>

            {/* Page Header */}
            <div className={Styles.pageHeader}>
              <div>
                <h2>Tutorials</h2>
                <p>Manage all your tutorial content in one place.</p>
              </div>
              <button className={Styles.addBtn} onClick={() => navigate("/tutorial")}>
                <Plus size={15} /> Add Tutorial
              </button>
            </div>

            {/* Table Card */}
            <div className={Styles.tableCard}>

              {/* ── Toolbar ── */}
              <div className={Styles.toolbar}>
                {/* Search */}
                <div className={Styles.searchBox}>
                  <Search size={14} className={Styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search by title, category, author…"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className={Styles.searchInput}
                  />
                  {search && <button className={Styles.clearSearch} onClick={() => { setSearch(""); setPage(1); }}>✕</button>}
                </div>

                {/* Custom dropdowns */}
                <div className={Styles.filters}>
                  <SearchableDropdown
                    icon={Layers}
                    placeholder="All Categories"
                    value={categoryFilter}
                    options={categoryOptions}
                    onChange={handleCategoryChange}
                  />
                  <SearchableDropdown
                    icon={Library}
                    placeholder="All Lessons"
                    value={lessonFilter}
                    options={lessonOptions}
                    onChange={handleLessonChange}
                    disabled={false}
                  />
                  <SearchableDropdown
                    icon={BookOpen}
                    placeholder="All Status"
                    value={statusFilter}
                    options={statusOptions}
                    onChange={handleStatusChange}
                  />
                </div>

                {/* Count + clear filters */}
                <div className={Styles.toolbarRight}>
                  <span className={Styles.countBadge}>
                    {filtered.length} tutorial{filtered.length !== 1 ? "s" : ""}
                  </span>
                  {activeFilters > 0 && (
                    <button
                      className={Styles.clearFiltersBtn}
                      onClick={() => { setCategoryFilter("all"); setLessonFilter("all"); setStatusFilter("all"); setPage(1); }}
                    >
                      <X size={11} /> Clear filters
                    </button>
                  )}
                </div>
              </div>

              {/* ── Table ── */}
              <div className={Styles.tableScroll}>
                <table className={Styles.table}>
                  <thead>
                    <tr>
                      <th onClick={() => handleSort("title")} className={Styles.th}><span className={Styles.thInner}>Title <SortIcon col="title" sortCol={sortCol} sortDir={sortDir} /></span></th>
                      <th onClick={() => handleSort("category")} className={Styles.th}><span className={Styles.thInner}>Category <SortIcon col="category" sortCol={sortCol} sortDir={sortDir} /></span></th>
                      <th onClick={() => handleSort("lesson")} className={Styles.th}><span className={Styles.thInner}>Lesson <SortIcon col="lesson" sortCol={sortCol} sortDir={sortDir} /></span></th>
                      <th className={Styles.th}><span className={Styles.thInner}>Slug</span></th>
                      <th onClick={() => handleSort("author")} className={Styles.th}><span className={Styles.thInner}>Author <SortIcon col="author" sortCol={sortCol} sortDir={sortDir} /></span></th>
                      <th onClick={() => handleSort("updatedAt")} className={Styles.th}><span className={Styles.thInner}>Date <SortIcon col="updatedAt" sortCol={sortCol} sortDir={sortDir} /></span></th>
                      <th onClick={() => handleSort("status")} className={Styles.th}><span className={Styles.thInner}>Status <SortIcon col="status" sortCol={sortCol} sortDir={sortDir} /></span></th>
                      <th className={Styles.th}><span className={Styles.thInner}>Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.length === 0 ? (
                      <tr>
                        <td colSpan={8}>
                          <div className={Styles.emptyState}>
                            <div className={Styles.emptyIcon}><BookOpen size={36} strokeWidth={1.2} /></div>
                            <div className={Styles.emptyTitle}>No tutorials found</div>
                            <div className={Styles.emptyDesc}>Try adjusting your search or filters.</div>
                            <button className={Styles.addBtn} onClick={() => navigate("/tutorial")}><Plus size={14} /> Add Tutorial</button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      pageData.map((t) => (
                        <tr key={t.id} className={Styles.tr}>
                          <td className={Styles.tdTitle} title={t.title}>{t.title}</td>
                          <td><span className={Styles.badgeCategory}>{t.category}</span></td>
                          <td className={Styles.tdLesson}>{t.lesson}</td>
                          <td className={Styles.tdSlug}>/{t.slug}</td>
                          <td className={Styles.tdAuthor}>{t.author}</td>
                          <td className={Styles.tdDate}>{t.updatedAt}</td>
                          <td>
                            <span className={`${Styles.badge} ${t.status === "Published" ? Styles.badgePublished : Styles.badgeDraft}`}>
                              {t.status}
                            </span>
                          </td>
                          <td>
                            <div className={Styles.actionBtns}>
                              <button className={Styles.actionBtn} title="Edit" onClick={() => navigate("/tutorial/edit-form", { state: { tutorial: t } })}>
                                <Pencil size={13} />
                              </button>
                              <button className={`${Styles.actionBtn} ${Styles.actionBtnDanger}`} title="Delete" onClick={() => setDeleteTarget(t)}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ── */}
              {filtered.length > 0 && (
                <div className={Styles.pagination}>
                  <span className={Styles.paginationInfo}>
                    Showing {start + 1}–{Math.min(start + PER_PAGE, filtered.length)} of {filtered.length}
                  </span>
                  <div className={Styles.paginationBtns}>
                    <button className={Styles.pageBtn} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>
                      <ChevronLeft size={14} />
                    </button>
                    {pageButtons().map((btn, i) =>
                      btn === "..." ? (
                        <span key={`e-${i}`} className={Styles.ellipsis}>…</span>
                      ) : (
                        <button key={btn} className={`${Styles.pageBtn} ${safePage === btn ? Styles.pageBtnActive : ""}`} onClick={() => setPage(btn)}>
                          {btn}
                        </button>
                      )
                    )}
                    <button className={Styles.pageBtn} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DeleteModal tutorial={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} />
          {toast && <Toast message={toast} onHide={() => setToast(null)} />}
        </>
      )}
    </PageLayout>
  );
};

export default TutorialsPage;