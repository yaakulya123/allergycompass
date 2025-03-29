// Local Data Storage Service for AllergyCompass
// Handles persistent storage of user data using localStorage

const STORAGE_KEYS = {
    USER_PROFILE: 'allergyCompass_userProfile',
    JOURNAL_ENTRIES: 'allergyCompass_journalEntries',
    SAVED_RESOURCES: 'allergyCompass_savedResources',
    APP_SETTINGS: 'allergyCompass_settings'
};

// Default data structures
const DEFAULT_DATA = {
    userProfile: {
        name: "Jane Doe",
        allergies: [
            { name: "Peanuts", severity: "severe" },
            { name: "Shellfish", severity: "moderate" },
            { name: "Dairy", severity: "mild" },
            { name: "Gluten", severity: "mild" }
        ],
        symptoms: [
            { name: "Hives", allergens: ["Peanuts", "Shellfish"] },
            { name: "Swelling", allergens: ["Peanuts"] },
            { name: "Stomach Pain", allergens: ["Dairy", "Gluten"] },
            { name: "Itchy Throat", allergens: ["Shellfish"] }
        ],
        medications: [
            { name: "Epinephrine Auto-Injector", notes: "For severe reactions" },
            { name: "Antihistamine", notes: "For mild allergic reactions" },
            { name: "Corticosteroid Cream", notes: "For skin reactions" }
        ],
        emergencyContacts: [
            { name: "Dr. Smith", phone: "555-123-4567", relation: "Allergist" }
        ]
    },
    journalEntries: [
        {
            date: "2025-03-29",
            meals: [
                { time: "07:30", name: "Breakfast", items: "Oatmeal with berries", reactions: null }
            ],
            reactions: null,
            notes: "No reactions today"
        },
        {
            date: "2025-03-28",
            meals: [
                { time: "08:00", name: "Breakfast", items: "Toast with avocado", reactions: null },
                { 
                    time: "13:00", 
                    name: "Lunch", 
                    items: "Pasta with tomato sauce", 
                    reactions: { severity: "mild", symptoms: ["Stomach Pain"] }
                }
            ],
            reactions: {
                severity: "mild",
                symptoms: ["Stomach Pain"],
                duration: "1 hour",
                notes: "Mild stomach discomfort after lunch"
            },
            notes: "Might be cross-contamination in the pasta sauce"
        }
    ],
    savedResources: [
        { type: "emergency", name: "Emergency Action Plan", downloaded: false },
        { type: "restaurant", name: "Restaurant Chef Cards", downloaded: false },
        { type: "travel", name: "Travel Guide", downloaded: false },
        { type: "education", name: "Allergy Education", accessed: false }
    ],
    settings: {
        notifications: true,
        emergencyAccess: true,
        dataSharing: false,
        theme: "light"
    }
};

const DataStore = {
    /**
     * Initialize data store with default values if not already set
     */
    init: function() {
        // Check if data exists in localStorage, if not set defaults
        if (!localStorage.getItem(STORAGE_KEYS.USER_PROFILE)) {
            this.saveUserProfile(DEFAULT_DATA.userProfile);
        }
        
        if (!localStorage.getItem(STORAGE_KEYS.JOURNAL_ENTRIES)) {
            this.saveJournalEntries(DEFAULT_DATA.journalEntries);
        }
        
        if (!localStorage.getItem(STORAGE_KEYS.SAVED_RESOURCES)) {
            this.saveResources(DEFAULT_DATA.savedResources);
        }
        
        if (!localStorage.getItem(STORAGE_KEYS.APP_SETTINGS)) {
            this.saveSettings(DEFAULT_DATA.settings);
        }
        
        console.log("DataStore initialized");
    },
    
    /**
     * Get user profile data
     * @returns {Object} User profile
     */
    getUserProfile: function() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
            return data ? JSON.parse(data) : DEFAULT_DATA.userProfile;
        } catch (error) {
            console.error("Error getting user profile:", error);
            return DEFAULT_DATA.userProfile;
        }
    },
    
    /**
     * Save user profile data
     * @param {Object} profile - User profile data
     */
    saveUserProfile: function(profile) {
        try {
            localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
        } catch (error) {
            console.error("Error saving user profile:", error);
        }
    },
    
    /**
     * Get user's allergens
     * @returns {Array} User allergens
     */
    getAllergens: function() {
        const profile = this.getUserProfile();
        return profile.allergies || [];
    },
    
    /**
     * Add new allergen
     * @param {Object} allergen - Allergen to add
     */
    addAllergen: function(allergen) {
        const profile = this.getUserProfile();
        profile.allergies = profile.allergies || [];
        profile.allergies.push(allergen);
        this.saveUserProfile(profile);
    },
    
    /**
     * Update existing allergen
     * @param {number} index - Index of allergen to update
     * @param {Object} allergen - Updated allergen data
     */
    updateAllergen: function(index, allergen) {
        const profile = this.getUserProfile();
        if (profile.allergies && index >= 0 && index < profile.allergies.length) {
            profile.allergies[index] = allergen;
            this.saveUserProfile(profile);
        }
    },
    
    /**
     * Remove allergen
     * @param {number} index - Index of allergen to remove
     */
    removeAllergen: function(index) {
        const profile = this.getUserProfile();
        if (profile.allergies && index >= 0 && index < profile.allergies.length) {
            profile.allergies.splice(index, 1);
            this.saveUserProfile(profile);
        }
    },
    
    /**
     * Get all journal entries
     * @returns {Array} Journal entries
     */
    getJournalEntries: function() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.JOURNAL_ENTRIES);
            return data ? JSON.parse(data) : DEFAULT_DATA.journalEntries;
        } catch (error) {
            console.error("Error getting journal entries:", error);
            return DEFAULT_DATA.journalEntries;
        }
    },
    
    /**
     * Get journal entries for a specific date
     * @param {string} date - Date string (YYYY-MM-DD)
     * @returns {Object|null} Journal entry for date or null
     */
    getJournalEntryByDate: function(date) {
        const entries = this.getJournalEntries();
        return entries.find(entry => entry.date === date) || null;
    },
    
    /**
     * Save all journal entries
     * @param {Array} entries - All journal entries
     */
    saveJournalEntries: function(entries) {
        try {
            localStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(entries));
        } catch (error) {
            console.error("Error saving journal entries:", error);
        }
    },
    
    /**
     * Add new journal entry
     * @param {Object} entry - New journal entry
     */
    addJournalEntry: function(entry) {
        const entries = this.getJournalEntries();
        // Check if entry for this date already exists
        const existingIndex = entries.findIndex(e => e.date === entry.date);
        
        if (existingIndex >= 0) {
            // Update existing entry
            entries[existingIndex] = entry;
        } else {
            // Add new entry
            entries.push(entry);
        }
        
        this.saveJournalEntries(entries);
    },
    
    /**
     * Get app settings
     * @returns {Object} App settings
     */
    getSettings: function() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
            return data ? JSON.parse(data) : DEFAULT_DATA.settings;
        } catch (error) {
            console.error("Error getting app settings:", error);
            return DEFAULT_DATA.settings;
        }
    },
    
    /**
     * Save app settings
     * @param {Object} settings - App settings
     */
    saveSettings: function(settings) {
        try {
            localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
        } catch (error) {
            console.error("Error saving app settings:", error);
        }
    },
    
    /**
     * Get saved resources
     * @returns {Array} Saved resources
     */
    getResources: function() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SAVED_RESOURCES);
            return data ? JSON.parse(data) : DEFAULT_DATA.savedResources;
        } catch (error) {
            console.error("Error getting saved resources:", error);
            return DEFAULT_DATA.savedResources;
        }
    },
    
    /**
     * Save resources
     * @param {Array} resources - Resources data
     */
    saveResources: function(resources) {
        try {
            localStorage.setItem(STORAGE_KEYS.SAVED_RESOURCES, JSON.stringify(resources));
        } catch (error) {
            console.error("Error saving resources:", error);
        }
    },
    
    /**
     * Update resource status
     * @param {number} index - Index of resource
     * @param {Object} updates - Updates to apply
     */
    updateResource: function(index, updates) {
        const resources = this.getResources();
        if (resources && index >= 0 && index < resources.length) {
            resources[index] = {...resources[index], ...updates};
            this.saveResources(resources);
        }
    },
    
    /**
     * Clear all stored data (for testing or user account reset)
     */
    clearAllData: function() {
        localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
        localStorage.removeItem(STORAGE_KEYS.JOURNAL_ENTRIES);
        localStorage.removeItem(STORAGE_KEYS.SAVED_RESOURCES);
        localStorage.removeItem(STORAGE_KEYS.APP_SETTINGS);
        console.log("All data cleared");
    }
};

export default DataStore;