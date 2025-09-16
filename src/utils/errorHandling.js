/**
 * Enhanced error handling utilities
 */

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} - Promise that resolves with function result
 */
export const retryWithExponentialBackoff = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    jitter = true
  } = options;

  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      let delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt), maxDelay);
      
      // Add jitter to prevent thundering herd
      if (jitter) {
        delay = delay * (0.5 + Math.random() * 0.5);
      }
      
      console.log(`Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Circuit breaker pattern implementation
 */
export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minute
    this.monitoringPeriod = options.monitoringPeriod || 10000; // 10 seconds
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = null;
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      nextAttempt: this.nextAttempt
    };
  }
}

/**
 * Error classification utility
 */
export const classifyError = (error) => {
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code || '';
  
  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return { type: 'NETWORK', retryable: true };
  }
  
  // Timeout errors
  if (errorMessage.includes('timeout') || errorCode === 'TIMEOUT') {
    return { type: 'TIMEOUT', retryable: true };
  }
  
  // Rate limiting
  if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorCode === 'RATE_LIMIT_EXCEEDED') {
    return { type: 'RATE_LIMIT', retryable: true };
  }
  
  // Quota exceeded
  if (errorMessage.includes('quota') || errorMessage.includes('limit exceeded')) {
    return { type: 'QUOTA_EXCEEDED', retryable: false };
  }
  
  // Authentication errors
  if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorCode === 'UNAUTHORIZED') {
    return { type: 'AUTHENTICATION', retryable: false };
  }
  
  // Permission errors
  if (errorMessage.includes('403') || errorMessage.includes('forbidden') || errorCode === 'FORBIDDEN') {
    return { type: 'PERMISSION', retryable: false };
  }
  
  // Server errors
  if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
    return { type: 'SERVER_ERROR', retryable: true };
  }
  
  // Content policy violations
  if (errorMessage.includes('safety') || errorMessage.includes('content') || errorMessage.includes('policy')) {
    return { type: 'CONTENT_POLICY', retryable: false };
  }
  
  // Model not found
  if (errorMessage.includes('404') || errorMessage.includes('not found') || errorCode === 'MODEL_NOT_FOUND') {
    return { type: 'MODEL_NOT_FOUND', retryable: false };
  }
  
  // Default classification
  return { type: 'UNKNOWN', retryable: true };
};

/**
 * Enhanced error handler with classification and retry logic
 */
export const handleApiError = async (error, context = {}) => {
  const classification = classifyError(error);
  const { operation = 'API call', maxRetries = 3 } = context;
  
  console.error(`${operation} failed:`, {
    error: error.message,
    classification,
    context
  });
  
  // Log error details for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Full error object:', error);
  }
  
  // Return structured error information
  return {
    originalError: error,
    classification,
    message: getErrorMessage(error, classification),
    retryable: classification.retryable,
    shouldRetry: classification.retryable && maxRetries > 0
  };
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error, classification) => {
  const { type } = classification;
  
  switch (type) {
    case 'NETWORK':
      return 'Network connection failed. Please check your internet connection and try again.';
    case 'TIMEOUT':
      return 'Request timed out. The server is taking too long to respond.';
    case 'RATE_LIMIT':
      return 'Too many requests. Please wait a moment before trying again.';
    case 'QUOTA_EXCEEDED':
      return 'API quota exceeded. Please check your usage limits.';
    case 'AUTHENTICATION':
      return 'Authentication failed. Please check your API key.';
    case 'PERMISSION':
      return 'Permission denied. Please check your API key permissions.';
    case 'SERVER_ERROR':
      return 'Server error occurred. Please try again later.';
    case 'CONTENT_POLICY':
      return 'Content policy violation. Please modify your request and try again.';
    case 'MODEL_NOT_FOUND':
      return 'AI model not found. Please check your model configuration.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
};

/**
 * Error reporting utility (for future integration with services like Sentry)
 */
export const reportError = (error, context = {}) => {
  const errorReport = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    context,
    classification: classifyError(error)
  };
  
  // In production, send to error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Sentry, LogRocket, etc.
    console.log('Error report:', errorReport);
  } else {
    console.error('Development error report:', errorReport);
  }
  
  return errorReport;
};

/**
 * Safe async function wrapper with error handling
 */
export const safeAsync = async (fn, fallback = null, context = {}) => {
  try {
    return await fn();
  } catch (error) {
    const errorInfo = await handleApiError(error, context);
    reportError(error, context);
    
    if (fallback !== null) {
      return fallback;
    }
    
    throw errorInfo;
  }
};

/**
 * Debounced error handler to prevent error spam
 */
export class DebouncedErrorHandler {
  constructor(delay = 1000) {
    this.delay = delay;
    this.timeout = null;
    this.pendingErrors = [];
  }
  
  handle(error, context = {}) {
    this.pendingErrors.push({ error, context, timestamp: Date.now() });
    
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    
    this.timeout = setTimeout(() => {
      this.flush();
    }, this.delay);
  }
  
  flush() {
    if (this.pendingErrors.length === 0) return;
    
    const errors = [...this.pendingErrors];
    this.pendingErrors = [];
    
    // Process errors
    errors.forEach(({ error, context }) => {
      reportError(error, context);
    });
    
    console.log(`Processed ${errors.length} debounced errors`);
  }
}

export default {
  retryWithExponentialBackoff,
  CircuitBreaker,
  classifyError,
  handleApiError,
  getErrorMessage,
  reportError,
  safeAsync,
  DebouncedErrorHandler
};
