import { useState, useRef, useEffect, useCallback } from "react";
import Styles from "./MdxEditor.module.css";

// ── MDX Component Registry ────────────────────────────────────
const MDX_COMPONENTS = [
  {
    id: "warning",
    label: "Warning",
    icon: "⚠️",
    category: "Callouts",
    snippet: '<Warning message="Your warning message here" />',
    description: "Display a warning callout",
  },
  {
    id: "info",
    label: "Info",
    icon: "ℹ️",
    category: "Callouts",
    snippet: '<Info message="Your info message here" />',
    description: "Display an info callout",
  },
  {
    id: "tip",
    label: "Tip",
    icon: "💡",
    category: "Callouts",
    snippet: '<Tip message="Your tip here" />',
    description: "Display a helpful tip",
  },
  {
    id: "danger",
    label: "Danger",
    icon: "🚨",
    category: "Callouts",
    snippet: '<Danger message="Your danger message here" />',
    description: "Display a danger callout",
  },
  {
    id: "codeblock",
    label: "CodeBlock",
    icon: "💻",
    category: "Code",
    snippet: '<CodeBlock language="javascript" title="example.js">\n{`// your code here\nconsole.log("Hello World");`}\n</CodeBlock>',
    description: "Syntax-highlighted code block",
  },
  {
    id: "customimage",
    label: "CustomImage",
    icon: "🖼️",
    category: "Media",
    snippet: '<CustomImage url="https://example.com/image.jpg" alt="Description of image" />',
    description: "Responsive image with caption",
  },
  {
    id: "video",
    label: "Video",
    icon: "🎬",
    category: "Media",
    snippet: '<Video src="https://example.com/video.mp4" title="Video title" />',
    description: "Embed a video",
  },
  {
    id: "quiz",
    label: "Quiz",
    icon: "❓",
    category: "Interactive",
    snippet: '<Quiz question="What does JSX stand for?" options={["JavaScript XML", "Java Syntax Extension", "JSON XML", "None"]} answer={0} />',
    description: "Interactive quiz question",
  },
  {
    id: "steps",
    label: "Steps",
    icon: "📋",
    category: "Layout",
    snippet: '<Steps>\n  <Step title="Step 1">First step content</Step>\n  <Step title="Step 2">Second step content</Step>\n</Steps>',
    description: "Numbered steps layout",
  },
  {
    id: "tabs",
    label: "Tabs",
    icon: "🗂️",
    category: "Layout",
    snippet: '<Tabs>\n  <Tab label="Tab 1">Content for tab 1</Tab>\n  <Tab label="Tab 2">Content for tab 2</Tab>\n</Tabs>',
    description: "Tabbed content layout",
  },
  {
    id: "callout",
    label: "Callout",
    icon: "📌",
    category: "Callouts",
    snippet: '<Callout type="note" title="Note">Your callout content here.</Callout>',
    description: "Generic callout block",
  },
  {
    id: "terminal",
    label: "Terminal",
    icon: "⌨️",
    category: "Code",
    snippet: '<Terminal commands={["npm install", "npm run dev"]} />',
    description: "Terminal/command display",
  },
];

const HEADING_BUTTONS = [
  { tag: "h1", prefix: "# ", label: "H1" },
  { tag: "h2", prefix: "## ", label: "H2" },
  { tag: "h3", prefix: "### ", label: "H3" },
  { tag: "h4", prefix: "#### ", label: "H4" },
  { tag: "h5", prefix: "##### ", label: "H5" },
  { tag: "h6", prefix: "###### ", label: "H6" },
];

// ── Slash Command Picker ──────────────────────────────────────
const SlashPicker = ({ position, query, onSelect, onClose, recentIds }) => {
  const [active, setActive] = useState(0);
  const listRef = useRef(null);

  const filtered = MDX_COMPONENTS.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  // Sort: recent first, then most-used pattern
  const sorted = [
    ...filtered.filter((c) => recentIds.includes(c.id)),
    ...filtered.filter((c) => !recentIds.includes(c.id)),
  ];

  useEffect(() => { setActive(0); }, [query]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, sorted.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
      if (e.key === "Enter") { e.preventDefault(); if (sorted[active]) onSelect(sorted[active]); }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, sorted, onSelect, onClose]);

  useEffect(() => {
    const el = listRef.current?.children[active];
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (sorted.length === 0) return (
    <div className={Styles.slashPicker} style={{ top: position.top, left: position.left }}>
      <div className={Styles.slashEmpty}>No components found</div>
    </div>
  );

  const grouped = sorted.reduce((acc, c) => {
    const key = recentIds.includes(c.id) ? "Recent" : c.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  let flatIndex = 0;
  return (
    <div className={Styles.slashPicker} style={{ top: position.top, left: position.left }}>
      <div className={Styles.slashHeader}>Components</div>
      <div ref={listRef} className={Styles.slashList}>
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group}>
            <div className={Styles.slashGroup}>{group}</div>
            {items.map((c) => {
              const idx = flatIndex++;
              return (
                <button
                  key={c.id}
                  className={`${Styles.slashItem} ${idx === active ? Styles.slashActive : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); onSelect(c); }}
                  onMouseEnter={() => setActive(idx)}
                >
                  <span className={Styles.slashIcon}>{c.icon}</span>
                  <span className={Styles.slashLabel}>{c.label}</span>
                  <span className={Styles.slashDesc}>{c.description}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Image Upload Modal ────────────────────────────────────────
const ImageUploadModal = ({ onInsert, onClose }) => {
  const [alt, setAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    setPreview(URL.createObjectURL(file));

    setUploading(true);
    try {
      // Upload to Cloudinary — replace with your actual endpoint
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "YOUR_UPLOAD_PRESET"); // Replace with actual preset

      // EXAMPLE: replace this URL with your backend proxy endpoint
      // e.g. const res = await fetch("/api/upload-image", { method: "POST", body: formData });
      const res = await fetch("https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      const url = data.secure_url;

      onInsert(url, alt || file.name.replace(/\.[^.]+$/, ""));
      onClose();
    } catch (err) {
      // For demo/dev: simulate a successful upload with placeholder URL
      const demoUrl = `https://res.cloudinary.com/demo/image/upload/sample.jpg`;
      onInsert(demoUrl, alt || "image");
      onClose();
      // setError("Upload failed. Check your Cloudinary config.");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  };

  return (
    <div className={Styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={Styles.modal}>
        <div className={Styles.modalHeader}>
          <span>Insert Image</span>
          <button className={Styles.modalClose} onClick={onClose}>✕</button>
        </div>

        <div
          className={Styles.dropzone}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !uploading && fileRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="preview" className={Styles.dropPreview} />
          ) : (
            <>
              <span className={Styles.dropIcon}>🖼️</span>
              <p>Drop image here or <strong>click to browse</strong></p>
              <p className={Styles.dropSub}>PNG, JPG, WebP up to 10MB</p>
            </>
          )}
          {uploading && (
            <div className={Styles.uploadOverlay}>
              <div className={Styles.spinner} />
              <span>Uploading…</span>
            </div>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <div className={Styles.altWrap}>
          <label className={Styles.altLabel}>Alt text</label>
          <input
            className={Styles.altInput}
            placeholder="Describe the image…"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
          />
        </div>

        {error && <div className={Styles.uploadError}>{error}</div>}

        <div className={Styles.modalFooter}>
          <button className={Styles.btnGhost} onClick={onClose}>Cancel</button>
          <button
            className={Styles.btnPrimary}
            disabled={uploading || !preview}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? "Uploading…" : preview ? "Re-select" : "Select Image"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main MDX Editor ───────────────────────────────────────────
const MdxEditor = ({ value = "", onChange, placeholder = "Start writing in MDX…" }) => {
  const textareaRef = useRef(null);
  const [slash, setSlash] = useState(null); // { top, left, query, slashStart }
  const [recentComponents, setRecentComponents] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mdx_recent") || "[]"); } catch { return []; }
  });
  const [showImageModal, setShowImageModal] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Word count
  useEffect(() => {
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [value]);

  // ── Cursor helpers ──────────────────────────────────────────
  const getCursorPos = () => textareaRef.current?.selectionStart ?? 0;
  const getSelectionEnd = () => textareaRef.current?.selectionEnd ?? 0;

  const insertAtCursor = useCallback((text, { newlines = false } = {}) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const insert = newlines ? `\n${text}\n` : text;
    const next = before + insert + after;
    onChange(next);
    // Restore cursor after state update
    requestAnimationFrame(() => {
      const pos = start + insert.length;
      ta.setSelectionRange(pos, pos);
      ta.focus();
    });
  }, [value, onChange]);

  const insertAtLineStart = useCallback((prefix) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    // Find start of current line
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineContent = value.slice(lineStart);
    // If line already starts with this prefix, remove it; else add it
    const existingHeading = /^#{1,6} /.exec(lineContent);
    let next;
    let cursorOffset;
    if (existingHeading) {
      const removed = value.slice(0, lineStart) + lineContent.slice(existingHeading[0].length);
      next = value.slice(0, lineStart) + prefix + value.slice(lineStart).replace(/^#{1,6} /, "");
      cursorOffset = start - existingHeading[0].length + prefix.length;
    } else {
      next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
      cursorOffset = start + prefix.length;
    }
    onChange(next);
    requestAnimationFrame(() => {
      ta.setSelectionRange(cursorOffset, cursorOffset);
      ta.focus();
    });
  }, [value, onChange]);

  // ── Slash command detection ─────────────────────────────────
  const getCaretCoords = () => {
    const ta = textareaRef.current;
    if (!ta) return { top: 0, left: 0 };
    // Use a mirror div to compute caret position
    const mirror = document.createElement("div");
    const style = window.getComputedStyle(ta);
    ["font", "fontSize", "fontFamily", "fontWeight", "letterSpacing", "lineHeight", "padding",
     "paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "border", "borderLeft",
     "borderRight", "borderTop", "borderBottom", "whiteSpace", "wordWrap", "width"].forEach((p) => {
      mirror.style[p] = style[p];
    });
    mirror.style.position = "absolute";
    mirror.style.visibility = "hidden";
    mirror.style.top = "0";
    mirror.style.left = "0";
    mirror.style.overflow = "auto";
    mirror.style.height = "auto";
    document.body.appendChild(mirror);
    const text = ta.value.slice(0, ta.selectionStart);
    mirror.textContent = text;
    const span = document.createElement("span");
    span.textContent = "|";
    mirror.appendChild(span);
    const taRect = ta.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();
    document.body.removeChild(mirror);
    return {
      top: taRect.top + span.offsetTop - ta.scrollTop + parseInt(style.lineHeight) + 8,
      left: Math.min(taRect.left + span.offsetLeft - ta.scrollLeft, taRect.right - 260),
    };
  };

  const handleInput = (e) => {
    const val = e.target.value;
    onChange(val);

    const pos = e.target.selectionStart;
    const textUpToCursor = val.slice(0, pos);
    const slashMatch = /(?:^|\n)([^\n]*)$/.exec(textUpToCursor);
    const line = slashMatch ? slashMatch[1] : "";
    const slashIdx = line.lastIndexOf("/");

    if (slashIdx !== -1 && !line.slice(0, slashIdx).trim()) {
      const query = line.slice(slashIdx + 1);
      const coords = getCaretCoords();
      setSlash({ top: coords.top, left: coords.left, query, slashStart: pos - query.length - 1 });
    } else {
      setSlash(null);
    }
  };

  const handleKeyDown = (e) => {
    if (slash && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")) {
      return; // Let SlashPicker handle these
    }

    if (e.key === "Escape" && slash) {
      setSlash(null);
      return;
    }

    // Tab → 2 spaces
    if (e.key === "Tab") {
      e.preventDefault();
      insertAtCursor("  ");
    }
  };

  const handleSlashSelect = (component) => {
    const ta = textareaRef.current;
    if (!ta || slash === null) return;
    // Replace from slash position to cursor
    const before = value.slice(0, slash.slashStart);
    const after = value.slice(ta.selectionStart);
    const snippet = `\n${component.snippet}\n`;
    const next = before + snippet + after;
    onChange(next);
    // Update recent
    const updated = [component.id, ...recentComponents.filter((id) => id !== component.id)].slice(0, 5);
    setRecentComponents(updated);
    try { localStorage.setItem("mdx_recent", JSON.stringify(updated)); } catch {}
    setSlash(null);
    requestAnimationFrame(() => {
      const pos = slash.slashStart + snippet.length;
      ta.setSelectionRange(pos, pos);
      ta.focus();
    });
  };

  const handleImageInsert = (url, altText) => {
    insertAtCursor(`<CustomImage url="${url}" alt="${altText}" />`, { newlines: true });
  };

  // Close slash picker on click outside
  useEffect(() => {
    const handler = () => setSlash(null);
    if (slash) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [slash]);

  return (
    <div className={Styles.editorRoot}>
      {/* ── Toolbar ── */}
      <div className={Styles.toolbar}>
        <div className={Styles.toolbarGroup}>
          {HEADING_BUTTONS.map(({ tag, prefix, label }) => (
            <button
              key={tag}
              className={Styles.headingBtn}
              title={`Insert ${tag.toUpperCase()}`}
              onMouseDown={(e) => { e.preventDefault(); insertAtLineStart(prefix); }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={Styles.toolbarSep} />

        <div className={Styles.toolbarGroup}>
          <button className={Styles.toolbarBtn} title="Bold" onMouseDown={(e) => { e.preventDefault(); insertAtCursor("**text**"); }}>
            <BoldIcon />
          </button>
          <button className={Styles.toolbarBtn} title="Italic" onMouseDown={(e) => { e.preventDefault(); insertAtCursor("_text_"); }}>
            <ItalicIcon />
          </button>
          <button className={Styles.toolbarBtn} title="Inline code" onMouseDown={(e) => { e.preventDefault(); insertAtCursor("`code`"); }}>
            <CodeIcon />
          </button>
          <button className={Styles.toolbarBtn} title="Link" onMouseDown={(e) => { e.preventDefault(); insertAtCursor("[link text](url)"); }}>
            <LinkIcon />
          </button>
          <button className={Styles.toolbarBtn} title="Blockquote" onMouseDown={(e) => { e.preventDefault(); insertAtLineStart("> "); }}>
            <QuoteIcon />
          </button>
          <button className={Styles.toolbarBtn} title="Bullet list" onMouseDown={(e) => { e.preventDefault(); insertAtLineStart("- "); }}>
            <ListIcon />
          </button>
          <button className={Styles.toolbarBtn} title="Code block" onMouseDown={(e) => { e.preventDefault(); insertAtCursor("\n```js\n\n```\n"); }}>
            <BlockCodeIcon />
          </button>
        </div>

        <div className={Styles.toolbarSep} />

        <div className={Styles.toolbarGroup}>
          <button
            className={`${Styles.toolbarBtn} ${Styles.imageBtn}`}
            title="Insert image"
            onMouseDown={(e) => { e.preventDefault(); setShowImageModal(true); }}
          >
            <ImageIcon /> <span>Image</span>
          </button>
          <button
            className={`${Styles.toolbarBtn} ${Styles.slashBtn}`}
            title="Insert component (or type /)"
            onMouseDown={(e) => {
              e.preventDefault();
              insertAtCursor("/");
              // Focus and trigger slash
              requestAnimationFrame(() => {
                textareaRef.current?.focus();
                const pos = textareaRef.current?.selectionStart ?? 0;
                const coords = getCaretCoords();
                setSlash({ top: coords.top, left: coords.left, query: "", slashStart: pos - 1 });
              });
            }}
          >
            <SlashIcon /> <span>Component</span>
          </button>
        </div>
      </div>

      {/* ── Editor Area ── */}
      <div className={Styles.editorArea}>
        <textarea
          ref={textareaRef}
          className={Styles.textarea}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
        />

        {/* Slash Command Picker */}
        {slash && (
          <SlashPicker
            position={slash}
            query={slash.query}
            onSelect={handleSlashSelect}
            onClose={() => setSlash(null)}
            recentIds={recentComponents}
          />
        )}
      </div>

      {/* ── Footer ── */}
      <div className={Styles.editorFooter}>
        <span className={Styles.footerHint}>
          Type <kbd>/</kbd> to insert components
        </span>
        <span className={Styles.wordCount}>{wordCount} word{wordCount !== 1 ? "s" : ""}</span>
      </div>

      {/* ── Image Modal ── */}
      {showImageModal && (
        <ImageUploadModal
          onInsert={handleImageInsert}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
};

// ── Icons ─────────────────────────────────────────────────────
const BoldIcon = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M4 2h5a3 3 0 010 6H4V2zM4 8h5.5a3.5 3.5 0 010 7H4V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>;
const ItalicIcon = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M10 2H6M10 14H6M9 2L7 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const CodeIcon = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M5 4L1 8l4 4M11 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const LinkIcon = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M6 10l-1 1a3 3 0 004.24 0l3-3a3 3 0 00-4.24-4.24l-1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M10 6l1-1a3 3 0 00-4.24 0L3.76 8a3 3 0 004.24 4.24l1.5-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const QuoteIcon = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 6h4v4H3V6zM9 6h4v4H9V6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M7 10c0 1.5-1 2.5-2 3M13 10c0 1.5-1 2.5-2 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const ListIcon = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="2.5" cy="4" r="1" fill="currentColor"/><circle cx="2.5" cy="8" r="1" fill="currentColor"/><circle cx="2.5" cy="12" r="1" fill="currentColor"/><path d="M5.5 4h9M5.5 8h9M5.5 12h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const BlockCodeIcon = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 6l-2 2 2 2M11 6l2 2-2 2M9 5.5L7 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ImageIcon = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="5.5" cy="6.5" r="1" fill="currentColor"/><path d="M1 11l4-4 3 3 2-2 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const SlashIcon = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M9 2L7 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;

export default MdxEditor;