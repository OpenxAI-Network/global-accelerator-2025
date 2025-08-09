// src/components/Chat/ChatLog.jsx
import { useRef, useEffect } from 'react';
import TypingIndicator from '../UI/TypingIndicator';

// THIS IS THE SUB-COMPONENT TO UPDATE
function ChatMessage({ message, onRetry }) {
    // Check for the typing indicator message type first
    if (message.type === 'typing') {
        return (
            <div className="chat-message assistant">
                <div className="message-header">Buddly</div>
                <TypingIndicator />
            </div>
        );
    }

    // The rest of the logic remains the same
    return (
        <div className={`chat-message ${message.role}`}>
            {message.role !== 'user' && (
                <div className="message-header">
                    {message.role === 'error' ? 'System Error' : 'Assistant'}
                </div>
            )}
            <p>{message.content}</p>
            {message.type === 'json' && (
                <button onClick={() => onRetry(message)}>Retry Generation</button>
            )}
        </div>
    );
}


export default function ChatLog({ history, onRetry }) {
    const endOfMessagesRef = useRef(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    return (
        <div id="chat-log">
            {history.map((msg, index) => (
                <ChatMessage key={index} message={msg} onRetry={onRetry} />
            ))}
            <div ref={endOfMessagesRef} />
        </div>
    );
}