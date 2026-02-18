import { useEffect } from 'react';

// =========================================================================
// USE CURRENCY SANITIZER — Strips $, £, €, ¥ from text nodes
// Port of art_2b3c4dxjs.js
// Runs initial cleanup + MutationObserver for dynamically added content
// =========================================================================

function sanitizeNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    // Use non-global regex for .test() to avoid stateful lastIndex bug,
    // then use global regex inline for .replace()
    if (/[$£€¥]/.test(node.textContent)) {
      node.textContent = node.textContent.replace(/[$£€¥]/g, '');
    }
  } else {
    for (const child of node.childNodes) {
      sanitizeNode(child);
    }
  }
}

export default function useCurrencySanitizer() {
  useEffect(() => {
    // 1. Perform immediate cleanup
    sanitizeNode(document.body);

    // 2. MutationObserver for dynamically added content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => sanitizeNode(node));
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);
}
