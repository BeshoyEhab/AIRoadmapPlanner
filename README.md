# TimePlan - AI-Powered Study Roadmap Planner

<div align="center">
  <img src="https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6.3.5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.1.7-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/AI-Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini AI" />
  <br />
  <img src="https://api.netlify.com/api/v1/badges/b96bfb91-b2a8-4b84-b23d-985f6f22fd1d/deploy-status" alt="Netlify Status" />
</div>

<div align="center">
  <h3>🎯 Transform Your Learning Journey with AI-Generated Study Roadmaps</h3>
  <p>A modern, responsive web application that creates personalized learning paths using Google's Gemini AI, featuring progress tracking, flexible time management, and comprehensive study planning tools.</p>
  
  **🌐 [Live Demo](https://airoadmapplanner.netlify.app)**
</div>

---

## 🌟 Overview

TimePlan is an innovative study planning application that leverages Google's Gemini AI to create comprehensive, personalized learning roadmaps. Whether you're preparing for a certification, learning a new programming language, or diving into a complex academic subject, TimePlan provides the structure and guidance needed to achieve your educational goals efficiently.

## ✨ Key Features

### 🤖 AI-Powered Roadmap Generation
- **Intelligent Planning**: Utilizes Google Gemini AI models to create comprehensive study plans
- **Personalized Content**: Generates customized learning paths based on your specific objectives
- **Adaptive Difficulty**: Automatically adjusts content complexity based on your experience level
- **Resource Integration**: Provides curated learning resources and project suggestions

### 📊 Advanced Progress Tracking
- **Phase-Based Learning**: Organizes study plans into manageable phases with clear milestones
- **Mini-Goal System**: Breaks down each phase into actionable mini-goals
- **Progress Visualization**: Real-time progress tracking with visual indicators
- **Flexible Scheduling**: Adaptable time allocation for your personal schedule

### 🎨 Modern User Interface
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Intuitive Navigation**: Clean, modern interface built with Tailwind CSS and shadcn/ui components

### 💾 Data Management
- **Local Storage**: Secure local storage of your study plans and progress data
- **Import/Export**: Export roadmaps to multiple formats (Markdown, PDF, JSON, HTML)
- **Multiple Plans**: Save and manage multiple study roadmaps simultaneously

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 20.0 or higher)
- **npm** or **pnpm** (pnpm recommended)
- **Google Gemini API Key** (obtain from [Google AI Studio](https://aistudio.google.com/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BeshoyEhab/AIRoadmapPlanner.git
   cd AIRoadmapPlanner
   ```

2. **Install dependencies**
   ```bash
   # Using pnpm (recommended)
   pnpm install
   
   # Or using npm
   npm install
   ```

3. **Set up your API key**
   - Visit [Google AI Studio](https://aistudio.google.com/apikey) (High recommended)
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

```bash
# Build the application
pnpm build

# Preview the production build
pnpm preview
```

## 📖 Usage Guide

### Creating Your First Roadmap

1. **Define Your Objective**
   - Navigate to the "Create Roadmap" tab
   - Enter a clear, specific learning objective
   - Provide context about your current skill level and time constraints

2. **Set Your Final Goal**
   - Describe what you want to achieve by the end of your study plan
   - Be specific about skills, knowledge, or certifications you're targeting

3. **Generate Your Roadmap**
   - Click "Generate Roadmap" to let AI create your personalized study plan
   - Review the generated phases, resources, and timeline
   - Save your roadmap with a descriptive name

4. **Track Your Progress**
   - Check off completed mini-goals within each phase
   - Monitor your overall completion percentage
   - Access linked resources directly from the interface

## 🛠️ Technical Stack

- **React 19.1.0**: Modern React with latest features
- **Vite 6.3.5**: Lightning-fast build tool
- **Tailwind CSS 4.1.7**: Utility-first CSS framework
- **shadcn/ui**: Accessible React components
- **Google Gemini AI**: Multiple AI models for roadmap generation

## 🔐 Privacy & Security

- **Local Data Storage**: All data stored locally in your browser
- **API Key Security**: Keys stored securely in localStorage, never transmitted to third-party servers
- **No User Tracking**: No analytics or data collection
- **Secure Communication**: All external API calls use HTTPS encryption

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google AI Team** for the powerful Gemini AI models
- **shadcn/ui** for the excellent component library
- **Tailwind Labs** for Tailwind CSS
- **React Team** for the robust React framework
- **Vite Team** for the build tool

---

<div align="center">
  <p><strong>Built with ❤️ by the TimePlan Team</strong></p>
  <p>🌐 <a href="https://airoadmapplanner.netlify.app">Try TimePlan Now</a></p>
</div>
