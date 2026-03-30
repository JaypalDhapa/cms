import { useState, useEffect, useRef, useCallback } from "react";
import Styles from "./TutorialForm.module.css";
import MdxEditor from "../mdxEditor/MdxEditor";
// import { CATEGORIES } from "../../data/tutorialData";

import { useQuery, useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import { GET_COURSES } from "../../graphql/queries/courseQueries";
import { GET_LESSONS_BY_COURSE } from "../../graphql/queries/lessonQueries";
import {
  CREATE_LESSON,
  UPDATE_LESSON,
} from "../../graphql/mutations/lessonMutations";

// ── Searchable Dropdown ────────────────────────────────────────
const SearchableDropdown = ({
  options = [],
  value = "",
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  disabled = false,
  hasError = false,
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

  // Close on outside click
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

  // Focus search input when opened
  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
      setHighlighted(0);
    }
  }, [open]);

  // Scroll highlighted item into view
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
    if (!open) {
      if (e.key === "Enter" || e.key === " ") setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlighted]) select(filtered[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${Styles.sdRoot} ${disabled ? Styles.sdDisabled : ""} ${
        hasError ? Styles.sdError : ""
      }`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger button */}
      <button
        type="button"
        className={Styles.sdTrigger}
        onClick={() => {
          if (!disabled) setOpen((o) => !o);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        <span className={value ? Styles.sdValue : Styles.sdPlaceholder}>
          {value || placeholder}
        </span>
        <svg
          className={`${Styles.sdChevron} ${open ? Styles.sdChevronOpen : ""}`}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path
            d="M2 5l5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className={Styles.sdPanel}>
          {/* Search box */}
          <div className={Styles.sdSearchWrap}>
            <svg
              className={Styles.sdSearchIcon}
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
            >
              <circle
                cx="5.5"
                cy="5.5"
                r="4.5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M9.5 9.5l2.5 2.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
            <input
              ref={searchRef}
              type="text"
              className={Styles.sdSearchInput}
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlighted(0);
              }}
            />
            {query && (
              <button
                className={Styles.sdClear}
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus();
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1 1l8 8M9 1L1 9"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Options list */}
          <ul ref={listRef} className={Styles.sdList} role="listbox">
            {filtered.length > 0 ? (
              filtered.map((opt, i) => (
                <li
                  key={opt}
                  role="option"
                  aria-selected={opt === value}
                  className={`${Styles.sdOption} ${
                    opt === value ? Styles.sdSelected : ""
                  } ${i === highlighted ? Styles.sdHighlighted : ""}`}
                  onMouseEnter={() => setHighlighted(i)}
                  onClick={() => select(opt)}
                >
                  <span>{opt}</span>
                  {opt === value && (
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path
                        d="M2 6.5l3.5 3.5L11 3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
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

// ── Steps ─────────────────────────────────────────────────────
const ALL_STEPS = [
  { id: 1, name: "Meta Data" },
  { id: 2, name: "Content" },
  { id: 3, name: "Category" },
  { id: 4, name: "SEO" },
  { id: 5, name: "Publish" },
];

// Steps visible to editors (no Publish step)
const EDITOR_STEPS = ALL_STEPS.filter((s) => s.id < 5);

// ── Helpers ───────────────────────────────────────────────────
const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const DRAFT_KEY = "cms_tutorial_draft";

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  content: "",
  courseId: "",
  isPublished: false,
  metaTitle: "",
  metaDesc: "",
  keywords: [],
  canonicalUrl: "",
};

// ── Main Component ────────────────────────────────────────────
// Props:
//   initialData  – tutorial object to prefill (edit mode)
//   isEditing    – boolean, true = edit mode
//   isEditor     – boolean, true = role is editor (hides Publish, shows only Save)
const TutorialForm = ({
  initialData = null,
  isEditing = false,
  isEditor = false,
}) => {
  const STEPS = isEditor ? EDITOR_STEPS : ALL_STEPS;
  const maxStep = STEPS[STEPS.length - 1].id;

  const [step, setStep] = useState(() => {
    if (isEditing) return 1; // always start at step 1 when editing
    try {
      return parseInt(sessionStorage.getItem(DRAFT_KEY + "_step") || "1", 10);
    } catch {
      return 1;
    }
  });

  const [form, setForm] = useState(() => {
    if (isEditing && initialData) return { ...emptyForm, ...initialData };
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      return saved ? { ...emptyForm, ...JSON.parse(saved) } : { ...emptyForm };
    } catch {
      return { ...emptyForm };
    }
  });

  const [errors, setErrors] = useState({});
  const [keywords, setKeywords] = useState(() => {
    if (isEditing && initialData) return initialData.keywords || [];
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved).keywords || [] : [];
    } catch {
      return [];
    }
  });
  const [keywordInput, setKeywordInput] = useState("");
  const slugManual = useRef(isEditing); // in edit mode, don't auto-overwrite slug

  const navigate = useNavigate();

  const { data: coursesData, loading: coursesLoading } = useQuery(GET_COURSES, {
    variables: { filters: { isDeleted: false } },
  });
  const courses = coursesData?.courses?.edges?.map((e) => e.node) ?? [];

  const { data: lessonsData, loading: lessonsLoading } = useQuery(
    GET_LESSONS_BY_COURSE,
    {
      variables: { courseId: form.courseId },
      skip: !form.courseId,
    }
  );
  const lessonsInCourse = lessonsData?.lessons?.edges?.map((e) => e.node) ?? [];

  const [createLesson, { loading: creating }] = useMutation(CREATE_LESSON);
  const [updateLesson, { loading: updating }] = useMutation(UPDATE_LESSON);

  const isSaving = creating || updating;

  // Persist to sessionStorage only in create mode
  useEffect(() => {
    if (isEditing) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      sessionStorage.setItem(DRAFT_KEY + "_step", String(step));
    } catch {}
  }, [form, step, isEditing]);

  // Auto-slug from title (create mode only)
  useEffect(() => {
    if (!slugManual.current) {
      setForm((f) => ({ ...f, slug: slugify(f.title) }));
    }
  }, [form.title]);

  // ── Validation ─────────────────────────────────────────────
  const validate = (s) => {
    const errs = {};
    if (s === 1) {
      if (!form.title.trim()) errs.title = "Title is required";
      if (!form.description.trim())
        errs.description = "Description is required";
      if (!form.author.trim()) errs.author = "Author is required";
    }
    if (s === 2) {
      if (!form.content.trim()) errs.content = "Content is required";
    }
    if (s === 3) {
      if (!form.courseId) errs.courseId = "Course is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (!validate(step)) return;
    if (step === 4) setForm((f) => ({ ...f, keywords }));
    setStep((s) => Math.min(s + 1, maxStep));
  };

  const back = () => setStep((s) => Math.max(s - 1, 1));

  const goToStep = (n) => {
    if (step === 4) setForm((f) => ({ ...f, keywords }));
    setStep(n);
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const addKeyword = () => {
    const val = keywordInput.trim().toLowerCase();
    if (val && !keywords.includes(val)) setKeywords((k) => [...k, val]);
    setKeywordInput("");
  };

  const removeKeyword = (kw) => setKeywords((k) => k.filter((x) => x !== kw));

  // ── Submit ─────────────────────────────────────────────────
  const save = async (publishState) => {
    if (!form.title) {
      setStep(1);
      return;
    }

    const selectedCourse = courses.find((c) => c.id === form.courseId);
    if (!selectedCourse) {
      setStep(3);
      return;
    }

    const fullSlug = `${selectedCourse.slug}/${form.slug}`;

    const input = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      fullSlug,
      description: form.description.trim(),
      content: form.content,
      course: {
        id: selectedCourse.id,
        name: selectedCourse.name,
      },
      isPublished: publishState === "published",
      order: 0,
      meta: {
        title: form.metaTitle || form.title,
        description: form.metaDesc || form.description,
        keywords: keywords,
      },
    };

    try {
      if (isEditing && initialData?.id) {
        await updateLesson({ variables: { id: initialData.id, input } });
      } else {
        await createLesson({ variables: { input } });
      }

      try {
        sessionStorage.removeItem(DRAFT_KEY);
        sessionStorage.removeItem(DRAFT_KEY + "_step");
      } catch {}

      navigate("/tutorials");
    } catch (err) {
      console.error("Save failed:", err);
      alert(err.message || "Failed to save. Check console.");
    }
  };

  const progress = ((step - 1) / (maxStep - 1)) * 100;

  return (
    <div className={Styles.wrapper}>
      <div className={Styles.pageHeader}>
        <h2>
          {isEditing
            ? `Editing: ${form.title || "Tutorial"}`
            : "Add New Tutorial"}
        </h2>
        <p>
          {isEditing
            ? isEditor
              ? "You can edit content and save — publish actions are managed by an admin."
              : "Update the details below and publish when ready."
            : "Fill in the details to create a new tutorial."}
        </p>
      </div>

      <div className={Styles.layout}>
        {/* ── Step Sidebar ── */}
        <div className={Styles.stepSidebar}>
          <div className={Styles.stepSidebarTitle}>Steps</div>
          <div className={Styles.stepList}>
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`${Styles.stepItem} ${
                  step === s.id ? Styles.active : ""
                } ${step > s.id ? Styles.completed : ""}`}
                onClick={() => goToStep(s.id)}
              >
                <div className={Styles.stepNum}>
                  {step > s.id ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    s.id
                  )}
                </div>
                <span className={Styles.stepName}>{s.name}</span>
              </div>
            ))}
          </div>
          <div className={Styles.progressBar}>
            <div
              className={Styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Editor badge */}
          {isEditor && (
            <div className={Styles.editorBadge}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Editor Mode
            </div>
          )}
        </div>

        {/* ── Step Forms ── */}
        <div className={Styles.formCard}>
          {/* Step 1 — Meta Data */}
          {step === 1 && (
            <div>
              <div className={Styles.stepHeader}>
                <h3>Meta Data</h3>
                <p>Basic information about your tutorial.</p>
              </div>
              <div className={Styles.formGrid}>
                <div className={`${Styles.formGroup} ${Styles.fullWidth}`}>
                  <label className={Styles.label}>
                    Tutorial Title <span className={Styles.req}>*</span>
                  </label>
                  <input
                    className={`${Styles.input} ${
                      errors.title ? Styles.inputError : ""
                    }`}
                    placeholder="e.g. Getting Started with React Hooks"
                    {...field("title")}
                  />
                  {errors.title && (
                    <span className={Styles.error}>{errors.title}</span>
                  )}
                </div>
                <div className={`${Styles.formGroup} ${Styles.fullWidth}`}>
                  <label className={Styles.label}>Slug</label>
                  <div className={Styles.slugWrap}>
                    <span className={Styles.slugPrefix}>tutorialsite.com/</span>
                    <input
                      className={Styles.input}
                      placeholder="auto-generated-from-title"
                      value={form.slug}
                      onChange={(e) => {
                        slugManual.current = true;
                        setForm((f) => ({ ...f, slug: e.target.value }));
                      }}
                    />
                  </div>
                  <span className={Styles.helpText}>
                    Leave blank to auto-generate from title
                  </span>
                </div>
                <div className={`${Styles.formGroup} ${Styles.fullWidth}`}>
                  <label className={Styles.label}>
                    Short Description <span className={Styles.req}>*</span>
                  </label>
                  <textarea
                    className={`${Styles.textarea} ${
                      errors.description ? Styles.inputError : ""
                    }`}
                    placeholder="Brief description of what this tutorial covers..."
                    {...field("description")}
                  />
                  {errors.description && (
                    <span className={Styles.error}>{errors.description}</span>
                  )}
                </div>
                <div className={Styles.formGroup}>
                  <label className={Styles.label}>
                    Author Name <span className={Styles.req}>*</span>
                  </label>
                  <input
                    className={`${Styles.input} ${
                      errors.author ? Styles.inputError : ""
                    }`}
                    placeholder="Your name"
                    {...field("author")}
                  />
                  {errors.author && (
                    <span className={Styles.error}>{errors.author}</span>
                  )}
                </div>
              </div>
              <StepActions step={1} maxStep={maxStep} onNext={next} />
            </div>
          )}

          {/* Step 2 — Content */}
          {step === 2 && (
            <div>
              <div className={Styles.stepHeader}>
                <h3>Tutorial Content</h3>
                <p>
                  Write MDX content. Type <strong>/</strong> to insert
                  components.
                </p>
              </div>
              <MdxEditor
                value={form.content}
                onChange={(val) => setForm((f) => ({ ...f, content: val }))}
                placeholder="Start writing your tutorial in MDX…"
              />
              {errors.content && (
                <span
                  className={Styles.error}
                  style={{ marginTop: 6, display: "block" }}
                >
                  {errors.content}
                </span>
              )}
              <StepActions
                step={2}
                maxStep={maxStep}
                onBack={back}
                onNext={next}
              />
            </div>
          )}

          {/* Step 3 — Category & Lesson */}
          {step === 3 && (
            <div>
              <div className={Styles.stepHeader}>
                <h3>Course & Status</h3>
                <p>Assign this tutorial to a course.</p>
              </div>
              <div className={Styles.formGrid}>
                <div className={Styles.formGroup}>
                  <label className={Styles.label}>
                    Course <span className={Styles.req}>*</span>
                  </label>
                  <SearchableDropdown
                    options={courses.map((c) => c.name)}
                    value={
                      courses.find((c) => c.id === form.courseId)?.name || ""
                    }
                    onChange={(name) => {
                      const found = courses.find((c) => c.name === name);
                      setForm((f) => ({ ...f, courseId: found?.id || "" }));
                    }}
                    placeholder={
                      coursesLoading ? "Loading courses…" : "Select Course"
                    }
                    searchPlaceholder="Search courses…"
                    hasError={!!errors.courseId}
                  />
                  {errors.courseId && (
                    <span className={Styles.error}>{errors.courseId}</span>
                  )}
                </div>

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
                          onChange={() =>
                            setForm((f) => ({
                              ...f,
                              isPublished: s === "Published",
                            }))
                          }
                        />
                        {s}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <StepActions
                step={3}
                maxStep={maxStep}
                onBack={back}
                onNext={next}
              />
            </div>
          )}

          {/* Step 4 — SEO */}
          {step === 4 && (
            <div>
              <div className={Styles.stepHeader}>
                <h3>SEO Settings</h3>
                <p>Optimize your tutorial for search engines.</p>
              </div>
              <div className={Styles.formGrid}>
                <div className={`${Styles.formGroup} ${Styles.fullWidth}`}>
                  <label className={Styles.label}>Meta Title</label>
                  <input
                    className={Styles.input}
                    placeholder="SEO title (60 chars max)"
                    maxLength={60}
                    {...field("metaTitle")}
                  />
                  <span className={Styles.charCount}>
                    {form.metaTitle.length}/60
                  </span>
                </div>
                <div className={`${Styles.formGroup} ${Styles.fullWidth}`}>
                  <label className={Styles.label}>Meta Description</label>
                  <textarea
                    className={Styles.textarea}
                    placeholder="SEO description (160 chars max)"
                    maxLength={160}
                    {...field("metaDesc")}
                  />
                  <span className={Styles.charCount}>
                    {form.metaDesc.length}/160
                  </span>
                </div>
                <div className={`${Styles.formGroup} ${Styles.fullWidth}`}>
                  <label className={Styles.label}>Keywords</label>
                  <div className={Styles.keywordInputWrap}>
                    <input
                      className={Styles.input}
                      placeholder="Type keyword and press Enter"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addKeyword();
                        }
                      }}
                    />
                    <button
                      className={Styles.btnSecondary}
                      onClick={addKeyword}
                    >
                      Add
                    </button>
                  </div>
                  {keywords.length > 0 && (
                    <div className={Styles.keywordsWrap}>
                      {keywords.map((kw) => (
                        <span key={kw} className={Styles.keywordTag}>
                          {kw}
                          <button
                            className={Styles.keywordDel}
                            onClick={() => removeKeyword(kw)}
                          >
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 10 10"
                              fill="none"
                            >
                              <path
                                d="M1 1l8 8M9 1L1 9"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className={`${Styles.formGroup} ${Styles.fullWidth}`}>
                  <label className={Styles.label}>Canonical URL</label>
                  <input
                    className={Styles.input}
                    placeholder="https://yoursite.com/tutorials/slug"
                    {...field("canonicalUrl")}
                  />
                </div>
              </div>
              <div className={Styles.seoPreview}>
                <div className={Styles.seoLabel}>Search Preview</div>
                <div className={Styles.seoUrl}>
                  tutorialsite.com › tutorials › {form.slug || "your-slug"}
                </div>
                <div className={Styles.seoTitle}>
                  {form.metaTitle || form.title || "Your Tutorial Title"} —
                  TutorialCMS
                </div>
                <div className={Styles.seoDesc}>
                  {form.metaDesc ||
                    form.description ||
                    "Your meta description will appear here."}
                </div>
              </div>

              {/* Editor mode: show save actions directly on step 4 instead of going to step 5 */}
              {isEditor ? (
                <div className={Styles.stepActions}>
                  <button className={Styles.btnGhost} onClick={back}>
                    ← Back
                  </button>
                  <div className={Styles.actionsRight}>
                    <button
                      className={Styles.btnSecondary}
                      onClick={() => save("Draft")}
                    >
                      <SaveIcon /> Save as Draft
                    </button>
                    <button
                      className={Styles.btnPrimary}
                      onClick={() => save(form.status || "Draft")}
                    >
                      <SaveIcon /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <StepActions
                  step={4}
                  maxStep={maxStep}
                  onBack={back}
                  onNext={next}
                />
              )}
            </div>
          )}

          {/* Step 5 — Preview & Publish (admin only) */}
          {step === 5 && !isEditor && (
            <div>
              <div className={Styles.stepHeader}>
                <h3>Preview & {isEditing ? "Update" : "Publish"}</h3>
                <p>
                  Review your tutorial before{" "}
                  {isEditing ? "updating" : "publishing"}.
                </p>
              </div>
              <div className={Styles.previewCard}>
                <div className={Styles.previewThumb}>📖</div>
                <div className={Styles.previewBody}>
                  <div className={Styles.previewMeta}>
                    <span className={Styles.previewCategory}>
                      {form.category || "Uncategorized"}
                    </span>
                    <span className={Styles.previewLesson}>{form.lesson}</span>
                  </div>
                  <div className={Styles.previewTitle}>
                    {form.title || "Untitled Tutorial"}
                  </div>
                  <div className={Styles.previewDesc}>{form.description}</div>
                  {form.content && (
                    <div
                      className={Styles.previewContent}
                      dangerouslySetInnerHTML={{ __html: form.content }}
                    />
                  )}
                </div>
              </div>
              <div className={Styles.stepActions}>
                <button className={Styles.btnGhost} onClick={back}>
                  ← Back
                </button>
                <div className={Styles.actionsRight}>
                  <button
                    className={Styles.btnSecondary}
                    onClick={() => save("draft")}
                    disabled={isSaving}
                  >
                    <SaveIcon /> {isSaving ? "Saving…" : "Save Draft"}
                  </button>
                  {isEditing ? (
                    <button
                      className={Styles.btnSuccess}
                      onClick={() => save("published")}
                      disabled={isSaving}
                    >
                      <CheckIcon /> {isSaving ? "Saving…" : "Update Tutorial"}
                    </button>
                  ) : (
                    <button
                      className={Styles.btnSuccess}
                      onClick={() => save("published")}
                      disabled={isSaving}
                    >
                      <CheckIcon /> {isSaving ? "Saving…" : "Publish Tutorial"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Step Actions Bar ───────────────────────────────────────────
const StepActions = ({ step, maxStep, onBack, onNext }) => (
  <div className={Styles.stepActions}>
    <button
      className={Styles.btnGhost}
      onClick={onBack}
      style={{ visibility: step === 1 ? "hidden" : "visible" }}
    >
      ← Back
    </button>
    {step < maxStep && (
      <button className={Styles.btnPrimary} onClick={onNext}>
        Continue →
      </button>
    )}
  </div>
);

const SaveIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
    <path
      d="M13 9v4H3V9M8 1v8M5 6l3 3 3-3"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
    <path
      d="M2 8l4.5 4.5L14 3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default TutorialForm;
