# AllergyCompass

<p align="center">
Navigate your dietary restrictions with confidence
</p>


<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#key-features">Key Features</a> •
  <a href="#technology-stack">Technology Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#ai-implementation">AI Implementation</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#usage-examples">Usage Examples</a> •
  <a href="#team">Team</a>
</p>

![image](https://github.com/user-attachments/assets/e5f259dd-3b71-4505-bd10-5277ea5abdbf)


## Overview

AllergyCompass is an intelligent food allergen detection and management system that leverages advanced AI to help users navigate their dietary restrictions with confidence. Our application analyzes ingredient lists through sophisticated natural language processing, identifies potential allergens, detects cross-reactivity patterns, and provides personalized recommendations tailored to each user's unique allergen profile.

Developed for HackPrinceton 2025, AllergyCompass tackles the daily challenge faced by millions with food allergies and sensitivities: safely identifying what they can eat without triggering reactions.


#### Link to Project : https://yaakulya123.github.io/allergycompass/


## Key Features

-  Smart Allergen Detection**: Advanced AI-powered scanning of ingredient lists to identify potential allergens even when they appear under alternative names
-  Cross-Reactivity Analysis**: Sophisticated identification of potential allergic reactions based on known and emerging cross-reactivity patterns
-  Personalized Recommendations**: Custom alternative food suggestions based on user-specific allergen profiles and severity levels
-  Symptom Pattern Recognition**: Machine learning algorithms to identify patterns in user-reported symptoms and correlate with specific ingredients
-  Interactive Dashboard**: Real-time visualization of allergen exposure, reaction frequency, and symptom correlation
-  Offline Capability**: Robust local storage implementation for seamless user experience regardless of connectivity

## Background Research: 

### Healthcare System Crisis: Dual Epidemics of Provider Burnout and Long COVID
The healthcare ecosystem faces unprecedented challenges characterized by two concurrent epidemiological phenomena. Healthcare worker burnout has reached critical levels with 49.9% prevalence across roles, with highest rates among nursing (56.0%) and clinical staff (54.1%) (Rotenstein et al., 2023). This crisis has precipitated substantial workforce attrition, with projections indicating a deficit of 4+ million healthcare workers by 2026 if current trends continue (Oracle Health, 2023).
Concurrently, post-COVID cognitive sequelae represent an emerging public health concern. Longitudinal studies demonstrate measurable cognitive deficits in COVID-19 survivors, with severity-dependent impairment ranging from 3-point IQ reduction in mild cases to 9-point deficits in hospitalized patients (Hampshire et al., 2024). These impairments manifest primarily in executive function, information processing speed, and memory domains - essential capacities for medication management and symptom recognition. 
   
## Technology Stack

- Frontend: HTML5, CSS3, JavaScript (ES6+)
- Data Visualization: Chart.js
- PDF Generation: jsPDF
- API Integrations:
  - OpenAI GPT API for intelligent allergen analysis and recommendations
  - Open Food Facts API for comprehensive ingredient data retrieval
  - Edamam API for nutritional information and alternative food suggestions

## Architecture

AllergyCompass employs a sophisticated architecture with dedicated service modules designed for optimal performance and extensibility:

```
/js
  /services
    /gptService.js      # OpenAI GPT integration for allergen intelligence
    /foodDataService.js # Food database API integrations
  /utils
    /allergenAnalyzer.js # Core analysis algorithms
    /dataVisualizer.js   # Dashboard visualization engine
  /components
    /userProfile.js     # User profile management
    /scannerInterface.js # Ingredient scanning interface
```

Our implementation prioritizes:
- Performance: Asynchronous processing for uninterrupted user experience
- Privacy: Local-first data approach with user control over shared information
- Extensibility: Modular design allowing for easy integration of additional allergen databases
- Accessibility: WCAG-compliant interface usable by individuals with various accessibility needs

## AI Implementation

The core of AllergyCompass is its intelligent allergen detection system, which leverages multiple advanced techniques:

1. Natural Language Processing: Using GPT-4 to understand and extract allergen information from unstructured ingredient lists, including detecting:
   - Common allergen names and their derivatives
   - Scientific and alternative ingredient names
   - Processing additives that may contain allergen traces

2. Knowledge Graph: Implementation of allergen relationship mapping to identify hidden cross-reactivity risks based on:
   - Protein structure similarities
   - Documented cross-reactivity patterns
   - Geographical and botanical relationships between allergens

3. Retrieval Augmented Generation (RAG): Enhanced AI responses with specialized allergen knowledge base containing:
   - Peer-reviewed medical information on allergen profiles
   - Regulatory data on labeling requirements
   - User-contributed observations on uncommon reactions

4. Progressive Learning: System improves recommendations based on user feedback and symptom journal entries through:
   - Continuous model fine-tuning
   - Personalized sensitivity threshold adjustment
   - Community-informed safety ratings

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- API keys for OpenAI GPT, Edamam (free tier available)

### Installation
1. Clone the repository
   ```bash
   git clone https://github.com/your-team/allergycompass.git
   ```

2. Navigate to the project directory
   ```bash
   cd allergycompass
   ```

3. Configure API keys in the `config.js` file
   ```javascript
   const CONFIG = {
     GPT_API_KEY: 'your-gpt-api-key',
     EDAMAM_API_KEY: 'your-edamam-api-key',
     EDAMAM_APP_ID: 'your-edamam-app-id'
   };
   ```

4. Open `index.html` in your browser or use a local server
   ```bash
   # If you have Python installed
   python -m http.server 8000
   
   # If you have Node.js installed
   npx serve
   ```

## Usage Examples

### Scanning Product Ingredients
Upload a photo of an ingredient list or paste text directly. AllergyCompass will:
- Highlight identified allergens with severity color-coding
- Flag potential cross-reactivity concerns with confidence ratings
- Provide safety recommendations based on user's specific sensitivity profile
- Suggest alternatives if available with nutritional comparisons


### Symptom Journal Analysis
Record symptoms after meals to enable:
- Pattern recognition across multiple dimensions (time, ingredient combinations, environmental factors)
- Identification of potential unknown allergens through statistical correlation
- Visualization of the relationship between specific ingredients and symptom severity
- Exportable reports for healthcare provider consultation

## Future Enhancements

Integration with the TxGemma database provides access to comprehensive cross-reactivity matrices and molecular-level allergen profiling beyond traditional taxonomic classification. This implementation will make the project more accurate by using recent advances in proteomics to identify shared epitopes responsible for cross-sensitization phenomena not captured by conventional allergen databases. 

### Technical Implementation Roadmap

The AllergyCompass platform will be implemented through a multi-agent architecture powered by Firebase Genkit, featuring:
javascriptCopy// Core Triage Agent Implementation

```
// Core Triage Agent Implementation
const triageAgentFlow = ai.defineFlow({
  name: 'triageAgent',
  inputSchema: z.string(),
  outputSchema: z.string(),
}, async (userInput) => {
  // Intent classification and routing logic
  if (userInput.toLowerCase().includes('allergy') || 
      userInput.toLowerCase().includes('reaction')) {
    const allergyResults = await ai.useTool('detectAllergen', { 
      allergenData: userInput,
      patientProfile: await getUserProfile()
    });
    return generateResponse(allergyResults);
  } else if (userInput.toLowerCase().includes('symptom') || 
             userInput.toLowerCase().includes('feel')) {
    const symptomResults = await ai.useTool('detectSymptomPattern', { 
      symptomData: userInput,
      historicalData: await getPatientHistory()
    });
    return generateResponse(symptomResults);
  }
});

// TxGamma Database Integration
const txGammaIntegrationTool = ai.defineTool({
  name: 'queryTxGamma',
  description: 'Queries the TxGamma cross-reactivity database for molecular allergen analysis',
  inputSchema: z.object({ 
    allergenIdentifiers: z.array(z.string()),
    molecularComponents: z.boolean().optional()
  }),
  outputSchema: z.object({
    crossReactivityProfile: z.array(z.object({
      relatedAllergen: z.string(),
      confidenceScore: z.number(),
      molecularMechanism: z.string().optional()
    }))
  })
}, async (input) => {
  // Implementation of secure API call to TxGamma
  const response = await secureAPICall('https://api.txgamma.org/molecular-profile', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${await getAPIToken()}` },
    body: JSON.stringify(input)
  });
  return response.data;
});
```
- Mobile application with camera integration for real-time label scanning
- Restaurant menu analyzer with pre-dining recommendations
- Social sharing features for allergen-friendly restaurants and products
- Integration with wearable devices for real-time symptom tracking
- Machine learning integration for predictive reaction forecasting

## Team

| Name | Role | GitHub |
|------|------|--------|
| [Team Member 1: Yaakulya Sabbani] | [Hacker: BasedCode + Api Integration] | [@github](https://github.com/) |
| [Team Member 2: Rehnuma Taskin] | [Front End: Idea + Research + Data Visualization] | [@github](https://github.com/TaskinRe) |
| [Team Member 3: Xichen Zhang] | [Ideation + Prototyping] | [@github](https://github.com/Cmint9) |


## Acknowledgments

- Special thanks to [HackPrienceton 2025] for the opportunity
- OpenAI for GPT API access
- Open Food Facts for their comprehensive food database
- Edamam for nutritional data API

---

<p align="center">
  Made by Team [DeepCure]
</p>
