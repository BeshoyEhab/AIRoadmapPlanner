import { AIProvider } from '../AIProvider.js';

/**
 * Claude/Anthropic Provider Implementation
 */
export class ClaudeProvider extends AIProvider {
  constructor(config = {}) {
    super(config);
    this.client = null;
  }

  getProviderInfo() {
    return {
      name: 'ClaudeProvider',
      displayName: 'Claude (Anthropic)',
      description: 'Anthropic\'s Claude models for thoughtful content generation',
      icon: '🎭',
      website: 'https://anthropic.com/',
      isConfigured: this.isConfigured
    };
  }

  getConfigSchema() {
    return {
      apiKey: {
        type: 'string',
        label: 'API Key',
        placeholder: 'Enter your Anthropic API key',
        required: true,
        sensitive: true
      },
      model: {
        type: 'select',
        label: 'Model',
        options: this.getAvailableModels(),
        default: 'claude-3-sonnet-20240229'
      },
      baseURL: {
        type: 'string',
        label: 'Base URL (optional)',
        placeholder: 'https://api.anthropic.com',
        required: false
      }
    };
  }

  getAvailableModels() {
    return [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-2.1',
      'claude-2.0'
    ];
  }

  validateConfig() {
    return !!(this.config.apiKey && this.config.apiKey.trim());
  }

  async initialize(config) {
    await super.initialize(config);
    
    if (this.isConfigured) {
      this.client = {
        apiKey: this.config.apiKey,
        baseURL: this.config.baseURL || 'https://api.anthropic.com'
      };
      return true;
    }
    
    return false;
  }

  async testConnection() {
    if (!this.isConfigured) {
      return false;
    }

    try {
      const response = await this.makeRequest('/v1/messages', {
        model: this.config.model || 'claude-3-sonnet-20240229',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hello, this is a test message.' }]
      });

      return !!(response && response.content && response.content.length > 0);
    } catch (error) {
      console.error('Claude connection test failed:', error);
      return false;
    }
  }

  async makeRequest(endpoint, data) {
    const response = await fetch(`${this.client.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.client.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async generateRoadmap({ objective, finalGoal, startingLevel, options = {} }) {
    if (!this.isConfigured) {
      throw new Error('Claude provider is not properly configured');
    }

    const prompt = this.buildRoadmapPrompt({ objective, finalGoal, startingLevel, options });

    try {
      const response = await this.makeRequest('/v1/messages', {
        model: this.config.model || 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: `You are an expert curriculum designer creating comprehensive learning roadmaps. Always respond with valid JSON only.\n\n${prompt}`
          }
        ]
      });

      const text = response.content[0].text;
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        return this.parseUnstructuredResponse(text, { objective, finalGoal, startingLevel });
      }
    } catch (error) {
      console.error('Error generating roadmap with Claude:', error);
      throw new Error(`Failed to generate roadmap: ${error.message}`);
    }
  }

  async generatePhase({ phaseInfo, roadmapContext, options = {} }) {
    if (!this.isConfigured) {
      throw new Error('Claude provider is not properly configured');
    }

    const prompt = this.buildPhasePrompt({ phaseInfo, roadmapContext, options });

    try {
      const response = await this.makeRequest('/v1/messages', {
        model: this.config.model || 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `You are an expert curriculum designer expanding learning phases. Always respond with valid JSON only.\n\n${prompt}`
          }
        ]
      });

      const text = response.content[0].text;
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        return this.parsePhaseResponse(text, phaseInfo);
      }
    } catch (error) {
      console.error('Error generating phase with Claude:', error);
      throw new Error(`Failed to generate phase: ${error.message}`);
    }
  }

  buildRoadmapPrompt({ objective, finalGoal, startingLevel, options }) {
    return `Create a thoughtful and detailed study roadmap with the following specifications:

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
- Create ${options.minPhases || 5}-${options.maxPhases || 15} comprehensive phases
- Each phase should have 3-8 well-thought-out mini-goals
- Include practical projects and hands-on learning opportunities
- Consider the starting level carefully when determining complexity progression
- Provide realistic and achievable time estimates
- Include high-quality, relevant resources and career outcomes
- Focus on building strong foundational understanding

Respond ONLY with valid JSON.`;
  }

  buildPhasePrompt({ phaseInfo, roadmapContext, options }) {
    return `Expand this learning phase with thoughtful, detailed content:

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
- Create 5-10 well-structured, detailed mini-goals
- Include practical, hands-on resources of high quality
- Add relevant project suggestions that reinforce learning
- Maintain consistency with the overall roadmap objective
- Focus on progressive skill building

Respond ONLY with valid JSON.`;
  }

  parseUnstructuredResponse(text, context) {
    // Fallback parser for when AI doesn't return valid JSON
    const fallbackRoadmap = {
      title: `Comprehensive Roadmap for ${context.objective}`,
      totalDuration: "10-16 weeks",
      difficultyLevel: "Intermediate",
      totalEstimatedHours: 120,
      phases: [
        {
          phaseNumber: 1,
          title: "Foundation and Fundamentals",
          duration: "3-4 weeks", 
          goal: "Build solid foundational understanding",
          progressPercentage: 0,
          miniGoals: [
            {
              id: "foundation_1",
              title: "Master core concepts",
              description: "Develop deep understanding of fundamental concepts and terminology",
              estimatedTime: "8-12 hours",
              completed: false,
              priority: "High"
            }
          ],
          resources: [
            {
              name: "Comprehensive Documentation",
              type: "Documentation",
              url: "#",
              description: "Official documentation and comprehensive guides",
              difficulty: "Beginner"
            }
          ]
        }
      ],
      careerOutcomes: [],
      tips: ["Build strong foundations", "Practice consistently", "Engage with community"],
      marketDemand: "Strong and growing demand in the field",
      communityResources: []
    };

    return fallbackRoadmap;
  }

  parsePhaseResponse(text, phaseInfo) {
    // Fallback parser for phase generation
    return {
      title: phaseInfo.title,
      duration: "3-4 weeks",
      goal: phaseInfo.goal,
      miniGoals: [
        {
          id: `${phaseInfo.title.toLowerCase().replace(/\s+/g, '_')}_1`,
          title: "Complete comprehensive phase objectives",
          description: "Thoroughly work through all main objectives for this phase",
          estimatedTime: "8-12 hours",
          completed: false,
          priority: "High"
        }
      ],
      resources: [
        {
          name: "Quality Learning Materials",
          type: "Course",
          url: "#",
          description: "High-quality, relevant learning materials for this phase",
          difficulty: "Beginner"
        }
      ],
      projects: []
    };
  }
}

export default ClaudeProvider;
