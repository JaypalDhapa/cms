import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/pageLayout/PageLayout";
import Header from "../components/header/Header";
import { CATEGORIES, TUTORIALS_DB } from "../data/tutorialData";
import Styles from "./DeleteTutorial.module.css";
import {
  Layers,
  Library,
  BookMarked,
  ChevronDown,
  Trash2,
  AlertTriangle,
  BookOpen,
  CalendarDays,
} from "lucide-react";

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
                    <div className={Styles.selectWrap}>
                      <select
                        className={Styles.select}
                        value={category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                      >
                        <option value="">Choose a category…</option>
                        {Object.keys(CATEGORIES).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className={Styles.chevron} />
                    </div>
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
                    <div className={Styles.selectWrap}>
                      <select
                        className={Styles.select}
                        value={lesson}
                        onChange={(e) => handleLessonChange(e.target.value)}
                        disabled={!category}
                      >
                        <option value="">
                          {category ? "Choose a lesson…" : "Select category first"}
                        </option>
                        {lessonList.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className={Styles.chevron} />
                    </div>
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
                    <div className={Styles.selectWrap}>
                      <select
                        className={Styles.select}
                        value={tutorialId}
                        onChange={(e) => handleTutorialChange(e.target.value)}
                        disabled={!lesson}
                      >
                        <option value="">
                          {lesson ? "Choose a tutorial…" : "Select lesson first"}
                        </option>
                        {tutorialsInLesson.map((t) => (
                          <option key={t.id} value={t.id}>{t.title}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className={Styles.chevron} />
                    </div>
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
