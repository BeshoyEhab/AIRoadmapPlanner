/**
 * Enhanced HTML exporter for interactive roadmap to-do lists
 * Creates a fully interactive HTML file with checkboxes and progress saving
 */

/**
 * Exports roadmap as an interactive HTML to-do list
 * @param {Object} roadmap - The roadmap to export
 * @returns {void}
 */
export const exportToHTMLTodoList = (roadmap) => {
  if (!roadmap) return;

  const roadmapId = roadmap.id || 'roadmap-' + Date.now();
  const title = roadmap.title || roadmap.name || 'Learning Roadmap';
  
  const htmlContent = generateHTMLContent(roadmap, roadmapId, title);
  
  // Create and download the file
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_todo.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Generates the complete HTML content for the interactive to-do list
 */
const generateHTMLContent = (roadmap, roadmapId, title) => {
  const phases = roadmap.phases || [];
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Interactive To-Do List</title>
    <style>
        ${getCSS()}
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>📚 ${title}</h1>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" id="overall-progress"></div>
                </div>
                <span class="progress-text" id="progress-text">0% Complete</span>
            </div>
            <div class="export-info">
                <p><strong>Objective:</strong> ${roadmap.objective || 'Not specified'}</p>
                <p><strong>Final Goal:</strong> ${roadmap.finalGoal || 'Not specified'}</p>
                <p><strong>Total Duration:</strong> ${roadmap.totalDuration || 'Not specified'}</p>
                <p><strong>Phases:</strong> ${phases.length}</p>
                <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
        </header>

        <main class="main-content">
            ${generatePhasesHTML(phases, roadmapId)}
        </main>

        <footer class="footer">
            <div class="stats" id="stats">
                <div class="stat-item">
                    <span class="stat-number" id="completed-count">0</span>
                    <span class="stat-label">Completed</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number" id="total-count">0</span>
                    <span class="stat-label">Total Tasks</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number" id="remaining-count">0</span>
                    <span class="stat-label">Remaining</span>
                </div>
            </div>
            <div class="actions">
                <button onclick="resetProgress()" class="btn btn-secondary">Reset Progress</button>
                <button onclick="exportProgress()" class="btn btn-primary">Export Progress</button>
                <input type="file" id="import-progress" accept=".json" onchange="importProgress(event)" style="display: none;">
                <button onclick="document.getElementById('import-progress').click()" class="btn btn-secondary">Import Progress</button>
            </div>
        </footer>
    </div>

    <script>
        ${getJavaScript(roadmapId)}
    </script>
</body>
</html>`;
};

/**
 * Generates HTML for all phases and their mini-goals
 */
const generatePhasesHTML = (phases, roadmapId) => {
  return phases.map((phase, phaseIndex) => {
    const miniGoals = phase.miniGoals || [];
    const phaseId = `phase-${phaseIndex}`;
    
    return `
    <div class="phase" data-phase-id="${phaseId}">
        <div class="phase-header" onclick="togglePhase('${phaseId}')">
            <div class="phase-title-container">
                <h2 class="phase-title">
                    <span class="phase-number">Phase ${phase.phaseNumber || phaseIndex + 1}</span>
                    ${phase.title || `Phase ${phaseIndex + 1}`}
                </h2>
                <div class="phase-progress">
                    <div class="mini-progress-bar">
                        <div class="mini-progress-fill" id="${phaseId}-progress"></div>
                    </div>
                    <span class="mini-progress-text" id="${phaseId}-progress-text">0%</span>
                </div>
            </div>
            <span class="toggle-icon" id="${phaseId}-toggle" style="transform: rotate(-90deg);">▼</span>
        </div>
        
        <div class="phase-content collapsed" id="${phaseId}-content">
            <div class="phase-info">
                <p><strong>Duration:</strong> ${phase.duration || 'Not specified'}</p>
                <p><strong>Goal:</strong> ${phase.goal || 'Not specified'}</p>
                ${phase.skills ? `<p><strong>Skills:</strong> ${phase.skills.join(', ')}</p>` : ''}
            </div>
            
            <div class="mini-goals">
                <h3>📋 Tasks & Mini-Goals</h3>
                ${generateMiniGoalsHTML(miniGoals, phaseId, roadmapId)}
            </div>
            
            ${phase.resources ? generateResourcesHTML(phase.resources) : ''}
            
            ${phase.project ? generateProjectHTML(phase.project) : ''}
        </div>
    </div>`;
  }).join('');
};

/**
 * Generates HTML for mini-goals with checkboxes
 */
const generateMiniGoalsHTML = (miniGoals, phaseId, roadmapId) => {
  if (!miniGoals || miniGoals.length === 0) {
    return '<p class="no-tasks">No specific tasks defined for this phase.</p>';
  }
  
  return `
    <ul class="mini-goals-list">
        ${miniGoals.map((goal, goalIndex) => {
          const goalId = `${phaseId}-goal-${goalIndex}`;
          return `
            <li class="mini-goal-item" data-goal-id="${goalId}">
                <label class="checkbox-container">
                    <input type="checkbox" 
                           id="${goalId}" 
                           data-roadmap-id="${roadmapId}"
                           data-phase-id="${phaseId}"
                           onchange="updateProgress()">
                    <span class="checkmark"></span>
                    <div class="goal-content">
                        <span class="goal-title">${goal.title || `Task ${goalIndex + 1}`}</span>
                        ${goal.estimatedTime ? `<span class="goal-time">⏱️ ${goal.estimatedTime}</span>` : ''}
                        ${goal.description ? `<p class="goal-description">${goal.description}</p>` : ''}
                        ${goal.url ? `<a href="${goal.url}" target="_blank" class="goal-link">🔗 Resource</a>` : ''}
                        ${goal.priority ? `<span class="goal-priority priority-${goal.priority.toLowerCase()}">${goal.priority}</span>` : ''}
                    </div>
                </label>
            </li>`;
        }).join('')}
    </ul>`;
};

/**
 * Generates HTML for resources section
 */
const generateResourcesHTML = (resources) => {
  if (!resources || resources.length === 0) return '';
  
  return `
    <div class="resources">
        <h3>📚 Resources</h3>
        <ul class="resources-list">
            ${resources.map(resource => `
                <li class="resource-item">
                    <strong>${resource.name}</strong>
                    ${resource.type ? `<span class="resource-type">(${resource.type})</span>` : ''}
                    ${resource.url ? `<a href="${resource.url}" target="_blank" class="resource-link">🔗 Open</a>` : ''}
                    ${resource.description ? `<p class="resource-description">${resource.description}</p>` : ''}
                </li>
            `).join('')}
        </ul>
    </div>`;
};

/**
 * Generates HTML for project section
 */
const generateProjectHTML = (project) => {
  if (!project) return '';
  
  const projectObj = typeof project === 'string' ? { description: project } : project;
  
  return `
    <div class="project">
        <h3>🚀 Phase Project</h3>
        ${projectObj.title ? `<h4>${projectObj.title}</h4>` : ''}
        <p>${projectObj.description}</p>
        ${projectObj.deliverables ? `
            <div class="deliverables">
                <strong>Deliverables:</strong>
                <ul>
                    ${projectObj.deliverables.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
    </div>`;
};

/**
 * Returns the CSS styles for the HTML export
 */
const getCSS = () => {
  return `
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }
    
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        line-height: 1.6;
        color: #333;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
    }
    
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        background: white;
        margin-top: 20px;
        margin-bottom: 20px;
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    
    .header {
        text-align: center;
        margin-bottom: 40px;
        padding: 30px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px;
    }
    
    .header h1 {
        font-size: 2.5em;
        margin-bottom: 20px;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    
    .progress-container {
        margin: 20px 0;
    }
    
    .progress-bar {
        width: 100%;
        height: 12px;
        background: rgba(255,255,255,0.3);
        border-radius: 6px;
        overflow: hidden;
        margin-bottom: 10px;
    }
    
    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #4CAF50, #81C784);
        border-radius: 6px;
        transition: width 0.3s ease;
        width: 0%;
    }
    
    .progress-text {
        font-size: 1.2em;
        font-weight: bold;
    }
    
    .export-info {
        margin-top: 20px;
        padding: 20px;
        background: rgba(255,255,255,0.1);
        border-radius: 8px;
        text-align: left;
    }
    
    .export-info p {
        margin: 8px 0;
    }
    
    .phase {
        margin: 30px 0;
        border: 2px solid #e0e0e0;
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.3s ease;
    }
    
    .phase:hover {
        border-color: #667eea;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    }
    
    .phase-header {
        background: linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%);
        padding: 20px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.3s ease;
    }
    
    .phase-header:hover {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    .phase-title-container {
        flex-grow: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .phase-title {
        margin: 0;
        font-size: 1.4em;
    }
    
    .phase-number {
        display: inline-block;
        background: #667eea;
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8em;
        margin-right: 12px;
    }
    
    .phase-progress {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .mini-progress-bar {
        width: 100px;
        height: 6px;
        background: rgba(0,0,0,0.1);
        border-radius: 3px;
        overflow: hidden;
    }
    
    .mini-progress-fill {
        height: 100%;
        background: #4CAF50;
        border-radius: 3px;
        transition: width 0.3s ease;
        width: 0%;
    }
    
    .mini-progress-text {
        font-size: 0.9em;
        font-weight: bold;
    }
    
    .toggle-icon {
        font-size: 1.5em;
        transition: transform 0.3s ease;
    }
    
    .phase-content {
        padding: 25px;
        display: block;
    }
    
    .phase-content.collapsed {
        display: none;
    }
    
    .phase-info {
        margin-bottom: 25px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #667eea;
    }
    
    .phase-info p {
        margin: 8px 0;
    }
    
    .mini-goals h3 {
        color: #667eea;
        margin-bottom: 15px;
        font-size: 1.3em;
    }
    
    .mini-goals-list {
        list-style: none;
    }
    
    .mini-goal-item {
        margin: 15px 0;
        padding: 15px;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        transition: all 0.3s ease;
    }
    
    .mini-goal-item:hover {
        border-color: #667eea;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
    }
    
    .mini-goal-item.completed {
        background: #f0f8f0;
        border-color: #4CAF50;
    }
    
    .checkbox-container {
        display: flex;
        align-items: flex-start;
        cursor: pointer;
        gap: 15px;
    }
    
    .checkbox-container input[type="checkbox"] {
        display: none;
    }
    
    .checkmark {
        width: 24px;
        height: 24px;
        border: 2px solid #ddd;
        border-radius: 4px;
        display: inline-block;
        position: relative;
        transition: all 0.3s ease;
        flex-shrink: 0;
        margin-top: 2px;
    }
    
    .checkbox-container input:checked + .checkmark {
        background-color: #4CAF50;
        border-color: #4CAF50;
    }
    
    .checkbox-container input:checked + .checkmark:after {
        content: "✓";
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-weight: bold;
        font-size: 16px;
    }
    
    .goal-content {
        flex-grow: 1;
    }
    
    .goal-title {
        font-weight: bold;
        color: #333;
        display: block;
        margin-bottom: 8px;
    }
    
    .goal-time {
        background: #e3f2fd;
        color: #1976d2;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.85em;
        margin-left: 10px;
    }
    
    .goal-description {
        color: #666;
        margin: 8px 0;
        font-size: 0.95em;
    }
    
    .goal-link {
        color: #667eea;
        text-decoration: none;
        font-size: 0.9em;
    }
    
    .goal-link:hover {
        text-decoration: underline;
    }
    
    .goal-priority {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.8em;
        font-weight: bold;
        margin-left: 10px;
    }
    
    .priority-high { background: #ffebee; color: #c62828; }
    .priority-medium { background: #fff3e0; color: #f57c00; }
    .priority-low { background: #e8f5e8; color: #2e7d32; }
    
    .resources, .project {
        margin: 25px 0;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #764ba2;
    }
    
    .resources h3, .project h3 {
        color: #764ba2;
        margin-bottom: 15px;
    }
    
    .resources-list {
        list-style: none;
    }
    
    .resource-item {
        margin: 12px 0;
        padding: 12px;
        background: white;
        border-radius: 6px;
        border: 1px solid #e0e0e0;
    }
    
    .resource-type {
        color: #666;
        font-size: 0.9em;
        margin-left: 8px;
    }
    
    .resource-link {
        color: #764ba2;
        text-decoration: none;
        margin-left: 10px;
    }
    
    .resource-description {
        color: #666;
        margin-top: 8px;
        font-size: 0.95em;
    }
    
    .deliverables ul {
        margin-left: 20px;
        margin-top: 10px;
    }
    
    .footer {
        margin-top: 40px;
        padding: 30px;
        background: #f8f9fa;
        border-radius: 12px;
        text-align: center;
    }
    
    .stats {
        display: flex;
        justify-content: center;
        gap: 40px;
        margin-bottom: 30px;
    }
    
    .stat-item {
        text-align: center;
    }
    
    .stat-number {
        display: block;
        font-size: 2em;
        font-weight: bold;
        color: #667eea;
    }
    
    .stat-label {
        color: #666;
        font-size: 0.9em;
    }
    
    .actions {
        display: flex;
        justify-content: center;
        gap: 15px;
        flex-wrap: wrap;
    }
    
    .btn {
        padding: 12px 24px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1em;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-block;
    }
    
    .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    .btn-secondary {
        background: #f8f9fa;
        color: #333;
        border: 2px solid #ddd;
    }
    
    .btn-secondary:hover {
        border-color: #667eea;
        color: #667eea;
    }
    
    .no-tasks {
        color: #666;
        font-style: italic;
        text-align: center;
        padding: 20px;
    }
    
    @media (max-width: 768px) {
        .container {
            margin: 10px;
            padding: 15px;
        }
        
        .header h1 {
            font-size: 2em;
        }
        
        .phase-title-container {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
        }
        
        .stats {
            flex-direction: column;
            gap: 20px;
        }
        
        .actions {
            flex-direction: column;
        }
    }
  `;
};

/**
 * Returns the JavaScript code for interactivity and progress saving
 */
const getJavaScript = (roadmapId) => {
  return `
    const STORAGE_KEY = 'roadmap_progress_${roadmapId}';
    
    // Initialize the page
    document.addEventListener('DOMContentLoaded', function() {
        console.log('HTML Todo List initialized');
        loadProgress();
        updateProgress();
        updateStats();
        
        // Add click handlers for checkboxes (fallback)
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', updateProgress);
        });
    });
    
    // Toggle phase visibility
    function togglePhase(phaseId) {
        const content = document.getElementById(phaseId + '-content');
        const toggle = document.getElementById(phaseId + '-toggle');
        
        if (content.classList.contains('collapsed')) {
            content.classList.remove('collapsed');
            toggle.style.transform = 'rotate(0deg)';
        } else {
            content.classList.add('collapsed');
            toggle.style.transform = 'rotate(-90deg)';
        }
    }
    
    // Update progress bars and save state
    function updateProgress() {
        console.log('Updating progress...');
        const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        const totalTasks = allCheckboxes.length;
        let completedTasks = 0;
        
        // Update individual mini-goal items
        allCheckboxes.forEach(checkbox => {
            const goalItem = checkbox.closest('.mini-goal-item');
            if (goalItem) {
                if (checkbox.checked) {
                    completedTasks++;
                    goalItem.classList.add('completed');
                } else {
                    goalItem.classList.remove('completed');
                }
            }
        });
        
        console.log('Completed tasks:', completedTasks, 'Total tasks:', totalTasks);
        
        // Update overall progress
        const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const progressBar = document.getElementById('overall-progress');
        const progressText = document.getElementById('progress-text');
        
        if (progressBar) progressBar.style.width = overallProgress + '%';
        if (progressText) progressText.textContent = overallProgress + '% Complete';
        
        console.log('Overall progress:', overallProgress + '%');
        
        // Update phase progress
        updatePhaseProgress();
        
        // Update stats
        updateStats();
        
        // Save progress to localStorage
        saveProgress();
    }
    
    // Update individual phase progress
    function updatePhaseProgress() {
        const phases = document.querySelectorAll('.phase');
        
        phases.forEach(phase => {
            const phaseId = phase.getAttribute('data-phase-id');
            const checkboxes = phase.querySelectorAll('input[type="checkbox"]');
            const total = checkboxes.length;
            
            if (total === 0) return;
            
            let completed = 0;
            checkboxes.forEach(cb => {
                if (cb.checked) completed++;
            });
            
            const percentage = Math.round((completed / total) * 100);
            const progressFill = document.getElementById(phaseId + '-progress');
            const progressText = document.getElementById(phaseId + '-progress-text');
            
            if (progressFill) progressFill.style.width = percentage + '%';
            if (progressText) progressText.textContent = percentage + '%';
        });
    }
    
    // Update statistics
    function updateStats() {
        const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        const totalTasks = allCheckboxes.length;
        let completedTasks = 0;
        
        allCheckboxes.forEach(checkbox => {
            if (checkbox.checked) completedTasks++;
        });
        
        document.getElementById('completed-count').textContent = completedTasks;
        document.getElementById('total-count').textContent = totalTasks;
        document.getElementById('remaining-count').textContent = totalTasks - completedTasks;
    }
    
    // Save progress to localStorage
    function saveProgress() {
        const progress = {};
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            progress[checkbox.id] = checkbox.checked;
        });
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            progress: progress,
            lastUpdated: new Date().toISOString(),
            version: '1.0'
        }));
    }
    
    // Load progress from localStorage
    function loadProgress() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return;
            
            const data = JSON.parse(saved);
            const progress = data.progress || {};
            
            Object.keys(progress).forEach(checkboxId => {
                const checkbox = document.getElementById(checkboxId);
                if (checkbox) {
                    checkbox.checked = progress[checkboxId];
                }
            });
        } catch (_error) {
            console.error('Failed to load progress:', error);
        }
    }
    
    // Reset all progress
    function resetProgress() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            
            localStorage.removeItem(STORAGE_KEY);
            updateProgress();
        }
    }
    
    // Export progress to JSON file
    function exportProgress() {
        const progress = {};
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            progress[checkbox.id] = checkbox.checked;
        });
        
        const exportData = {
            roadmapId: '${roadmapId}',
            progress: progress,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'roadmap_progress_' + new Date().toISOString().split('T')[0] + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Import progress from JSON file
    function importProgress(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.progress) {
                    Object.keys(data.progress).forEach(checkboxId => {
                        const checkbox = document.getElementById(checkboxId);
                        if (checkbox) {
                            checkbox.checked = data.progress[checkboxId];
                        }
                    });
                    
                    updateProgress();
                    alert('Progress imported successfully!');
                } else {
                    alert('Invalid progress file format.');
                }
            } catch (_error) {
                console.error('Import failed:', error);
                alert('Failed to import progress file.');
            }
        };
        
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    }
    
    // Auto-save every 30 seconds
    setInterval(saveProgress, 30000);
  `;
};
