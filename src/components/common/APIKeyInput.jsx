import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { apiKeyManager } from '@/lib/api/apiKeyManager';

const APIKeyInput = ({ onValidKey }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    // Check if we already have a valid key
    if (apiKeyManager.hasValidKey()) {
      setIsValid(true);
      onValidKey?.(true);
    }
  }, [onValidKey]);

  const validateKey = async (key) => {
    setIsValidating(true);
    setError('');

    try {
      const valid = await apiKeyManager.setKey(key);
      setIsValid(valid);
      onValidKey?.(valid);

      if (!valid) {
        setError('Invalid API key. Please check and try again.');
      }
    } catch (_err) {
      setError('Error validating API key. Please try again.');
      setIsValid(false);
      onValidKey?.(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }
    await validateKey(apiKey.trim());
  };

  const handleClear = () => {
    setApiKey('');
    setIsValid(false);
    setError('');
    apiKeyManager.clearKey();
    onValidKey?.(false);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4">
      <div className="flex items-start space-x-2">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          OpenAI API Key
        </h2>
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          onClick={() => setShowInfo(!showInfo)}
          aria-label="Show API key information"
        >
          <Info size={20} />
        </button>
      </div>

      {showInfo && (
        <div className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200">
          <p className="mb-2">Your API key is required to use the AI features. The key:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Is stored only in memory (never saved to disk or storage)</li>
            <li>Is cleared when you close or refresh the page</li>
            <li>Is used only for your roadmap generation requests</li>
            <li>Can be obtained from your OpenAI account dashboard</li>
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500
                     dark:bg-gray-800 dark:border-gray-700 dark:text-white
                     disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isValidating}
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isValidating || isValid}
            className={`px-4 py-2 rounded-lg font-medium ${
              isValid
                ? 'bg-green-500 text-white cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isValidating ? 'Validating...' : isValid ? 'Validated' : 'Validate Key'}
          </button>

          {isValid && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-200
                       hover:bg-gray-300 dark:text-gray-200 dark:bg-gray-700
                       dark:hover:bg-gray-600"
            >
              Clear Key
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default APIKeyInput;
