// src/components/Layout/Sidebar.jsx
import ChatLog from "../Chat/ChatLog";
import ChatInput from "../Chat/ChatInput";

// Added onNewProject to props
export default function Sidebar({ onNewProject, chatHistory, onSend, onRetry, isLoading }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                {/* Use a button to trigger the new project function */}
                <button onClick={onNewProject} className="new-project-btn">✨ New Project</button>
            </div>
            <ChatLog history={chatHistory} onRetry={onRetry} />
            <ChatInput onSend={onSend} isLoading={isLoading} />
        </aside>
    );
}