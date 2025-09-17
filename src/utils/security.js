/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitizes user input to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove other potentially dangerous tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    // Remove javascript: protocols
    .replace(/javascript:/gi, '')
    // Remove data: protocols that could be dangerous
    .replace(/data:(?!image\/)/gi, '')
    // Remove on* event handlers
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove style attributes that could contain malicious CSS
    .replace(/\sstyle\s*=\s*["'][^"']*["']/gi, '')
    // Trim whitespace
    .trim();
};

/**
 * Validates and sanitizes roadmap title
 * @param {string} title - The title to validate
 * @returns {Object} - { isValid: boolean, sanitized: string, error?: string }
 */
export const validateRoadmapTitle = (title) => {
  if (!title || typeof title !== 'string') {
    return { isValid: false, sanitized: '', error: 'Title is required' };
  }

  const sanitized = sanitizeInput(title);
  
  if (sanitized.length === 0) {
    return { isValid: false, sanitized: '', error: 'Title cannot be empty' };
  }

  if (sanitized.length > 200) {
    return { isValid: false, sanitized: sanitized.substring(0, 200), error: 'Title too long (max 200 characters)' };
  }

  // Check for potentially malicious patterns
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i
  ];

  if (maliciousPatterns.some(pattern => pattern.test(sanitized))) {
    return { isValid: false, sanitized: '', error: 'Title contains invalid characters' };
  }

  return { isValid: true, sanitized, error: null };
};

/**
 * Validates and sanitizes objective/final goal
 * @param {string} text - The text to validate
 * @returns {Object} - { isValid: boolean, sanitized: string, error?: string }
 */
export const validateObjective = (text) => {
  if (!text || typeof text !== 'string') {
    return { isValid: false, sanitized: '', error: 'Objective is required' };
  }

  const sanitized = sanitizeInput(text);
  
  if (sanitized.length === 0) {
    return { isValid: false, sanitized: '', error: 'Objective cannot be empty' };
  }

  if (sanitized.length > 1000) {
    return { isValid: false, sanitized: sanitized.substring(0, 1000), error: 'Objective too long (max 1000 characters)' };
  }

  return { isValid: true, sanitized, error: null };
};

/**
 * Validates API key format
 * @param {string} apiKey - The API key to validate
 * @returns {Object} - { isValid: boolean, error?: string }
 */
export const validateApiKey = (apiKey) => {
  if (!apiKey || typeof apiKey !== 'string') {
    return { isValid: false, error: 'API key is required' };
  }

  const trimmed = apiKey.trim();
  
  if (trimmed.length === 0) {
    return { isValid: false, error: 'API key cannot be empty' };
  }

  // Basic format validation for Gemini API keys
  if (!trimmed.match(/^[A-Za-z0-9_-]+$/)) {
    return { isValid: false, error: 'API key contains invalid characters' };
  }

  if (trimmed.length < 20) {
    return { isValid: false, error: 'API key appears to be too short' };
  }

  return { isValid: true, error: null };
};

/**
 * Masks API key for display purposes
 * @param {string} apiKey - The API key to mask
 * @returns {string} - Masked API key
 */
export const maskApiKey = (apiKey) => {
  if (!apiKey || typeof apiKey !== 'string') {
    return 'Not set';
  }

  if (apiKey.length <= 12) {
    return '*'.repeat(apiKey.length);
  }

  const visibleStart = Math.min(4, Math.floor(apiKey.length / 4));
  const visibleEnd = Math.min(4, Math.floor(apiKey.length / 4));
  const maskedLength = apiKey.length - visibleStart - visibleEnd;
  return `${apiKey.slice(0, visibleStart)}${'*'.repeat(maskedLength)}${apiKey.slice(-visibleEnd)}`;
};

/**
 * Sanitizes filename for safe file operations
 * @param {string} filename - The filename to sanitize
 * @returns {string} - Sanitized filename
 */
export const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') {
    return 'untitled';
  }

  return filename
    .replace(/[^a-z0-9._-]/gi, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()
    .substring(0, 100); // Limit length
};

/**
 * Validates JSON data structure
 * @param {any} data - The data to validate
 * @returns {Object} - { isValid: boolean, error?: string }
 */
export const validateJsonData = (data) => {
  try {
    if (typeof data !== 'object' || data === null) {
      return { isValid: false, error: 'Data must be an object' };
    }

    // Check for required roadmap properties
    const requiredFields = ['title', 'phases'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        return { isValid: false, error: `Missing required field: ${field}` };
      }
    }

    // Validate phases array
    if (!Array.isArray(data.phases)) {
      return { isValid: false, error: 'Phases must be an array' };
    }

    // Check for reasonable limits
    if (data.phases.length > 100) {
      return { isValid: false, error: 'Too many phases (max 100)' };
    }

    return { isValid: true, error: null };
  } catch (_error) {
    return { isValid: false, error: 'Invalid data structure' };
  }
};

/**
 * Rate limiting utility
 */
export class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map(); // Map of key -> array of timestamps
  }

  isAllowed(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Get or initialize request timestamps for this key
    let keyRequests = this.requests.get(key) || [];
    
    // Filter out old timestamps
    keyRequests = keyRequests.filter(timestamp => timestamp >= windowStart);

    // Check if this key is under limit
    if (keyRequests.length >= this.maxRequests) {
      return false;
    }

    // Add new request timestamp
    keyRequests.push(now);
    this.requests.set(key, keyRequests);
    return true;
  }

  reset() {
    this.requests.clear();
  }
}

/**
 * Content Security Policy helper
 */
export const getCSPDirectives = () => {
  return {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "https://apis.google.com"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", "data:", "https:"],
    'connect-src': ["'self'", "https://generativelanguage.googleapis.com"],
    'font-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  };
};
