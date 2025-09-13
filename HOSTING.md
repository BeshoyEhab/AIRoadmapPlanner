# Hosting Guide for AI Roadmap Planner

## Overview

This guide describes how to deploy the AI Roadmap Planner as a secure static website that protects user API keys and data.

## Architecture Changes for Static Hosting

### 1. Remove Backend Dependencies
- Remove `server.js` and related backend code
- Migrate from server-based storage to browser storage
- Implement export/import functionality for roadmap data

### 2. Data Storage Implementation
```javascript
// Example IndexedDB schema
const dbSchema = {
  version: 1,
  stores: {
    roadmaps: 'id, title, lastModified',
    settings: 'key'
  }
}
```

### 3. API Key Management
```javascript
// Example API key management
class APIKeyManager {
  #apiKey = null; // Private field for memory-only storage
  
  setKey(key) {
    this.#apiKey = key;
    return this.validateKey(key);
  }
  
  getKey() {
    return this.#apiKey;
  }
  
  clearKey() {
    this.#apiKey = null;
  }
}
```

## Deployment Steps

### 1. GitHub Pages Setup

1. Update `vite.config.js`:
```javascript
export default defineConfig({
  base: '/ai-roadmap-planner/', // Your repository name
  build: {
    outDir: 'dist'
  }
})
```

2. Create GitHub Actions workflow:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@4.1.5
        with:
          branch: gh-pages
          folder: dist
```

### 2. Security Implementation

1. Add API Key Input Component:
```javascript
// Components must never store API key in localStorage/sessionStorage
// Only keep it in memory
const APIKeyInput = () => {
  const [isValid, setIsValid] = useState(false);
  
  const handleSubmit = async (key) => {
    if (await validateAPIKey(key)) {
      setIsValid(true);
      apiKeyManager.setKey(key);
    }
  };
  
  // Component code...
};
```

2. Implement Session Handling:
- Clear API key on page refresh/close
- Add warning about key storage
- Implement auto-logout on inactivity

### 3. Local Data Management

1. Export functionality:
```javascript
const exportRoadmap = (roadmap) => {
  const blob = new Blob(
    [JSON.stringify(roadmap)], 
    { type: 'application/json' }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${roadmap.title}-${Date.now()}.json`;
  a.click();
};
```

2. Import functionality:
```javascript
const importRoadmap = async (file) => {
  const text = await file.text();
  const roadmap = JSON.parse(text);
  await saveToIndexedDB(roadmap);
};
```

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Security Best Practices

1. API Key Protection
- Never store API keys in localStorage or sessionStorage
- Clear keys from memory when session ends
- Use HTTPS for all API requests
- Implement rate limiting on client side

2. Data Security
- Encrypt sensitive data before storing in IndexedDB
- Implement proper input sanitization
- Use Content Security Policy (CSP) headers
- Implement proper CORS settings

3. User Privacy
- Clear user data on logout
- Provide data export functionality
- Implement proper error handling
- Add privacy policy and terms of service

## Environment Variables

Create `.env` file for development:
```
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=AI Roadmap Planner
```

## Production Checks

- [ ] Build successful locally
- [ ] All routes work with base URL
- [ ] API key input working
- [ ] IndexedDB storage functional
- [ ] Export/Import working
- [ ] Error handling implemented
- [ ] Security headers configured
- [ ] Performance optimized
- [ ] Documentation updated

## Troubleshooting

### Common Issues

1. API Key Issues
- Verify key format before sending to API
- Check for CORS issues
- Validate key permissions

2. Storage Issues
- Check IndexedDB browser support
- Verify storage quota
- Handle storage errors

3. Build Issues
- Verify base URL configuration
- Check asset paths
- Validate environment variables

## Support

For issues and feature requests, please use the GitHub Issues page:
https://github.com/yourusername/ai-roadmap-planner/issues