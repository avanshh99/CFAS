# EcoSense AI

EcoSense is a production-ready, AI-powered web application that helps individuals understand, track, and reduce their personal carbon footprint through conversational AI, smart action suggestions, and personalized data insights.

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Groq API key (starts with `gsk_`)

### Installation
```bash
git clone <your-repo>
cd ecosense
npm install
```

### Environment Setup
Create a `.env` file in the root directory (you can copy `.env.example` as a template):
```bash
cp .env.example .env
```
Add your `GROQ_API_KEY` to the `.env` file.

### Run Development Server
To launch both the frontend client and the secure Groq Express proxy server:

```bash
# In terminal 1: Start the React frontend (running on http://localhost:5173)
npm run dev

# In terminal 2: Start the proxy server (running on http://localhost:3001)
npm run server
```
*Note: Both servers must be running concurrently for full AI suggestions & chat features to function.*

### Run Tests
To run all test suites (using Vitest and React Testing Library):
```bash
npm test
```

To run tests with a code coverage report:
```bash
npm run test:coverage
```

### Build for Production
To build the optimized client-side bundle:
```bash
npm run build
npm run preview
```

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v3 + Custom design tokens
- **AI Integration**: Groq API (`llama-3.3-70b-versatile`)
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod validation
- **Storage**: LocalStorage with AES-256 encryption wrapper
- **Testing**: Vitest + React Testing Library
