import { AIProvider } from '../AIProvider.js';

export class CustomProvider extends AIProvider {
  constructor(apiKey, config = {}) {
    super();
    this.apiKey = apiKey;
    this.baseURL = config.baseURL || 'http://localhost:8080';
    this.model = config.model || 'custom-model';
    this.maxTokens = config.maxTokens || 4000;
    this.temperature = config.temperature || 0.7;
    this.headers = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      ...config.headers
    };
    this.endpoint = config.endpoint || '/v1/chat/completions';
    this.requestFormat = config.requestFormat || 'openai'; // 'openai', 'claude', or 'custom'
  }

  async initialize() {
    if (!this.baseURL) {
      throw new Error('Custom provider requires a base URL');
    }
    
    // Test connection
    try {
      await this.testConnection();
      return true;
    } catch (_error) {
      throw new Error(`Failed to initialize custom provider: ${error.message}`);
    }
  }

  async validateApiKey() {
    try {
      await this.testConnection();
      return true;
    } catch (_error) {
      return false;
    }
  }

  async generateRoadmap(objective, preferences = {}) {
    const prompt = this.buildRoadmapPrompt(objective, preferences);
    
    try {
      const response = await this.makeRequest(prompt);
      return this.parseRoadmapResponse(response);
    } catch (_error) {
      throw new Error(`Custom AI roadmap generation failed: ${error.message}`);
    }
  }

  async generatePhase(roadmapTitle, phaseTitle, context = '') {
    const prompt = this.buildPhasePrompt(roadmapTitle, phaseTitle, context);
    
    try {
      const response = await this.makeRequest(prompt);
      return this.parsePhaseResponse(response);
    } catch (_error) {
      throw new Error(`Custom AI phase generation failed: ${error.message}`);
    }
  }

  async testConnection() {
    const testPrompt = "Hello, this is a test message. Please respond with 'Connection successful'.";
    
    try {
      const response = await this.makeRequest(testPrompt, { maxTokens: 50 });
      return response && response.length > 0;
    } catch (_error) {
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }

  async makeRequest(prompt, options = {}) {
    const requestBody = this.buildRequestBody(prompt, _options);
    
    const response = await fetch(`${this.baseURL}${this.endpoint}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return this.extractResponseText(data);
  }

  buildRequestBody(prompt, options = {}) {
    const maxTokens = options.maxTokens || this.maxTokens;
    const temperature = options.temperature || this.temperature;

    switch (this.requestFormat) {
      case 'openai':
        return {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: maxTokens,
          temperature: temperature
        };
        
      case 'claude':
        return {
          model: this.model,
          max_tokens: maxTokens,
          temperature: temperature,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        };
        
      case 'custom':
      default:
        return {
          model: this.model,
          prompt: prompt,
          max_tokens: maxTokens,
          temperature: temperature
        };
    }
  }

  extractResponseText(data) {
    // Try different response formats
    if (data.choices && data.choices[0]) {
      // OpenAI format
      return data.choices[0].message?.content || data.choices[0].text || '';
    }
    
    if (data.content && data.content[0]) {
      // Claude format
      return data.content[0].text || '';
    }
    
    if (data.response) {
      // Common custom format
      return data.response;
    }
    
    if (data.text) {
      // Simple text format
      return data.text;
    }
    
    if (data.message) {
      // Message format
      return data.message;
    }
    
    // If none of the above, try to stringify and extract
    const str = JSON.stringify(data);
    if (str.length > 2) { // More than just "{}"
      return str;
    }
    
    throw new Error('Unable to extract response text from custom API response');
  }

  buildRoadmapPrompt(objective, preferences) {
    const difficultyLevel = preferences.startingLevel || 'beginner';
    const timeframe = preferences.timeframe || 'flexible';
    
    return `Create a comprehensive study roadmap for: "${objective}"

Requirements:
- Starting level: ${difficultyLevel}
- Timeframe: ${timeframe}
- Include specific phases with clear objectives
- Provide estimated time for each phase
- Include practical resources and exercises
- Structure as a JSON object with phases array

Please respond with a valid JSON object containing the roadmap structure with title, description, phases, and other relevant fields.`;
  }

  buildPhasePrompt(roadmapTitle, phaseTitle, context) {
    return `Generate detailed content for the phase "${phaseTitle}" in the roadmap "${roadmapTitle}".

Context: ${context}

Please provide:
- Detailed learning objectives
- Key concepts to master
- Practical exercises and projects
- Recommended resources
- Assessment criteria
- Estimated completion time

Respond with a JSON object containing the phase details.`;
  }

  parseRoadmapResponse(response) {
    return this.parseJsonResponse(response, 'roadmap');
  }

  parsePhaseResponse(response) {
    return this.parseJsonResponse(response, 'phase');
  }

  parseJsonResponse(response, type) {
    try {
      // Try to parse as JSON directly
      const parsed = JSON.parse(response);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (_error) {
      // If direct parsing fails, try to extract JSON from the response
    }

    // Try to find JSON within the response text
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      } catch (_error) {
        // Continue to fallback
      }
    }

    // Fallback: create a structured response based on the raw text
    console.warn(`Custom AI returned non-JSON response for ${type}, using fallback parsing`);
    
    if (type === 'roadmap') {
      return {
        title: "Generated Roadmap",
        description: response.substring(0, 200) + "...",
        phases: [
          {
            title: "Study Phase 1",
            description: response,
            estimatedTime: "2-4 weeks",
            objectives: ["Complete the generated content"],
            resources: []
          }
        ],
        totalEstimatedTime: "2-4 weeks",
        difficulty: "intermediate"
      };
    } else {
      return {
        title: "Generated Phase",
        description: response,
        estimatedTime: "1-2 weeks",
        objectives: [response.substring(0, 100) + "..."],
        resources: [],
        exercises: []
      };
    }
  }
}
