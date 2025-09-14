import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from '../AIProvider.js';

/**
 * Google Gemini AI Provider Implementation
 */
export class GeminiProvider extends AIProvider {
  constructor(config = {}) {
    super(config);
    this.genAI = null;
    this.model = null;
  }

  getProviderInfo() {
    return {
      name: 'GeminiProvider',
      displayName: 'Google Gemini',
      description: 'Google\'s advanced AI model for content generation',
      icon: '🧠',
      website: 'https://ai.google.dev/',
      isConfigured: this.isConfigured
    };
  }

  getConfigSchema() {
    return {
      apiKey: {
        type: 'string',
        label: 'API Key',
        placeholder: 'Enter your Gemini API key',
        required: true,
        sensitive: true
      },
      model: {
        type: 'select',
        label: 'Model',
        options: this.getAvailableModels(),
        default: 'gemini-1.5-flash'
      }
    };
  }

  getAvailableModels() {
    return [
      'gemini-2.5-flash',
      'gemini-2.0-flash', 
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-1.0-pro'
    ];
  }

  validateConfig() {
    return !!(this.config.apiKey && this.config.apiKey.trim());
  }

  async initialize(config) {
    await super.initialize(config);
    
    if (this.isConfigured) {
      try {
        this.genAI = new GoogleGenerativeAI(this.config.apiKey);
        const modelName = this.config.model || 'gemini-1.5-flash';
        this.model = this.genAI.getGenerativeModel({ model: modelName });
        return true;
      } catch (error) {
        console.error('Error initializing Gemini provider:', error);
        this.isConfigured = false;
        return false;
      }
    }
    
    return false;
  }

  async testConnection() {
    if (!this.isConfigured || !this.model) {
      return false;
    }

    try {
      const result = await this.model.generateContent('Hello, this is a test message.');
      return !!(result && result.response);
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }

  async generateRoadmap({ objective, finalGoal, startingLevel, options = {} }) {
    if (!this.isConfigured || !this.model) {
      throw new Error('Gemini provider is not properly configured');
    }

    const prompt = this.buildRoadmapPrompt({ objective, finalGoal, startingLevel, options });

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Try to parse JSON response, fallback to structured parsing
      try {
        return JSON.parse(text);
      } catch (parseError) {
        return this.parseUnstructuredResponse(text, { objective, finalGoal, startingLevel });
      }
    } catch (error) {
      console.error('Error generating roadmap with Gemini:', error);
      throw new Error(`Failed to generate roadmap: ${error.message}`);
    }
  }

  async generatePhase({ phaseInfo, roadmapContext, options = {} }) {
    if (!this.isConfigured || !this.model) {
      throw new Error('Gemini provider is not properly configured');
    }

    const prompt = this.buildPhasePrompt({ phaseInfo, roadmapContext, options });

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        return this.parsePhaseResponse(text, phaseInfo);
      }
    } catch (error) {
      console.error('Error generating phase with Gemini:', error);
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
      title: `Roadmap for ${context.objective}`,
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

export default GeminiProvider;
