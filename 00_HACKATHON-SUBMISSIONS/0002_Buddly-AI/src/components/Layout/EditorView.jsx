// src/components/Layout/EditorView.jsx
import Sidebar from "./Sidebar";
import { useState } from 'react';
import CodePanels from "../Code/CodePanels";
import { useMediaQuery } from '../../hooks/useMediaQuery';
import LoadingOverlay from "../UI/LoadingOverlay";

// Mobile-specific SVG Icons
const ChatIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);
const EyeIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

export default function EditorView({ onNewProject, onRefresh, previewKey, ...props }) {
    const isMobile = useMediaQuery('(max-width: 900px)');
    const [mobileView, setMobileView] = useState('editor'); // 'chat' or 'editor'

    // --- Mobile Layout ---
    if (isMobile) {
        return (
            <div id="editor-view" className="mobile-layout">
                <div className="mobile-header">
                    <button 
                        className={`mobile-toggle-btn ${mobileView === 'chat' ? 'active' : ''}`}
                        onClick={() => setMobileView('chat')}
                    >
                        <ChatIcon />
                        <span>Chat</span>
                    </button>
                    <button 
                        className={`mobile-toggle-btn ${mobileView === 'editor' ? 'active' : ''}`}
                        onClick={() => setMobileView('editor')}
                    >
                        <EyeIcon />
                        <span>Editor</span>
                    </button>
                </div>
                
                <div className="mobile-content-wrapper">
                    {mobileView === 'chat' && (
                        <Sidebar
                            onNewProject={props.onNewProject}
                            chatHistory={props.chatHistory}
                            onSend={props.onSend}
                            onRetry={props.onRetry}
                            isLoading={props.isLoading}
                        />
                    )}

                    {mobileView === 'editor' && (
                         <main className="main-content">
                            {props.isLoading && <LoadingOverlay />}
                            <CodePanels code={props.code} onCodeChange={props.onCodeChange} />
                        </main>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div id="editor-view">
            {/* The sidebar is now always visible, which is correct. */}
            <Sidebar
                onNewProject={props.onNewProject}
                chatHistory={props.chatHistory}
                onSend={props.onSend}
                onRetry={props.onRetry}
                isLoading={props.isLoading}
            />
            {/* The main-content div has position: relative and will contain the overlay */}
            <main className="main-content">
                {/* MOVE THE LOADING OVERLAY LOGIC HERE */}
                {props.isLoading && <LoadingOverlay />}
                <CodePanels 
                    code={props.code} 
                    onCodeChange={props.onCodeChange}
                    onRefresh={onRefresh} // <-- PASS DOWN onRefresh
                    previewKey={previewKey} // <-- PASS DOWN previewKey
                />
            </main>
        </div>
    );
}