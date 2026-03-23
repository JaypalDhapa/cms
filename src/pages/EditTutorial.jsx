import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/pageLayout/PageLayout";
import Header from "../components/header/Header";
import { CATEGORIES, TUTORIALS_DB } from "../data/tutorialData";
import Styles from "./EditTutorial.module.css";
import {
  BookOpen,
  Pencil,
  CalendarDays,
  ChevronDown,
  SearchX,
  Layers,
  Library,
  BookMarked,
} from "lucide-react";

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
                    <div className={Styles.selectWrap}>
                      <select className={Styles.select} value={category} onChange={(e) => handleCategoryChange(e.target.value)}>
                        <option value="">Choose a category…</option>
                        {Object.keys(CATEGORIES).map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={14} className={Styles.chevron} />
                    </div>
                  </div>
                </div>

                <div className={Styles.selectorArrow}>→</div>

                <div className={`${Styles.selectorStep} ${!category ? Styles.selectorDisabled : ""}`}>
                  <div className={Styles.selectorStepBadge}>2</div>
                  <div className={Styles.selectorStepBody}>
                    <label className={Styles.selectorLabel}><Library size={13} /> Lesson</label>
                    <div className={Styles.selectWrap}>
                      <select className={Styles.select} value={lesson} onChange={(e) => handleLessonChange(e.target.value)} disabled={!category}>
                        <option value="">{category ? "Choose a lesson…" : "Select category first"}</option>
                        {lessonList.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <ChevronDown size={14} className={Styles.chevron} />
                    </div>
                  </div>
                </div>

                <div className={Styles.selectorArrow}>→</div>

                <div className={`${Styles.selectorStep} ${!lesson ? Styles.selectorDisabled : ""}`}>
                  <div className={Styles.selectorStepBadge}>3</div>
                  <div className={Styles.selectorStepBody}>
                    <label className={Styles.selectorLabel}><BookMarked size={13} /> Tutorial <span className={Styles.optionalTag}>optional</span></label>
                    <div className={Styles.selectWrap}>
                      <select className={Styles.select} value={tutorialId} onChange={(e) => setTutorialId(e.target.value)} disabled={!lesson}>
                        <option value="">{lesson ? `All tutorials (${tutorialsInLesson.length})` : "Select lesson first"}</option>
                        {tutorialsInLesson.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
                      </select>
                      <ChevronDown size={14} className={Styles.chevron} />
                    </div>
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
