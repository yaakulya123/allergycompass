// GPT API Service for AllergyCompass

// Configuration - replace with your actual API key and settings
const GPT_CONFIG = {
    apiKey: "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", // This will be a placeholder
    model: "gpt-4", // Or whichever model you're using
    endpoint: "https://api.openai.com/v1/chat/completions"
};

// Base allergen knowledge for RAG approach
const ALLERGEN_KNOWLEDGE_BASE = {
    peanuts: {
        aliases: ["arachis hypogaea", "peanut oil", "groundnut", "arachis oil", "beer nuts"],
        crossReactivity: ["tree nuts", "legumes", "soy"],
        hiddenSources: ["marzipan", "nougat", "some sauces", "artificial nuts", "many Asian dishes"]
    },
    shellfish: {
        aliases: ["crustaceans", "prawns", "shrimp", "crab", "lobster", "crayfish"],
        crossReactivity: ["mollusks", "fish"],
        hiddenSources: ["fish sauce", "seafood flavoring", "surimi", "bouillabaisse", "paella"]
    },
    dairy: {
        aliases: ["milk", "cheese", "butter", "cream", "yogurt", "whey", "casein", "lactose"],
        crossReactivity: [],
        hiddenSources: ["chocolate", "caramel", "nougat", "some breads", "many sauces"]
    },
    gluten: {
        aliases: ["wheat", "rye", "barley", "malt", "brewer's yeast", "triticale"],
        crossReactivity: ["oats (due to contamination)"],
        hiddenSources: ["soy sauce", "some dressings", "imitation crab", "processed meats", "some medications"]
    }
};

// Prompt templates for GPT
const PROMPT_TEMPLATES = {
    ingredientAnalysis: `
You are an expert allergist and nutritionist analyzing food ingredients for a person with specific allergies.

User's allergen profile:
{allergenProfile}

Analyze the following ingredients list to identify any ingredients that would cause an allergic reaction for this person:
{ingredientText}

Please respond in JSON format with the following structure:
{
  "safe": boolean,
  "detectedAllergens": [
    {
      "name": "Allergen name",
      "foundAs": "How it appears in the ingredient list",
      "severity": "mild/moderate/severe (based on user profile)",
      "lineNumber": number
    }
  ],
  "hiddenIngredients": [
    {
      "name": "Ingredient name",
      "contains": "Allergen it contains"
    }
  ],
  "alternatives": [
    {
      "original": "Original ingredient",
      "alternatives": ["Alternative 1", "Alternative 2", "Alternative 3"]
    }
  ]
}

Be thorough in identifying both direct allergens and hidden sources. For each detected allergen, suggest 2-3 safe alternatives.
    `,
    
    menuAnalysis: `
You are an expert allergist helping a person with allergies navigate a restaurant menu safely.

User's allergen profile:
{allergenProfile}

Analyze the following menu items to identify any dishes that would likely cause an allergic reaction:
{menuText}

Please respond in JSON format with the following structure:
{
  "safe": boolean,
  "riskyItems": [
    {
      "name": "Menu item name",
      "allergens": ["Allergen 1", "Allergen 2"],
      "severity": "mild/moderate/severe (based on user profile)"
    }
  ],
  "safeOptions": ["Safe menu item 1", "Safe menu item 2"],
  "questions": ["Question to ask server 1", "Question to ask server 2"]
}

Include specific questions the person should ask their server to ensure food safety.
    `,
    
    patternAnalysis: `
You are an expert allergist analyzing a patient's food and symptom journal to identify patterns.

User's allergen profile:
{allergenProfile}

Review the following journal entries:
{journalEntries}

Please respond in JSON format with the following structure:
{
  "patterns": ["Observed pattern 1", "Observed pattern 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}

Focus on identifying connections between specific foods, times of day, stress levels, or combinations of ingredients and allergy symptoms. Provide actionable recommendations based on these patterns.
    `
};

/**
 * Format user allergen profile for GPT prompts
 * @param {Array} allergens - User's allergens
 * @returns {String} Formatted allergen profile
 */
function formatAllergenProfile(allergens) {
    if (!allergens || allergens.length === 0) {
        return "No known allergies.";
    }
    
    return allergens.map(allergen => 
        `- ${allergen.name}: ${allergen.severity} allergy`
    ).join('\n');
}

// The GPT Service object
const GPTService = {
    /**
     * Analyze ingredient list for allergens based on user profile
     * @param {string} ingredientText - The raw ingredient text to analyze
     * @param {Array} userAllergens - User's allergen profile
     * @returns {Promise} Analysis result
     */
    analyzeIngredients: async function(ingredientText, userAllergens) {
        try {
            const formattedAllergens = formatAllergenProfile(userAllergens);
            const prompt = PROMPT_TEMPLATES.ingredientAnalysis
                .replace('{allergenProfile}', formattedAllergens)
                .replace('{ingredientText}', ingredientText);
            
            // PLACEHOLDER: Replace with actual GPT API call
            // const response = await this.callGPTAPI(prompt);
            // return JSON.parse(response);
            
            console.log("Would send to GPT API:", prompt);
            // For prototype, return mock response
            return this.mockAnalyzeResponse(ingredientText, userAllergens);
        } catch (error) {
            console.error("Error analyzing ingredients:", error);
            throw error;
        }
    },
    
    /**
     * Analyze restaurant menu for allergens
     * @param {string} menuText - The menu text to analyze
     * @param {Array} userAllergens - User's allergen profile
     * @returns {Promise} Analysis result
     */
    analyzeMenu: async function(menuText, userAllergens) {
        try {
            const formattedAllergens = formatAllergenProfile(userAllergens);
            const prompt = PROMPT_TEMPLATES.menuAnalysis
                .replace('{allergenProfile}', formattedAllergens)
                .replace('{menuText}', menuText);
            
            // PLACEHOLDER: Replace with actual GPT API call
            console.log("Would send to GPT API:", prompt);
            // For prototype, return mock response
            return this.mockMenuAnalysis(menuText, userAllergens);
        } catch (error) {
            console.error("Error analyzing menu:", error);
            throw error;
        }
    },
    
    /**
     * Analyze user's symptom journal for patterns
     * @param {Array} journalEntries - User's symptom journal entries
     * @param {Array} userAllergens - User's allergen profile
     * @returns {Promise} Analysis result with patterns and recommendations
     */
    analyzeSymptomPatterns: async function(journalEntries, userAllergens) {
        try {
            const formattedAllergens = formatAllergenProfile(userAllergens);
            const formattedEntries = JSON.stringify(journalEntries, null, 2);
            
            const prompt = PROMPT_TEMPLATES.patternAnalysis
                .replace('{allergenProfile}', formattedAllergens)
                .replace('{journalEntries}', formattedEntries);
            
            // PLACEHOLDER: Replace with actual GPT API call
            console.log("Would send to GPT API:", prompt);
            // For prototype, return mock response
            return this.mockPatternAnalysis(journalEntries);
        } catch (error) {
            console.error("Error analyzing symptom patterns:", error);
            throw error;
        }
    },
    
    /**
     * Call the GPT API - this is the function you would implement with your API key
     * @param {string} prompt - The prompt to send to GPT
     * @returns {Promise} GPT response
     */
    callGPTAPI: async function(prompt) {
        // IMPORTANT: Replace this with actual API implementation
        // This is a placeholder for the actual API call
        
        /* Example implementation:
        
        const response = await fetch(GPT_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GPT_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: GPT_CONFIG.model,
                messages: [
                    {
                        role: "system",
                        content: "You are an expert allergist and nutritionist."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 1000
            })
        });
        
        const data = await response.json();
        return data.choices[0].message.content;
        */
        
        // For a hackathon prototype, this mock response is sufficient
        console.log("Mock GPT API called with prompt:", prompt);
        return "Mock GPT response - implement actual API call";
    },
    
    // Mock functions for prototype - these will be replaced with real GPT responses
    mockAnalyzeResponse: function(ingredientText, userAllergens) {
        const detectedAllergens = [];
        const hiddenIngredients = [];
        const alternatives = [];
        
        // Check for common allergens in the text
        userAllergens.forEach(allergen => {
            const allergenInfo = ALLERGEN_KNOWLEDGE_BASE[allergen.name.toLowerCase()];
            
            if (allergenInfo) {
                // Check for direct mentions
                if (ingredientText.toLowerCase().includes(allergen.name.toLowerCase())) {
                    detectedAllergens.push({
                        name: allergen.name,
                        foundAs: allergen.name.toLowerCase(),
                        severity: allergen.severity,
                        lineNumber: 1
                    });
                }
                
                // Check for aliases
                allergenInfo.aliases.forEach(alias => {
                    if (ingredientText.toLowerCase().includes(alias.toLowerCase())) {
                        detectedAllergens.push({
                            name: allergen.name,
                            foundAs: alias,
                            severity: allergen.severity,
                            lineNumber: 1
                        });
                        
                        hiddenIngredients.push({
                            name: alias,
                            contains: allergen.name
                        });
                    }
                });
                
                // Add alternatives if allergen detected
                if (detectedAllergens.some(detected => detected.name === allergen.name)) {
                    alternatives.push({
                        original: allergen.name,
                        alternatives: this.getAllergenAlternatives(allergen.name)
                    });
                }
            }
        });
        
        return {
            safe: detectedAllergens.length === 0,
            detectedAllergens,
            hiddenIngredients,
            alternatives
        };
    },
    
    mockMenuAnalysis: function(menuText, userAllergens) {
        const riskyItems = [];
        const safeOptions = ["Grilled Chicken (no sauce)", "Garden Salad (oil and vinegar dressing)", "Steamed Vegetables"];
        const questions = ["Is there cross-contamination in the kitchen?", "Are any marinades used that might contain allergens?"];
        
        userAllergens.forEach(allergen => {
            const allergenInfo = ALLERGEN_KNOWLEDGE_BASE[allergen.name.toLowerCase()];
            
            if (allergenInfo) {
                if (menuText.toLowerCase().includes("caesar salad") && 
                    (allergen.name.toLowerCase() === "dairy" || allergen.name.toLowerCase() === "eggs")) {
                    riskyItems.push({
                        name: "Caesar Salad",
                        allergens: [allergen.name],
                        severity: allergen.severity
                    });
                }
                
                if (menuText.toLowerCase().includes("bread") && allergen.name.toLowerCase() === "gluten") {
                    riskyItems.push({
                        name: "Any dishes with bread",
                        allergens: [allergen.name],
                        severity: allergen.severity
                    });
                }
                
                if (menuText.toLowerCase().includes("shrimp") && allergen.name.toLowerCase() === "shellfish") {
                    riskyItems.push({
                        name: "Shrimp Scampi",
                        allergens: [allergen.name],
                        severity: allergen.severity
                    });
                }
            }
        });
        
        return {
            safe: riskyItems.length === 0,
            riskyItems,
            safeOptions,
            questions
        };
    },
    
    mockPatternAnalysis: function(journalEntries) {
        return {
            patterns: [
                "Dairy reactions appear to be more severe in the evening",
                "Symptoms typically appear within 30 minutes of consuming trigger foods",
                "Stress seems to intensify allergic reactions"
            ],
            recommendations: [
                "Consider avoiding dairy products after 4pm",
                "Keep emergency medication with you, especially when dining out",
                "Practice stress management techniques before meals",
                "Keep a more detailed food journal including time of day and stress levels"
            ]
        };
    },
    
    getAllergenAlternatives: function(allergenName) {
        const alternatives = {
            "peanuts": ["Sunflower seed butter", "Almond butter", "Tahini"],
            "shellfish": ["Hearts of palm", "Jackfruit", "King oyster mushrooms"],
            "dairy": ["Almond milk", "Coconut yogurt", "Nutritional yeast (for cheese flavor)"],
            "gluten": ["Rice flour", "Almond flour", "Certified gluten-free oats"]
        };
        
        return alternatives[allergenName.toLowerCase()] || ["Alternative 1", "Alternative 2", "Alternative 3"];
    }
};

export default GPTService;