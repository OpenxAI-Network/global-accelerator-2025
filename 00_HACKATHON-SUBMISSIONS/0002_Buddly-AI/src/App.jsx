// src/App.jsx
import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import LandingView from './components/Layout/LandingView';
import EditorView from './components/Layout/EditorView';
import HistoryPanel from './components/History/HistoryPanel';
import HistoryToggle from './components/History/HistoryToggle';
import * as api from './services/apiService';

const INITIAL_CODE = { html: '', css: '', js: '' };


function App() {
    const [previewKey, setPreviewKey] = useState(0);
    const [allSessions, setAllSessions] = useLocalStorage('lovable-sessions', {});
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const currentSession = activeSessionId ? allSessions[activeSessionId] : null;

    const handleRefreshPreview = () => {
        // Incrementing the key will force the Preview component to re-render
        setPreviewKey(prevKey => prevKey + 1);
    };

    // --- Session Management ---
    const createNewSession = (prompt) => {
        const newId = `session_${Date.now()}`;
        const newSession = {
            id: newId,
            title: prompt.substring(0, 50) || 'New Chat',
            chatHistory: [],
            code: INITIAL_CODE,
            lastGoodCode: INITIAL_CODE,
        };
        setAllSessions(prev => ({ ...prev, [newId]: newSession }));
        setActiveSessionId(newId);
        return newId; // Return the ID for immediate use
    };

    const loadSession = (sessionId) => {
        setActiveSessionId(sessionId);
        setIsHistoryOpen(false);
    };

    const clearHistory = () => {
        if (window.confirm('Are you sure you want to delete all chat history? This cannot be undone.')) {
            setAllSessions({});
            setActiveSessionId(null);
        }
    };

    const handleCodeChange = (newCode) => {
        if (!activeSessionId) return;
        setAllSessions(prev => ({
            ...prev,
            [activeSessionId]: { ...prev[activeSessionId], code: newCode }
        }));
    };
    
    const handleNewProject = () => {
        setActiveSessionId(null); // This will switch view to landing
    };

    // --- Core AI Logic ---
    const handleSendPrompt = async (prompt) => {
        let sessionId = activeSessionId;
        // If there's no active session, create one first.
        if (!sessionId) {
            sessionId = createNewSession(prompt);
        }

        setIsLoading(true);
        const userMessage = { role: 'user', content: prompt };
        const typingMessage = { role: 'assistant', type: 'typing' };
        
        // Add user prompt and typing indicator using the functional updater form
        setAllSessions(prevSessions => {
            const currentChatHistory = prevSessions[sessionId].chatHistory;
            return {
                ...prevSessions,
                [sessionId]: {
                    ...prevSessions[sessionId],
                    chatHistory: [...currentChatHistory, userMessage, typingMessage]
                }
            };
        });

        try {
            // We can get the most recent 'lastGoodCode' from the state directly
            const lastGoodCode = allSessions[sessionId]?.lastGoodCode || INITIAL_CODE;
            
            const response = lastGoodCode.html !== ''
                ? await api.followUp(prompt, lastGoodCode)
                : await api.generateCode(prompt);
            
            // Handle the response by updating the state again
            setAllSessions(prevSessions => {
                const historyWithoutTyping = prevSessions[sessionId].chatHistory.filter(m => m.type !== 'typing');
                
                if (response.errorType === 'JSON_PARSE_ERROR') {
                    const errorMessage = {
                        role: 'error', type: 'json', content: 'The AI response was not valid. You can retry.',
                        originalPrompt: prompt, badJson: response.rawResponse
                    };
                    return {
                        ...prevSessions,
                        [sessionId]: { ...prevSessions[sessionId], chatHistory: [...historyWithoutTyping, errorMessage] }
                    };
                } else {
                    const successMessage = { role: 'assistant', content: 'I have updated the code.' };
                    return {
                        ...prevSessions,
                        [sessionId]: {
                            ...prevSessions[sessionId],
                            code: response,
                            lastGoodCode: response,
                            chatHistory: [...historyWithoutTyping, successMessage]
                        }
                    };
                }
            });

        } catch (error) {
            setAllSessions(prevSessions => {
                const historyWithoutTyping = prevSessions[sessionId].chatHistory.filter(m => m.type !== 'typing');
                const errorMessage = { role: 'error', content: error.message };
                return {
                    ...prevSessions,
                    [sessionId]: { ...prevSessions[sessionId], chatHistory: [...historyWithoutTyping, errorMessage] }
                };
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    // Retry logic can be implemented here if needed
    const handleRetry = async (errorMsg) => { console.log("Retry requested for:", errorMsg); };

    const view = activeSessionId ? 'editor' : 'landing';

    return (
        <>
            <HistoryToggle onClick={() => setIsHistoryOpen(true)} />
            <HistoryPanel
                history={allSessions}
                onLoad={loadSession}
                onClear={clearHistory}
                onClose={() => setIsHistoryOpen(false)}
                isOpen={isHistoryOpen}
            />

            {view === 'landing' && <LandingView onSend={handleSendPrompt} isLoading={isLoading} />}
            {view === 'editor' && currentSession && (
                <EditorView
                    key={activeSessionId}
                    chatHistory={currentSession.chatHistory}
                    code={currentSession.code}
                    onCodeChange={handleCodeChange}
                    onSend={handleSendPrompt}
                    onRetry={handleRetry}
                    isLoading={isLoading}
                    onNewProject={handleNewProject}
                    onRefresh={handleRefreshPreview}
                    previewKey={previewKey}
                />
            )}
        </>
    );
}

export default App;