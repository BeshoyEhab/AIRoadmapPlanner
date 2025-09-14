/**
 * Base AI Provider Interface
 * Defines the common interface that all AI providers must implement
 */

export class AIProvider {
  constructor(config = {}) {
    this.config = config;
    this.name = this.constructor.name;
    this.isConfigured = false;
  }

  /**
   * Initialize the AI provider with configuration
   * @param {Object} config - Provider-specific configuration
   */
  async initialize(config) {
    this.config = { ...this.config, ...config };
    this.isConfigured = this.validateConfig();
    return this.isConfigured;
  }

  /**
   * Validate the provider configuration
   * @returns {boolean} - Whether the configuration is valid
   */
  validateConfig() {
    throw new Error('validateConfig must be implemented by provider');
  }

  /**
   * Generate roadmap content using the AI provider
   * @param {Object} params - Generation parameters
   * @param {string} params.objective - Learning objective
   * @param {string} params.finalGoal - Final goal
   * @param {string} params.startingLevel - Starting level/prerequisites
   * @param {Object} params.options - Additional options
   * @returns {Promise<Object>} - Generated roadmap content
   */
  async generateRoadmap(params) {
    if (!this.isConfigured) {
      throw new Error(`${this.name} is not properly configured`);
    }
    throw new Error('generateRoadmap must be implemented by provider');
  }

  /**
   * Generate content for a specific roadmap phase
   * @param {Object} params - Phase generation parameters
   * @returns {Promise<Object>} - Generated phase content
   */
  async generatePhase(params) {
    if (!this.isConfigured) {
      throw new Error(`${this.name} is not properly configured`);
    }
    throw new Error('generatePhase must be implemented by provider');
  }

  /**
   * Test the provider connection and configuration
   * @returns {Promise<boolean>} - Whether the test was successful
   */
  async testConnection() {
    if (!this.isConfigured) {
      return false;
    }
    throw new Error('testConnection must be implemented by provider');
  }

  /**
   * Get provider-specific configuration schema
   * @returns {Object} - Configuration schema
   */
  getConfigSchema() {
    throw new Error('getConfigSchema must be implemented by provider');
  }

  /**
   * Get provider display information
   * @returns {Object} - Provider display info
   */
  getProviderInfo() {
    return {
      name: this.name,
      displayName: this.name,
      description: 'Base AI Provider',
      icon: '🤖',
      website: '',
      isConfigured: this.isConfigured
    };
  }

  /**
   * Get available models for this provider
   * @returns {Array<string>} - List of available models
   */
  getAvailableModels() {
    return [];
  }

  /**
   * Set the active model for this provider
   * @param {string} model - Model identifier
   */
  setModel(model) {
    this.config.model = model;
  }

  /**
   * Get the current active model
   * @returns {string} - Current model identifier
   */
  getCurrentModel() {
    return this.config.model || this.getAvailableModels()[0];
  }
}

export default AIProvider;
