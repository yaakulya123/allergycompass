// Import services
import GPTService from './services/gptService.js';
import FoodDataService from './services/foodDataService.js';
import DataStore from './services/dataStore.js';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data store
    DataStore.init();
    
    // Initialize the dashboard
    initializeDashboard();
    
    // Setup navigation
    setupNavigation();
    
    // Setup mobile navigation
    setupMobileNavigation();
    
    // Setup analyzer tabs
    setupAnalyzerTabs();
    
    // Setup profile management
    setupProfileManagement();
    
    // Setup journal functionality
    setupJournalCalendar();
    
    // Setup analyzer functionality
    setupAnalyzerFunctionality();
    
    // Add modal styles
    addModalStyles();
});

// Initialize the dashboard with data from store
function initializeDashboard() {
    // Get user data
    const userProfile = DataStore.getUserProfile();
    const journalEntries = DataStore.getJournalEntries();
    
    // Update user name in welcome message
    const welcomeHeader = document.querySelector('.section-header h2');
    if (welcomeHeader && userProfile.name) {
        welcomeHeader.textContent = `Welcome back, ${userProfile.name.split(' ')[0]}!`;
    }
    
    // Update stats based on journal data
    updateDashboardStats(journalEntries);
    
    // Populate recent journal entries
    populateRecentEntries(journalEntries);
    
    // Generate symptom chart from journal data
    generateSymptomChart(journalEntries);
    
    // Setup quick analyzer
    setupQuickAnalyzerDemo();
}

// Generate symptom chart from journal data
function generateSymptomChart(journalEntries) {
    const symptomCtx = document.getElementById('symptomChart');
    if (!symptomCtx) return;
    
    // Get last 6 months for chart
    const months = getLastSixMonths();
    
    // Count reactions by month and severity
    const mildReactions = Array(6).fill(0);
    const moderateReactions = Array(6).fill(0);
    const severeReactions = Array(6).fill(0);
    
    // Process journal entries to get reaction counts
    journalEntries.forEach(entry => {
        if (entry.reactions) {
            // Get month index (0-5) from entry date
            const entryDate = new Date(entry.date);
            const currentDate = new Date();
            const monthDiff = (currentDate.getFullYear() - entryDate.getFullYear()) * 12 + 
                              (currentDate.getMonth() - entryDate.getMonth());
            
            // Only count entries from last 6 months
            if (monthDiff >= 0 && monthDiff < 6) {
                const monthIndex = 5 - monthDiff; // Reverse index (5 is current month)
                
                // Count by severity
                if (entry.reactions.severity === "severe") {
                    severeReactions[monthIndex]++;
                } else if (entry.reactions.severity === "moderate") {
                    moderateReactions[monthIndex]++;
                } else if (entry.reactions.severity === "mild") {
                    mildReactions[monthIndex]++;
                }
            }
        }
    });
    
    // Create chart
    const symptomChart = new Chart(symptomCtx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Mild Reactions',
                    data: mildReactions,
                    borderColor: '#3b82f6', // Blue
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    borderWidth: 2,
                    pointBackgroundColor: '#3b82f6'
                },
                {
                    label: 'Moderate Reactions',
                    data: moderateReactions,
                    borderColor: '#f59e0b', // Amber
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    borderWidth: 2,
                    pointBackgroundColor: '#f59e0b'
                },
                {
                    label: 'Severe Reactions',
                    data: severeReactions,
                    borderColor: '#ef4444', // Red
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    borderWidth: 2,
                    pointBackgroundColor: '#ef4444'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 6,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Get array of last 6 months names
function getLastSixMonths() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    const result = [];
    
    for (let i = 5; i >= 0; i--) {
        const monthIndex = (today.getMonth() - i + 12) % 12;
        result.push(months[monthIndex]);
    }
    
    return result;
}

// Update dashboard stats based on journal data
function updateDashboardStats(journalEntries) {
    // Calculate stats
    const stats = calculateJournalStats(journalEntries);
    
    // Update stats on dashboard
    const statCards = document.querySelectorAll('.stat-card');
    
    if (statCards.length >= 4) {
        // Reaction-free days
        const reactionFreeCard = statCards[0];
        reactionFreeCard.querySelector('h3').textContent = `${stats.reactionFreeDays} Days`;
        
        // Flagged foods
        const flaggedFoodsCard = statCards[1];
        flaggedFoodsCard.querySelector('h3').textContent = `${stats.flaggedFoods} Foods`;
        
        // Tracked meals
        const trackedMealsCard = statCards[2];
        trackedMealsCard.querySelector('h3').textContent = `${stats.trackedMeals} Meals`;
        
        // Symptoms this week
        const symptomsCard = statCards[3];
        symptomsCard.querySelector('h3').textContent = `${stats.symptomsThisWeek} Symptoms`;
    }
}

// Calculate stats from journal entries
function calculateJournalStats(journalEntries) {
    const today = new Date();
    let reactionFreeDays = 0;
    let flaggedFoods = 0;
    let trackedMeals = 0;
    let symptomsThisWeek = 0;
    
    // Count consecutive reaction-free days
    for (let i = 0; i < journalEntries.length; i++) {
        const entry = journalEntries[i];
        const entryDate = new Date(entry.date);
        
        // Skip future entries
        if (entryDate > today) continue;
        
        if (!entry.reactions) {
            reactionFreeDays++;
        } else {
            break;
        }
    }
    
    // Count flagged foods yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const yesterdayEntry = journalEntries.find(entry => entry.date === yesterdayStr);
    if (yesterdayEntry && yesterdayEntry.meals) {
        flaggedFoods = yesterdayEntry.meals.filter(meal => meal.reactions).length;
    }
    
    // Count meals tracked this month
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    journalEntries.forEach(entry => {
        const entryDate = new Date(entry.date);
        if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear && entry.meals) {
            trackedMeals += entry.meals.length;
        }
    });
    
    // Count symptoms recorded this week
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    journalEntries.forEach(entry => {
        const entryDate = new Date(entry.date);
        if (entryDate >= oneWeekAgo && entryDate <= today && entry.reactions && entry.reactions.symptoms) {
            symptomsThisWeek += entry.reactions.symptoms.length;
        }
    });
    
    return {
        reactionFreeDays,
        flaggedFoods,
        trackedMeals,
        symptomsThisWeek
    };
}

// Populate recent entries on dashboard
function populateRecentEntries(journalEntries) {
    const entryList = document.querySelector('.entry-list');
    if (!entryList) return;
    
    // Sort entries by date (newest first)
    const sortedEntries = [...journalEntries].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Take most recent 3 entries
    const recentEntries = sortedEntries.slice(0, 3);
    
    // Clear existing entries
    entryList.innerHTML = '';
    
    // Add new entries
    recentEntries.forEach(entry => {
        const entryDate = new Date(entry.date);
        const formattedDate = formatDate(entryDate);
        
        // Get first meal of the day
        const firstMeal = entry.meals && entry.meals.length > 0 ? entry.meals[0] : null;
        
        if (firstMeal) {
            const entryItem = document.createElement('li');
            entryItem.className = 'entry-item';
            
            // Determine status icon
            let statusClass = 'safe';
            let statusIcon = 'check';
            
            if (firstMeal.reactions) {
                if (firstMeal.reactions.severity === 'severe') {
                    statusClass = 'alert';
                    statusIcon = 'times';
                } else {
                    statusClass = 'warning';
                    statusIcon = 'exclamation';
                }
            }
            
            entryItem.innerHTML = `
                <div class="entry-icon ${statusClass}">
                    <i class="fas fa-${statusIcon}"></i>
                </div>
                <div class="entry-details">
                    <h4>${firstMeal.name} ${formattedDate}</h4>
                    <p>${firstMeal.items}${firstMeal.reactions ? ', ' + formatReaction(firstMeal.reactions) : ', no reactions'}</p>
                    <span class="entry-time">${firstMeal.time}</span>
                </div>
            `;
            
            entryList.appendChild(entryItem);
        }
    });
}

// Setup navigation between sections
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Get the target section ID
            const targetId = this.getAttribute('data-target');
            
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked nav item
            this.classList.add('active');
            
            // Hide all content sections
            contentSections.forEach(section => section.classList.remove('active'));
            
            // Show the target content section
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// Setup mobile navigation toggle
function setupMobileNavigation() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            
            // Change icon based on state
            const icon = this.querySelector('i');
            if (sidebar.classList.contains('collapsed')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-chevron-up');
            } else {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-bars');
            }
        });
    }
}

// Setup analyzer tabs
function setupAnalyzerTabs() {
    const analyzerTabs = document.querySelectorAll('.analyzer-tab');
    
    analyzerTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Get the target content
            const targetId = this.getAttribute('data-target');
            
            // Remove active class from all tabs
            analyzerTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Update placeholder text based on selected tab
            const analyzerInput = document.querySelector('.analyzer-input');
            if (analyzerInput) {
                switch (targetId) {
                    case 'ingredients':
                        analyzerInput.placeholder = 'Paste your ingredient list here...';
                        break;
                    case 'restaurant':
                        analyzerInput.placeholder = 'Paste restaurant menu items here...';
                        break;
                    case 'recipe':
                        analyzerInput.placeholder = 'Paste recipe ingredients here...';
                        break;
                }
            }
        });
    });
}

// Initialize demo data for analysis
function initializeDemoData() {
    // Example data for demo purposes
    setupAnalyzerDemo();
    setupQuickAnalyzerDemo();
}

// Setup the analyzer demo functionality
function setupAnalyzerDemo() {
    const analyzeBtn = document.querySelector('.analyzer-actions .btn-primary');
    const analyzerInput = document.querySelector('.analyzer-input');
    const resultsSection = document.querySelector('.analyzer-results');
    
    if (analyzeBtn && analyzerInput && resultsSection) {
        analyzeBtn.addEventListener('click', function() {
            const inputText = analyzerInput.value.trim();
            
            if (inputText) {
                // Show results section with animation
                resultsSection.style.display = 'block';
                resultsSection.style.opacity = '0';
                resultsSection.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    resultsSection.style.opacity = '1';
                    resultsSection.style.transform = 'translateY(0)';
                    resultsSection.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                }, 100);
                
                // Scroll to results
                setTimeout(() => {
                    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 300);
            } else {
                // If empty, prompt user to enter text
                analyzerInput.placeholder = 'Please enter ingredients to analyze...';
                analyzerInput.classList.add('error');
                
                setTimeout(() => {
                    analyzerInput.classList.remove('error');
                }, 2000);
            }
        });
    }
}

// Setup the quick analyzer on dashboard with API integration
function setupQuickAnalyzerDemo() {
    const quickAnalyzeBtn = document.querySelector('.quick-analyzer .btn-primary');
    const quickAnalyzerInput = document.querySelector('.quick-analyzer textarea');
    
    if (quickAnalyzeBtn && quickAnalyzerInput) {
        quickAnalyzeBtn.addEventListener('click', async function() {
            const inputText = quickAnalyzerInput.value.trim();
            
            if (inputText) {
                // Show loading state
                quickAnalyzeBtn.disabled = true;
                quickAnalyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                
                try {
                    // Get user allergens
                    const userAllergens = DataStore.getAllergens();
                    
                    // Call API for analysis
                    const analysisResult = await GPTService.analyzeIngredients(inputText, userAllergens);
                    
                    // Create a temporary results preview
                    const resultPreview = document.createElement('div');
                    resultPreview.className = 'quick-result-preview';
                    
                    // Determine result status
                    let statusClass = 'safe';
                    let statusIcon = 'check-circle';
                    let statusMessage = 'No allergens detected';
                    
                    if (!analysisResult.safe) {
                        if (analysisResult.detectedAllergens.some(a => a.severity === 'severe')) {
                            statusClass = 'danger';
                            statusIcon = 'times-circle';
                            statusMessage = `Found severe allergen: ${analysisResult.detectedAllergens[0].name}`;
                        } else {
                            statusClass = 'warning';
                            statusIcon = 'exclamation-triangle';
                            statusMessage = `Found potential allergen: ${analysisResult.detectedAllergens[0].name}`;
                        }
                    }
                    
                    resultPreview.innerHTML = `
                        <div class="quick-result ${statusClass}">
                            <i class="fas fa-${statusIcon}"></i>
                            <p>${statusMessage}</p>
                        </div>
                        <button class="btn btn-text view-details">View detailed analysis</button>
                    `;
                    
                    // Add to the quick analyzer card
                    const cardBody = document.querySelector('.quick-analyzer .card-body');
                    
                    // Hide the form
                    const analyzerForm = document.querySelector('.analyzer-form');
                    analyzerForm.style.display = 'none';
                    
                    // Show the result
                    cardBody.appendChild(resultPreview);
                    
                    // Setup view details button
                    const viewDetailsBtn = document.querySelector('.view-details');
                    viewDetailsBtn.addEventListener('click', function() {
                        // Navigate to analyzer tab
                        document.querySelector('.nav-item[data-target="analyzer"]').click();
                        
                        // Populate analyzer with the same text
                        document.querySelector('.analyzer-input').value = inputText;
                        
                        // Trigger analysis
                        document.querySelector('.analyzer-actions .btn-primary').click();
                    });
                    
                    // Add a reset button
                    const resetBtn = document.createElement('button');
                    resetBtn.className = 'btn btn-text reset-analysis';
                    resetBtn.innerHTML = '<i class="fas fa-redo"></i> New Analysis';
                    resultPreview.appendChild(resetBtn);
                    
                    resetBtn.addEventListener('click', function() {
                        // Remove the result preview
                        cardBody.removeChild(resultPreview);
                        
                        // Show the form again
                        analyzerForm.style.display = 'block';
                        quickAnalyzerInput.value = '';
                        
                        // Reset button state
                        quickAnalyzeBtn.disabled = false;
                        quickAnalyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze';
                    });
                } catch (error) {
                    console.error("Error in quick analysis:", error);
                    showNotification("Error analyzing ingredients. Please try again.", "error");
                    
                    // Reset button state
                    quickAnalyzeBtn.disabled = false;
                    quickAnalyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze';
                }
            } else {
                // If empty, prompt user to enter text
                quickAnalyzerInput.placeholder = 'Please enter ingredients to analyze...';
                quickAnalyzerInput.classList.add('error');
                
                setTimeout(() => {
                    quickAnalyzerInput.classList.remove('error');
                }, 2000);
            }
        });
    }
}

// Helper functions for document generation
// These would be implemented with actual PDF generation in production

// Format date for display
function formatDate(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

// Format reaction for display
function formatReaction(reaction) {
    if (!reaction) return "no reaction";
    
    if (reaction.symptoms && reaction.symptoms.length > 0) {
        return `${reaction.severity} ${reaction.symptoms.join(', ')}`;
    }
    
    return `${reaction.severity} reaction`;
}

// Generate a personalized emergency plan PDF
async function generateEmergencyPlan() {
    // In a production implementation, this would generate a PDF using a library like jsPDF
    const userProfile = DataStore.getUserProfile();
    
    showNotification("Generating your personalized Emergency Action Plan...", "info");
    
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Generating emergency plan for', userProfile);
    
    // Show success notification with mock download
    showNotification("Emergency Action Plan generated! Download started.", "success");
    
    // Simulate PDF download
    // In production, you would use actual PDF generation and download
    const resource = DataStore.getResources().find(r => r.type === "emergency");
    if (resource) {
        const updatedResource = {...resource, downloaded: true, lastDownloaded: new Date().toISOString()};
        const index = DataStore.getResources().findIndex(r => r.type === "emergency");
        DataStore.updateResource(index, updatedResource);
    }
    
    return true;
}

// Generate restaurant chef cards
async function generateRestaurantCards() {
    const userProfile = DataStore.getUserProfile();
    
    showNotification("Generating your personalized Restaurant Chef Cards...", "info");
    
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Generating restaurant cards for', userProfile);
    
    // Show success notification with mock download
    showNotification("Restaurant Chef Cards generated! Download started.", "success");
    
    // Update resource status
    const resource = DataStore.getResources().find(r => r.type === "restaurant");
    if (resource) {
        const updatedResource = {...resource, downloaded: true, lastDownloaded: new Date().toISOString()};
        const index = DataStore.getResources().findIndex(r => r.type === "restaurant");
        DataStore.updateResource(index, updatedResource);
    }
    
    return true;
}

// Generate travel guide
async function generateTravelGuide() {
    const userProfile = DataStore.getUserProfile();
    
    showNotification("Generating your personalized Travel Guide...", "info");
    
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Generating travel guide for', userProfile);
    
    // Show success notification with mock download
    showNotification("Travel Guide generated! Download started.", "success");
    
    // Update resource status
    const resource = DataStore.getResources().find(r => r.type === "travel");
    if (resource) {
        const updatedResource = {...resource, downloaded: true, lastDownloaded: new Date().toISOString()};
        const index = DataStore.getResources().findIndex(r => r.type === "travel");
        DataStore.updateResource(index, updatedResource);
    }
    
    return true;
}

// Handle resource download button clicks
document.addEventListener('click', async function(e) {
    // Handle PDF downloads
    if (e.target.closest('.btn-primary') && e.target.closest('.btn-primary').innerHTML.includes('Download')) {
        e.preventDefault();
        
        const downloadBtn = e.target.closest('.btn-primary');
        const resourceCard = downloadBtn.closest('.resource-card');
        
        if (resourceCard) {
            // Determine which resource is being downloaded
            const resourceHeader = resourceCard.querySelector('h3').textContent;
            
            // Disable button to prevent multiple clicks
            downloadBtn.disabled = true;
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            
            try {
                if (resourceHeader.includes('Emergency')) {
                    await generateEmergencyPlan();
                } else if (resourceHeader.includes('Restaurant')) {
                    await generateRestaurantCards();
                } else if (resourceHeader.includes('Travel')) {
                    await generateTravelGuide();
                } else {
                    // Generic document
                    showNotification("Document generated! Download started.", "success");
                }
            } catch (error) {
                console.error("Error generating document:", error);
                showNotification("Error generating document. Please try again.", "error");
            } finally {
                // Reset button state
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
            }
        }
    }
    
    // Handle emergency button
    if (e.target.closest('.btn-emergency')) {
        e.preventDefault();
        
        // Show emergency plan modal
        showEmergencyPlanModal();
    }
});

// Calendar functionality
function setupJournalCalendar() {
    const calendarDays = document.querySelectorAll('.calendar-day');
    const journalEntries = document.querySelector('.journal-entries');
    
    calendarDays.forEach(day => {
        day.addEventListener('click', function() {
            // Remove selected class from all days
            calendarDays.forEach(d => d.classList.remove('selected-day'));
            
            // Add selected class to clicked day
            this.classList.add('selected-day');
            
            // Get the day number
            const dayNumber = this.textContent.trim();
            
            // Update entries section title
            const entriesTitle = journalEntries.querySelector('h3');
            entriesTitle.textContent = `Entries for March ${dayNumber}, 2025`;
            
            // Simulate loading entries
            const entryList = journalEntries.querySelector('.journal-entry-list');
            entryList.innerHTML = '<div class="loading">Loading entries...</div>';
            
            setTimeout(() => {
                // If it's a day with an indicator, show a reaction
                if (this.classList.contains('alert-day')) {
                    entryList.innerHTML = createEntryHTML(dayNumber, 'alert');
                } else if (this.classList.contains('warning-day')) {
                    entryList.innerHTML = createEntryHTML(dayNumber, 'warning');
                } else {
                    entryList.innerHTML = createEntryHTML(dayNumber, 'safe');
                }
                
                // Scroll to entries
                journalEntries.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 500);
        });
    });
    
    // Initialize calendar view with today's entries
    const today = document.querySelector('.calendar-day.today');
    if (today) {
        today.click();
    }
}

// Create HTML for journal entries based on day and status
function createEntryHTML(day, status) {
    let statusText = 'No Reactions';
    let statusIcon = 'check-circle';
    
    if (status === 'warning') {
        statusText = 'Mild Reaction';
        statusIcon = 'exclamation-triangle';
    } else if (status === 'alert') {
        statusText = 'Severe Reaction';
        statusIcon = 'exclamation-circle';
    }
    
    let symptomsHTML = '';
    if (status !== 'safe') {
        symptomsHTML = `
            <div class="entry-symptoms">
                <h5>Symptoms Reported:</h5>
                <p>${status === 'alert' ? 'Hives, difficulty breathing, swelling' : 'Mild stomach discomfort, itching'}</p>
            </div>
        `;
    }
    
    return `
        <div class="journal-entry">
            <div class="entry-header">
                <h4>March ${day}, 2025</h4>
                <div class="entry-status ${status}">
                    <i class="fas fa-${statusIcon}"></i>
                    <span>${statusText}</span>
                </div>
            </div>
            <div class="entry-meals">
                <div class="meal-item">
                    <div class="meal-time">8:00 AM</div>
                    <div class="meal-details">
                        <h5>Breakfast</h5>
                        <p>${status === 'safe' ? 'Oatmeal with berries' : 'Toast with peanut butter'}</p>
                    </div>
                    <div class="meal-status ${status === 'alert' ? 'alert' : 'safe'}">
                        <i class="fas fa-${status === 'alert' ? 'times' : 'check'}"></i>
                    </div>
                </div>
                <div class="meal-item">
                    <div class="meal-time">12:30 PM</div>
                    <div class="meal-details">
                        <h5>Lunch</h5>
                        <p>${status === 'warning' ? 'Pasta with cream sauce' : 'Grilled chicken salad'}</p>
                    </div>
                    <div class="meal-status ${status === 'warning' ? 'warning' : 'safe'}">
                        <i class="fas fa-${status === 'warning' ? 'exclamation' : 'check'}"></i>
                    </div>
                </div>
                <div class="meal-item">
                    <div class="meal-time">6:45 PM</div>
                    <div class="meal-details">
                        <h5>Dinner</h5>
                        <p>Grilled salmon with vegetables</p>
                    </div>
                    <div class="meal-status safe">
                        <i class="fas fa-check"></i>
                    </div>
                </div>
                ${symptomsHTML}
            </div>
        </div>
    `;
}

// Setup profile management
function setupProfileManagement() {
    // Add new allergen functionality
    const addAllergenBtn = document.querySelector('.allergens-card .btn-sm');
    if (addAllergenBtn) {
        addAllergenBtn.addEventListener('click', function() {
            showAddAllergenModal();
        });
    }
    
    // Add new symptom functionality
    const addSymptomBtn = document.querySelector('.symptoms-card .btn-sm');
    if (addSymptomBtn) {
        addSymptomBtn.addEventListener('click', function() {
            showAddSymptomModal();
        });
    }
    
    // Add new medication functionality
    const addMedicationBtn = document.querySelector('.medications-card .btn-sm');
    if (addMedicationBtn) {
        addMedicationBtn.addEventListener('click', function() {
            showAddMedicationModal();
        });
    }
    
    // Setup allergen edit/delete buttons
    setupAllergenActions();
}

// Show modal to add new allergen
function showAddAllergenModal() {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add New Allergen</h3>
                <button class="close-modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="allergen-name">Allergen Name</label>
                    <input type="text" id="allergen-name" placeholder="Enter allergen name">
                </div>
                <div class="form-group">
                    <label>Severity</label>
                    <div class="severity-options">
                        <label class="severity-option">
                            <input type="radio" name="severity" value="mild">
                            <span class="severity-label mild">Mild</span>
                        </label>
                        <label class="severity-option">
                            <input type="radio" name="severity" value="moderate">
                            <span class="severity-label moderate">Moderate</span>
                        </label>
                        <label class="severity-option">
                            <input type="radio" name="severity" value="severe">
                            <span class="severity-label severe">Severe</span>
                        </label>
                    </div>
                </div>
                <div class="form-group">
                    <label for="allergen-notes">Notes</label>
                    <textarea id="allergen-notes" placeholder="Additional information about this allergen"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary cancel-modal">Cancel</button>
                <button class="btn btn-primary save-allergen">Save</button>
            </div>
        </div>
    `;
    
    // Add modal to the body
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Setup modal close event
    modal.querySelector('.close-modal').addEventListener('click', function() {
        closeModal(modal);
    });
    
    // Setup cancel button
    modal.querySelector('.cancel-modal').addEventListener('click', function() {
        closeModal(modal);
    });
    
    // Setup save button
    modal.querySelector('.save-allergen').addEventListener('click', function() {
        // Get values from the form
        const name = document.getElementById('allergen-name').value;
        const severity = document.querySelector('input[name="severity"]:checked')?.value || 'mild';
        
        if (name.trim()) {
            // Add new allergen to the list
            addAllergenToList(name, severity);
            
            // Close the modal
            closeModal(modal);
            
            // Show success message
            showNotification('Allergen added successfully!', 'success');
        } else {
            // Show validation error
            showFormError(document.getElementById('allergen-name'), 'Please enter an allergen name');
        }
    });
}

// Add new allergen to the list
function addAllergenToList(name, severity) {
    const allergenList = document.querySelector('.allergen-list');
    
    if (allergenList) {
        // Create new allergen item
        const newAllergenItem = document.createElement('li');
        newAllergenItem.className = `allergen-item ${severity}`;
        
        newAllergenItem.innerHTML = `
            <div class="allergen-info">
                <h4>${name}</h4>
                <span class="severity">${severity.charAt(0).toUpperCase() + severity.slice(1)}</span>
            </div>
            <div class="allergen-actions">
                <button class="btn-icon">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add to the list
        allergenList.appendChild(newAllergenItem);
        
        // Setup actions for the new item
        setupAllergenActions();
    }
}

// Setup actions for allergen items (edit/delete)
function setupAllergenActions() {
    // Setup delete buttons
    const deleteButtons = document.querySelectorAll('.allergen-actions .fa-trash');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the allergen item
            const allergenItem = this.closest('.allergen-item');
            const allergenName = allergenItem.querySelector('h4').textContent;
            
            // Show confirmation dialog
            if (confirm(`Are you sure you want to remove ${allergenName} from your allergens?`)) {
                // Remove with animation
                allergenItem.style.opacity = '0';
                allergenItem.style.height = '0';
                allergenItem.style.marginBottom = '0';
                allergenItem.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    allergenItem.remove();
                    showNotification('Allergen removed successfully!', 'success');
                }, 300);
            }
        });
    });
    
    // Setup edit buttons
    const editButtons = document.querySelectorAll('.allergen-actions .fa-edit');
    
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the allergen item
            const allergenItem = this.closest('.allergen-item');
            const allergenName = allergenItem.querySelector('h4').textContent;
            const allergenSeverity = allergenItem.querySelector('.severity').textContent.toLowerCase();
            
            // Show edit modal
            showEditAllergenModal(allergenItem, allergenName, allergenSeverity);
        });
    });
}

// Show modal to edit an allergen
function showEditAllergenModal(allergenItem, name, severity) {
    // Create modal element (similar to add modal but with prefilled values)
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit Allergen</h3>
                <button class="close-modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="edit-allergen-name">Allergen Name</label>
                    <input type="text" id="edit-allergen-name" value="${name}">
                </div>
                <div class="form-group">
                    <label>Severity</label>
                    <div class="severity-options">
                        <label class="severity-option">
                            <input type="radio" name="edit-severity" value="mild" ${severity === 'mild' ? 'checked' : ''}>
                            <span class="severity-label mild">Mild</span>
                        </label>
                        <label class="severity-option">
                            <input type="radio" name="edit-severity" value="moderate" ${severity === 'moderate' ? 'checked' : ''}>
                            <span class="severity-label moderate">Moderate</span>
                        </label>
                        <label class="severity-option">
                            <input type="radio" name="edit-severity" value="severe" ${severity === 'severe' ? 'checked' : ''}>
                            <span class="severity-label severe">Severe</span>
                        </label>
                    </div>
                </div>
                <div class="form-group">
                    <label for="edit-allergen-notes">Notes</label>
                    <textarea id="edit-allergen-notes" placeholder="Additional information about this allergen"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary cancel-modal">Cancel</button>
                <button class="btn btn-primary update-allergen">Update</button>
            </div>
        </div>
    `;
    
    // Add modal to the body
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Setup modal close event
    modal.querySelector('.close-modal').addEventListener('click', function() {
        closeModal(modal);
    });
    
    // Setup cancel button
    modal.querySelector('.cancel-modal').addEventListener('click', function() {
        closeModal(modal);
    });
    
    // Setup update button
    modal.querySelector('.update-allergen').addEventListener('click', function() {
        // Get values from the form
        const newName = document.getElementById('edit-allergen-name').value;
        const newSeverity = document.querySelector('input[name="edit-severity"]:checked')?.value || 'mild';
        
        if (newName.trim()) {
            // Update allergen item
            allergenItem.querySelector('h4').textContent = newName;
            allergenItem.querySelector('.severity').textContent = newSeverity.charAt(0).toUpperCase() + newSeverity.slice(1);
            
            // Update item class
            allergenItem.classList.remove('mild', 'moderate', 'severe');
            allergenItem.classList.add(newSeverity);
            
            // Close the modal
            closeModal(modal);
            
            // Show success message
            showNotification('Allergen updated successfully!', 'success');
        } else {
            // Show validation error
            showFormError(document.getElementById('edit-allergen-name'), 'Please enter an allergen name');
        }
    });
}

// Close modal with animation
function closeModal(modal) {
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.remove();
    }, 300);
}

// Show form validation error
function showFormError(inputElement, message) {
    // Add error class to input
    inputElement.classList.add('error');
    
    // Create error message if it doesn't exist
    let errorMessage = inputElement.nextElementSibling;
    if (!errorMessage || !errorMessage.classList.contains('error-message')) {
        errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        inputElement.parentNode.insertBefore(errorMessage, inputElement.nextSibling);
    }
    
    // Update error message text
    errorMessage.textContent = message;
    
    // Focus the input
    inputElement.focus();
    
    // Remove error after 3 seconds
    setTimeout(() => {
        inputElement.classList.remove('error');
        errorMessage.remove();
    }, 3000);
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Add icon based on type
    let icon = 'info-circle';
    
    if (type === 'success') {
        icon = 'check-circle';
    } else if (type === 'warning') {
        icon = 'exclamation-triangle';
    } else if (type === 'error') {
        icon = 'times-circle';
    }
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
        <button class="close-notification">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add notification container if it doesn't exist
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Add notification to container
    notificationContainer.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Setup close button
    notification.querySelector('.close-notification').addEventListener('click', function() {
        notification.classList.remove('show');
        
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Save data to local storage
function saveUserData() {
    // Collect user profile data
    const userData = {
        allergies: [],
        symptoms: [],
        medications: [],
        journalEntries: []
    };
    
    // Collect allergies
    document.querySelectorAll('.allergen-item').forEach(item => {
        userData.allergies.push({
            name: item.querySelector('h4').textContent,
            severity: item.querySelector('.severity').textContent.toLowerCase()
        });
    });
    
    // Save to localStorage
    localStorage.setItem('allergyCompassData', JSON.stringify(userData));
}

// Load data from local storage
function loadUserData() {
    const savedData = localStorage.getItem('allergyCompassData');
    
    if (savedData) {
        const userData = JSON.parse(savedData);
        
        // Load allergies
        const allergenList = document.querySelector('.allergen-list');
        if (allergenList && userData.allergies) {
            allergenList.innerHTML = '';
            
            userData.allergies.forEach(allergen => {
                addAllergenToList(allergen.name, allergen.severity);
            });
        }
    }
}

// Initialize all the additional features
document.addEventListener('DOMContentLoaded', function() {
    // Initialize calendar functionality
    setupJournalCalendar();
    
    // Initialize profile management
    setupProfileManagement();
    
    // Load user data
    loadUserData();
    
    // Setup auto-save
    setInterval(saveUserData, 30000); // Save every 30 seconds
    
    // Add CSS for new components
    addModalStyles();
});

// Add necessary CSS for modals and notifications
function addModalStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Modal Styles */
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        
        .modal.show {
            opacity: 1;
            visibility: visible;
        }
        
        .modal-content {
            background-color: white;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            transform: translateY(20px);
            transition: transform 0.3s ease;
        }
        
        .modal.show .modal-content {
            transform: translateY(0);
        }
        
        .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .modal-header h3 {
            margin: 0;
            font-size: 1.25rem;
        }
        
        .close-modal {
            background: transparent;
            border: none;
            font-size: 1.25rem;
            color: #6b7280;
            cursor: pointer;
        }
        
        .modal-body {
            padding: 20px;
        }
        
        .modal-footer {
            padding: 16px 20px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        }
        
        /* Form Styles */
        .form-group {
            margin-bottom: 16px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            font-family: inherit;
            font-size: 0.95rem;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #3b82f6;
        }
        
        .form-group input.error,
        .form-group textarea.error {
            border-color: #ef4444;
        }
        
        .error-message {
            color: #ef4444;
            font-size: 0.85rem;
            margin-top: 4px;
        }
        
        .form-group textarea {
            resize: vertical;
            min-height: 100px;
        }
        
        .severity-options {
            display: flex;
            gap: 12px;
        }
        
        .severity-option {
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
        }
        
        .severity-label {
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        
        .severity-label.mild {
            background-color: rgba(59, 130, 246, 0.1);
            color: #3b82f6;
        }
        
        .severity-label.moderate {
            background-color: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
        }
        
        .severity-label.severe {
            background-color: rgba(239, 68, 68, 0.1);
            color: #ef4444;
        }
        
        /* Notification Styles */
        .notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 350px;
        }
        
        .notification {
            background-color: white;
            border-radius: 8px;
            padding: 12px 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateX(120%);
            transition: transform 0.3s ease;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification i:first-child {
            font-size: 1.25rem;
        }
        
        .notification.info i:first-child {
            color: #3b82f6;
        }
        
        .notification.success i:first-child {
            color: #10b981;
        }
        
        .notification.warning i:first-child {
            color: #f59e0b;
        }
        
        .notification.error i:first-child {
            color: #ef4444;
        }
        
        .notification span {
            flex: 1;
        }
        
        .close-notification {
            background: transparent;
            border: none;
            color: #6b7280;
            cursor: pointer;
            font-size: 0.9rem;
        }
        
        /* Calendar Day Selected Style */
        .calendar-day.selected-day {
            border: 2px solid #3b82f6;
        }
        
        /* Loading Indicator */
        .loading {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-style: italic;
        }
    `;
    
    document.head.appendChild(styleElement);
}