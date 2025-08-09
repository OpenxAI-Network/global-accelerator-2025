// src/components/Chat/ChatInput.jsx
import { useState } from 'react';

export default function ChatInput({ onSend, isLoading }) {
    const [prompt, setPrompt] = useState('');

    const handleSend = () => {
        if (prompt.trim() && !isLoading) {
            onSend(prompt);
            setPrompt('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-input-container">
            <div className="chat-input-wrapper">
                <textarea
                    className="chat-input"
                    placeholder="Ask Buddly to build..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                />
                <button className="send-btn" title="Send" onClick={handleSend} disabled={isLoading}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>
            {/* ... other actions can be added here if needed ... */}
        </div>
    );
}