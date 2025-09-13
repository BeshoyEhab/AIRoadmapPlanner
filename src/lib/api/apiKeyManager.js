/**
 * APIKeyManager class for secure API key management
 * Stores the API key only in memory, never persisted to storage
 */
class APIKeyManager {
  #apiKey = null;
  #isValid = false;
  #lastValidated = null;
  static #instance = null;

  constructor() {
    if (APIKeyManager.#instance) {
      return APIKeyManager.#instance;
    }
    APIKeyManager.#instance = this;
  }

  /**
   * Validates and sets the API key
   * @param {string} key - The OpenAI API key to validate and store
   * @returns {Promise<boolean>} - Whether the key is valid
   */
  async setKey(key) {
    if (!key || typeof key !== 'string') {
      this.#apiKey = null;
      this.#isValid = false;
      return false;
    }

    const keyPattern = /^sk-[A-Za-z0-9]{48}$/;
    if (!keyPattern.test(key)) {
      this.#apiKey = null;
      this.#isValid = false;
      return false;
    }

    try {
      const isValid = await this.validateKey(key);
      if (isValid) {
        this.#apiKey = key;
        this.#isValid = true;
        this.#lastValidated = Date.now();
        return true;
      }
    } catch (error) {
      console.error('Error validating API key:', error);
    }

    this.#apiKey = null;
    this.#isValid = false;
    return false;
  }

  /**
   * Validates the API key by making a test request
   * @param {string} key - The API key to validate
   * @returns {Promise<boolean>} - Whether the key is valid
   */
  async validateKey(key) {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      });

      return response.status === 200;
    } catch (error) {
      console.error('Error validating API key:', error);
      return false;
    }
  }

  /**
   * Gets the stored API key if it exists and is valid
   * @returns {string|null} - The stored API key or null
   */
  getKey() {
    if (!this.#apiKey || !this.#isValid) {
      return null;
    }

    // Revalidate key if it hasn't been used in 1 hour
    const oneHour = 60 * 60 * 1000;
    if (Date.now() - this.#lastValidated > oneHour) {
      this.validateKey(this.#apiKey).then(isValid => {
        if (!isValid) {
          this.clearKey();
        }
      });
    }

    return this.#apiKey;
  }

  /**
   * Checks if a valid API key is set
   * @returns {boolean} - Whether a valid key is set
   */
  hasValidKey() {
    return this.#isValid && this.#apiKey !== null;
  }

  /**
   * Clears the stored API key
   */
  clearKey() {
    this.#apiKey = null;
    this.#isValid = false;
    this.#lastValidated = null;
  }

  /**
   * Gets the singleton instance of APIKeyManager
   * @returns {APIKeyManager} - The singleton instance
   */
  static getInstance() {
    if (!APIKeyManager.#instance) {
      APIKeyManager.#instance = new APIKeyManager();
    }
    return APIKeyManager.#instance;
  }
}

export const apiKeyManager = APIKeyManager.getInstance();
