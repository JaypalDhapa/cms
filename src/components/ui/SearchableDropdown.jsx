// src/components/ui/SearchableDropdown.jsx
import { useState, useEffect, useRef } from "react";
import Styles from "./SearchableDropdown.module.css";

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
  const [highlighted, setHighlighted] = useState(0);

  const containerRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase())
  );

  // Close when clicking outside
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
      className={`${Styles.root} ${disabled ? Styles.disabled : ""} ${hasError ? Styles.error : ""}`}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className={Styles.trigger}
        onClick={() => { if (!disabled) setOpen((o) => !o); }}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        <span className={value ? Styles.value : Styles.placeholder}>
          {value || placeholder}
        </span>
        <svg
          className={`${Styles.chevron} ${open ? Styles.chevronOpen : ""}`}
          width="14" height="14" viewBox="0 0 14 14" fill="none"
        >
          <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className={Styles.panel}>
          <div className={Styles.searchWrap}>
            <svg className={Styles.searchIcon} width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              className={Styles.searchInput}
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setHighlighted(0); }}
            />
            {query && (
              <button className={Styles.clearBtn} onClick={() => { setQuery(""); searchRef.current?.focus(); }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          <ul ref={listRef} className={Styles.list} role="listbox">
            {filtered.length > 0 ? (
              filtered.map((opt, i) => (
                <li
                  key={opt}
                  role="option"
                  aria-selected={opt === value}
                  className={`${Styles.option} ${opt === value ? Styles.selected : ""} ${i === highlighted ? Styles.highlighted : ""}`}
                  onMouseEnter={() => setHighlighted(i)}
                  onClick={() => select(opt)}
                >
                  <span>{opt}</span>
                  {opt === value && (
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M2 6.5l3.5 3.5L11 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </li>
              ))
            ) : (
              <li className={Styles.empty}>No results for "{query}"</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;