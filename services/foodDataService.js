// Food Data Service for AllergyCompass
// Interfaces with multiple free food-related APIs

const FOOD_API_CONFIG = {
    // Open Food Facts API (no API key required)
    openFoodFactsUrl: "https://world.openfoodfacts.org/api/v0/product/",
    openFoodFactsSearch: "https://world.openfoodfacts.org/cgi/search.pl",
    
    // TheMealDB API endpoints (free tier)
    mealDbSearch: "https://www.themealdb.com/api/json/v1/1/search.php",
    mealDbLookup: "https://www.themealdb.com/api/json/v1/1/lookup.php",
    mealDbFilter: "https://www.themealdb.com/api/json/v1/1/filter.php",
    
    // Fruityvice API (no API key required)
    fruityviceUrl: "https://www.fruityvice.com/api/fruit"
};

const FoodDataService = {
    /**
     * Get detailed product information by barcode
     * @param {string} barcode - Product barcode
     * @returns {Promise} Product information
     */
    getProductByBarcode: async function(barcode) {
        try {
            const response = await fetch(`${FOOD_API_CONFIG.openFoodFactsUrl}${barcode}.json`);
            const data = await response.json();
            
            if (data.status === 1) {
                return {
                    name: data.product.product_name,
                    ingredients: data.product.ingredients_text,
                    allergens: data.product.allergens_tags,
                    image: data.product.image_url,
                    nutriments: data.product.nutriments
                };
            } else {
                throw new Error("Product not found");
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            throw error;
        }
    },
    
    /**
     * Search for products by name
     * @param {string} query - Product name to search
     * @returns {Promise} Search results
     */
    searchProducts: async function(query) {
        try {
            const response = await fetch(`${FOOD_API_CONFIG.openFoodFactsSearch}?search_terms=${encodeURIComponent(query)}&json=1`);
            const data = await response.json();
            
            return data.products.map(product => ({
                id: product.id,
                name: product.product_name,
                brand: product.brands,
                image: product.image_url,
                ingredients: product.ingredients_text
            }));
        } catch (error) {
            console.error("Error searching products:", error);
            throw error;
        }
    },
    
    /**
     * Find substitutes for allergenic ingredients
     * @param {string} ingredient - Ingredient to substitute
     * @param {Array} allergies - User allergies to avoid
     * @returns {Promise} Substitute suggestions
     */
    findSubstitutes: async function(ingredient, allergies) {
        try {
            // For hackathon purposes, we'll use our database of common substitutes
            return this.mockSubstitutes(ingredient, allergies);
        } catch (error) {
            console.error("Error finding substitutes:", error);
            throw error;
        }
    },
    
    /**
     * Search for recipes by name
     * @param {string} query - Search term
     * @returns {Promise} List of recipes
     */
    searchRecipes: async function(query) {
        try {
            // Search recipes in TheMealDB by name
            const response = await fetch(`${FOOD_API_CONFIG.mealDbSearch}?s=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (!data.meals) {
                return [];
            }
            
            return data.meals.map(meal => ({
                id: meal.idMeal,
                name: meal.strMeal,
                category: meal.strCategory,
                area: meal.strArea,
                instructions: meal.strInstructions,
                image: meal.strMealThumb,
                tags: meal.strTags ? meal.strTags.split(',') : [],
                ingredients: this.extractIngredients(meal)
            }));
        } catch (error) {
            console.error("Error searching recipes:", error);
            return this.mockRecipes(query);
        }
    },
    
    /**
     * Find recipes by ingredient
     * @param {string} ingredient - Main ingredient
     * @returns {Promise} List of recipes
     */
    findRecipesByIngredient: async function(ingredient) {
        try {
            // Filter recipes in TheMealDB by ingredient
            const response = await fetch(`${FOOD_API_CONFIG.mealDbFilter}?i=${encodeURIComponent(ingredient)}`);
            const data = await response.json();
            
            if (!data.meals) {
                return [];
            }
            
            // The filter endpoint only returns basic info, so get full details
            const recipes = [];
            
            // Limit to 5 recipes for hackathon performance
            const recipeLimit = Math.min(data.meals.length, 5);
            
            for (let i = 0; i < recipeLimit; i++) {
                try {
                    const details = await this.getRecipeDetails(data.meals[i].idMeal);
                    recipes.push(details);
                } catch (err) {
                    console.error(`Error fetching details for recipe ${data.meals[i].idMeal}:`, err);
                }
            }
            
            return recipes;
        } catch (error) {
            console.error("Error finding recipes by ingredient:", error);
            return this.mockRecipes(ingredient);
        }
    },
    
    /**
     * Find safe recipes that don't contain user's allergens
     * @param {string} query - Search term
     * @param {Array} allergies - User allergies to avoid
     * @returns {Promise} List of safe recipes
     */
    findSafeRecipes: async function(query, allergies) {
        try {
            // First search for recipes
            const recipes = await this.searchRecipes(query);
            
            // Filter out recipes containing allergens
            const safeRecipes = recipes.filter(recipe => {
                // Check if recipe contains any allergens
                return !allergies.some(allergen => 
                    this.recipeContainsAllergen(recipe, allergen.name)
                );
            });
            
            return safeRecipes;
        } catch (error) {
            console.error("Error finding safe recipes:", error);
            return this.mockSafeRecipes(query, allergies);
        }
    },
    
    /**
     * Get detailed recipe information
     * @param {string} id - Recipe ID
     * @returns {Promise} Recipe details
     */
    getRecipeDetails: async function(id) {
        try {
            const response = await fetch(`${FOOD_API_CONFIG.mealDbLookup}?i=${id}`);
            const data = await response.json();
            
            if (data.meals && data.meals.length > 0) {
                const meal = data.meals[0];
                return {
                    id: meal.idMeal,
                    name: meal.strMeal,
                    category: meal.strCategory,
                    area: meal.strArea,
                    instructions: meal.strInstructions,
                    image: meal.strMealThumb,
                    tags: meal.strTags ? meal.strTags.split(',') : [],
                    ingredients: this.extractIngredients(meal)
                };
            } else {
                throw new Error("Recipe not found");
            }
        } catch (error) {
            console.error("Error fetching recipe details:", error);
            throw error;
        }
    },
    
    /**
     * Extract ingredients from TheMealDB meal object
     * @param {Object} meal - TheMealDB meal object
     * @returns {Array} List of ingredients with measures
     */
    extractIngredients: function(meal) {
        const ingredients = [];
        
        // TheMealDB stores ingredients in strIngredient1, strIngredient2, etc.
        // and measures in strMeasure1, strMeasure2, etc.
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            
            if (ingredient && ingredient.trim()) {
                ingredients.push({
                    name: ingredient,
                    measure: measure || ''
                });
            }
        }
        
        return ingredients;
    },
    
    /**
     * Check if recipe contains an allergen
     * @param {Object} recipe - Recipe details
     * @param {string} allergen - Allergen to check for
     * @returns {boolean} True if allergen found
     */
    recipeContainsAllergen: function(recipe, allergen) {
        const allergenLower = allergen.toLowerCase();
        
        // Check in ingredients
        if (recipe.ingredients) {
            for (const ingredient of recipe.ingredients) {
                if (ingredient.name.toLowerCase().includes(allergenLower)) {
                    return true;
                }
            }
        }
        
        // Also check in instructions
        if (recipe.instructions && recipe.instructions.toLowerCase().includes(allergenLower)) {
            return true;
        }
        
        // Check in name
        if (recipe.name && recipe.name.toLowerCase().includes(allergenLower)) {
            return true;
        }
        
        return false;
    },
    
    /**
     * Get nutritional information about a specific fruit
     * @param {string} fruit - Fruit name
     * @returns {Promise} Nutritional information
     */
    getFruitInfo: async function(fruit) {
        try {
            const response = await fetch(`${FOOD_API_CONFIG.fruityviceUrl}/${encodeURIComponent(fruit)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            return {
                name: data.name,
                family: data.family,
                genus: data.genus,
                nutritions: data.nutritions
            };
        } catch (error) {
            console.error("Error fetching fruit info:", error);
            return null;
        }
    },
    
    /**
     * Get information about all fruits
     * @returns {Promise} List of all fruits with nutrition data
     */
    getAllFruits: async function() {
        try {
            const response = await fetch(`${FOOD_API_CONFIG.fruityviceUrl}/all`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            return data.map(fruit => ({
                name: fruit.name,
                family: fruit.family,
                genus: fruit.genus,
                nutritions: fruit.nutritions
            }));
        } catch (error) {
            console.error("Error fetching all fruits:", error);
            return [];
        }
    },
    
    /**
     * Find fruits safe for user's allergies
     * @param {Array} allergies - User allergies to avoid
     * @returns {Promise} List of safe fruits
     */
    findSafeFruits: async function(allergies) {
        try {
            const allFruits = await this.getAllFruits();
            
            // Filter fruits that might trigger allergies
            // Note: This is a simplistic approach for the hackathon
            return allFruits.filter(fruit => 
                !allergies.some(allergy => 
                    fruit.name.toLowerCase().includes(allergy.name.toLowerCase())
                )
            );
        } catch (error) {
            console.error("Error finding safe fruits:", error);
            return [];
        }
    },
    
    /**
     * Scan photo of ingredient list (mock function - would use OCR in production)
     * @param {File} imageFile - Image file to analyze
     * @returns {Promise} Extracted text
     */
    scanIngredientImage: async function(imageFile) {
        try {
            // PLACEHOLDER: In a real implementation, this would use an OCR service
            // like Google Cloud Vision, Tesseract.js, or a similar API
            
            console.log("Would scan image:", imageFile.name);
            
            // For prototype, return mock result
            return "Water, Sugar, Wheat Flour, Vegetable Oil (Contains One or More of the Following: Canola, Soybean, Cottonseed), Eggs, Milk, Salt, Natural Flavors.";
        } catch (error) {
            console.error("Error scanning image:", error);
            throw error;
        }
    },
    
    // Mock functions for prototype development
    mockSubstitutes: function(ingredient, allergies) {
        const commonSubstitutes = {
            "milk": ["almond milk", "soy milk", "oat milk", "coconut milk"],
            "eggs": ["flax eggs", "apple sauce", "silken tofu", "banana"],
            "wheat flour": ["almond flour", "coconut flour", "rice flour", "gluten-free flour blend"],
            "peanut butter": ["sunflower seed butter", "almond butter", "cashew butter", "tahini"],
            "soy sauce": ["coconut aminos", "tamari (for gluten-free)", "liquid aminos", "fish sauce"],
            "shellfish": ["hearts of palm", "jackfruit", "mushrooms", "tofu"],
            "dairy": ["coconut yogurt", "cashew cheese", "nutritional yeast", "coconut cream"],
            "peanuts": ["sunflower seeds", "pumpkin seeds", "chickpeas", "soybeans"],
            "tree nuts": ["seeds", "beans", "roasted chickpeas", "oats"]
        };
        
        // Return substitutes if we have them, filtering out any that contain user allergens
        if (commonSubstitutes[ingredient.toLowerCase()]) {
            return commonSubstitutes[ingredient.toLowerCase()].filter(substitute => 
                !allergies.some(allergy => 
                    substitute.toLowerCase().includes(allergy.name.toLowerCase())
                )
            );
        }
        
        // Default substitutes if we don't have specific ones
        return ["Substitute 1", "Substitute 2", "Substitute 3"];
    },
    
    mockRecipes: function(query) {
        return [
            {
                id: 1,
                name: "Simple Veggie Stir Fry",
                category: "Vegetarian",
                area: "Asian",
                instructions: "1. Chop all vegetables. 2. Heat oil in pan. 3. Stir fry vegetables. 4. Add sauce and serve.",
                image: "/api/placeholder/300/200",
                ingredients: [
                    { name: "Broccoli", measure: "1 cup" },
                    { name: "Carrots", measure: "2 medium" },
                    { name: "Bell Peppers", measure: "1 large" },
                    { name: "Soy Sauce", measure: "2 tbsp" },
                    { name: "Rice", measure: "1 cup" }
                ]
            },
            {
                id: 2,
                name: "Basic Rice Bowl",
                category: "Vegetarian",
                area: "Asian",
                instructions: "1. Cook rice. 2. Prepare tofu and vegetables. 3. Assemble in bowl. 4. Add sauce on top.",
                image: "/api/placeholder/300/200",
                ingredients: [
                    { name: "Rice", measure: "1 cup" },
                    { name: "Tofu", measure: "200g" },
                    { name: "Avocado", measure: "1" },
                    { name: "Cucumber", measure: "1" },
                    { name: "Carrots", measure: "1" }
                ]
            },
            {
                id: 3,
                name: "Fruit Salad",
                category: "Dessert",
                area: "International",
                instructions: "1. Wash and cut all fruits. 2. Mix together. 3. Add honey if desired.",
                image: "/api/placeholder/300/200",
                ingredients: [
                    { name: "Apple", measure: "1" },
                    { name: "Banana", measure: "1" },
                    { name: "Strawberries", measure: "10" },
                    { name: "Honey", measure: "1 tbsp" }
                ]
            }
        ];
    },
    
    mockSafeRecipes: function(query, allergies) {
        // Get mock recipes
        const recipes = this.mockRecipes(query);
        
        // Filter based on allergies
        return recipes.filter(recipe => 
            !allergies.some(allergy => 
                this.recipeContainsAllergen(recipe, allergy.name)
            )
        );
    }
};

export default FoodDataService;