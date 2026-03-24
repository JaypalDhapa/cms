import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/pageLayout/PageLayout";
import Header from "../components/header/Header";
import { CATEGORIES, TUTORIALS_DB } from "../data/tutorialData";
import Styles from "./EditTutorial.module.css";
import {
  BookOpen,
  Pencil,
  CalendarDays,
  SearchX,
  Layers,
  Library,
  BookMarked,
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

const STATUS_CLASS = {
  Published: Styles.badgePublished,
  Draft: Styles.badgeDraft,
};

const TutorialCard = ({ tutorial, onEdit }) => (
  <div className={Styles.card}>
    <div className={Styles.cardThumb}>
      <BookOpen size={28} />
    </div>
    <div className={Styles.cardBody}>
      <div className={Styles.cardMeta}>
        <span className={Styles.cardCategory}>{tutorial.category}</span>
        <span className={Styles.cardLesson}>{tutorial.lesson}</span>
        <span className={`${Styles.cardBadge} ${STATUS_CLASS[tutorial.status] || ""}`}>
          {tutorial.status}
        </span>
      </div>
      <h3 className={Styles.cardTitle}>{tutorial.title}</h3>
      <p className={Styles.cardDesc}>{tutorial.description}</p>
      <div className={Styles.cardFooter}>
        <span className={Styles.cardAuthor}>By {tutorial.author}</span>
        <span className={Styles.cardDate}>
          <CalendarDays size={12} />
          {tutorial.updatedAt}
        </span>
      </div>
    </div>
    <div className={Styles.cardActions}>
      <button className={Styles.editBtn} onClick={() => onEdit(tutorial)}>
        <Pencil size={14} />
        Edit Tutorial
      </button>
    </div>
  </div>
);

const EditTutorialPage = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [lesson, setLesson] = useState("");
  const [tutorialId, setTutorialId] = useState("");

  const lessonList = category ? CATEGORIES[category] : [];
  const tutorialsInLesson = category && lesson ? (TUTORIALS_DB[category]?.[lesson] ?? []) : [];

  const handleCategoryChange = (val) => { setCategory(val); setLesson(""); setTutorialId(""); };
  const handleLessonChange = (val) => { setLesson(val); setTutorialId(""); };

  const displayedTutorials = tutorialId
    ? tutorialsInLesson.filter((t) => t.id === tutorialId)
    : tutorialsInLesson;

  const handleEdit = (tutorial) => {
    navigate("/tutorial/edit-form", { state: { tutorial } });
  };

  const selectionComplete = category && lesson;

  return (
    <PageLayout>
      {({ isMobile, isOpen, setOpen }) => (
        <>
          <Header isMobile={isMobile} isOpen={isOpen} setOpen={setOpen} title="Edit Tutorial" />
          <div className={Styles.wrapper}>
            <div className={Styles.pageHeader}>
              <h2>Edit Tutorial</h2>
              <p>Use the selectors below to find the tutorial you want to edit.</p>
            </div>

            <div className={Styles.selectorCard}>
              <div className={Styles.selectorCardTitle}>Find Tutorial</div>
              <div className={Styles.selectorRow}>

                <div className={Styles.selectorStep}>
                  <div className={Styles.selectorStepBadge}>1</div>
                  <div className={Styles.selectorStepBody}>
                    <label className={Styles.selectorLabel}><Layers size={13} /> Category</label>
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

                <div className={`${Styles.selectorStep} ${!category ? Styles.selectorDisabled : ""}`}>
                  <div className={Styles.selectorStepBadge}>2</div>
                  <div className={Styles.selectorStepBody}>
                    <label className={Styles.selectorLabel}><Library size={13} /> Lesson</label>
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

                <div className={`${Styles.selectorStep} ${!lesson ? Styles.selectorDisabled : ""}`}>
                  <div className={Styles.selectorStepBadge}>3</div>
                  <div className={Styles.selectorStepBody}>
                    <label className={Styles.selectorLabel}><BookMarked size={13} /> Tutorial <span className={Styles.optionalTag}>optional</span></label>
                    <SearchableDropdown
                      options={tutorialsInLesson.map((t) => t.title)}
                      value={tutorialsInLesson.find((t) => t.id === tutorialId)?.title || ""}
                      onChange={(title) => {
                        const found = tutorialsInLesson.find((t) => t.title === title);
                        setTutorialId(found ? found.id : "");
                      }}
                      placeholder={lesson ? `All tutorials (${tutorialsInLesson.length})` : "Select lesson first"}
                      searchPlaceholder="Search tutorials…"
                      disabled={!lesson}
                    />
                  </div>
                </div>

              </div>
            </div>

            {selectionComplete ? (
              <div className={Styles.results}>
                <div className={Styles.resultsHeader}>
                  <span className={Styles.resultsCount}>
                    <strong>{displayedTutorials.length}</strong> tutorial{displayedTutorials.length !== 1 ? "s" : ""} in{" "}
                    <em>{category} → {lesson}</em>{tutorialId ? " (filtered)" : ""}
                  </span>
                  {tutorialId && (
                    <button className={Styles.clearFilter} onClick={() => setTutorialId("")}>✕ Clear filter</button>
                  )}
                </div>

                {displayedTutorials.length === 0 ? (
                  <div className={Styles.empty}>
                    <SearchX size={44} strokeWidth={1.5} />
                    <p>No tutorials in this lesson yet.</p>
                    <span>Go to <strong>Add Tutorial</strong> to create one.</span>
                  </div>
                ) : (
                  <div className={Styles.cardGrid}>
                    {displayedTutorials.map((t) => (
                      <TutorialCard key={t.id} tutorial={t} onEdit={handleEdit} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className={Styles.placeholder}>
                <div className={Styles.placeholderIcon}><BookOpen size={52} strokeWidth={1.2} /></div>
                <p>Select a <strong>category</strong> and <strong>lesson</strong> to browse tutorials.</p>
              </div>
            )}
          </div>
        </>
      )}
    </PageLayout>
  );
};

export default EditTutorialPage;