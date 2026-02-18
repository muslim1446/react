import React, { useState, useEffect, useCallback } from 'react';

// =========================================================================
// OFFLINE STATUS HUB — Floating glassmorphic notification
// Shows "System State: Localized: Offline Mode" when browser goes offline
// Features: pulsing green dot, reload button, dismiss button
// ID: #status-hub
// =========================================================================

const HUB_STYLES = `
#status-hub {
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 10000;
  background: rgba(20, 20, 20, 0.85);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px 20px;
  color: #e0e0e0;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.85rem;
  min-width: 240px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.4s ease, transform 0.4s ease;
  pointer-events: none;
}
#status-hub.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
.status-hub-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  margin-right: 8px;
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.status-hub-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.status-hub-btn {
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.2s;
}
.status-hub-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
`;

export default function OfflineStatusHub() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function handleOnline() { setIsOffline(false); setDismissed(false); }
    function handleOffline() { setIsOffline(true); setDismissed(false); }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  const visible = isOffline && !dismissed;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HUB_STYLES }} />
      <div id="status-hub" className={visible ? 'visible' : ''}>
        <div>
          <span className="status-hub-dot" />
          <strong>System State</strong>
        </div>
        <div style={{ marginTop: '4px', color: '#aaa' }}>
          Localized: Offline Mode
        </div>
        <div className="status-hub-actions">
          <button className="status-hub-btn" onClick={handleReload}>
            Sync
          </button>
          <button className="status-hub-btn" onClick={handleDismiss}>
            Dismiss
          </button>
        </div>
      </div>
    </>
  );
}
