# AI Roadmap Planner - Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Codebase Structure](#codebase-structure)
3. [Key Components](#key-components)
4. [State Management](#state-management)
5. [Recent Changes](#recent-changes)
6. [Known Issues](#known-issues)
7. [Development Setup](#development-setup)
8. [Testing](#testing)
9. [Future Improvements](#future-improvements)

## Project Overview
AI Roadmap Planner is a React-based web application that helps users create and manage learning roadmaps using AI. The application allows users to generate personalized learning paths, track progress, and manage multiple roadmaps.

## Codebase Structure

```
src/
├── App.jsx               # Main application component
├── components/           # Reusable UI components
│   ├── layout/           # Layout components (Header, Sidebar, etc.)
│   ├── tabs/             # Main tab components
│   │   ├── CreateRoadmapTab.jsx
│   │   ├── ViewRoadmapTab.jsx
│   │   ├── SavedPlansTab.jsx
│   │   └── OngoingTab.jsx
│   └── RoadmapContent.jsx # Shared roadmap display component
├── hooks/                # Custom React hooks
│   ├── useRoadmap.js     # Main roadmap logic hook
│   └── roadmap/          # Roadmap-related hooks
│       └── useRoadmapActions.js
├── lib/                  # Third-party library configurations
└── utils/                # Utility functions
```

## Key Components

### 1. App.jsx
- Main application component
- Manages global state and routing
- Handles theme and layout

### 2. CreateRoadmapTab.jsx
- Interface for creating new roadmaps
- Handles user input for objectives and goals
- Manages the roadmap generation process

### 3. ViewRoadmapTab.jsx
- Displays generated roadmaps
- Handles roadmap interactions
- Manages export functionality

### 4. useRoadmap.js
- Main hook for roadmap logic
- Manages API calls to AI services
- Handles state for roadmaps, loading, and errors

### 5. useRoadmapActions.js
- Contains reusable roadmap actions
- Handles pause/resume functionality
- Manages queue for roadmap generation

## State Management

The application uses React's built-in state management with the following key state variables:

- `activeTab`: Controls which tab is currently active
- `roadmap`: Current roadmap data
- `loading`: Loading state for async operations
- `generationQueue`: Queue for managing multiple roadmap generations
- `isQueuePaused`: Controls whether the generation queue is paused

## Recent Changes

### 2025-08-24: Fixed setActiveTab Prop Issue
- **Files Modified**:
  - `src/components/tabs/CreateRoadmapTab.jsx`
  - `src/App.jsx`
- **Changes**:
  - Added `setActiveTab` to CreateRoadmapTab props
  - Ensured proper prop passing to child components
  - Fixed reference error in roadmap actions

## Known Issues

1. **Error Handling**
   - Some error states might not be properly handled in the UI
   - Network errors during roadmap generation could be more gracefully managed

2. **Performance**
   - Large roadmaps might cause performance issues
   - Consider virtualizing long lists for better performance

3. **Accessibility**
   - Some components may need better ARIA labels
   - Keyboard navigation could be improved

## Development Setup

### Prerequisites
- Node.js (v16 or later)
- pnpm

### Installation
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Environment Variables
Create a `.env` file in the root directory:
```
VITE_GEMINI_API_KEY=your_api_key_here
```

## Testing

Run tests with:
```bash
pnpm test
```

## Future Improvements

1. **Code Quality**
   - Add more comprehensive unit tests
   - Implement end-to-end testing
   - Add TypeScript for better type safety

2. **Features**
   - Add collaborative roadmap editing
   - Implement offline support
   - Add more export formats

3. **Performance**
   - Optimize re-renders
   - Implement code splitting
   - Add loading states for better UX

## AI Integration Notes

- The application uses Google's Generative AI (Gemini)
- API key management is handled through environment variables
- Rate limiting and error handling should be considered for production use

## Troubleshooting

### Common Issues
1. **Missing Dependencies**
   - Run `pnpm install` to ensure all dependencies are installed

2. **API Errors**
   - Verify your API key is correctly set in `.env`
   - Check network connectivity

3. **Build Failures**
   - Clear node_modules and reinstall dependencies
   - Check for version conflicts in package.json

---
Last Updated: 2025-08-24
