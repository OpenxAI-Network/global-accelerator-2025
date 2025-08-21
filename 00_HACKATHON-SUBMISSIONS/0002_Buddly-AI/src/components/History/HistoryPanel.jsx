// src/components/History/HistoryPanel.jsx
export default function HistoryPanel({ history, onLoad, onClear, onClose, isOpen }) {
    return (
        <div className={`history-panel ${isOpen ? 'open' : ''}`}>
            <div className="history-header">
                <h3>Chats</h3>
                <button onClick={onClose} className="close-btn" title="Close History">×</button>
            </div>
            <div className="history-list">
                {Object.keys(history).length === 0 ? (
                    <p className="empty-history">No saved chats yet.</p>
                ) : (
                    <ul>
                        {Object.entries(history).map(([id, session]) => (
                            <li key={id} onClick={() => onLoad(id)}>
                                {session.title}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="history-footer">
                <button onClick={onClear} className="clear-history-btn">Clear All History</button>
            </div>
        </div>
    );
}