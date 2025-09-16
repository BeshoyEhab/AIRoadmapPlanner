import { AIProvider } from '../AIProvider.js';

/**
 * Local AI Provider Implementation (for Ollama, LocalAI, etc.)
 */
export class LocalProvider extends AIProvider {
  constructor(config = {}) {
    super(config);
  }

  getProviderInfo() {
    return {
      name: 'LocalProvider',
      displayName: 'Local AI',
      description: 'Local AI models (Ollama, LocalAI, etc.)',
      icon: '🏠',
      website: 'https://ollama.ai/',
      isConfigured: this.isConfigured
    };
  }

  getConfigSchema() {
    return {
      baseURL: {
        type: 'string',
        label: 'Base URL',
        placeholder: 'http://localhost:11434',
        required: true
      },
      model: {
        type: 'string',
        label: 'Model Name',
        placeholder: 'llama2, mistral, etc.',
        required: true
      },
      apiKey: {
        type: 'string',
        label: 'API Key (optional)',
        placeholder: 'Leave empty for local models',
        required: false,
        sensitive: true
      }
    };
  }

  getAvailableModels() {
    return [
      'llama2',
      'llama2:13b',
      'llama2:70b',
      'mistral',
      'mixtral',
      'codellama',
      'vicuna',
      'orca-mini'
    ];
  }

  validateConfig() {
    return !!(this.config.baseURL && this.config.model);
  }

  async initialize(config) {
    await super.initialize(config);
    return this.isConfigured;
  }

  async testConnection() {
    if (!this.isConfigured) {
      return false;
    }

    try {
      // Test with a simple generation request
      const response = await this.makeRequest('/api/generate', {
        model: this.config.model,
        prompt: 'Hello, this is a test message.',
        stream: false
      });

      return !!(response && response.response);
    } catch (_error) {
      console.error('Local AI connection test failed:', error);
      return false;
    }
  }

  async makeRequest(endpoint, data) {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(`${this.config.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  async generateRoadmap({ objective, finalGoal, startingLevel, options = {} }) {
    if (!this.isConfigured) {
      throw new Error('Local AI provider is not properly configured');
    }

    const prompt = this.buildRoadmapPrompt({ objective, finalGoal, startingLevel, options });

    try {
      const response = await this.makeRequest('/api/generate', {
        model: this.config.model,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 4000
        }
      });

      const text = response.response;
      
      try {
        // Try to extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error('No JSON found in response');
      } catch (_parseError) {
        return this.parseUnstructuredResponse(text, { objective, finalGoal, startingLevel });
      }
    } catch (_error) {
      console.error('Error generating roadmap with Local AI:', error);
      throw new Error(`Failed to generate roadmap: ${error.message}`);
    }
  }

  async generatePhase({ phaseInfo, roadmapContext, options = {} }) {
    if (!this.isConfigured) {
      throw new Error('Local AI provider is not properly configured');
    }

    const prompt = this.buildPhasePrompt({ phaseInfo, roadmapContext, options });

    try {
      const response = await this.makeRequest('/api/generate', {
        model: this.config.model,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 2000
        }
      });

      const text = response.response;
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error('No JSON found in response');
      } catch (_parseError) {
        return this.parsePhaseResponse(text, phaseInfo);
      }
    } catch (_error) {
      console.error('Error generating phase with Local AI:', error);
      throw new Error(`Failed to generate phase: ${error.message}`);
    }
  }

  buildRoadmapPrompt({ objective, finalGoal, startingLevel, options }) {
    return `You are an expert curriculum designer creating comprehensive learning roadmaps.

Create a detailed study roadmap with the following specifications:

Learning Objective: ${objective}
Final Goal: ${finalGoal}
Starting Level: ${startingLevel}

Generate a roadmap in JSON format with this exact structure:
{
  "title": "Roadmap title",
  "totalDuration": "estimated time (e.g., '8-12 weeks')",
  "difficultyLevel": "Beginner|Intermediate|Advanced|Expert",
  "totalEstimatedHours": number,
  "phases": [
    {
      "phaseNumber": number,
      "title": "Phase title",
      "duration": "phase duration",
      "goal": "specific learning goal for this phase",
      "progressPercentage": 0,
      "miniGoals": [
        {
          "id": "unique_id",
          "title": "Mini-goal title",
          "description": "Detailed description",
          "estimatedTime": "time estimate",
          "completed": false,
          "priority": "High|Medium|Low",
          "url": "relevant resource URL (optional)"
        }
      ],
      "resources": [
        {
          "name": "Resource name",
          "type": "Course|Tutorial|Documentation|Book|Tool",
          "url": "resource URL",
          "description": "resource description",
          "difficulty": "Beginner|Intermediate|Advanced"
        }
      ]
    }
  ],
  "careerOutcomes": [
    {
      "role": "Job role",
      "salary": "Salary range"
    }
  ],
  "tips": ["practical tips"],
  "marketDemand": "Market demand description",
  "communityResources": ["community resource names"]
}

Requirements:
- Create ${options.minPhases || 5}-${options.maxPhases || 15} phases
- Each phase should have 3-8 mini-goals
- Include practical projects and hands-on learning
- Consider the starting level when determining complexity
- Provide realistic time estimates
- Include relevant resources and career outcomes

Respond ONLY with valid JSON.`;
  }

  buildPhasePrompt({ phaseInfo, roadmapContext, options }) {
    return `You are an expert curriculum designer expanding a specific learning phase.

Roadmap Context: ${roadmapContext.title}
Phase to Expand: ${phaseInfo.title}
Phase Goal: ${phaseInfo.goal}

Generate detailed content for this phase in JSON format:
{
  "title": "Phase title",
  "duration": "duration estimate",
  "goal": "expanded phase goal",
  "miniGoals": [
    {
      "id": "unique_id",
      "title": "Mini-goal title", 
      "description": "Detailed description",
      "estimatedTime": "time estimate",
      "completed": false,
      "priority": "High|Medium|Low",
      "url": "relevant resource URL (optional)"
    }
  ],
  "resources": [
    {
      "name": "Resource name",
      "type": "Course|Tutorial|Documentation|Book|Tool",
      "url": "resource URL",
      "description": "resource description", 
      "difficulty": "Beginner|Intermediate|Advanced"
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "Project description",
      "estimatedTime": "time to complete",
      "difficulty": "Beginner|Intermediate|Advanced"
    }
  ]
}

Requirements:
- Create 5-10 detailed mini-goals
- Include practical, hands-on resources
- Add relevant project suggestions
- Maintain consistency with the overall roadmap objective

Respond ONLY with valid JSON.`;
  }

  parseUnstructuredResponse(text, context) {
    // Fallback parser for when AI doesn't return valid JSON
    const fallbackRoadmap = {
      title: `Local AI Roadmap for ${context.objective}`,
      totalDuration: "8-12 weeks",
      difficultyLevel: "Intermediate",
      totalEstimatedHours: 80,
      phases: [
        {
          phaseNumber: 1,
          title: "Foundation Phase",
          duration: "2-3 weeks", 
          goal: "Build fundamental understanding",
          progressPercentage: 0,
          miniGoals: [
            {
              id: "foundation_1",
              title: "Learn basic concepts",
              description: "Understand the fundamental concepts and terminology",
              estimatedTime: "5-8 hours",
              completed: false,
              priority: "High"
            }
          ],
          resources: [
            {
              name: "Online Documentation",
              type: "Documentation",
              url: "#",
              description: "Official documentation and guides",
              difficulty: "Beginner"
            }
          ]
        }
      ],
      careerOutcomes: [],
      tips: ["Start with basics", "Practice regularly", "Join communities"],
      marketDemand: "Growing demand in the field",
      communityResources: []
    };

    return fallbackRoadmap;
  }

  parsePhaseResponse(text, phaseInfo) {
    // Fallback parser for phase generation
    return {
      title: phaseInfo.title,
      duration: "2-3 weeks",
      goal: phaseInfo.goal,
      miniGoals: [
        {
          id: `${phaseInfo.title.toLowerCase().replace(/\s+/g, '_')}_1`,
          title: "Complete phase objectives",
          description: "Work through the main objectives for this phase",
          estimatedTime: "5-10 hours",
          completed: false,
          priority: "High"
        }
      ],
      resources: [
        {
          name: "Learning Materials",
          type: "Course",
          url: "#",
          description: "Relevant learning materials for this phase",
          difficulty: "Beginner"
        }
      ],
      projects: []
    };
  }
}

export default LocalProvider;
