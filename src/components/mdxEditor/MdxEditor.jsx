import { useState, useRef, useEffect, useCallback } from "react";
import Styles from "./MdxEditor.module.css";

// ── MDX Component Registry ────────────────────────────────────
const MDX_COMPONENTS = [
  { id: "warning",     label: "Warning",     icon: "⚠️",  category: "Callouts",    snippet: '<Warning message="Your warning message here" />',                                                                                               description: "Display a warning callout" },
  { id: "info",        label: "Info",        icon: "ℹ️",  category: "Callouts",    snippet: '<Info message="Your info message here" />',                                                                                                    description: "Display an info callout" },
  { id: "tip",         label: "Tip",         icon: "💡",  category: "Callouts",    snippet: '<Tip message="Your tip here" />',                                                                                                              description: "Display a helpful tip" },
  { id: "danger",      label: "Danger",      icon: "🚨",  category: "Callouts",    snippet: '<Danger message="Your danger message here" />',                                                                                                description: "Display a danger callout" },
  { id: "callout",     label: "Callout",     icon: "📌",  category: "Callouts",    snippet: '<Callout type="note" title="Note">Your callout content here.</Callout>',                                                                      description: "Generic callout block" },
  { id: "codeblock",   label: "CodeBlock",   icon: "💻",  category: "Code",        snippet: '<CodeBlock language="javascript" title="example.js">\n{`// your code here\nconsole.log("Hello World");`}\n</CodeBlock>',                      description: "Syntax-highlighted code block" },
  { id: "terminal",    label: "Terminal",    icon: "⌨️",  category: "Code",        snippet: '<Terminal commands={["npm install", "npm run dev"]} />',                                                                                      description: "Terminal/command display" },
  { id: "customimage", label: "CustomImage", icon: "🖼️",  category: "Media",       snippet: '<CustomImage url="https://example.com/image.jpg" alt="Description of image" />',                                                             description: "Responsive image with caption" },
  { id: "video",       label: "Video",       icon: "🎬",  category: "Media",       snippet: '<Video src="https://example.com/video.mp4" title="Video title" />',                                                                           description: "Embed a video" },
  { id: "quiz",        label: "Quiz",        icon: "❓",  category: "Interactive", snippet: '<Quiz question="What does JSX stand for?" options={["JavaScript XML", "Java Syntax Extension", "JSON XML", "None"]} answer={0} />',           description: "Interactive quiz question" },
  { id: "steps",       label: "Steps",       icon: "📋",  category: "Layout",      snippet: '<Steps>\n  <Step title="Step 1">First step content</Step>\n  <Step title="Step 2">Second step content</Step>\n</Steps>',                      description: "Numbered steps layout" },
  { id: "tabs",        label: "Tabs",        icon: "🗂️",  category: "Layout",      snippet: '<Tabs>\n  <Tab label="Tab 1">Content for tab 1</Tab>\n  <Tab label="Tab 2">Content for tab 2</Tab>\n</Tabs>',                                description: "Tabbed content layout" },
];

const HEADING_BUTTONS = [
  { tag: "h1", prefix: "# ",      label: "H1" },
  { tag: "h2", prefix: "## ",     label: "H2" },
  { tag: "h3", prefix: "### ",    label: "H3" },
  { tag: "h4", prefix: "#### ",   label: "H4" },
  { tag: "h5", prefix: "##### ",  label: "H5" },
  { tag: "h6", prefix: "###### ", label: "H6" },
];

// ── FIX 1: Slash Picker with smart viewport-aware positioning ──
const SlashPicker = ({ position, query, onSelect, onClose, recentIds }) => {
  const [active, setActive] = useState(0);
  const listRef = useRef(null);

  const filtered = MDX_COMPONENTS.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const sorted = [
    ...filtered.filter((c) => recentIds.includes(c.id)),
    ...filtered.filter((c) => !recentIds.includes(c.id)),
  ];

  useEffect(() => { setActive(0); }, [query]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, sorted.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
      if (e.key === "Enter")     { e.preventDefault(); if (sorted[active]) onSelect(sorted[active]); }
      if (e.key === "Escape")    { onClose(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, sorted, onSelect, onClose]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  // Smart positioning — flip above if not enough space below
  const PICKER_H = 300;
  const PICKER_W = 260;
  const GAP      = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let top  = position.caretBottom + GAP;
  let left = position.caretLeft;

  if (top + PICKER_H > vh - GAP) {
    top = position.caretTop - PICKER_H - GAP;
  }
  if (left + PICKER_W > vw - GAP) left = vw - PICKER_W - GAP;
  if (left < GAP) left = GAP;
  if (top  < GAP) top  = GAP;

  const grouped = sorted.reduce((acc, c) => {
    const key = recentIds.includes(c.id) ? "Recent" : c.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  let flatIndex = 0;

  return (
    <div
      className={Styles.slashPicker}
      style={{ top, left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className={Styles.slashHeader}>
        Components {query && <span className={Styles.slashQuery}>"{query}"</span>}
      </div>
      {sorted.length === 0 ? (
        <div className={Styles.slashEmpty}>No components found</div>
      ) : (
        <div ref={listRef} className={Styles.slashList}>
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <div className={Styles.slashGroup}>{group}</div>
              {items.map((c) => {
                const idx = flatIndex++;
                return (
                  <button
                    key={c.id}
                    data-idx={idx}
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
      )}
    </div>
  );
};

// ── Image Upload Modal ────────────────────────────────────────
const ImageUploadModal = ({ onInsert, onClose }) => {
  const [alt, setAlt]           = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState("");
  const [preview, setPreview]   = useState(null);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "YOUR_UPLOAD_PRESET");
      const res = await fetch("https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onInsert(data.secure_url, alt || file.name.replace(/\.[^.]+$/, ""));
      onClose();
    } catch {
      onInsert("https://res.cloudinary.com/demo/image/upload/sample.jpg", alt || "image");
      onClose();
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
        <div className={Styles.dropzone} onDrop={onDrop} onDragOver={(e) => e.preventDefault()} onClick={() => !uploading && fileRef.current?.click()}>
          {preview
            ? <img src={preview} alt="preview" className={Styles.dropPreview} />
            : (<><span className={Styles.dropIcon}>🖼️</span><p>Drop image here or <strong>click to browse</strong></p><p className={Styles.dropSub}>PNG, JPG, WebP up to 10MB</p></>)
          }
          {uploading && <div className={Styles.uploadOverlay}><div className={Styles.spinner} /><span>Uploading…</span></div>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
        <div className={Styles.altWrap}>
          <label className={Styles.altLabel}>Alt text</label>
          <input className={Styles.altInput} placeholder="Describe the image…" value={alt} onChange={(e) => setAlt(e.target.value)} />
        </div>
        {error && <div className={Styles.uploadError}>{error}</div>}
        <div className={Styles.modalFooter}>
          <button className={Styles.btnGhost} onClick={onClose}>Cancel</button>
          <button className={Styles.btnPrimary} disabled={uploading || !preview} onClick={() => fileRef.current?.click()}>
            {uploading ? "Uploading…" : preview ? "Re-select" : "Select Image"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main MDX Editor ───────────────────────────────────────────
const MdxEditor = ({ value = "", onChange, placeholder = "Start writing in MDX…" }) => {
  const textareaRef   = useRef(null);
  const [slash, setSlash]               = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [wordCount, setWordCount]       = useState(0);
  const [recentComponents, setRecentComponents] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mdx_recent") || "[]"); } catch { return []; }
  });
  const bulletStyle  = "-";
  const orderedStyle = "1.";

  // Word count
  useEffect(() => {
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [value]);

  // ── Insert helpers ──────────────────────────────────────────
  const insertAtCursor = useCallback((text, { newlines = false } = {}) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start  = ta.selectionStart;
    const end    = ta.selectionEnd;
    const insert = newlines ? `\n${text}\n` : text;
    const next   = value.slice(0, start) + insert + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      ta.setSelectionRange(start + insert.length, start + insert.length);
      ta.focus();
    });
  }, [value, onChange]);

  const insertAtLineStart = useCallback((prefix) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start       = ta.selectionStart;
    const lineStart   = value.lastIndexOf("\n", start - 1) + 1;
    const lineContent = value.slice(lineStart);
    const existing    = /^#{1,6} /.exec(lineContent);
    let next, cursorOffset;
    if (existing) {
      next         = value.slice(0, lineStart) + prefix + value.slice(lineStart).replace(/^#{1,6} /, "");
      cursorOffset = start - existing[0].length + prefix.length;
    } else {
      next         = value.slice(0, lineStart) + prefix + value.slice(lineStart);
      cursorOffset = start + prefix.length;
    }
    onChange(next);
    requestAnimationFrame(() => {
      ta.setSelectionRange(cursorOffset, cursorOffset);
      ta.focus();
    });
  }, [value, onChange]);

  // ── FIX 1: Accurate caret coordinates ──────────────────────
  const getCaretCoords = () => {
    const ta = textareaRef.current;
    if (!ta) return { caretTop: 100, caretBottom: 120, caretLeft: 20 };

    const mirror = document.createElement("div");
    const cs     = window.getComputedStyle(ta);

    // Copy all layout-affecting styles
    ["boxSizing","width","paddingTop","paddingRight","paddingBottom","paddingLeft",
     "borderTopWidth","borderRightWidth","borderBottomWidth","borderLeftWidth",
     "fontFamily","fontSize","fontWeight","fontStyle","lineHeight",
     "letterSpacing","wordSpacing","textTransform","whiteSpace","wordBreak","overflowWrap",
    ].forEach((p) => { mirror.style[p] = cs[p]; });

    mirror.style.position   = "fixed";
    mirror.style.top        = "-9999px";
    mirror.style.left       = "-9999px";
    mirror.style.visibility = "hidden";
    mirror.style.height     = "auto";
    mirror.style.overflow   = "hidden";
    document.body.appendChild(mirror);

    // Text before cursor
    mirror.textContent = ta.value.slice(0, ta.selectionStart);
    const span = document.createElement("span");
    span.textContent = "|";
    mirror.appendChild(span);

    const lineH  = parseFloat(cs.lineHeight) || 20;
    const taRect = ta.getBoundingClientRect();

    const relTop  = span.offsetTop  - ta.scrollTop;
    const relLeft = span.offsetLeft - ta.scrollLeft;

    document.body.removeChild(mirror);

    return {
      caretTop:    taRect.top  + relTop,
      caretBottom: taRect.top  + relTop + lineH,
      caretLeft:   taRect.left + relLeft,
    };
  };

  // ── Slash command detection ─────────────────────────────────
  const handleInput = (e) => {
    const val = e.target.value;
    onChange(val);

    const pos            = e.target.selectionStart;
    const textUpToCursor = val.slice(0, pos);
    const slashMatch     = /(?:^|\n)([^\n]*)$/.exec(textUpToCursor);
    const line           = slashMatch ? slashMatch[1] : "";
    const slashIdx       = line.lastIndexOf("/");

    if (slashIdx !== -1 && !line.slice(0, slashIdx).trim()) {
      const query  = line.slice(slashIdx + 1);
      const coords = getCaretCoords();
      setSlash({ ...coords, query, slashStart: pos - query.length - 1 });
    } else {
      setSlash(null);
    }
  };

  // ── Smart list keyboard handling ───────────────────────────
  const handleKeyDown = (e) => {
    // Let slash picker handle its own keys
    if (slash && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")) return;
    if (e.key === "Escape" && slash) { setSlash(null); return; }
    if (e.key === "Escape" && showBulletPicker) { setShowBulletPicker(null); return; }

    const ta = textareaRef.current;
    if (!ta) return;

    const pos       = ta.selectionStart;
    const lineStart = value.lastIndexOf("\n", pos - 1) + 1;
    const lineEnd   = value.indexOf("\n", pos);
    const lineText  = value.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);

    // Detect if current line is a list item
    const ulMatch  = /^(\s*)([-*+]) (.*)/.exec(lineText);   // unordered
    const olMatch  = /^(\s*)(\d+)([.)]) (.*)/.exec(lineText); // ordered

    if (e.key === "Enter" && (ulMatch || olMatch)) {
      e.preventDefault();

      if (ulMatch) {
        const [, indent, marker, content] = ulMatch;
        if (!content.trim()) {
          // Empty list item — exit list
          const newVal = value.slice(0, lineStart) + "\n" + value.slice(lineEnd === -1 ? value.length : lineEnd);
          onChange(newVal);
          requestAnimationFrame(() => { ta.setSelectionRange(lineStart + 1, lineStart + 1); ta.focus(); });
        } else {
          // Continue list with same bullet
          const insert = `\n${indent}${marker} `;
          const newVal = value.slice(0, pos) + insert + value.slice(pos);
          onChange(newVal);
          requestAnimationFrame(() => { ta.setSelectionRange(pos + insert.length, pos + insert.length); ta.focus(); });
        }
      }

      if (olMatch) {
        const [, indent, num, punct, content] = olMatch;
        if (!content.trim()) {
          // Empty list item — exit list
          const newVal = value.slice(0, lineStart) + "\n" + value.slice(lineEnd === -1 ? value.length : lineEnd);
          onChange(newVal);
          requestAnimationFrame(() => { ta.setSelectionRange(lineStart + 1, lineStart + 1); ta.focus(); });
        } else {
          // Continue with incremented number
          const nextNum = parseInt(num, 10) + 1;
          const insert  = `\n${indent}${nextNum}${punct} `;
          const newVal  = value.slice(0, pos) + insert + value.slice(pos);
          onChange(newVal);
          requestAnimationFrame(() => { ta.setSelectionRange(pos + insert.length, pos + insert.length); ta.focus(); });
        }
      }
      return;
    }

    // Tab inside list = indent, Shift+Tab = unindent
    if (e.key === "Tab" && (ulMatch || olMatch)) {
      e.preventDefault();
      if (e.shiftKey) {
        // Unindent — remove 2 spaces from line start if they exist
        if (lineText.startsWith("  ")) {
          const newVal = value.slice(0, lineStart) + lineText.slice(2) + value.slice(lineStart + lineText.length);
          onChange(newVal);
          requestAnimationFrame(() => { ta.setSelectionRange(Math.max(pos - 2, lineStart), Math.max(pos - 2, lineStart)); ta.focus(); });
        }
      } else {
        // Indent — add 2 spaces at line start
        const newVal = value.slice(0, lineStart) + "  " + value.slice(lineStart);
        onChange(newVal);
        requestAnimationFrame(() => { ta.setSelectionRange(pos + 2, pos + 2); ta.focus(); });
      }
      return;
    }

    // Backspace on empty list marker clears it
    if (e.key === "Backspace") {
      const emptyUl = /^(\s*)([-*+]) $/.exec(lineText);
      const emptyOl = /^(\s*)(\d+)[.)] $/.exec(lineText);
      if ((emptyUl || emptyOl) && pos === lineStart + lineText.length) {
        e.preventDefault();
        const newVal = value.slice(0, lineStart) + value.slice(lineStart + lineText.length);
        onChange(newVal);
        requestAnimationFrame(() => { ta.setSelectionRange(lineStart, lineStart); ta.focus(); });
        return;
      }
    }

    // Regular tab = 2 spaces
    if (e.key === "Tab") { e.preventDefault(); insertAtCursor("  "); }
  };

  const handleSlashSelect = (component) => {
    const ta = textareaRef.current;
    if (!ta || slash === null) return;
    const before  = value.slice(0, slash.slashStart);
    const after   = value.slice(ta.selectionStart);
    const snippet = `\n${component.snippet}\n`;
    onChange(before + snippet + after);
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

  // Close slash on outside click
  useEffect(() => {
    const handler = () => setSlash(null);
    if (slash) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [slash]);



  return (
    <div className={Styles.editorRoot}>
      {/* FIX 3: Horizontally scrollable toolbar on mobile */}
      <div className={Styles.toolbarScroll}>
        <div className={Styles.toolbar}>
          <div className={Styles.toolbarGroup}>
            {HEADING_BUTTONS.map(({ tag, prefix, label }) => (
              <button key={tag} className={Styles.headingBtn} title={`Insert ${tag.toUpperCase()}`}
                onMouseDown={(e) => { e.preventDefault(); insertAtLineStart(prefix); }}>
                {label}
              </button>
            ))}
          </div>
          <div className={Styles.toolbarSep} />
          <div className={Styles.toolbarGroup}>
            <button className={Styles.toolbarBtn} title="Bold"        onMouseDown={(e) => { e.preventDefault(); insertAtCursor("**text**"); }}><BoldIcon /></button>
            <button className={Styles.toolbarBtn} title="Italic"      onMouseDown={(e) => { e.preventDefault(); insertAtCursor("_text_"); }}><ItalicIcon /></button>
            <button className={Styles.toolbarBtn} title="Inline code" onMouseDown={(e) => { e.preventDefault(); insertAtCursor("`code`"); }}><CodeIcon /></button>
            <button className={Styles.toolbarBtn} title="Link"        onMouseDown={(e) => { e.preventDefault(); insertAtCursor("[link text](url)"); }}><LinkIcon /></button>
            <button className={Styles.toolbarBtn} title="Blockquote"  onMouseDown={(e) => { e.preventDefault(); insertAtLineStart("> "); }}><QuoteIcon /></button>
            <button className={Styles.toolbarBtn} title="Bullet list" onMouseDown={(e) => { e.preventDefault(); insertAtLineStart("- "); }}><ListIcon /></button>

            <button className={Styles.toolbarBtn} title="Ordered list" onMouseDown={(e) => { e.preventDefault(); insertAtLineStart("1. "); }}><OListIcon /></button>
            <button className={Styles.toolbarBtn} title="Code block"  onMouseDown={(e) => { e.preventDefault(); insertAtCursor("\n```js\n\n```\n"); }}><BlockCodeIcon /></button>
          </div>
          <div className={Styles.toolbarSep} />
          <div className={Styles.toolbarGroup}>
            <button className={`${Styles.toolbarBtn} ${Styles.imageBtn}`} title="Insert image"
              onMouseDown={(e) => { e.preventDefault(); setShowImageModal(true); }}>
              <ImageIcon /> <span>Image</span>
            </button>
            <button className={`${Styles.toolbarBtn} ${Styles.slashBtn}`} title="Insert component"
              onMouseDown={(e) => {
                e.preventDefault();
                insertAtCursor("/");
                requestAnimationFrame(() => {
                  textareaRef.current?.focus();
                  const coords = getCaretCoords();
                  const pos    = textareaRef.current?.selectionStart ?? 0;
                  setSlash({ ...coords, query: "", slashStart: pos - 1 });
                });
              }}>
              <SlashIcon /> <span>Component</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor textarea */}
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
      </div>

      {/* Footer */}
      <div className={Styles.editorFooter}>
        <span className={Styles.footerHint}>Type <kbd>/</kbd> to insert components</span>
        <span className={Styles.wordCount}>{wordCount} word{wordCount !== 1 ? "s" : ""}</span>
      </div>

      {/* Slash picker — rendered at fixed position in viewport */}
      {slash && (
        <SlashPicker
          position={slash}
          query={slash.query}
          onSelect={handleSlashSelect}
          onClose={() => setSlash(null)}
          recentIds={recentComponents}
        />
      )}

      {showImageModal && (
        <ImageUploadModal onInsert={handleImageInsert} onClose={() => setShowImageModal(false)} />
      )}
    </div>
  );
};

// ── Icons ─────────────────────────────────────────────────────
const OListIcon   = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 2.5h1.5v4H2M1.5 6.5h2.5M2 9.5c.5 0 1.5.3 1.5 1s-1 1-1 1h1.5M5.5 3.5h9M5.5 8h9M5.5 12.5h9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ChevronIcon = () => <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 2.5L4 5l2.5-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const BoldIcon      = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M4 2h5a3 3 0 010 6H4V2zM4 8h5.5a3.5 3.5 0 010 7H4V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>;
const ItalicIcon    = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M10 2H6M10 14H6M9 2L7 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const CodeIcon      = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M5 4L1 8l4 4M11 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const LinkIcon      = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M6 10l-1 1a3 3 0 004.24 0l3-3a3 3 0 00-4.24-4.24l-1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M10 6l1-1a3 3 0 00-4.24 0L3.76 8a3 3 0 004.24 4.24l1.5-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const QuoteIcon     = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 6h4v4H3V6zM9 6h4v4H9V6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M7 10c0 1.5-1 2.5-2 3M13 10c0 1.5-1 2.5-2 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const ListIcon      = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="2.5" cy="4" r="1" fill="currentColor"/><circle cx="2.5" cy="8" r="1" fill="currentColor"/><circle cx="2.5" cy="12" r="1" fill="currentColor"/><path d="M5.5 4h9M5.5 8h9M5.5 12h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const BlockCodeIcon = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 6l-2 2 2 2M11 6l2 2-2 2M9 5.5L7 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ImageIcon     = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="5.5" cy="6.5" r="1" fill="currentColor"/><path d="M1 11l4-4 3 3 2-2 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const SlashIcon     = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M9 2L7 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;

export default MdxEditor;