// Practice Generator functionality
(function() {
    'use strict';

    // DOM elements
    const practiceForm = document.getElementById('practiceForm');
    const subjectSelect = document.getElementById('subject');
    const customSubjectDiv = document.getElementById('customSubjectDiv');
    const customSubjectInput = document.getElementById('customSubject');
    const difficultySlider = document.getElementById('difficulty');
    const difficultyValue = document.getElementById('difficultyValue');
    const numQuestionsSelect = document.getElementById('numQuestions');
    const questionTypeSelect = document.getElementById('questionType');
    const generateBtn = document.getElementById('generateBtn');
    const progressCard = document.getElementById('progressCard');
    const practiceContainer = document.getElementById('practiceContainer');
    const questionsContainer = document.getElementById('questionsContainer');
    const resultsContainer = document.getElementById('resultsContainer');
    const questionContent = document.getElementById('questionContent');
    const questionCounter = document.getElementById('questionCounter');
    const hintBtn = document.getElementById('hintBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    // State variables
    let currentPracticeSession = null;
    let currentQuestionIndex = 0;
    let questions = [];
    let answers = [];
    let isGenerating = false;

    // Initialize practice functionality
    function init() {
        setupEventListeners();
        setupAutoSave();
        updateDifficultyDisplay();
    }

    // Setup event listeners
    function setupEventListeners() {
        if (practiceForm) {
            practiceForm.addEventListener('submit', handlePracticeGeneration);
        }

        if (subjectSelect) {
            subjectSelect.addEventListener('change', handleSubjectChange);
        }

        if (difficultySlider) {
            difficultySlider.addEventListener('input', updateDifficultyDisplay);
        }

        if (hintBtn) {
            hintBtn.addEventListener('click', handleGetHint);
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => navigateQuestion(-1));
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => navigateQuestion(1));
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', handleSubmitAnswers);
        }
    }

    // Setup auto-save for practice settings
    function setupAutoSave() {
        if (practiceForm) {
            const autoSave = LearnAI.AutoSave.setupAutoSave(practiceForm, 'practice_settings', 30);
            
            // Restore previous settings if available
            if (LearnAI.AutoSave.restoreFormData(practiceForm, 'practice_settings')) {
                updateDifficultyDisplay();
                handleSubjectChange();
            }
        }
    }

    // Handle subject selection change
    function handleSubjectChange() {
        const selectedValue = subjectSelect.value;
        if (selectedValue === 'other') {
            customSubjectDiv.style.display = 'block';
            customSubjectInput.required = true;
        } else {
            customSubjectDiv.style.display = 'none';
            customSubjectInput.required = false;
        }
    }

    // Update difficulty display
    function updateDifficultyDisplay() {
        if (difficultySlider && difficultyValue) {
            const value = difficultySlider.value;
            difficultyValue.textContent = value;
            
            // Add descriptive text
            const descriptions = {
                1: 'Beginner',
                2: 'Easy',
                3: 'Intermediate',
                4: 'Advanced',
                5: 'Expert'
            };
            
            difficultyValue.textContent = `${value} (${descriptions[value]})`;
        }
    }

    // Handle practice generation
    async function handlePracticeGeneration(e) {
        e.preventDefault();
        
        if (isGenerating) {
            LearnAI.Utils.showToast('Generation already in progress', 'warning');
            return;
        }

        if (!LearnAI.Validation.validateRequired(practiceForm)) {
            return;
        }

        const formData = new FormData(practiceForm);
        const subject = subjectSelect.value === 'other' ? customSubjectInput.value : subjectSelect.value;
        const difficulty = parseInt(difficultySlider.value);
        const numQuestions = parseInt(numQuestionsSelect.value);
        const questionType = questionTypeSelect.value;

        if (!subject) {
            LearnAI.Utils.showToast('Please select or enter a subject', 'warning');
            return;
        }

        try {
            isGenerating = true;
            showGenerationProgress();

            const response = await LearnAI.API.post('/api/generate_practice', {
                subject: subject,
                difficulty: difficulty,
                num_questions: numQuestions,
                question_type: questionType
            });

            if (response.practice_id && response.questions) {
                currentPracticeSession = response.practice_id;
                questions = response.questions;
                answers = new Array(questions.length).fill('');
                currentQuestionIndex = 0;

                displayQuestions();
                LearnAI.Utils.showToast('Practice questions generated successfully!', 'success');
            } else {
                throw new Error('Invalid response format');
            }

        } catch (error) {
            console.error('Practice generation error:', error);
            LearnAI.Utils.showToast('Failed to generate practice questions. Please try again.', 'danger');
        } finally {
            isGenerating = false;
            hideGenerationProgress();
        }
    }

    // Show generation progress
    function showGenerationProgress() {
        practiceContainer.style.display = 'none';
        progressCard.style.display = 'block';
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating...';
    }

    // Hide generation progress
    function hideGenerationProgress() {
        progressCard.style.display = 'none';
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic me-2"></i>Generate Practice';
    }

    // Display questions interface
    function displayQuestions() {
        practiceContainer.style.display = 'none';
        questionsContainer.style.display = 'block';
        resultsContainer.style.display = 'none';
        
        renderCurrentQuestion();
        updateNavigationButtons();
        updateQuestionCounter();
    }

    // Render current question
    function renderCurrentQuestion() {
        if (!questions[currentQuestionIndex]) return;

        const question = questions[currentQuestionIndex];
        let questionHtml = '';

        // Question header
        questionHtml += `
            <div class="question-header mb-4">
                <h5 class="mb-2">Question ${currentQuestionIndex + 1}</h5>
                <p class="question-text">${question.question}</p>
                ${question.difficulty ? `<span class="badge bg-secondary">Difficulty: ${question.difficulty}</span>` : ''}
            </div>
        `;

        // Question content based on type
        if (question.type === 'multiple_choice' && question.options) {
            questionHtml += '<div class="question-options">';
            question.options.forEach((option, index) => {
                const optionId = `question_${currentQuestionIndex}_option_${index}`;
                const isChecked = answers[currentQuestionIndex] === option ? 'checked' : '';
                
                questionHtml += `
                    <div class="form-check mb-2">
                        <input class="form-check-input" type="radio" name="question_${currentQuestionIndex}" 
                               id="${optionId}" value="${option}" ${isChecked}
                               onchange="PracticeModule.updateAnswer(${currentQuestionIndex}, this.value)">
                        <label class="form-check-label" for="${optionId}">
                            ${option}
                        </label>
                    </div>
                `;
            });
            questionHtml += '</div>';
        } else {
            // Short answer or essay
            const placeholder = question.type === 'essay' ? 
                'Write your essay response here...' : 
                'Enter your answer here...';
            const rows = question.type === 'essay' ? 8 : 3;
            
            questionHtml += `
                <div class="question-answer">
                    <textarea class="form-control" rows="${rows}" placeholder="${placeholder}"
                              onchange="PracticeModule.updateAnswer(${currentQuestionIndex}, this.value)"
                              oninput="PracticeModule.updateAnswer(${currentQuestionIndex}, this.value)">${answers[currentQuestionIndex]}</textarea>
                </div>
            `;
        }

        questionContent.innerHTML = questionHtml;
    }

    // Update answer for current question
    function updateAnswer(questionIndex, answer) {
        answers[questionIndex] = answer;
        
        // Auto-save answers
        LearnAI.Storage.setItem(`practice_answers_${currentPracticeSession}`, answers, 60);
    }

    // Navigate between questions
    function navigateQuestion(direction) {
        const newIndex = currentQuestionIndex + direction;
        
        if (newIndex >= 0 && newIndex < questions.length) {
            currentQuestionIndex = newIndex;
            renderCurrentQuestion();
            updateNavigationButtons();
            updateQuestionCounter();
        }
    }

    // Update navigation buttons
    function updateNavigationButtons() {
        if (prevBtn) {
            prevBtn.disabled = currentQuestionIndex === 0;
        }
        
        if (nextBtn) {
            nextBtn.style.display = currentQuestionIndex === questions.length - 1 ? 'none' : 'inline-block';
        }
        
        if (submitBtn) {
            submitBtn.style.display = currentQuestionIndex === questions.length - 1 ? 'inline-block' : 'none';
        }
    }

    // Update question counter
    function updateQuestionCounter() {
        if (questionCounter) {
            questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
        }
    }

    // Handle get hint
    async function handleGetHint() {
        const currentQuestion = questions[currentQuestionIndex];
        const currentAnswer = answers[currentQuestionIndex];
        
        if (!currentQuestion) return;

        try {
            hintBtn.disabled = true;
            hintBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Getting hint...';

            const response = await LearnAI.API.post('/api/get_hint', {
                question: currentQuestion.question,
                attempt: currentAnswer || 'No attempt yet'
            });

            if (response.hint) {
                displayHint(response.hint);
            } else {
                LearnAI.Utils.showToast('Unable to generate hint for this question', 'warning');
            }

        } catch (error) {
            console.error('Hint error:', error);
            LearnAI.Utils.showToast('Failed to get hint', 'danger');
        } finally {
            hintBtn.disabled = false;
            hintBtn.innerHTML = '<i class="fas fa-lightbulb me-1"></i>Hint';
        }
    }

    // Display hint
    function displayHint(hint) {
        // Remove existing hint
        const existingHint = questionContent.querySelector('.hint-display');
        if (existingHint) {
            existingHint.remove();
        }

        const hintElement = document.createElement('div');
        hintElement.className = 'hint-display alert alert-warning mt-3';
        hintElement.innerHTML = `
            <div class="d-flex align-items-start">
                <i class="fas fa-lightbulb text-warning me-2 mt-1"></i>
                <div>
                    <strong>Hint:</strong> ${hint}
                </div>
            </div>
        `;

        questionContent.appendChild(hintElement);
    }

    // Handle submit answers
    async function handleSubmitAnswers() {
        // Check if all questions are answered
        const unansweredQuestions = answers.map((answer, index) => answer.trim() === '' ? index + 1 : null)
                                          .filter(index => index !== null);

        if (unansweredQuestions.length > 0) {
            const proceed = confirm(`You have ${unansweredQuestions.length} unanswered questions (${unansweredQuestions.join(', ')}). Submit anyway?`);
            if (!proceed) return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Grading...';

            const response = await LearnAI.API.post('/api/submit_practice', {
                practice_id: currentPracticeSession,
                answers: answers
            });

            if (response.scores && response.overall_score !== undefined) {
                displayResults(response);
                LearnAI.Storage.removeItem(`practice_answers_${currentPracticeSession}`);
            } else {
                throw new Error('Invalid response format');
            }

        } catch (error) {
            console.error('Submission error:', error);
            LearnAI.Utils.showToast('Failed to submit answers. Please try again.', 'danger');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check me-1"></i>Submit Answers';
        }
    }

    // Display results
    function displayResults(results) {
        questionsContainer.style.display = 'none';
        resultsContainer.style.display = 'block';

        const overallScore = Math.round(results.overall_score);
        const scoreClass = overallScore >= 80 ? 'success' : overallScore >= 60 ? 'warning' : 'danger';

        let resultsHtml = `
            <div class="overall-score text-center mb-4">
                <div class="display-4 text-${scoreClass}">${overallScore}%</div>
                <h5>Overall Score</h5>
                <div class="progress mt-2" style="height: 15px;">
                    <div class="progress-bar bg-${scoreClass}" style="width: ${overallScore}%"></div>
                </div>
            </div>
        `;

        // Individual question results
        resultsHtml += '<div class="question-results">';
        results.scores.forEach((score, index) => {
            const question = questions[index];
            const answer = answers[index];
            const questionScore = Math.round(score.score || 0);
            const questionScoreClass = questionScore >= 80 ? 'success' : questionScore >= 60 ? 'warning' : 'danger';

            resultsHtml += `
                <div class="card mb-3">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">Question ${index + 1}</h6>
                        <span class="badge bg-${questionScoreClass}">${questionScore}%</span>
                    </div>
                    <div class="card-body">
                        <p class="question-text mb-2"><strong>Question:</strong> ${question.question}</p>
                        <p class="user-answer mb-2"><strong>Your Answer:</strong> ${answer || '<em>No answer provided</em>'}</p>
                        ${question.correct_answer ? `<p class="correct-answer mb-2"><strong>Correct Answer:</strong> ${question.correct_answer}</p>` : ''}
                        ${score.feedback ? `<div class="feedback alert alert-info"><strong>Feedback:</strong> ${score.feedback}</div>` : ''}
                        ${question.explanation ? `<div class="explanation alert alert-light"><strong>Explanation:</strong> ${question.explanation}</div>` : ''}
                    </div>
                </div>
            `;
        });
        resultsHtml += '</div>';

        document.getElementById('resultsContent').innerHTML = resultsHtml;

        // Scroll to results
        LearnAI.Utils.scrollToElement(resultsContainer);
    }

    // Restore saved answers
    function restoreSavedAnswers() {
        if (currentPracticeSession) {
            const savedAnswers = LearnAI.Storage.getItem(`practice_answers_${currentPracticeSession}`);
            if (savedAnswers && Array.isArray(savedAnswers)) {
                answers = savedAnswers;
                renderCurrentQuestion();
                LearnAI.Utils.showToast('Previous answers restored', 'info');
            }
        }
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', init);

    // Export for global access
    window.PracticeModule = {
        updateAnswer,
        navigateQuestion,
        handleGetHint,
        restoreSavedAnswers
    };

})();
