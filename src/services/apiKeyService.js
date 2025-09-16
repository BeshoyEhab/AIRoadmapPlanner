/**
 * Service for handling secure API key management
 * Forwards all operations to backend API to avoid client-side storage of sensitive data
 */

const API_BASE_URL = '/api/keys';

/**
 * Save an API key to the backend
 * @param {string} key - The API key to save
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const saveApiKey = async (key) => {
  try {
    const response = await fetch(`${API_BASE_URL}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key }),
      credentials: 'include', // Include cookies for session management
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save API key');
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving API key:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get the API key from the backend
 * @returns {Promise<{key: string|null, error?: string}>}
 */
export const getApiKey = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/get`, {
      method: 'GET',
      credentials: 'include', // Include cookies for session management
    });

    if (!response.ok) {
      // If no key is set, the backend returns 404
      if (response.status === 404) {
        return { key: null };
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to retrieve API key');
    }

    const data = await response.json();
    return { key: data.key };
  } catch (error) {
    console.error('Error retrieving API key:', error);
    return { key: null, error: error.message };
  }
};

/**
 * Delete the API key from the backend
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteApiKey = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/delete`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete API key');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting API key:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Validate if the API key is properly set and valid
 * @returns {Promise<{isValid: boolean, error?: string}>}
 */
export const validateStoredApiKey = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/validate`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to validate API key');
    }

    const result = await response.json();
    return { isValid: result.valid, error: result.error };
  } catch (error) {
    console.error('Error validating API key:', error);
    return { isValid: false, error: error.message };
  }
};
