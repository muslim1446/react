import { useEffect } from 'react';

// =========================================================================
// CONTENT PROTECTION
// Prevents: right-click, text selection, dragging, Ctrl+C/Cmd+C
// Also injects global user-select: none styles
// =========================================================================

export default function ContentProtection() {
  useEffect(() => {
    // Inject user-select prevention styles
    const style = document.createElement('style');
    style.textContent = `
      html, body {
        user-select: none;
        -webkit-user-select: none;
        overscroll-behavior: none;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      input, textarea, [contenteditable="true"] {
        user-select: text;
        -webkit-user-select: text;
      }
    `;
    document.head.appendChild(style);

    // Event handlers
    function preventContextMenu(e) { e.preventDefault(); }
    function preventSelectStart(e) { e.preventDefault(); }
    function preventDragStart(e) { e.preventDefault(); }
    function preventCopy(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
      }
    }

    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('selectstart', preventSelectStart);
    document.addEventListener('dragstart', preventDragStart);
    document.addEventListener('keydown', preventCopy);

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('selectstart', preventSelectStart);
      document.removeEventListener('dragstart', preventDragStart);
      document.removeEventListener('keydown', preventCopy);
      if (style.parentNode) style.parentNode.removeChild(style);
    };
  }, []);

  return null; // Renderless component
}
