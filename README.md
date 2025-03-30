# AllergyCompass 🧭

<p align="center">
  <img src="https://via.placeholder.com/150" alt="AllergyCompass Logo" width="150"/>
  <br>
  <em>Navigate your dietary restrictions with confidence</em>
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#key-features">Key Features</a> •
  <a href="#technology-stack">Technology Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#ai-implementation">AI Implementation</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#usage-examples">Usage Examples</a> •
  <a href="#demo">Demo</a> •
  <a href="#team">Team</a>
</p>

## Overview

AllergyCompass is an intelligent food allergen detection and management system that leverages advanced AI to help users navigate their dietary restrictions with confidence. Our application analyzes ingredient lists through sophisticated natural language processing, identifies potential allergens, detects cross-reactivity patterns, and provides personalized recommendations tailored to each user's unique allergen profile.

Developed for [Hackathon Name], AllergyCompass tackles the daily challenge faced by millions with food allergies and sensitivities: safely identifying what they can eat without triggering reactions.

## Key Features

- **🔍 Smart Allergen Detection**: Advanced AI-powered scanning of ingredient lists to identify potential allergens even when they appear under alternative names
- **🔄 Cross-Reactivity Analysis**: Sophisticated identification of potential allergic reactions based on known and emerging cross-reactivity patterns
- **👤 Personalized Recommendations**: Custom alternative food suggestions based on user-specific allergen profiles and severity levels
- **📊 Symptom Pattern Recognition**: Machine learning algorithms to identify patterns in user-reported symptoms and correlate with specific ingredients
- **📱 Interactive Dashboard**: Real-time visualization of allergen exposure, reaction frequency, and symptom correlation
- **🔌 Offline Capability**: Robust local storage implementation for seamless user experience regardless of connectivity

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Data Visualization**: Chart.js
- **PDF Generation**: jsPDF
- **API Integrations**:
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
- **Performance**: Asynchronous processing for uninterrupted user experience
- **Privacy**: Local-first data approach with user control over shared information
- **Extensibility**: Modular design allowing for easy integration of additional allergen databases
- **Accessibility**: WCAG-compliant interface usable by individuals with various accessibility needs

## AI Implementation

The core of AllergyCompass is its intelligent allergen detection system, which leverages multiple advanced techniques:

1. **Natural Language Processing**: Using GPT-4 to understand and extract allergen information from unstructured ingredient lists, including detecting:
   - Common allergen names and their derivatives
   - Scientific and alternative ingredient names
   - Processing additives that may contain allergen traces

2. **Knowledge Graph**: Implementation of allergen relationship mapping to identify hidden cross-reactivity risks based on:
   - Protein structure similarities
   - Documented cross-reactivity patterns
   - Geographical and botanical relationships between allergens

3. **Retrieval Augmented Generation (RAG)**: Enhanced AI responses with specialized allergen knowledge base containing:
   - Peer-reviewed medical information on allergen profiles
   - Regulatory data on labeling requirements
   - User-contributed observations on uncommon reactions

4. **Progressive Learning**: System improves recommendations based on user feedback and symptom journal entries through:
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

- Mobile application with camera integration for real-time label scanning
- Restaurant menu analyzer with pre-dining recommendations
- Social sharing features for allergen-friendly restaurants and products
- Integration with wearable devices for real-time symptom tracking
- Machine learning integration for predictive reaction forecasting

## Team

| Name | Role | GitHub |
|------|------|--------|
| [Team Member 1: Yaakulya Sabbani] | [Hacker] | [@github](https://github.com/) |
| [Team Member 2: Rehnuma Taskin] | [Front End] | [@github](https://github.com/) |
| [Team Member 3: Xichen Zhang] | [Frond End] | [@github](https://github.com/) |


## Acknowledgments

- Special thanks to [HackPrienceton 2025] for the opportunity
- OpenAI for GPT API access
- Open Food Facts for their comprehensive food database
- Edamam for nutritional data API

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made by Team [DeepCure]
</p>
