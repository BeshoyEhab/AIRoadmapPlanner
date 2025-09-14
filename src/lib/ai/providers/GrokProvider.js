import { AIProvider } from '../AIProvider.js';

export class GrokProvider extends AIProvider {
  constructor(apiKey, config = {}) {
    super();
    this.apiKey = apiKey;
    this.baseURL = 'https://api.x.ai/v1';
    this.model = config.model || 'grok-beta';
    this.maxTokens = config.maxTokens || 4000;
    this.temperature = config.temperature || 0.7;
  }

  async initialize() {
    if (!this.apiKey) {
      throw new Error('Grok API key is required');
    }
    
    // Test the API key
    try {
      await this.validateApiKey();
      return true;
    } catch (error) {
      throw new Error(`Failed to initialize Grok: ${error.message}`);
    }
  }

  async validateApiKey() {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: 'Hello, please respond with "API key valid" to test the connection.'
            }
          ],
          max_tokens: 50
        })
      });

      if (response.status === 401) {
        return false;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      return true;
    } catch (error) {
      if (error.message.includes('401')) {
        return false;
      }
      throw error;
    }
  }

  async generateRoadmap(objective, preferences = {}) {
    const prompt = this.buildRoadmapPrompt(objective, preferences);
    
    try {
      const response = await this.makeRequest(prompt);
      return this.parseRoadmapResponse(response);
    } catch (error) {
      throw new Error(`Grok roadmap generation failed: ${error.message}`);
    }
  }

  async generatePhase(roadmapTitle, phaseTitle, context = '') {
    const prompt = this.buildPhasePrompt(roadmapTitle, phaseTitle, context);
    
    try {
      const response = await this.makeRequest(prompt);
      return this.parsePhaseResponse(response);
    } catch (error) {
      throw new Error(`Grok phase generation failed: ${error.message}`);
    }
  }

  async testConnection() {
    return await this.validateApiKey();
  }

  async makeRequest(prompt, options = {}) {
    const maxTokens = options.maxTokens || this.maxTokens;
    const temperature = options.temperature || this.temperature;

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that creates detailed, structured learning roadmaps. Always respond with valid JSON when requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: temperature
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid response format from Grok API');
    }

    return data.choices[0].message.content;
  }

  buildRoadmapPrompt(objective, preferences) {
    const difficultyLevel = preferences.startingLevel || 'beginner';
    const timeframe = preferences.timeframe || 'flexible';
    
    return `Create a comprehensive study roadmap for: "${objective}"

Requirements:
- Starting level: ${difficultyLevel}
- Timeframe: ${timeframe}
- Include 3-6 main phases with clear objectives
- Provide estimated time for each phase
- Include practical resources and exercises
- Structure as a JSON object

Please respond with ONLY a valid JSON object in this exact format:
{
  "title": "Roadmap title",
  "description": "Brief description of what the learner will achieve",
  "difficulty": "${difficultyLevel}",
  "totalEstimatedTime": "Total time estimate",
  "phases": [
    {
      "title": "Phase title",
      "description": "What the learner will accomplish in this phase",
      "estimatedTime": "Time estimate for this phase",
      "objectives": ["Objective 1", "Objective 2"],
      "resources": [
        {
          "title": "Resource title",
          "type": "book|video|article|course|practice",
          "url": "URL if available",
          "description": "Why this resource is helpful"
        }
      ]
    }
  ]
}

Respond with ONLY the JSON object, no additional text.`;
  }

  buildPhasePrompt(roadmapTitle, phaseTitle, context) {
    return `Generate detailed content for the phase "${phaseTitle}" in the roadmap "${roadmapTitle}".

Context: ${context}

Please respond with ONLY a valid JSON object in this format:
{
  "title": "${phaseTitle}",
  "description": "Detailed description of this phase",
  "estimatedTime": "Time estimate",
  "objectives": ["Specific objective 1", "Specific objective 2"],
  "keyTopics": ["Topic 1", "Topic 2"],
  "resources": [
    {
      "title": "Resource title",
      "type": "book|video|article|course|practice",
      "url": "URL if available",
      "description": "Why this resource is helpful"
    }
  ],
  "exercises": [
    {
      "title": "Exercise title",
      "description": "What the learner should do",
      "estimatedTime": "Time to complete"
    }
  ],
  "milestones": ["Milestone 1", "Milestone 2"]
}

Respond with ONLY the JSON object, no additional text.`;
  }

  parseRoadmapResponse(response) {
    return this.parseJsonResponse(response, 'roadmap');
  }

  parsePhaseResponse(response) {
    return this.parseJsonResponse(response, 'phase');
  }

  parseJsonResponse(response, type) {
    try {
      // Clean the response - remove any markdown formatting
      let cleanResponse = response.trim();
      
      // Remove markdown code blocks if present
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Try to parse as JSON directly
      const parsed = JSON.parse(cleanResponse);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (error) {
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
      } catch (error) {
        // Continue to fallback
      }
    }

    // Fallback: create a structured response based on the raw text
    console.warn(`Grok returned non-JSON response for ${type}, using fallback parsing`);
    
    if (type === 'roadmap') {
      return {
        title: "Generated Roadmap",
        description: response.substring(0, 200) + "...",
        difficulty: "intermediate",
        totalEstimatedTime: "6-12 weeks",
        phases: [
          {
            title: "Study Phase 1",
            description: response,
            estimatedTime: "2-4 weeks",
            objectives: ["Complete the generated content"],
            resources: []
          }
        ]
      };
    } else {
      return {
        title: "Generated Phase",
        description: response,
        estimatedTime: "1-2 weeks",
        objectives: [response.substring(0, 100) + "..."],
        keyTopics: [],
        resources: [],
        exercises: [],
        milestones: []
      };
    }
  }
}
