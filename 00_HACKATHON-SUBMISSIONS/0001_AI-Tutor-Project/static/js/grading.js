// Auto Grading functionality
(function() {
    'use strict';

    // DOM elements
    const gradingForm = document.getElementById('gradingForm');
    const submissionTypeSelect = document.getElementById('submissionType');
    const submissionTitleInput = document.getElementById('submissionTitle');
    const submissionContentTextarea = document.getElementById('submissionContent');
    const wordCountSpan = document.getElementById('wordCount');
    const rubricContainer = document.getElementById('rubricContainer');
    const addCriterionBtn = document.getElementById('addCriterion');
    const useDefaultRubricBtn = document.getElementById('useDefaultRubric');
    const gradeBtn = document.getElementById('gradeBtn');
    const gradingProgress = document.getElementById('gradingProgress');
    const gradingProgressBar = document.getElementById('gradingProgressBar');
    const gradingResults = document.getElementById('gradingResults');

    // State variables
    let isGrading = false;
    let criterionCount = 1;

    // Default rubrics for different submission types
    const defaultRubrics = {
        essay: [
            { name: 'Content Quality', maxPoints: 40, description: 'Depth of ideas and understanding' },
            { name: 'Organization', maxPoints: 25, description: 'Structure and flow of ideas' },
            { name: 'Grammar & Mechanics', maxPoints: 20, description: 'Spelling, grammar, punctuation' },
            { name: 'Creativity & Originality', maxPoints: 15, description: 'Original thinking and creativity' }
        ],
        short_answer: [
            { name: 'Accuracy', maxPoints: 50, description: 'Correctness of the answer' },
            { name: 'Completeness', maxPoints: 30, description: 'Thoroughness of response' },
            { name: 'Clarity', maxPoints: 20, description: 'Clear expression of ideas' }
        ],
        math_problem: [
            { name: 'Correct Solution', maxPoints: 60, description: 'Accuracy of final answer' },
            { name: 'Work Shown', maxPoints: 25, description: 'Clear demonstration of steps' },
            { name: 'Method Used', maxPoints: 15, description: 'Appropriate problem-solving approach' }
        ],
        code: [
            { name: 'Functionality', maxPoints: 40, description: 'Code works as intended' },
            { name: 'Code Quality', maxPoints: 30, description: 'Clean, readable, efficient code' },
            { name: 'Problem Solving', maxPoints: 20, description: 'Logical approach to solution' },
            { name: 'Documentation', maxPoints: 10, description: 'Comments and documentation' }
        ],
        creative_writing: [
            { name: 'Creativity & Imagination', maxPoints: 35, description: 'Original and creative ideas' },
            { name: 'Writing Style', maxPoints: 30, description: 'Engaging and appropriate style' },
            { name: 'Grammar & Mechanics', maxPoints: 20, description: 'Technical writing skills' },
            { name: 'Character/Plot Development', maxPoints: 15, description: 'Story elements development' }
        ],
        lab_report: [
            { name: 'Methodology', maxPoints: 30, description: 'Clear experimental procedures' },
            { name: 'Data Analysis', maxPoints: 30, description: 'Accurate analysis and interpretation' },
            { name: 'Conclusions', maxPoints: 25, description: 'Logical conclusions from data' },
            { name: 'Presentation', maxPoints: 15, description: 'Clear organization and formatting' }
        ]
    };

    // Initialize grading functionality
    function init() {
        setupEventListeners();
        setupAutoSave();
        updateWordCount();
    }

    // Setup event listeners
    function setupEventListeners() {
        if (gradingForm) {
            gradingForm.addEventListener('submit', handleGradingSubmission);
        }

        if (submissionContentTextarea) {
            submissionContentTextarea.addEventListener('input', updateWordCount);
            submissionContentTextarea.addEventListener('input', LearnAI.Utils.debounce(autoSaveContent, 1000));
        }

        if (submissionTypeSelect) {
            submissionTypeSelect.addEventListener('change', handleSubmissionTypeChange);
        }

        if (addCriterionBtn) {
            addCriterionBtn.addEventListener('click', addRubricCriterion);
        }

        if (useDefaultRubricBtn) {
            useDefaultRubricBtn.addEventListener('click', loadDefaultRubric);
        }

        // Event delegation for remove criterion buttons
        if (rubricContainer) {
            rubricContainer.addEventListener('click', function(e) {
                if (e.target.classList.contains('remove-criterion') || e.target.closest('.remove-criterion')) {
                    e.preventDefault();
                    const criterionDiv = e.target.closest('.rubric-criterion');
                    if (criterionDiv) {
                        removeCriterion(criterionDiv);
                    }
                }
            });
        }
    }

    // Setup auto-save for grading form
    function setupAutoSave() {
        if (gradingForm) {
            const autoSave = LearnAI.AutoSave.setupAutoSave(gradingForm, 'grading_submission', 30);
            
            // Restore previous content if available
            if (LearnAI.AutoSave.restoreFormData(gradingForm, 'grading_submission')) {
                updateWordCount();
                handleSubmissionTypeChange();
                LearnAI.Utils.showToast('Previous submission restored', 'info');
            }
        }
    }

    // Auto-save content
    function autoSaveContent() {
        if (submissionContentTextarea && submissionContentTextarea.value.trim()) {
            LearnAI.Storage.setItem('grading_draft_content', {
                content: submissionContentTextarea.value,
                title: submissionTitleInput ? submissionTitleInput.value : '',
                type: submissionTypeSelect ? submissionTypeSelect.value : ''
            }, 120); // Save for 2 hours
        }
    }

    // Update word count
    function updateWordCount() {
        if (submissionContentTextarea && wordCountSpan) {
            const text = submissionContentTextarea.value.trim();
            const wordCount = text ? text.split(/\s+/).length : 0;
            wordCountSpan.textContent = wordCount;
            
            // Add color coding for different word counts
            wordCountSpan.className = '';
            if (wordCount < 50) {
                wordCountSpan.className = 'text-muted';
            } else if (wordCount < 200) {
                wordCountSpan.className = 'text-info';
            } else if (wordCount < 500) {
                wordCountSpan.className = 'text-success';
            } else {
                wordCountSpan.className = 'text-warning';
            }
        }
    }

    // Handle submission type change
    function handleSubmissionTypeChange() {
        const selectedType = submissionTypeSelect ? submissionTypeSelect.value : '';
        
        // Update placeholder text based on submission type
        if (submissionContentTextarea) {
            const placeholders = {
                essay: 'Write your essay here. Include an introduction, body paragraphs with supporting evidence, and a conclusion...',
                short_answer: 'Enter your answer here. Be specific and provide examples where appropriate...',
                math_problem: 'Show your work step by step. Include all calculations and explain your reasoning...',
                code: 'Paste your code here. Make sure to include comments explaining your approach...',
                creative_writing: 'Let your creativity flow! Write your story, poem, or creative piece here...',
                lab_report: 'Include your methodology, observations, data analysis, and conclusions...'
            };
            
            submissionContentTextarea.placeholder = placeholders[selectedType] || 'Enter your submission content here...';
        }

        // Update default rubric button text
        if (useDefaultRubricBtn && selectedType) {
            const typeName = selectedType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            useDefaultRubricBtn.innerHTML = `<i class="fas fa-magic me-1"></i>Use ${typeName} Rubric`;
            useDefaultRubricBtn.disabled = false;
        }
    }

    // Add rubric criterion
    function addRubricCriterion(name = '', maxPoints = '', description = '') {
        const criterionDiv = document.createElement('div');
        criterionDiv.className = 'rubric-criterion mb-3';
        criterionDiv.innerHTML = `
            <div class="row">
                <div class="col-md-5">
                    <input type="text" class="form-control" 
                           placeholder="Criterion (e.g., Content Quality)" 
                           name="criterion" value="${name}">
                </div>
                <div class="col-md-2">
                    <input type="number" class="form-control" 
                           placeholder="Max Points" min="1" max="100" 
                           name="maxPoints" value="${maxPoints}">
                </div>
                <div class="col-md-4">
                    <input type="text" class="form-control" 
                           placeholder="Description (optional)" 
                           name="description" value="${description}">
                </div>
                <div class="col-md-1">
                    <button type="button" class="btn btn-outline-danger btn-sm remove-criterion">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        // Insert before the add button
        const addButtonContainer = addCriterionBtn.parentElement;
        rubricContainer.insertBefore(criterionDiv, addButtonContainer);
        criterionCount++;
    }

    // Remove criterion
    function removeCriterion(criterionDiv) {
        if (rubricContainer.querySelectorAll('.rubric-criterion').length > 1) {
            criterionDiv.remove();
        } else {
            LearnAI.Utils.showToast('At least one criterion is required', 'warning');
        }
    }

    // Load default rubric
    function loadDefaultRubric() {
        const selectedType = submissionTypeSelect.value;
        if (!selectedType || !defaultRubrics[selectedType]) {
            LearnAI.Utils.showToast('Please select a submission type first', 'warning');
            return;
        }

        // Clear existing criteria
        const existingCriteria = rubricContainer.querySelectorAll('.rubric-criterion');
        existingCriteria.forEach(criterion => criterion.remove());

        // Add default criteria
        const rubric = defaultRubrics[selectedType];
        rubric.forEach(criterion => {
            addRubricCriterion(criterion.name, criterion.maxPoints, criterion.description);
        });

        LearnAI.Utils.showToast(`Default ${selectedType.replace('_', ' ')} rubric loaded`, 'success');
    }

    // Collect rubric data
    function collectRubricData() {
        const criteria = {};
        const criterionDivs = rubricContainer.querySelectorAll('.rubric-criterion');
        
        criterionDivs.forEach((div, index) => {
            const nameInput = div.querySelector('input[name="criterion"]');
            const pointsInput = div.querySelector('input[name="maxPoints"]');
            const descInput = div.querySelector('input[name="description"]');
            
            if (nameInput.value.trim() && pointsInput.value) {
                criteria[nameInput.value.trim()] = {
                    maxPoints: parseInt(pointsInput.value),
                    description: descInput.value.trim()
                };
            }
        });

        return criteria;
    }

    // Handle grading submission
    async function handleGradingSubmission(e) {
        e.preventDefault();
        
        if (isGrading) {
            LearnAI.Utils.showToast('Grading already in progress', 'warning');
            return;
        }

        if (!LearnAI.Validation.validateRequired(gradingForm)) {
            return;
        }

        const submissionType = submissionTypeSelect.value;
        const content = submissionContentTextarea.value.trim();
        const title = submissionTitleInput.value.trim();
        const rubric = collectRubricData();

        if (!content) {
            LearnAI.Utils.showToast('Please enter your submission content', 'warning');
            submissionContentTextarea.focus();
            return;
        }

        if (content.length < 10) {
            LearnAI.Utils.showToast('Submission content is too short for meaningful grading', 'warning');
            return;
        }

        try {
            isGrading = true;
            showGradingProgress();

            const response = await LearnAI.API.post('/api/grade_submission', {
                type: submissionType,
                content: content,
                title: title,
                rubric: rubric
            });

            if (response.overall_score !== undefined) {
                displayGradingResults(response);
                LearnAI.Storage.removeItem('grading_draft_content');
                LearnAI.Utils.showToast('Grading completed successfully!', 'success');
            } else {
                throw new Error('Invalid response format');
            }

        } catch (error) {
            console.error('Grading error:', error);
            LearnAI.Utils.showToast('Failed to grade submission. Please try again.', 'danger');
        } finally {
            isGrading = false;
            hideGradingProgress();
        }
    }

    // Show grading progress
    function showGradingProgress() {
        gradingProgress.style.display = 'block';
        gradeBtn.disabled = true;
        gradeBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Grading in Progress...';
        
        // Animate progress bar
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            
            gradingProgressBar.style.width = `${progress}%`;
            
            if (!isGrading) {
                clearInterval(progressInterval);
                gradingProgressBar.style.width = '100%';
            }
        }, 500);
    }

    // Hide grading progress
    function hideGradingProgress() {
        setTimeout(() => {
            gradingProgress.style.display = 'none';
            gradingProgressBar.style.width = '0%';
        }, 1000);
        
        gradeBtn.disabled = false;
        gradeBtn.innerHTML = '<i class="fas fa-check-circle me-2"></i>Grade My Work';
    }

    // Display grading results
    function displayGradingResults(results) {
        const overallScore = Math.round(results.overall_score);
        const maxScore = results.max_score || 100;
        const gradeClass = overallScore >= 80 ? 'success' : overallScore >= 60 ? 'warning' : 'danger';
        const letterGrade = results.grade_letter || '';

        let resultsHtml = `
            <div class="card mt-4">
                <div class="card-header bg-${gradeClass}">
                    <h5 class="mb-0 text-white">
                        <i class="fas fa-certificate me-2"></i>
                        Grading Results
                    </h5>
                </div>
                <div class="card-body">
                    <!-- Overall Score -->
                    <div class="overall-score text-center mb-4 p-4 bg-light rounded">
                        <div class="row align-items-center">
                            <div class="col-md-4">
                                <div class="display-3 text-${gradeClass}">${overallScore}</div>
                                <div class="h5 text-muted">out of ${maxScore}</div>
                            </div>
                            <div class="col-md-4">
                                <div class="display-4 text-${gradeClass}">${letterGrade}</div>
                                <div class="text-muted">Letter Grade</div>
                            </div>
                            <div class="col-md-4">
                                <div class="progress" style="height: 20px;">
                                    <div class="progress-bar bg-${gradeClass}" 
                                         style="width: ${(overallScore/maxScore)*100}%">
                                        ${Math.round((overallScore/maxScore)*100)}%
                                    </div>
                                </div>
                                <small class="text-muted mt-1 d-block">Performance</small>
                            </div>
                        </div>
                    </div>
        `;

        // Criteria breakdown
        if (results.criteria_scores) {
            resultsHtml += `
                <div class="criteria-breakdown mb-4">
                    <h6><i class="fas fa-list-alt me-2"></i>Detailed Breakdown</h6>
                    <div class="row">
            `;

            Object.entries(results.criteria_scores).forEach(([criterion, data]) => {
                const score = data.score || 0;
                const maxPoints = data.max_score || 100;
                const percentage = Math.round((score / maxPoints) * 100);
                const criterionClass = percentage >= 80 ? 'success' : percentage >= 60 ? 'warning' : 'danger';

                resultsHtml += `
                    <div class="col-md-6 mb-3">
                        <div class="card h-100">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <h6 class="card-title mb-0">${criterion}</h6>
                                    <span class="badge bg-${criterionClass}">${score}/${maxPoints}</span>
                                </div>
                                <div class="progress mb-2" style="height: 8px;">
                                    <div class="progress-bar bg-${criterionClass}" 
                                         style="width: ${percentage}%"></div>
                                </div>
                                ${data.feedback ? `<p class="small text-muted mb-2">${data.feedback}</p>` : ''}
                                ${data.suggestions && data.suggestions.length > 0 ? `
                                    <div class="small">
                                        <strong>Suggestions:</strong>
                                        <ul class="mb-0 ps-3">
                                            ${data.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });

            resultsHtml += '</div></div>';
        }

        // Strengths and improvements
        if (results.strengths || results.areas_for_improvement) {
            resultsHtml += '<div class="feedback-section row">';
            
            if (results.strengths && results.strengths.length > 0) {
                resultsHtml += `
                    <div class="col-md-6 mb-3">
                        <div class="card border-success">
                            <div class="card-header bg-success text-white">
                                <h6 class="mb-0"><i class="fas fa-thumbs-up me-2"></i>Strengths</h6>
                            </div>
                            <div class="card-body">
                                <ul class="mb-0">
                                    ${results.strengths.map(strength => `<li>${strength}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            if (results.areas_for_improvement && results.areas_for_improvement.length > 0) {
                resultsHtml += `
                    <div class="col-md-6 mb-3">
                        <div class="card border-warning">
                            <div class="card-header bg-warning text-dark">
                                <h6 class="mb-0"><i class="fas fa-arrow-up me-2"></i>Areas for Improvement</h6>
                            </div>
                            <div class="card-body">
                                <ul class="mb-0">
                                    ${results.areas_for_improvement.map(area => `<li>${area}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            resultsHtml += '</div>';
        }

        // Next steps
        if (results.next_steps && results.next_steps.length > 0) {
            resultsHtml += `
                <div class="next-steps mb-3">
                    <div class="card border-info">
                        <div class="card-header bg-info text-white">
                            <h6 class="mb-0"><i class="fas fa-route me-2"></i>Next Steps</h6>
                        </div>
                        <div class="card-body">
                            <ol class="mb-0">
                                ${results.next_steps.map(step => `<li>${step}</li>`).join('')}
                            </ol>
                        </div>
                    </div>
                </div>
            `;
        }

        // Confidence indicator
        if (results.confidence !== undefined) {
            const confidence = Math.round(results.confidence * 100);
            resultsHtml += `
                <div class="confidence-indicator text-center">
                    <small class="text-muted">
                        <i class="fas fa-brain me-1"></i>
                        AI Confidence: ${confidence}%
                        ${results.note ? `<br><em>${results.note}</em>` : ''}
                    </small>
                </div>
            `;
        }

        resultsHtml += `
                </div>
            </div>
        `;

        gradingResults.innerHTML = resultsHtml;
        gradingResults.style.display = 'block';

        // Scroll to results
        LearnAI.Utils.scrollToElement(gradingResults);
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', init);

    // Export for global access
    window.GradingModule = {
        addRubricCriterion,
        loadDefaultRubric,
        collectRubricData,
        displayGradingResults
    };

})();
