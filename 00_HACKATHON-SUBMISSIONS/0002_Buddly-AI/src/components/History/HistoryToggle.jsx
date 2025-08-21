// src/components/History/HistoryToggle.jsx
export default function HistoryToggle({ onClick }) {
    return (
        <button onClick={onClick} className="history-toggle-btn" title="Show History">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
    );
}