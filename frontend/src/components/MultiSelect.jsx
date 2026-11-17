import { useState, useRef, useEffect } from 'react';

/**
 * Multi-select dropdown with chip display, matching the template's .multiSelect pattern.
 * Props:
 *   options   — string[]
 *   selected  — string[]
 *   onChange  — (string[]) => void
 *   max       — number (default 99)
 *   placeholder — string
 */
export default function MultiSelect({ options = [], selected = [], onChange, max = 99, placeholder = 'Select options' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (val) => {
    if (selected.includes(val)) {
      onChange(selected.filter(s => s !== val));
    } else {
      if (selected.length >= max) return;
      onChange([...selected, val]);
    }
  };

  const remove = (val, e) => { e.stopPropagation(); onChange(selected.filter(s => s !== val)); };

  return (
    <div className="multiSelect" ref={ref}>
      <button
        type="button"
        className="msBtn"
        onClick={() => setOpen(o => !o)}
      >
        <i className="fa-solid fa-code"></i>
        <span className="msPlaceholder">
          {selected.length ? `${selected.length} selected` : placeholder}
        </span>
        <i className="fa-solid fa-chevron-down msChevron"></i>
      </button>

      {open && (
        <div className="msMenu">
          {options.map(opt => (
            <label key={opt} className="msItem">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                disabled={!selected.includes(opt) && selected.length >= max}
              />
              {opt}
            </label>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div className="msChips">
          {selected.map(val => (
            <span key={val} className="chip">
              {val}
              <button type="button" aria-label="Remove" onClick={(e) => remove(val, e)}>✕</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
