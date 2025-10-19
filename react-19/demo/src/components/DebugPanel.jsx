import { memo, useRef, useEffect } from 'react';

const DebugPanel = memo(function DebugPanel({ isOpen, onClose, renderCount, events }) {
  const eventsEndRef = useRef(null);

  // Auto-scroll to bottom when new events are added
  useEffect(() => {
    if (isOpen && eventsEndRef.current) {
      eventsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events.length, isOpen]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  const getEventIcon = (type) => {
    const icons = {
      'page-load': '🚀',
      'auth': '🔐',
      'list-create': '📝',
      'list-delete': '🗑️',
      'item-add': '➕',
      'item-delete': '❌',
      'sort': '🔄',
      'theme': '🎨',
      'debug': '🐛',
    };
    return icons[type] || '•';
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="debug-overlay" onClick={onClose} />}

      {/* Debug Panel */}
      <div className={`debug-panel ${isOpen ? 'open' : ''}`}>
        <div className="debug-header">
          <h3>Debug Panel</h3>
          <button onClick={onClose} className="debug-close" aria-label="Close debug panel">
            ×
          </button>
        </div>

        <div className="debug-content">
          <section className="debug-section">
            <h4>Performance</h4>
            <div className="debug-item">
              <span className="debug-label">App Renders:</span>
              <span className="debug-value">{renderCount}</span>
            </div>
            <div className="debug-item">
              <span className="debug-label">Total Events:</span>
              <span className="debug-value">{events.length}</span>
            </div>
            <p className="debug-note">
              Note: StrictMode doubles renders in development to detect bugs. Production builds will have ~50% fewer renders.
            </p>
          </section>

          <section className="debug-section">
            <div className="debug-section-header">
              <h4>User Flow Log</h4>
              {events.length > 0 && (
                <button
                  onClick={() => window.location.reload()}
                  className="debug-clear-btn"
                  title="Reload page to clear"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="debug-events">
              {events.length === 0 ? (
                <p className="debug-empty">No events yet</p>
              ) : (
                events.map((event, index) => (
                  <div key={index} className="debug-event">
                    <span className="debug-event-icon">{getEventIcon(event.type)}</span>
                    <div className="debug-event-content">
                      <div className="debug-event-message">{event.message}</div>
                      <div className="debug-event-time">{formatTime(event.timestamp)}</div>
                      {event.hooks && event.hooks.length > 0 && (
                        <div className="debug-event-hooks">
                          {event.hooks.map((hook, i) => (
                            <span key={i} className="debug-hook-tag">{hook}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={eventsEndRef} />
            </div>
          </section>
        </div>
      </div>
    </>
  );
});

export default DebugPanel;
