# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development Commands
- **Start development environment**: `pnpm dev` (starts both Vite frontend and Express backend concurrently)
- **Start frontend only**: `vite`
- **Start backend server only**: `pnpm server` or `node server.js`
- **Build for production**: `pnpm build`
- **Preview production build**: `pnpm preview`
- **Lint code**: `pnpm lint` (uses ESLint with React-specific rules)

### Testing and Quality
- The project currently uses ESLint for code quality but has no test setup
- ESLint configured with React hooks rules and modern ES2020+ features
- When adding tests, use the standard React testing patterns

### Package Management
- **Package manager**: pnpm (required - uses pnpm@10.4.1+)
- **Install dependencies**: `pnpm install`
- The project explicitly uses pnpm workspaces configuration

## Architecture Overview

### Application Structure
This is a full-stack React application for AI-powered study roadmap generation with the following key architectural components:

**Frontend (React + Vite)**:
- **Main App Component** (`src/App.jsx`): Manages global state, theme, API key status, and lazy-loaded tab routing
- **Tab-based Navigation**: Four main tabs (Create, View, Saved Plans, Ongoing) with lazy loading for performance
- **Hook-based State Management**: Uses custom hooks rather than external state management libraries

**Backend (Express.js)**:
- **Simple REST API** (`server.js`): Handles roadmap persistence to local JSON files in `saves/` directory
- **File-based Storage**: Roadmaps saved as JSON files with sanitized filenames
- **CORS-enabled**: Allows frontend-backend communication during development

### Key Architectural Patterns

**Custom Hook Architecture**:
- **`useRoadmap.js`**: Central hook managing all roadmap-related state and operations
- **`useRoadmapActions.js`**: Reusable actions for roadmap management (pause/resume/generation)
- State flows from hooks to components, promoting reusability and separation of concerns

**AI Integration Architecture**:
- **Google Gemini AI**: Uses `@google/generative-ai` for roadmap generation
- **Model Fallback System**: Supports multiple Gemini models with automatic fallback (`gemini-2.5-flash`, `gemini-2.0-flash`, etc.)
- **Queue-based Generation**: Implements a generation queue system for managing multiple roadmap requests
- **State-based Generation**: Roadmaps track generation state ("queued", "in-progress", "completed")

**Component Organization**:
```
src/components/
├── layout/          # Header and layout components
├── tabs/           # Main application tabs (Create, View, Saved, Ongoing)
├── common/         # Shared components (API key input, dialogs)
├── settings/       # Settings-related components
├── roadmap/        # Roadmap-specific components
└── ui/             # shadcn/ui component library
```

### Data Flow Architecture

**Roadmap Generation Flow**:
1. User inputs objective/goal in CreateRoadmapTab
2. Creates queue item with initial roadmap structure
3. Queue processor generates roadmap using AI
4. Updates roadmap state throughout generation
5. Auto-saves completed roadmaps to backend storage

**State Management Flow**:
- Global state in App.jsx (theme, activeTab, API key status)
- Roadmap state centralized in `useRoadmap` hook
- Props drilling to child components (consider Context API for future scaling)
- Local storage for API keys, favorites, and settings

## Development Guidelines

### API Key Management
- **Required**: Google Gemini API key stored in browser localStorage
- **Setup**: Users configure via Settings UI (gear icon)
- **Security**: Keys stored client-side only, never transmitted to backend
- **Models**: Supports multiple Gemini model variants with automatic fallback

### File Structure Patterns
- **Absolute imports**: Uses `@/` alias for `src/` directory (configured in vite.config.js)
- **Component naming**: Use PascalCase for components, camelCase for utilities
- **Hook naming**: Prefix custom hooks with `use` and place in `src/hooks/`

### State Management Patterns
- **Local component state**: Use `useState` for UI-specific state
- **Shared state**: Use custom hooks for domain-specific state (roadmaps, settings)
- **Persistence**: Auto-save important data (roadmaps, favorites, settings) to localStorage/backend

### AI Integration Best Practices
- **Error handling**: Implement graceful degradation when AI services fail
- **Loading states**: Always show loading indicators for AI operations
- **Interruption handling**: Allow users to cancel long-running AI generations
- **Model fallback**: Try alternative models if primary model fails

### Export/Import System
- **Multiple formats**: Supports Markdown, PDF, JSON, HTML export
- **Structured data**: Maintains roadmap structure across all export formats
- **File naming**: Uses sanitized titles for exported filenames

### Queue Management System
- **Generation queue**: Manages multiple concurrent roadmap generation requests
- **Pause/resume**: Users can pause and resume generation queue
- **Progress tracking**: Real-time updates on generation progress
- **Error recovery**: Retry failed generations with exponential backoff

### UI/UX Patterns
- **Theme system**: Dark/light theme toggle with localStorage persistence
- **Responsive design**: Mobile-first approach using Tailwind CSS
- **Accessibility**: Uses shadcn/ui components with built-in accessibility features
- **Progressive disclosure**: Expandable sections and lazy loading for performance

## Common Development Workflows

### Adding New Features
1. Create components in appropriate `src/components/` subdirectory
2. Add any new state to `useRoadmap` hook if roadmap-related
3. Update routing in `App.jsx` if adding new tabs
4. Follow existing patterns for loading states and error handling

### Modifying AI Behavior
1. Update model configuration in `useRoadmap.js`
2. Modify generation parameters in roadmap generation functions
3. Test with multiple Gemini models for compatibility
4. Update fallback logic if needed

### Backend API Changes
1. Modify endpoints in `server.js`
2. Update corresponding frontend calls in `useRoadmap.js`
3. Ensure error handling for network failures
4. Test file system operations for cross-platform compatibility

## Important Technical Constraints

### API Dependencies
- **Google Gemini AI**: Core functionality depends on external AI service
- **Local storage**: Critical data stored in browser (API keys, favorites, settings)
- **File system**: Backend requires write access to `saves/` directory

### Performance Considerations
- **Lazy loading**: Main tabs are lazy loaded to reduce initial bundle size
- **Large roadmaps**: Complex roadmaps with many phases may impact UI performance
- **AI generation**: Long-running operations require proper loading states and cancellation

### Browser Compatibility
- **Modern browsers**: Requires ES2020+ features (async/await, optional chaining)
- **Local storage**: Depends on browser localStorage availability
- **File downloads**: Uses browser download APIs for export functionality
