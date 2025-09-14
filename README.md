# TimePlan - AI-Powered Study Roadmap Planner

<div align="center">
  <img src="https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6.3.5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.1.7-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/AI-Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini AI" />
</div>

<div align="center">
  <h3>🎯 Transform Your Learning Journey with AI-Generated Study Roadmaps</h3>
  <p>A modern, responsive web application that creates personalized learning paths using Google's Gemini AI, featuring progress tracking, flexible time management, and comprehensive study planning tools.</p>
</div>

---

## 🌟 Overview

TimePlan is an innovative study planning application that leverages the power of artificial intelligence to create comprehensive, personalized learning roadmaps. Built with modern web technologies and designed with user experience in mind, TimePlan helps students, professionals, and lifelong learners structure their educational journey with precision and flexibility.

The application integrates Google's advanced Gemini AI models to analyze learning objectives and generate detailed study plans that include phase-based learning, mini-goals, resource recommendations, and progress tracking capabilities. Whether you're preparing for a certification, learning a new programming language, or diving into a complex academic subject, TimePlan provides the structure and guidance needed to achieve your educational goals efficiently.

## ✨ Key Features

### 🤖 AI-Powered Roadmap Generation
- **Intelligent Planning**: Utilizes Google Gemini AI models (2.5 Flash, 2.0 Flash, 1.5 Flash, 1.5 Pro, 1.0 Pro) to create comprehensive study plans
- **Personalized Content**: Generates customized learning paths based on your specific objectives and final goals
- **Adaptive Difficulty**: Automatically adjusts content complexity based on your experience level and learning preferences
- **Resource Integration**: Provides curated learning resources, tutorials, and project suggestions for each phase

### 📊 Advanced Progress Tracking
- **Phase-Based Learning**: Organizes study plans into manageable phases with clear milestones
- **Mini-Goal System**: Breaks down each phase into actionable mini-goals with estimated time requirements
- **Progress Visualization**: Real-time progress tracking with visual indicators and completion percentages
- **Flexible Scheduling**: Adaptable time allocation that accommodates your personal schedule and learning pace

### 🎨 Modern User Interface
- **Responsive Design**: Fully responsive interface that works seamlessly across desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between dark and light themes for comfortable viewing in any environment
- **Intuitive Navigation**: Clean, modern interface built with Tailwind CSS and shadcn/ui components
- **Accessibility**: Designed with accessibility best practices for inclusive user experience

### 💾 Data Management
- **Local Storage**: Secure local storage of your study plans and progress data
- **Import/Export**: Export your roadmaps to multiple formats (Markdown, PDF, JSON, HTML)
- **Backup & Restore**: Settings export/import functionality for easy backup and device migration
- **Multiple Plans**: Save and manage multiple study roadmaps simultaneously

### ⚙️ Comprehensive Settings
- **API Configuration**: Easy setup and management of Google Gemini API keys
- **Model Selection**: Choose from multiple AI models based on your needs and preferences
- **Customization Options**: Personalize auto-save behavior, notifications, and export preferences
- **Multi-language Support**: Interface available in multiple languages (English, Spanish, French, German, Chinese, Japanese)

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18.0 or higher)
- **npm** or **pnpm** (pnpm recommended for faster installation)
- **Google Gemini API Key** (obtain from [Google AI Studio](https://aistudio.google.com/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/timeplan.git
   cd timeplan
   ```

2. **Install dependencies**
   ```bash
   # Using pnpm (recommended)
   pnpm install
   
   # Or using npm
   npm install
   ```

3. **Set up your API key**
   - Visit [Google AI Studio](https://aistudio.google.com/apikey)
   - Generate a new API key
   - Launch the application and navigate to Settings (gear icon)
   - Enter your API key in the configuration section

4. **Start the development server**
   ```bash
   # Using pnpm
   pnpm dev
   
   # Or using npm
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to access the application

### Production Build

To create a production build:

```bash
# Build the application
pnpm build

# Preview the production build
pnpm preview

# Start the server component
pnpm server
```

## 📖 Usage Guide

### Creating Your First Roadmap

1. **Define Your Objective**
   - Navigate to the "Create Roadmap" tab
   - Enter a clear, specific learning objective (e.g., "Learn React.js for web development")
   - Provide additional context about your current skill level and time constraints

2. **Set Your Final Goal**
   - Describe what you want to achieve by the end of your study plan
   - Be specific about the skills, knowledge, or certifications you're targeting
   - Include any project goals or practical applications you want to master

3. **Generate Your Roadmap**
   - Click "Generate Roadmap" to let AI create your personalized study plan
   - The system will analyze your input and generate a comprehensive learning path
   - Review the generated phases, resources, and timeline

4. **Customize and Save**
   - Review each phase and adjust as needed
   - Save your roadmap with a descriptive name for future reference
   - Begin tracking your progress through the mini-goals system

### Managing Your Study Progress

1. **Phase Navigation**
   - Each roadmap is divided into logical learning phases
   - Progress through phases sequentially or jump to specific sections
   - Track completion percentage for overall progress monitoring

2. **Mini-Goal Tracking**
   - Check off completed mini-goals within each phase
   - View estimated time requirements and adjust your schedule accordingly
   - Access linked resources and tutorials directly from the interface

3. **Progress Monitoring**
   - Monitor your overall completion percentage
   - View detailed progress breakdowns by phase
   - Track time spent and remaining estimated time

### Exporting and Sharing

1. **Multiple Export Formats**
   - **Markdown**: Perfect for documentation and version control
   - **PDF**: Professional format for printing or sharing
   - **JSON**: Data format for backup or integration with other tools
   - **HTML**: Web-ready format for online sharing

2. **Sharing Options**
   - Export roadmaps to share with mentors, colleagues, or study groups
   - Print physical copies for offline reference
   - Copy JSON data for integration with other productivity tools

## 🛠️ Technical Architecture

### Frontend Stack

- **React 19.1.0**: Modern React with latest features including enhanced error boundaries
- **Vite 6.3.5**: Lightning-fast build tool with modern development server
- **Tailwind CSS 4.1.7**: Utility-first CSS framework with custom theming support
- **shadcn/ui**: Accessible React components with full dark/light theme support
- **Enhanced Error Handling**: Comprehensive error boundaries and graceful degradation
- **Progressive Loading**: Lazy-loaded components with intelligent fallbacks
- **Offline Detection**: Network status monitoring with user feedback

### Backend Integration

- **Express.js**: RESTful API server with file-based JSON storage
- **CORS Support**: Cross-origin resource sharing for development and production
- **Google Gemini AI**: Multi-model fallback system (2.5 Flash, 2.0 Flash, etc.)
- **Queue Management**: Advanced generation queue with priority handling
- **Error Recovery**: Automatic retry logic with exponential backoff

### Modern Development Features

- **Enhanced State Management**: Custom hooks with optimized re-rendering
- **Performance Optimization**: React.memo, useCallback, and useMemo usage
- **Smooth Transitions**: Theme switching with CSS transitions
- **Accessibility**: Full ARIA support and screen reader compatibility
- **Mobile-First Design**: Responsive layout with touch-friendly interactions

### Security & Error Handling

- **Client-Side API Keys**: Secure localStorage-based key management
- **Error Boundaries**: Comprehensive error catching and recovery
- **Network Resilience**: Offline mode detection and graceful degradation
- **Input Validation**: Robust form validation and sanitization
- **CSP Ready**: Content Security Policy compatible architecture

### Key Dependencies

```json
{
  "dependencies": {
    "@google/generative-ai": "^0.24.1",
    "@radix-ui/react-*": "Latest versions",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "tailwindcss": "^4.1.7",
    "framer-motion": "^12.15.0",
    "react-router-dom": "^7.6.1",
    "express": "^5.1.0"
  }
}
```

## 🎯 Core Functionality

### AI Roadmap Generation

The heart of TimePlan lies in its sophisticated AI integration that transforms simple learning objectives into comprehensive study plans. The system utilizes Google's Gemini AI models to analyze user input and generate structured learning paths that include:

**Phase-Based Learning Structure**: Each roadmap is organized into logical phases that build upon previous knowledge. The AI considers the complexity of the subject matter, typical learning progression patterns, and industry best practices to create a coherent learning journey.

**Resource Curation**: For each phase, the AI suggests relevant learning resources including online courses, tutorials, documentation, books, and practical projects. These resources are carefully selected based on quality, relevance, and alignment with the learning objectives.

**Time Estimation**: The system provides realistic time estimates for each phase and mini-goal, taking into account the complexity of the material and typical learning speeds. These estimates help learners plan their schedule effectively while maintaining flexibility.

**Skill Progression Mapping**: The AI identifies key skills that will be developed throughout the learning journey and maps them to specific phases, helping learners understand how their capabilities will evolve over time.

### Progress Tracking System

TimePlan's progress tracking system is designed to provide comprehensive insights into your learning journey while maintaining motivation and accountability:

**Mini-Goal Architecture**: Each phase is broken down into specific, actionable mini-goals that can be completed in focused study sessions. This granular approach makes large learning objectives feel manageable and provides frequent opportunities for achievement and progress validation.

**Flexible Time Management**: The system accommodates different learning styles and schedules by allowing users to adjust time allocations and deadlines. Whether you prefer intensive study sessions or gradual, consistent progress, TimePlan adapts to your preferred learning rhythm.

**Visual Progress Indicators**: Real-time progress visualization helps learners understand their advancement through both individual phases and the overall roadmap. Progress bars, completion percentages, and milestone markers provide immediate feedback on achievements.

**Completion Tracking**: The system maintains detailed records of completed mini-goals, including completion dates and time spent, enabling learners to analyze their productivity patterns and optimize their study habits.

## 🔧 Configuration Options

### API Configuration

TimePlan requires a Google Gemini API key to function. The application supports multiple Gemini models, each optimized for different use cases:

- **Gemini 2.5 Flash**: Latest model with enhanced performance and accuracy
- **Gemini 2.0 Flash**: Optimized for speed with excellent quality
- **Gemini 1.5 Flash**: Balanced performance for general use
- **Gemini 1.5 Pro**: Advanced model for complex reasoning tasks
- **Gemini 1.0 Pro**: Reliable model for standard applications

### Application Settings

**Auto-save Functionality**: Enable automatic saving of your progress and changes to prevent data loss during extended study sessions.

**Notification Preferences**: Configure push notifications for milestone achievements, deadline reminders, and progress updates.

**Export Preferences**: Set default export formats and customize the content included in exported roadmaps.

**Interface Customization**: Choose your preferred theme, language, and layout options to create an optimal learning environment.

### Data Management

**Local Storage**: All data is stored locally in your browser, ensuring privacy and offline access to your study plans.

**Backup Options**: Export your settings and roadmaps for backup purposes or to transfer between devices.

**Import Capabilities**: Import previously exported settings or roadmaps to restore your learning environment quickly.

## 🌐 Deployment & Hosting

### Free Hosting Options

TimePlan can be deployed to various free hosting platforms. Here are the recommended options:

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project directory
vercel --prod
```

**Why Vercel?**
- Zero-configuration deployment
- Automatic HTTPS and CDN
- Perfect for React/Vite applications
- Excellent performance and reliability

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
pnpm build
netlify deploy --prod --dir=dist
```

**Netlify Benefits:**
- Simple drag-and-drop deployment
- Automatic builds from Git
- Built-in form handling
- Edge functions support

#### GitHub Pages
```bash
# Build the project
pnpm build

# Deploy to gh-pages branch
npx gh-pages -d dist
```

**GitHub Pages Setup:**
1. Enable GitHub Pages in repository settings
2. Select `gh-pages` branch as source
3. Configure custom domain if needed

#### Cloudflare Pages
```bash
# Build command: pnpm build
# Output directory: dist
# Node.js version: 18+
```

### Production Deployment Checklist

- [ ] **Build Optimization**: Run `pnpm build` to create optimized production build
- [ ] **Environment Variables**: Configure any required environment variables
- [ ] **HTTPS Setup**: Ensure HTTPS is enabled (automatic on most platforms)
- [ ] **CSP Headers**: Configure Content Security Policy for enhanced security
- [ ] **Error Monitoring**: Set up error tracking (optional)
- [ ] **Performance Testing**: Test loading speed and responsiveness
- [ ] **Cross-browser Testing**: Verify functionality across different browsers

### Backend Deployment (Optional)

If deploying the backend separately:

```bash
# For Railway, Render, or Heroku
echo "web: node server.js" > Procfile

# Set environment variables
PORT=3000
NODE_ENV=production
```

## 🔐 Security & Privacy

### API Key Security Best Practices

#### ✅ What TimePlan Does Right

**Client-Side Storage**: API keys are stored only in your browser's localStorage, never on external servers.

**Direct API Communication**: Your browser communicates directly with Google AI services, bypassing our servers entirely.

**No Server-Side Key Storage**: TimePlan backend never sees or stores your API keys.

**User Control**: You have complete control over your API key - add, remove, or update it anytime.

**Local Validation**: API key format validation happens locally before any external requests.

#### ❌ Security Anti-Patterns We Avoid

- **No Environment Variables**: Never store client-side API keys in environment variables
- **No Repository Commits**: API keys are never committed to version control
- **No Server Proxying**: We don't proxy API requests through our servers
- **No Shared Keys**: Each user manages their own individual API key
- **No Third-Party Analytics**: No tracking or data collection of API usage

### Content Security Policy (CSP)

For enhanced security in production, configure these CSP headers:

```http
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  connect-src 'self' https://generativelanguage.googleapis.com;
  img-src 'self' data: blob:;
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
```

### Privacy Guarantees

**🔒 Zero Data Collection**: TimePlan collects no personal information, usage statistics, or behavioral data.

**🔒 Local-First Architecture**: All your data remains on your device unless you explicitly export it.

**🔒 No Cookies**: The application doesn't use cookies or tracking technologies.

**🔒 No User Accounts**: No sign-up required means no personal information collected.

**🔒 Encrypted Communication**: All external API calls use HTTPS encryption.

### API Key Management Tips

1. **Keep Keys Private**: Never share your API key or commit it to public repositories
2. **Regular Rotation**: Consider rotating your API key periodically for security
3. **Monitor Usage**: Check your Google AI Studio dashboard for unusual usage patterns
4. **Backup Safely**: If backing up, ensure API keys are stored securely
5. **Use Restrictions**: Configure API key restrictions in Google Cloud Console if needed

### Incident Response

If you suspect your API key has been compromised:

1. **Immediately Revoke**: Delete the compromised key from Google AI Studio
2. **Generate New Key**: Create a new API key with fresh credentials
3. **Update Application**: Replace the key in TimePlan settings
4. **Monitor Billing**: Check Google Cloud billing for unexpected usage
5. **Review Activity**: Look for suspicious activity in your Google account

## 📱 Responsive Design

TimePlan is built with a mobile-first approach, ensuring optimal performance and usability across all device types:

### Desktop Experience
- **Full-featured Interface**: Access to all functionality with optimized layouts for large screens
- **Multi-panel Views**: Simultaneous viewing of roadmap details, progress tracking, and resource lists
- **Keyboard Shortcuts**: Efficient navigation and interaction through keyboard commands
- **Advanced Export Options**: Full-featured export capabilities with preview options

### Tablet Experience
- **Touch-optimized Controls**: Interface elements sized and positioned for comfortable touch interaction
- **Adaptive Layouts**: Dynamic layout adjustments based on screen orientation and size
- **Gesture Support**: Intuitive swipe and tap gestures for navigation and interaction

### Mobile Experience
- **Streamlined Interface**: Simplified navigation optimized for small screens
- **Progressive Disclosure**: Information presented in digestible chunks with expandable sections
- **Offline Functionality**: Core features available without internet connection
- **Performance Optimization**: Fast loading and smooth interactions on mobile devices

## 🔒 Privacy and Security

TimePlan prioritizes user privacy and data security through several key measures:

**Local Data Storage**: All personal data, including study plans, progress information, and settings, is stored locally in your browser. This approach ensures that your learning data never leaves your device unless you explicitly choose to export it.

**API Key Security**: Your Google Gemini API key is stored securely in your browser's local storage and is only used for direct communication with Google's AI services. The key is never transmitted to or stored on any third-party servers.

**No User Tracking**: TimePlan does not implement any user tracking, analytics, or data collection mechanisms. Your usage patterns and learning progress remain completely private.

**Secure Communication**: All communication with external services (Google AI) uses encrypted HTTPS connections to protect data in transit.

## 🤝 Contributing

We welcome contributions from the community! Whether you're interested in fixing bugs, adding features, improving documentation, or enhancing the user experience, your contributions are valuable.

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** for your changes
4. **Install dependencies** using `pnpm install`
5. **Start the development server** with `pnpm dev`
6. **Make your changes** and test thoroughly
7. **Submit a pull request** with a clear description of your changes

### Contribution Guidelines

- **Code Quality**: Follow the existing code style and use ESLint for consistency
- **Testing**: Ensure your changes don't break existing functionality
- **Documentation**: Update documentation for any new features or changes
- **Commit Messages**: Use clear, descriptive commit messages
- **Pull Requests**: Provide detailed descriptions of changes and their purpose

### Areas for Contribution

- **Feature Development**: New functionality and enhancements
- **UI/UX Improvements**: Design refinements and user experience enhancements
- **Performance Optimization**: Speed and efficiency improvements
- **Accessibility**: Making the application more accessible to all users
- **Internationalization**: Adding support for additional languages
- **Documentation**: Improving guides, tutorials, and API documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google AI Team** for providing the powerful Gemini AI models
- **Vercel** for the excellent shadcn/ui component library
- **Tailwind Labs** for the outstanding Tailwind CSS framework
- **React Team** for the robust React framework
- **Vite Team** for the lightning-fast build tool
- **Open Source Community** for the countless libraries and tools that make this project possible

## 📞 Support

If you encounter any issues, have questions, or need assistance:

- **GitHub Issues**: Report bugs or request features through GitHub Issues
- **Documentation**: Check this README and inline code documentation
- **Community**: Join discussions in the GitHub Discussions section

---

<div align="center">
  <p><strong>Built with ❤️ by the TimePlan Team</strong></p>
  <p>Empowering learners worldwide with AI-driven study planning</p>
</div>

