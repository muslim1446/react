import React, { useState, useRef, useCallback, useEffect } from 'react';

// =========================================================================
// CUSTOM SELECT — Reusable dropdown component
// Classes: ._k (wrapper), ._q (trigger), ._br (panel), ._b5 (option)
// Features: keyboard nav, scroll-into-view, selected state with accent bar
// Opens above trigger (bottom: 115%)
// =========================================================================

export default function CustomSelect({ id, wrapperId, items, value, onChange, placeholder, icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const panelRef = useRef(null);

  const selectedItem = items.find(item => item.value === value);
  const displayText = selectedItem ? selectedItem.label : (placeholder || 'Select...');

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleSelect = useCallback((itemValue) => {
    onChange(itemValue);
    setIsOpen(false);
  }, [onChange]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isOpen]);

  // Keyboard navigation within dropdown
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    const panel = panelRef.current;
    if (!panel) return;

    const options = Array.from(panel.querySelectorAll('._b5'));
    const focused = document.activeElement;
    const idx = options.indexOf(focused);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = idx < options.length - 1 ? idx + 1 : 0;
      options[next]?.focus();
      options[next]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = idx > 0 ? idx - 1 : options.length - 1;
      options[prev]?.focus();
      options[prev]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (idx >= 0 && items[idx]) {
        handleSelect(items[idx].value);
      }
    }
  }, [isOpen, items, handleSelect]);

  // Scroll selected item into view when opening
  useEffect(() => {
    if (isOpen && panelRef.current) {
      const selected = panelRef.current.querySelector('._b5.selected');
      if (selected) {
        selected.scrollIntoView({ block: 'center' });
      }
    }
  }, [isOpen]);

  return (
    <div
      id={wrapperId}
      className={`_k${isOpen ? ' open' : ''}`}
      ref={wrapperRef}
      onKeyDown={handleKeyDown}
    >
      <button
        className="_q"
        tabIndex={0}
        onClick={toggleOpen}
        data-value={value}
      >
        {icon && <span className="_c1">{icon}</span>}
        <span className="_r">{displayText}</span>
      </button>

      <div className="_br" ref={panelRef}>
        {items.map((item) => (
          <div
            key={item.value}
            className={`_b5${item.value === value ? ' selected' : ''}`}
            tabIndex={isOpen ? 0 : -1}
            onClick={() => handleSelect(item.value)}
            role="option"
            aria-selected={item.value === value}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
