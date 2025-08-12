// Common JavaScript functionality for LearnAI application

// Global configuration
const CONFIG = {
    API_BASE: '',
    DEBOUNCE_DELAY: 300,
    TOAST_DURATION: 5000
};

// Utility functions
const Utils = {
    // Debounce function for input handlers
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Show toast notifications
    showToast: function(message, type = 'info') {
        const toastContainer = this.getOrCreateToastContainer();
        const toast = this.createToast(message, type);
        toastContainer.appendChild(toast);
        
        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, CONFIG.TOAST_DURATION);
    },

    // Get or create toast container
    getOrCreateToastContainer: function() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'position-fixed top-0 end-0 p-3';
            container.style.zIndex = '1050';
            document.body.appendChild(container);
        }
        return container;
    },

    // Create toast element
    createToast: function(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast show align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                        onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        return toast;
    },

    // Format time duration
    formatDuration: function(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    },

    // Scroll to element smoothly
    scrollToElement: function(element) {
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }
    },

    // Copy text to clipboard
    copyToClipboard: function(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Copied to clipboard!', 'success');
            }).catch(() => {
                this.fallbackCopyToClipboard(text);
            });
        } else {
            this.fallbackCopyToClipboard(text);
        }
    },

    // Fallback copy method for older browsers
    fallbackCopyToClipboard: function(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showToast('Copied to clipboard!', 'success');
        } catch (err) {
            this.showToast('Failed to copy to clipboard', 'danger');
        }
        
        document.body.removeChild(textArea);
    }
};

// API helper functions
const API = {
    // Make API request with error handling
    request: async function(url, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const finalOptions = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, finalOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Handle different response types
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            console.error('API request failed:', error);
            Utils.showToast(`Request failed: ${error.message}`, 'danger');
            throw error;
        }
    },

    // GET request
    get: function(url) {
        return this.request(url);
    },

    // POST request
    post: function(url, data) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Stream response handler
    streamResponse: function(url, data, onChunk, onComplete, onError) {
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            function readChunk() {
                return reader.read().then(({ done, value }) => {
                    if (done) {
                        onComplete && onComplete();
                        return;
                    }
                    
                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');
                    
                    lines.forEach(line => {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                onChunk && onChunk(data);
                            } catch (e) {
                                console.warn('Failed to parse SSE data:', line);
                            }
                        }
                    });
                    
                    return readChunk();
                });
            }
            
            return readChunk();
        })
        .catch(error => {
            console.error('Stream error:', error);
            onError && onError(error);
        });
    }
};

// Form validation helpers
const Validation = {
    // Validate required fields
    validateRequired: function(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });
        
        return isValid;
    },

    // Show field error
    showFieldError: function(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('is-invalid');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    },

    // Clear field error
    clearFieldError: function(field) {
        field.classList.remove('is-invalid');
        
        const errorDiv = field.parentNode.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
};

// Local storage helpers
const Storage = {
    // Set item with expiration
    setItem: function(key, value, expirationMinutes = null) {
        const item = {
            value: value,
            timestamp: Date.now(),
            expiration: expirationMinutes ? Date.now() + (expirationMinutes * 60 * 1000) : null
        };
        
        localStorage.setItem(key, JSON.stringify(item));
    },

    // Get item (check expiration)
    getItem: function(key) {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;
        
        try {
            const item = JSON.parse(itemStr);
            
            if (item.expiration && Date.now() > item.expiration) {
                localStorage.removeItem(key);
                return null;
            }
            
            return item.value;
        } catch (e) {
            return null;
        }
    },

    // Remove item
    removeItem: function(key) {
        localStorage.removeItem(key);
    },

    // Clear all expired items
    clearExpired: function() {
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith('learnai_')) {
                this.getItem(key); // This will remove expired items
            }
        });
    }
};

// Auto-save functionality
const AutoSave = {
    // Auto-save form data
    setupAutoSave: function(form, key, intervalSeconds = 30) {
        const saveData = () => {
            const formData = new FormData(form);
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            Storage.setItem(`autosave_${key}`, data, 60); // Save for 1 hour
        };

        // Save on input change (debounced)
        const debouncedSave = Utils.debounce(saveData, 2000);
        form.addEventListener('input', debouncedSave);
        
        // Save periodically
        const interval = setInterval(saveData, intervalSeconds * 1000);
        
        // Clear interval when form is submitted or page is unloaded
        form.addEventListener('submit', () => {
            clearInterval(interval);
            Storage.removeItem(`autosave_${key}`);
        });
        
        window.addEventListener('beforeunload', () => {
            clearInterval(interval);
        });
        
        return {
            destroy: () => {
                clearInterval(interval);
                form.removeEventListener('input', debouncedSave);
            }
        };
    },

    // Restore form data
    restoreFormData: function(form, key) {
        const data = Storage.getItem(`autosave_${key}`);
        if (!data) return false;
        
        Object.entries(data).forEach(([name, value]) => {
            const field = form.querySelector(`[name="${name}"]`);
            if (field) {
                field.value = value;
            }
        });
        
        return true;
    }
};

// Initialize common functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Clear expired storage items
    Storage.clearExpired();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+Enter to submit forms
        if (e.ctrlKey && e.key === 'Enter') {
            const activeForm = document.activeElement.closest('form');
            if (activeForm) {
                e.preventDefault();
                activeForm.requestSubmit();
            }
        }
    });
    
    // Add copy buttons to code blocks
    document.querySelectorAll('pre code').forEach(codeBlock => {
        const button = document.createElement('button');
        button.className = 'btn btn-sm btn-outline-secondary position-absolute top-0 end-0 m-2';
        button.innerHTML = '<i class="fas fa-copy"></i>';
        button.onclick = () => Utils.copyToClipboard(codeBlock.textContent);
        
        const pre = codeBlock.parentElement;
        pre.style.position = 'relative';
        pre.appendChild(button);
    });
    
    // Initialize tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
});

// Export for use in other scripts
window.LearnAI = {
    Utils,
    API,
    Validation,
    Storage,
    AutoSave,
    CONFIG
};
