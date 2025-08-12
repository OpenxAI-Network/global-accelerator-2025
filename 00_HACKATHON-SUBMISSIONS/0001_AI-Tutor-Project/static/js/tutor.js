// AI Tutor functionality
(function() {
    'use strict';

    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    const chatContainer = document.getElementById('chatContainer');
    const sendButton = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');
    const clearChatBtn = document.getElementById('clearChat');
    const getHintBtn = document.getElementById('getHint');

    let currentQuestion = '';
    let currentAttempt = '';
    let isStreaming = false;

    // Initialize tutor functionality
    function init() {
        setupEventListeners();
        setupAutoSave();
        scrollToBottom();
    }

    // Setup event listeners
    function setupEventListeners() {
        if (chatForm) {
            chatForm.addEventListener('submit', handleChatSubmit);
        }

        if (messageInput) {
            messageInput.addEventListener('keydown', handleKeyDown);
            messageInput.addEventListener('input', handleInputChange);
        }

        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', handleClearChat);
        }

        if (getHintBtn) {
            getHintBtn.addEventListener('click', handleGetHint);
        }
    }

    // Setup auto-save for message input
    function setupAutoSave() {
        if (messageInput) {
            const autoSave = LearnAI.AutoSave.setupAutoSave(chatForm, 'tutor_message', 10);
            
            // Restore previous message if available
            if (LearnAI.AutoSave.restoreFormData(chatForm, 'tutor_message')) {
                LearnAI.Utils.showToast('Previous message restored', 'info');
            }
        }
    }

    // Handle form submission
    function handleChatSubmit(e) {
        e.preventDefault();
        
        if (isStreaming) {
            LearnAI.Utils.showToast('Please wait for the current response to complete', 'warning');
            return;
        }

        const message = messageInput.value.trim();
        if (!message) {
            LearnAI.Utils.showToast('Please enter a message', 'warning');
            return;
        }

        // Store current question/attempt for hint functionality
        currentQuestion = message;
        currentAttempt = message;

        sendMessage(message);
    }

    // Handle keyboard shortcuts
    function handleKeyDown(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            chatForm.requestSubmit();
        }
    }

    // Handle input change for hint button visibility
    function handleInputChange() {
        const hasContent = messageInput.value.trim().length > 0;
        if (getHintBtn) {
            getHintBtn.style.display = hasContent ? 'inline-block' : 'none';
        }
    }

    // Send message to AI tutor
    async function sendMessage(message) {
        // Add user message to chat
        addMessageToChat('user', message);
        
        // Clear input and disable form
        messageInput.value = '';
        setFormState(false);
        showTypingIndicator();

        // Prepare for streaming response
        const assistantMessageElement = createMessageElement('assistant', '');
        chatContainer.appendChild(assistantMessageElement);
        scrollToBottom();

        const contentDiv = assistantMessageElement.querySelector('.message-content');
        let fullResponse = '';

        try {
            isStreaming = true;

            LearnAI.API.streamResponse('/api/chat', 
                { message: message },
                // onChunk
                (data) => {
                    if (data.chunk) {
                        fullResponse += data.chunk;
                        contentDiv.textContent = fullResponse;
                        scrollToBottom();
                    } else if (data.error) {
                        contentDiv.innerHTML = `<span class="text-danger">${data.error}</span>`;
                    }
                },
                // onComplete
                () => {
                    hideTypingIndicator();
                    setFormState(true);
                    isStreaming = false;
                    messageInput.focus();
                },
                // onError
                (error) => {
                    hideTypingIndicator();
                    setFormState(true);
                    isStreaming = false;
                    contentDiv.innerHTML = `<span class="text-danger">Sorry, I encountered an error. Please try again.</span>`;
                    LearnAI.Utils.showToast('Failed to get response from AI tutor', 'danger');
                }
            );

        } catch (error) {
            hideTypingIndicator();
            setFormState(true);
            isStreaming = false;
            contentDiv.innerHTML = `<span class="text-danger">Sorry, I encountered an error. Please try again.</span>`;
            LearnAI.Utils.showToast('Failed to send message', 'danger');
        }
    }

    // Add message to chat display
    function addMessageToChat(type, content) {
        const messageElement = createMessageElement(type, content);
        chatContainer.appendChild(messageElement);
        scrollToBottom();
    }

    // Create message element
    function createMessageElement(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const iconClass = type === 'user' ? 'fas fa-user-circle text-primary' : 'fas fa-robot text-info';
        
        messageDiv.innerHTML = `
            <div class="d-flex align-items-start">
                <div class="me-2">
                    <i class="${iconClass}"></i>
                </div>
                <div class="flex-grow-1">
                    <small class="text-muted">${timeStr}</small>
                    <div class="mt-1 message-content">${content}</div>
                </div>
            </div>
        `;
        
        return messageDiv;
    }

    // Show typing indicator
    function showTypingIndicator() {
        if (typingIndicator) {
            typingIndicator.style.display = 'block';
            scrollToBottom();
        }
    }

    // Hide typing indicator
    function hideTypingIndicator() {
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
    }

    // Set form state (enabled/disabled)
    function setFormState(enabled) {
        if (messageInput) {
            messageInput.disabled = !enabled;
        }
        if (sendButton) {
            sendButton.disabled = !enabled;
            sendButton.innerHTML = enabled ? 
                '<i class="fas fa-paper-plane"></i>' : 
                '<i class="fas fa-spinner fa-spin"></i>';
        }
    }

    // Scroll to bottom of chat
    function scrollToBottom() {
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    // Handle clear chat
    function handleClearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            // Remove all messages except the empty state
            const messages = chatContainer.querySelectorAll('.message');
            messages.forEach(message => message.remove());
            
            // Show empty state
            chatContainer.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-comments fa-3x mb-3"></i>
                    <p>Start a conversation with your AI tutor!</p>
                    <p class="small">Ask questions, request explanations, or get help with problems.</p>
                </div>
            `;
            
            LearnAI.Utils.showToast('Chat cleared', 'success');
        }
    }

    // Handle get hint
    async function handleGetHint() {
        const userInput = messageInput.value.trim();
        
        if (!userInput) {
            LearnAI.Utils.showToast('Please enter your question or attempt first', 'warning');
            return;
        }

        try {
            const response = await LearnAI.API.post('/api/get_hint', {
                question: currentQuestion || 'Current problem',
                attempt: userInput
            });

            if (response.hint) {
                // Add hint as a special message
                const hintElement = createHintElement(response.hint);
                chatContainer.appendChild(hintElement);
                scrollToBottom();
            } else {
                LearnAI.Utils.showToast('Unable to generate hint', 'warning');
            }

        } catch (error) {
            LearnAI.Utils.showToast('Failed to get hint', 'danger');
        }
    }

    // Create hint element
    function createHintElement(hint) {
        const hintDiv = document.createElement('div');
        hintDiv.className = 'message assistant hint-message';
        hintDiv.style.backgroundColor = 'var(--bs-warning-bg-subtle)';
        hintDiv.style.borderLeft = '4px solid var(--bs-warning)';
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        hintDiv.innerHTML = `
            <div class="d-flex align-items-start">
                <div class="me-2">
                    <i class="fas fa-lightbulb text-warning"></i>
                </div>
                <div class="flex-grow-1">
                    <small class="text-muted">
                        <i class="fas fa-lightbulb me-1"></i>Hint - ${timeStr}
                    </small>
                    <div class="mt-1">${hint}</div>
                </div>
            </div>
        `;
        
        return hintDiv;
    }

    // Insert prompt helper
    window.insertPrompt = function(promptText) {
        if (messageInput) {
            const currentValue = messageInput.value.trim();
            const newValue = currentValue ? `${currentValue}\n\n${promptText} ` : `${promptText} `;
            messageInput.value = newValue;
            messageInput.focus();
            
            // Move cursor to end
            messageInput.setSelectionRange(messageInput.value.length, messageInput.value.length);
        }
    };

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', init);

    // Export for testing
    window.TutorModule = {
        sendMessage,
        addMessageToChat,
        scrollToBottom
    };

})();
