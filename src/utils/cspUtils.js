/**
 * Content Security Policy (CSP) Utilities
 * 
 * This module provides functions for generating CSP headers and nonces
 * to enhance the security of the application.
 */

/**
 * Generates a cryptographically secure random string
 * @param {number} length - Length of the random string to generate
 * @returns {string} Random string
 */
function generateRandomString(length) {
  if (length <= 0) {
    throw new Error('Length must be greater than 0');
  }
  
  const array = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').slice(0, length);
}

/**
 * Generates cryptographically secure random nonces for CSP
 * @returns {{scriptNonce: string, styleNonce: string}} Object containing nonces
 */
export function generateNonces() {
  return {
    scriptNonce: generateRandomString(32),
    styleNonce: generateRandomString(32),
  };
}

/**
 * Generates a CSP header string with the provided nonces and options
 * @param {Object} options - Configuration options
 * @param {string} options.scriptNonce - Nonce for script-src
 * @param {string} options.styleNonce - Nonce for style-src
 * @param {string[]} [options.additionalScripts=[]] - Additional script sources to allow
 * @param {string[]} [options.additionalStyles=[]] - Additional style sources to allow
 * @param {boolean} [options.isDev=false] - Whether to include dev server in connect-src
 * @returns {string} The generated CSP header value
 */
export function generateCSPHeader({
  scriptNonce,
  styleNonce,
  additionalScripts = [],
  additionalStyles = [],
  isDev = false,
}) {
  if (!scriptNonce || !styleNonce) {
    throw new Error('Both scriptNonce and styleNonce are required');
  }

  // Base directives
  const directives = {
    'default-src': ["'self'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'object-src': ["'none'"],
    'upgrade-insecure-requests': [],
  };

  // Script sources
  directives['script-src'] = [
    "'self'",
    `'nonce-${scriptNonce}'`,
    "'strict-dynamic'",
    ...additionalScripts,
  ];

  // Style sources
  directives['style-src'] = [
    "'self'",
    `'nonce-${styleNonce}'`,
    ...additionalStyles,
  ];

  // Image sources
  directives['img-src'] = [
    "'self'",
    'data:',
    'https:', // Allow images from any HTTPS source
  ];

  // Font sources
  directives['font-src'] = ["'self'", 'data:'];

  // Connect sources
  directives['connect-src'] = [
    "'self'",
    'https://generativelanguage.googleapis.com',
    'https://api.anthropic.com',
    ...(isDev ? ['ws://localhost:5173', 'http://localhost:5173'] : []),
  ];

  // Report violations to this URI
  directives['report-uri'] = ['/_csp-violation-report-endpoint'];

  // Convert directives to CSP string
  return Object.entries(directives)
    .map(([directive, sources]) => {
      if (sources.length === 0) return directive;
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * Generates a cryptographically secure random string
 * @param {number} length - Length of the string to generate
 * @returns {string} Random string
 */
function generateRandomString(length) {
  if (length <= 0) throw new Error('Length must be greater than 0');
  const bytes = crypto.randomBytes(Math.ceil(length / 2));
  return bytes.toString('hex').slice(0, length);
}

// Export for testing
export const _private = {
  generateRandomString,
};
