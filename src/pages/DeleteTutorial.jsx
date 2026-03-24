import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/pageLayout/PageLayout";
import Header from "../components/header/Header";
import { CATEGORIES, TUTORIALS_DB } from "../data/tutorialData";
import Styles from "./DeleteTutorial.module.css";
import {
  Layers,
  Library,
  BookMarked,
  Trash2,
  AlertTriangle,
  BookOpen,
  CalendarDays,
} from "lucide-react";

// ── Searchable Dropdown ────────────────────────────────────────
const SearchableDropdown = ({
  options = [],
  value = "",
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);
  const [highlighted, setHighlighted] = useState(0);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
      setHighlighted(0);
    }
  }, [open]);

  useEffect(() => {
    if (!listRef.current) return;
    const item = listRef.current.children[highlighted];
    if (item) item.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  const select = (opt) => {
    onChange(opt);
    setOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e) => {
    if (!open) { if (e.key === "Enter" || e.key === " ") setOpen(true); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (filtered[highlighted]) select(filtered[highlighted]); }
    else if (e.key === "Escape") { setOpen(false); setQuery(""); }
  };

  return (
    <div
      ref={containerRef}
      className={`${Styles.sdRoot} ${disabled ? Styles.sdDisabled : ""}`}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className={Styles.sdTrigger}
        onClick={() => { if (!disabled) setOpen((o) => !o); }}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        <span className={value ? Styles.sdValue : Styles.sdPlaceholder}>
          {value || placeholder}
        </span>
        <svg
          className={`${Styles.sdChevron} ${open ? Styles.sdChevronOpen : ""}`}
          width="14" height="14" viewBox="0 0 14 14" fill="none"
        >
          <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className={Styles.sdPanel}>
          <div className={Styles.sdSearchWrap}>
            <svg className={Styles.sdSearchIcon} width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              ref={searchRef}
              type="text"
              className={Styles.sdSearchInput}
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setHighlighted(0); }}
            />
            {query && (
              <button className={Styles.sdClear} onClick={() => { setQuery(""); searchRef.current?.focus(); }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
          <ul ref={listRef} className={Styles.sdList} role="listbox">
            {filtered.length > 0 ? (
              filtered.map((opt, i) => (
                <li
                  key={opt}
                  role="option"
                  aria-selected={opt === value}
                  className={`${Styles.sdOption} ${opt === value ? Styles.sdSelected : ""} ${i === highlighted ? Styles.sdHighlighted : ""}`}
                  onMouseEnter={() => setHighlighted(i)}
                  onClick={() => select(opt)}
                >
                  <span>{opt}</span>
                  {opt === value && (
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M2 6.5l3.5 3.5L11 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </li>
              ))
            ) : (
              <li className={Styles.sdEmpty}>No results for "{query}"</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

// ── Status badge colours ──────────────────────────────────────
const STATUS_CLASS = {
  Published: Styles.badgePublished,
  Draft: Styles.badgeDraft,
};

// ── Main Page ─────────────────────────────────────────────────
const DeleteTutorialPage = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [lesson, setLesson] = useState("");
  const [tutorialId, setTutorialId] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const lessonList = category ? CATEGORIES[category] : [];
  const tutorialsInLesson =
    category && lesson ? TUTORIALS_DB[category]?.[lesson] ?? [] : [];
  const selected = tutorialId
    ? tutorialsInLesson.find((t) => t.id === tutorialId)
    : null;

  const handleCategoryChange = (val) => {
    setCategory(val);
    setLesson("");
    setTutorialId("");
    setShowConfirm(false);
    setDeleted(false);
  };

  const handleLessonChange = (val) => {
    setLesson(val);
    setTutorialId("");
    setShowConfirm(false);
    setDeleted(false);
  };

  const handleTutorialChange = (val) => {
    setTutorialId(val);
    setShowConfirm(false);
    setDeleted(false);
  };

  const handleDelete = () => {
    // In a real app: call DELETE API here
    // await fetch(`/api/tutorials/${tutorialId}`, { method: 'DELETE' })
    console.log("Deleting tutorial:", tutorialId);
    setDeleted(true);
    setShowConfirm(false);
    setTutorialId("");
    setLesson("");
    setCategory("");
  };

  return (
    <PageLayout>
      {({ isMobile, isOpen, setOpen }) => (
        <>
          <Header
            isMobile={isMobile}
            isOpen={isOpen}
            setOpen={setOpen}
            title="Delete Tutorial"
          />
          <div className={Styles.wrapper}>
            <div className={Styles.pageHeader}>
              <h2>Delete Tutorial</h2>
              <p>Select a tutorial to permanently remove it from the system.</p>
            </div>

            {/* ── Success State ── */}
            {deleted && (
              <div className={Styles.successBanner}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Tutorial deleted successfully.
                <button className={Styles.successDismiss} onClick={() => setDeleted(false)}>✕</button>
              </div>
            )}

            {/* ── Cascading Selectors ── */}
            <div className={Styles.selectorCard}>
              <div className={Styles.selectorCardTitle}>Select Tutorial to Delete</div>
              <div className={Styles.selectorRow}>

                {/* Step 1 */}
                <div className={Styles.selectorStep}>
                  <div className={Styles.selectorBadge}>1</div>
                  <div className={Styles.selectorBody}>
                    <label className={Styles.selectorLabel}>
                      <Layers size={13} /> Category
                    </label>
                    <SearchableDropdown
                      options={Object.keys(CATEGORIES)}
                      value={category}
                      onChange={handleCategoryChange}
                      placeholder="Choose a category…"
                      searchPlaceholder="Search categories…"
                    />
                  </div>
                </div>

                <div className={Styles.selectorArrow}>→</div>

                {/* Step 2 */}
                <div className={`${Styles.selectorStep} ${!category ? Styles.disabled : ""}`}>
                  <div className={Styles.selectorBadge}>2</div>
                  <div className={Styles.selectorBody}>
                    <label className={Styles.selectorLabel}>
                      <Library size={13} /> Lesson
                    </label>
                    <SearchableDropdown
                      options={lessonList}
                      value={lesson}
                      onChange={handleLessonChange}
                      placeholder={category ? "Choose a lesson…" : "Select category first"}
                      searchPlaceholder="Search lessons…"
                      disabled={!category}
                    />
                  </div>
                </div>

                <div className={Styles.selectorArrow}>→</div>

                {/* Step 3 */}
                <div className={`${Styles.selectorStep} ${!lesson ? Styles.disabled : ""}`}>
                  <div className={Styles.selectorBadge}>3</div>
                  <div className={Styles.selectorBody}>
                    <label className={Styles.selectorLabel}>
                      <BookMarked size={13} /> Tutorial
                    </label>
                    <SearchableDropdown
                      options={tutorialsInLesson.map((t) => t.title)}
                      value={tutorialsInLesson.find((t) => t.id === tutorialId)?.title || ""}
                      onChange={(title) => {
                        const found = tutorialsInLesson.find((t) => t.title === title);
                        handleTutorialChange(found ? found.id : "");
                      }}
                      placeholder={lesson ? "Choose a tutorial…" : "Select lesson first"}
                      searchPlaceholder="Search tutorials…"
                      disabled={!lesson}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* ── Selected Tutorial Card ── */}
            {selected && !showConfirm && (
              <div className={Styles.tutorialCard}>
                <div className={Styles.cardThumb}>
                  <BookOpen size={28} />
                </div>
                <div className={Styles.cardBody}>
                  <div className={Styles.cardMeta}>
                    <span className={Styles.cardCategory}>{selected.category}</span>
                    <span className={Styles.cardLesson}>{selected.lesson}</span>
                    <span className={`${Styles.cardBadge} ${STATUS_CLASS[selected.status] || ""}`}>
                      {selected.status}
                    </span>
                  </div>
                  <h3 className={Styles.cardTitle}>{selected.title}</h3>
                  <p className={Styles.cardDesc}>{selected.description}</p>
                  <div className={Styles.cardFooter}>
                    <span className={Styles.cardAuthor}>By {selected.author}</span>
                    <span className={Styles.cardDate}>
                      <CalendarDays size={12} /> {selected.updatedAt}
                    </span>
                    <span className={Styles.cardSlug}>/{selected.slug}</span>
                  </div>
                </div>
                <div className={Styles.cardActions}>
                  <button className={Styles.cancelBtn} onClick={() => navigate("/tutorial/edit")}>
                    Edit Instead
                  </button>
                  <button className={Styles.deleteBtn} onClick={() => setShowConfirm(true)}>
                    <Trash2 size={14} />
                    Delete Tutorial
                  </button>
                </div>
              </div>
            )}

            {/* ── Warning + Confirm ── */}
            {selected && showConfirm && (
              <div className={Styles.confirmZone}>
                <div className={Styles.warningBox}>
                  <div className={Styles.warningIcon}>
                    <AlertTriangle size={22} />
                  </div>
                  <div className={Styles.warningText}>
                    <div className={Styles.warningTitle}>This action is irreversible</div>
                    <div className={Styles.warningDesc}>
                      You are about to permanently delete{" "}
                      <strong>"{selected.title}"</strong>. Once deleted, it
                      cannot be recovered. Make sure you want to proceed.
                    </div>
                  </div>
                </div>

                <div className={Styles.confirmCard}>
                  <div className={Styles.confirmLabel}>You are deleting:</div>
                  <div className={Styles.confirmTitle}>{selected.title}</div>
                  <div className={Styles.confirmMeta}>
                    <span className={Styles.cardCategory}>{selected.category}</span>
                    <span className={Styles.cardLesson}>{selected.lesson}</span>
                    <span className={`${Styles.cardBadge} ${STATUS_CLASS[selected.status] || ""}`}>
                      {selected.status}
                    </span>
                  </div>
                </div>

                <div className={Styles.confirmActions}>
                  <button
                    className={Styles.cancelBtn}
                    onClick={() => setShowConfirm(false)}
                  >
                    ← Cancel
                  </button>
                  <button className={Styles.confirmDeleteBtn} onClick={handleDelete}>
                    <Trash2 size={14} />
                    Yes, Delete Permanently
                  </button>
                </div>
              </div>
            )}

            {/* ── Placeholder ── */}
            {!selected && !deleted && (
              <div className={Styles.placeholder}>
                <div className={Styles.placeholderIcon}>
                  <Trash2 size={44} strokeWidth={1.2} />
                </div>
                <p>Select a <strong>category</strong>, <strong>lesson</strong>, and <strong>tutorial</strong> above to delete it.</p>
              </div>
            )}
          </div>
        </>
      )}
    </PageLayout>
  );
};

export default DeleteTutorialPage;