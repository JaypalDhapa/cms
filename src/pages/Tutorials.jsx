import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/pageLayout/PageLayout";
import Header from "../components/header/Header";
import { CATEGORIES, TUTORIALS_DB } from "../data/tutorialData";
import Styles from "./Tutorials.module.css";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Plus,
  BookOpen,
} from "lucide-react";

// ── Flatten all tutorials from the DB into a single array ─────
function getAllTutorials() {
  const all = [];
  Object.entries(TUTORIALS_DB).forEach(([cat, lessons]) => {
    Object.entries(lessons).forEach(([lesson, tutorials]) => {
      tutorials.forEach((t) => all.push(t));
    });
  });
  return all;
}

const ALL_TUTORIALS = getAllTutorials();
const PER_PAGE = 6;

// ── Sort icon ─────────────────────────────────────────────────
const SortIcon = ({ col, sortCol, sortDir }) => {
  if (sortCol !== col)
    return (
      <span className={Styles.sortIconInactive}>
        <ChevronUp size={10} />
        <ChevronDown size={10} />
      </span>
    );
  return sortDir === "asc" ? (
    <ChevronUp size={12} className={Styles.sortIconActive} />
  ) : (
    <ChevronDown size={12} className={Styles.sortIconActive} />
  );
};

// ── Main Page ─────────────────────────────────────────────────
const TutorialsPage = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortCol, setSortCol] = useState("updatedAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  // ── Filter + Sort ─────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = [...ALL_TUTORIALS];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          t.author.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all")
      data = data.filter((t) => t.category === categoryFilter);

    if (statusFilter !== "all")
      data = data.filter(
        (t) => t.status.toLowerCase() === statusFilter.toLowerCase()
      );

    data.sort((a, b) => {
      const av = (a[sortCol] || "").toString().toLowerCase();
      const bv = (b[sortCol] || "").toString().toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [search, categoryFilter, statusFilter, sortCol, sortDir]);

  // ── Pagination ────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PER_PAGE;
  const pageData = filtered.slice(start, start + PER_PAGE);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
    setPage(1);
  };

  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleCategoryFilter = (val) => { setCategoryFilter(val); setPage(1); };
  const handleStatusFilter = (val) => { setStatusFilter(val); setPage(1); };

  const handleEdit = (tutorial) => {
    navigate("/tutorial/edit-form", { state: { tutorial } });
  };

  const handleDelete = (tutorial) => {
    navigate("/tutorial/delete", { state: { prefill: tutorial } });
  };

  // ── Page number buttons ───────────────────────────────────
  const pageButtons = () => {
    const btns = [];
    const delta = 1;
    const range = [];
    for (
      let i = Math.max(1, safePage - delta);
      i <= Math.min(totalPages, safePage + delta);
      i++
    ) range.push(i);
    if (range[0] > 1) { btns.push(1); if (range[0] > 2) btns.push("..."); }
    range.forEach((n) => btns.push(n));
    if (range[range.length - 1] < totalPages) {
      if (range[range.length - 1] < totalPages - 1) btns.push("...");
      btns.push(totalPages);
    }
    return btns;
  };

  return (
    <PageLayout>
      {({ isMobile, isOpen, setOpen }) => (
        <>
          <Header
            isMobile={isMobile}
            isOpen={isOpen}
            setOpen={setOpen}
            title="Tutorials"
          />
          <div className={Styles.wrapper}>

            {/* ── Page Header ── */}
            <div className={Styles.pageHeader}>
              <div>
                <h2>Tutorials</h2>
                <p>Manage all your tutorial content in one place.</p>
              </div>
              <button
                className={Styles.addBtn}
                onClick={() => navigate("/tutorial")}
              >
                <Plus size={15} />
                Add Tutorial
              </button>
            </div>

            {/* ── Table Card ── */}
            <div className={Styles.tableCard}>

              {/* ── Toolbar ── */}
              <div className={Styles.toolbar}>
                <div className={Styles.searchBox}>
                  <Search size={14} className={Styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search by title, category, author…"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className={Styles.searchInput}
                  />
                  {search && (
                    <button className={Styles.clearSearch} onClick={() => handleSearch("")}>✕</button>
                  )}
                </div>

                <div className={Styles.filters}>
                  <select
                    className={Styles.filterSelect}
                    value={categoryFilter}
                    onChange={(e) => handleCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {Object.keys(CATEGORIES).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <select
                    className={Styles.filterSelect}
                    value={statusFilter}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                <span className={Styles.countBadge}>
                  {filtered.length} tutorial{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* ── Table ── */}
              <div className={Styles.tableScroll}>
                <table className={Styles.table}>
                  <thead>
                    <tr>
                      <th onClick={() => handleSort("title")} className={Styles.th}>
                        <span className={Styles.thInner}>
                          Title <SortIcon col="title" sortCol={sortCol} sortDir={sortDir} />
                        </span>
                      </th>
                      <th onClick={() => handleSort("category")} className={Styles.th}>
                        <span className={Styles.thInner}>
                          Category <SortIcon col="category" sortCol={sortCol} sortDir={sortDir} />
                        </span>
                      </th>
                      <th onClick={() => handleSort("lesson")} className={Styles.th}>
                        <span className={Styles.thInner}>
                          Lesson <SortIcon col="lesson" sortCol={sortCol} sortDir={sortDir} />
                        </span>
                      </th>
                      <th className={Styles.th}>
                        <span className={Styles.thInner}>Slug</span>
                      </th>
                      <th onClick={() => handleSort("author")} className={Styles.th}>
                        <span className={Styles.thInner}>
                          Author <SortIcon col="author" sortCol={sortCol} sortDir={sortDir} />
                        </span>
                      </th>
                      <th onClick={() => handleSort("updatedAt")} className={Styles.th}>
                        <span className={Styles.thInner}>
                          Date <SortIcon col="updatedAt" sortCol={sortCol} sortDir={sortDir} />
                        </span>
                      </th>
                      <th onClick={() => handleSort("status")} className={Styles.th}>
                        <span className={Styles.thInner}>
                          Status <SortIcon col="status" sortCol={sortCol} sortDir={sortDir} />
                        </span>
                      </th>
                      <th className={Styles.th}>
                        <span className={Styles.thInner}>Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.length === 0 ? (
                      <tr>
                        <td colSpan={8}>
                          <div className={Styles.emptyState}>
                            <div className={Styles.emptyIcon}>
                              <BookOpen size={36} strokeWidth={1.2} />
                            </div>
                            <div className={Styles.emptyTitle}>No tutorials found</div>
                            <div className={Styles.emptyDesc}>
                              Try adjusting your search or filters.
                            </div>
                            <button
                              className={Styles.addBtn}
                              onClick={() => navigate("/tutorial")}
                            >
                              <Plus size={14} /> Add Tutorial
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      pageData.map((t) => (
                        <tr key={t.id} className={Styles.tr}>
                          <td className={Styles.tdTitle} title={t.title}>
                            {t.title}
                          </td>
                          <td>
                            <span className={Styles.badgeCategory}>{t.category}</span>
                          </td>
                          <td className={Styles.tdLesson}>{t.lesson}</td>
                          <td className={Styles.tdSlug}>/{t.slug}</td>
                          <td className={Styles.tdAuthor}>{t.author}</td>
                          <td className={Styles.tdDate}>{t.updatedAt}</td>
                          <td>
                            <span
                              className={`${Styles.badge} ${
                                t.status === "Published"
                                  ? Styles.badgePublished
                                  : Styles.badgeDraft
                              }`}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td>
                            <div className={Styles.actionBtns}>
                              <button
                                className={Styles.actionBtn}
                                title="Edit"
                                onClick={() => handleEdit(t)}
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                className={`${Styles.actionBtn} ${Styles.actionBtnDanger}`}
                                title="Delete"
                                onClick={() => handleDelete(t)}
                              >
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
                    Showing {filtered.length === 0 ? 0 : start + 1}–
                    {Math.min(start + PER_PAGE, filtered.length)} of{" "}
                    {filtered.length}
                  </span>
                  <div className={Styles.paginationBtns}>
                    <button
                      className={Styles.pageBtn}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                    >
                      <ChevronLeft size={14} />
                    </button>

                    {pageButtons().map((btn, i) =>
                      btn === "..." ? (
                        <span key={`ellipsis-${i}`} className={Styles.ellipsis}>…</span>
                      ) : (
                        <button
                          key={btn}
                          className={`${Styles.pageBtn} ${safePage === btn ? Styles.pageBtnActive : ""}`}
                          onClick={() => setPage(btn)}
                        >
                          {btn}
                        </button>
                      )
                    )}

                    <button
                      className={Styles.pageBtn}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
};

export default TutorialsPage;
