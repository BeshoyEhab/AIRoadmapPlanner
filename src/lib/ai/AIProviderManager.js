import { GeminiProvider } from './providers/GeminiProvider.js';
import { OpenAIProvider } from './providers/OpenAIProvider.js';
import { ClaudeProvider } from './providers/ClaudeProvider.js';
import { LocalProvider } from './providers/LocalProvider.js';
import { CustomProvider } from './providers/CustomProvider.js';
import { GrokProvider } from './providers/GrokProvider.js';

export class AIProviderManager {
  constructor() {
    this.providers = new Map();
    this.currentProvider = null;
    this.availableProviders = {
      'gemini': {
        name: 'Google Gemini',
        class: GeminiProvider,
        requiresApiKey: true,
        description: 'Google\'s advanced AI model with excellent reasoning capabilities'
      },
      'openai': {
        name: 'OpenAI',
        class: OpenAIProvider,
        requiresApiKey: true,
        description: 'OpenAI\'s GPT models including GPT-4 and GPT-3.5'
      },
      'claude': {
        name: 'Claude (Anthropic)',
        class: ClaudeProvider,
        requiresApiKey: true,
        description: 'Anthropic\'s Claude models, known for helpful and harmless responses'
      },
      'grok': {
        name: 'Grok (X.ai)',
        class: GrokProvider,
        requiresApiKey: true,
        description: 'X.ai\'s Grok model with real-time information capabilities'
      },
      'local': {
        name: 'Local AI',
        class: LocalProvider,
        requiresApiKey: false,
        description: 'Local AI models via Ollama, LocalAI, or similar services'
      },
      'custom': {
        name: 'Custom API',
        class: CustomProvider,
        requiresApiKey: false,
        description: 'Custom AI API endpoint with configurable parameters'
      }
    };
  }

  /**
   * Get list of available provider types
   */
  getAvailableProviders() {
    return Object.entries(this.availableProviders).map(([key, info]) => ({
      key,
      ...info
    }));
  }

  /**
   * Initialize a provider with given configuration
   */
  async initializeProvider(providerType, apiKey, config = {}) {
    if (!this.availableProviders[providerType]) {
      throw new Error(`Unknown provider type: ${providerType}`);
    }

    const ProviderClass = this.availableProviders[providerType].class;
    const provider = new ProviderClass(apiKey, config);

    try {
      await provider.initialize();
      this.providers.set(providerType, provider);
      return provider;
    } catch (error) {
      throw new Error(`Failed to initialize ${providerType}: ${error.message}`);
    }
  }

  /**
   * Set the current active provider
   */
  setCurrentProvider(providerType) {
    if (!this.providers.has(providerType)) {
      throw new Error(`Provider ${providerType} is not initialized`);
    }
    
    this.currentProvider = this.providers.get(providerType);
    return this.currentProvider;
  }

  /**
   * Get the current active provider
   */
  getCurrentProvider() {
    return this.currentProvider;
  }

  /**
   * Get a specific provider by type
   */
  getProvider(providerType) {
    return this.providers.get(providerType);
  }

  /**
   * Check if a provider is initialized
   */
  hasProvider(providerType) {
    return this.providers.has(providerType);
  }

  /**
   * Remove a provider
   */
  removeProvider(providerType) {
    this.providers.delete(providerType);
    if (this.currentProvider && this.currentProvider.constructor.name.toLowerCase().includes(providerType)) {
      this.currentProvider = null;
    }
  }

  /**
   * Test connection for a specific provider
   */
  async testProvider(providerType) {
    const provider = this.providers.get(providerType);
    if (!provider) {
      throw new Error(`Provider ${providerType} is not initialized`);
    }

    try {
      return await provider.testConnection();
    } catch (error) {
      throw new Error(`Provider test failed: ${error.message}`);
    }
  }

  /**
   * Validate API key for a specific provider
   */
  async validateProviderApiKey(providerType, apiKey, config = {}) {
    const ProviderClass = this.availableProviders[providerType]?.class;
    if (!ProviderClass) {
      throw new Error(`Unknown provider type: ${providerType}`);
    }

    const tempProvider = new ProviderClass(apiKey, config);
    
    try {
      return await tempProvider.validateApiKey();
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate roadmap using current provider
   */
  async generateRoadmap(objective, preferences = {}) {
    if (!this.currentProvider) {
      throw new Error('No AI provider is currently active');
    }

    try {
      return await this.currentProvider.generateRoadmap(objective, preferences);
    } catch (error) {
      throw new Error(`Roadmap generation failed: ${error.message}`);
    }
  }

  /**
   * Generate phase using current provider
   */
  async generatePhase(roadmapTitle, phaseTitle, context = '') {
    if (!this.currentProvider) {
      throw new Error('No AI provider is currently active');
    }

    try {
      return await this.currentProvider.generatePhase(roadmapTitle, phaseTitle, context);
    } catch (error) {
      throw new Error(`Phase generation failed: ${error.message}`);
    }
  }

  /**
   * Get provider configuration requirements
   */
  getProviderConfigRequirements(providerType) {
    const providerInfo = this.availableProviders[providerType];
    if (!providerInfo) {
      return null;
    }

    const baseRequirements = {
      apiKey: providerInfo.requiresApiKey,
      fields: []
    };

    switch (providerType) {
      case 'gemini':
        baseRequirements.fields = [
          { name: 'model', label: 'Model', type: 'select', options: ['gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-1.5-pro'], default: 'gemini-2.0-flash-exp' }
        ];
        break;
      case 'openai':
        baseRequirements.fields = [
          { name: 'model', label: 'Model', type: 'select', options: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'], default: 'gpt-4o' },
          { name: 'baseURL', label: 'Base URL (Optional)', type: 'text', placeholder: 'https://api.openai.com/v1' }
        ];
        break;
      case 'claude':
        baseRequirements.fields = [
          { name: 'model', label: 'Model', type: 'select', options: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'], default: 'claude-3-5-sonnet-20241022' }
        ];
        break;
      case 'grok':
        baseRequirements.fields = [
          { name: 'model', label: 'Model', type: 'select', options: ['grok-beta'], default: 'grok-beta' }
        ];
        break;
      case 'local':
        baseRequirements.fields = [
          { name: 'baseURL', label: 'Base URL', type: 'text', placeholder: 'http://localhost:11434', required: true },
          { name: 'model', label: 'Model Name', type: 'text', placeholder: 'llama2', required: true },
          { name: 'apiKey', label: 'API Key (if required)', type: 'password', placeholder: 'Optional' }
        ];
        break;
      case 'custom':
        baseRequirements.fields = [
          { name: 'baseURL', label: 'Base URL', type: 'text', placeholder: 'http://localhost:8080', required: true },
          { name: 'model', label: 'Model Name', type: 'text', placeholder: 'custom-model', required: true },
          { name: 'endpoint', label: 'Endpoint', type: 'text', placeholder: '/v1/chat/completions', required: true },
          { name: 'requestFormat', label: 'Request Format', type: 'select', options: ['openai', 'claude', 'custom'], default: 'openai' },
          { name: 'apiKey', label: 'API Key (if required)', type: 'password', placeholder: 'Optional' }
        ];
        break;
    }

    return baseRequirements;
  }

  /**
   * Get currently initialized provider types
   */
  getInitializedProviders() {
    return Array.from(this.providers.keys());
  }

  /**
   * Get provider info by type
   */
  getProviderInfo(providerType) {
    return this.availableProviders[providerType];
  }

  /**
   * Save provider configurations to localStorage
   */
  saveProvidersToStorage() {
    const providerConfigs = {};
    
    for (const [type, provider] of this.providers) {
      // Save basic config, excluding sensitive data like API keys
      providerConfigs[type] = {
        type: type,
        initialized: true,
        // Add any non-sensitive configuration that should be persisted
      };
    }
    
    localStorage.setItem('ai-provider-configs', JSON.stringify(providerConfigs));
    
    if (this.currentProvider) {
      // Find the type of current provider
      for (const [type, provider] of this.providers) {
        if (provider === this.currentProvider) {
          localStorage.setItem('current-ai-provider', type);
          break;
        }
      }
    }
  }

  /**
   * Load provider configurations from localStorage
   */
  loadProvidersFromStorage() {
    try {
      const providerConfigs = localStorage.getItem('ai-provider-configs');
      const currentProviderType = localStorage.getItem('current-ai-provider');
      
      if (providerConfigs) {
        const configs = JSON.parse(providerConfigs);
        return {
          configs,
          currentProviderType
        };
      }
    } catch (error) {
      console.warn('Failed to load provider configs from storage:', error);
    }
    
    return {
      configs: {},
      currentProviderType: null
    };
  }
}
