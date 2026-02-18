import React, { useState, useRef, useCallback, useEffect } from 'react';

export default function CustomSelect({ wrapperId, label, extraClass, items, value, onChange, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const panelRef = useRef(null);

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

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

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
    >
      <button
        className={`_q${extraClass ? ' ' + extraClass : ''}`}
        tabIndex={0}
        onClick={toggleOpen}
      >
        {children || <span>{label}</span>}
      </button>
      <div className="_br" ref={panelRef}>
        {items && items.map((item) => (
          <div
            key={item.value}
            className={`_b5${item.value === value ? ' selected' : ''}`}
            data-value={item.value}
            onClick={() => handleSelect(item.value)}
          >
            {item.text || item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
