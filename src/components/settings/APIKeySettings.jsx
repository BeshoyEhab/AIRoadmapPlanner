import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { KeyRound, AlertCircle } from 'lucide-react';

const APIKeySettings = () => {
  const { hasValidApiKey, setApiKey, clearApiKey } = useAppContext();
  const [apiKey, setApiKeyInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const isValid = await setApiKey(apiKey.trim());
      if (!isValid) {
        setError('Invalid API key. Please check and try again.');
      }
    } catch (_err) {
      setError('Error validating API key. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClear = () => {
    setApiKeyInput('');
    setError('');
    clearApiKey();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            OpenAI API Key
          </h3>
        </div>
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          onClick={() => setShowInfo(!showInfo)}
        >
          <AlertCircle className="w-5 h-5" />
        </button>
      </div>

      {showInfo && (
        <div className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200">
          <p className="mb-2">To use the AI features, you need to provide your OpenAI API key.</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Get your API key from the OpenAI website</li>
            <li>The key is stored only in memory and cleared when you close the page</li>
            <li>Your key is never sent to our servers</li>
            <li>API usage costs are based on your OpenAI account</li>
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="sk-..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500
                     dark:bg-gray-800 dark:border-gray-700 dark:text-white
                     disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isValidating || hasValidApiKey}
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        <div className="flex space-x-4">
          {!hasValidApiKey ? (
            <button
              type="submit"
              disabled={isValidating}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? 'Validating...' : 'Save API Key'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Clear API Key
            </button>
          )}
        </div>
      </form>

      {hasValidApiKey && (
        <p className="text-sm text-green-600 dark:text-green-400">
          ✓ Valid API key is set and ready to use
        </p>
      )}
    </div>
  );
};

export default APIKeySettings;
