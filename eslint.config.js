import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': [
        'error', 
        { 
          varsIgnorePattern: '^[A-Z_]|^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    // Disable linting for library files to avoid noise from unused parameters
    files: ['src/lib/**/*.js', 'src/lib/**/*.jsx'],
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off'
    }
  },
  {
    // Configure Jest environment for test files
    files: ['**/__tests__/**/*.js', '**/__tests__/**/*.jsx', '**/*.test.js', '**/*.test.jsx'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.jasmine,
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        it: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off'
    }
  }
]
