# 🌟 AI-Powered Feedback Collector

A full-stack web application demonstrating modern development practices including React, Node.js, AWS (LocalStack), AI integration (Google Gemini), and CI/CD.

![CI/CD Pipeline](https://github.com/essie20/feedback-app/actions/workflows/ci.yml/badge.svg)

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React App     │────▶│  Node.js API    │────▶│   DynamoDB      │
│   (Vite + TS)   │     │  (Express)      │     │   (LocalStack)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   Gemini AI     │
                        │  (Categorize)   │
                        └─────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | DynamoDB (LocalStack for local dev) |
| **AI** | Google Gemini API |
| **Infrastructure** | AWS CDK (TypeScript) |
| **CI/CD** | GitHub Actions |
| **Testing** | Vitest, React Testing Library |

## 📋 Prerequisites

- **Node.js** v18+ (v20 recommended)
- **Docker** (for LocalStack) - *Optional but recommended*
- **Git** for version control

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd feedback-app

# Install all dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd infra && npm install && cd ..
```

### 2. Configure Environment

The project includes a `.env.local` file with your Gemini API key. The backend will automatically use it.

**Environment Variables:**
```
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite
```

### 3. Start LocalStack (Optional - for DynamoDB)

> ⚠️ **Note:** If Docker is not running, the backend will automatically use in-memory storage as a fallback. All features work, but data won't persist after restart.

```bash
# Start LocalStack (requires Docker)
docker-compose up -d

# Deploy infrastructure to LocalStack
cd infra
npm run local:bootstrap
npm run local:deploy
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
The API will be available at: `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
The app will be available at: `http://localhost:5173`

## 📂 Project Structure

```
feedback-app/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── __tests__/        # Frontend tests
│   │   ├── App.tsx           # Main app component
│   │   └── index.css         # Design system
│   └── package.json
│
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   │   ├── dynamodb.ts   # Database service
│   │   │   └── gemini.ts     # AI categorization
│   │   ├── __tests__/        # Backend tests
│   │   └── index.ts          # Server entry point
│   └── package.json
│
├── infra/                    # AWS CDK infrastructure
│   ├── lib/
│   │   └── feedback-stack.ts # DynamoDB + S3 resources
│   └── bin/
│       └── app.ts            # CDK app entry point
│
├── .github/workflows/        # CI/CD pipeline
│   └── ci.yml
│
├── docker-compose.yml        # LocalStack configuration
├── .env.local                # Environment variables
└── README.md
```

## 🧪 Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Run all tests with coverage
npm test -- --coverage
```

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/feedback` | Get all feedback |
| `GET` | `/api/feedback/stats` | Get feedback statistics |
| `POST` | `/api/feedback` | Submit new feedback |

### Submit Feedback Example

```bash
curl -X POST http://localhost:3001/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"text": "I love this app! Great work!"}'
```

Response:
```json
{
  "id": "uuid-here",
  "text": "I love this app! Great work!",
  "category": "🌟 Praise",
  "createdAt": "2026-01-11T16:20:00.000Z"
}
```

## 🤖 AI Categorization

The app uses Google Gemini AI to automatically categorize feedback into:

| Category | Example |
|----------|---------|
| 🐛 Bug Report | "There's a bug in the login page" |
| ✨ Feature Request | "Can you add dark mode?" |
| 🌟 Praise | "Amazing app, love it!" |
| 😞 Complaint | "This is terrible" |
| ❓ Question | "How do I reset my password?" |
| 💬 General Feedback | Anything else |

> **Fallback:** If no API key is configured or there's an error, the app uses rule-based categorization.

## ☁️ Infrastructure (CDK)

The CDK stack creates:
- **DynamoDB Table** - Stores feedback with category index
- **S3 Bucket** - Static website hosting for frontend

Deploy to LocalStack:
```bash
cd infra
npm run local:bootstrap
npm run local:deploy
```

## 🔧 Development Tips

### Without Docker/LocalStack

The application works perfectly without Docker! The backend includes an in-memory fallback:
- All API endpoints work normally
- Data persists during the session
- Great for development and testing

### Testing AI Categorization

Try these sample feedbacks to see AI categorization:
- "There is a bug in the system" → 🐛 Bug Report
- "Please add export feature" → ✨ Feature Request  
- "This is amazing work!" → 🌟 Praise
- "I hate how slow this is" → 😞 Complaint
- "How do I sign up?" → ❓ Question

## 🚢 Deployment

The GitHub Actions pipeline automatically:
1. Runs linting and tests for backend/frontend
2. Validates CDK infrastructure
3. Builds the frontend
4. (With AWS credentials) Deploys to AWS

To enable deployment, add these secrets to your GitHub repository:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`

## 🧠 Technical Implementation Details

During the implementation, several technical hurdles were addressed to ensure a robust developer experience:

### 1. Environment Variable Loading
The initial implementation had a race condition where modules were initialized before `dotenv` could load variables.
**Fix:** Implemented lazy initialization in `gemini.ts` and `dynamodb.ts` to ensure variables are available when the services are actually used.

### 2. Regex-Based Rule Categorization
The fallback rule-based categorization used strict word boundaries (`\b`), which failed for conjugated words (e.g., "crashing" didn't match "crash").
**Fix:** Updated regex patterns to use word stems (e.g., `\bcrash\w*`) to support natural language variations.

### 3. Graceful Fallbacks
The application is designed to be "development-ready" even without the full cloud stack:
- **No Docker?** Automatically falls back to in-memory storage.
- **No API Key?** Automatically falls back to rule-based categorization.

### 4. Windows PowerShell Compatibility
For Windows users, standard `curl` commands may fail due to PowerShell aliases.
**Recommendation:** Use `Invoke-WebRequest` as shown in the examples:
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/feedback" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"text": "Test feedback"}'
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Try a different port
PORT=3002 npm run dev
```

### Frontend can't connect to backend
Make sure the backend is running on port 3001. The Vite dev server proxies `/api` requests.

### DynamoDB connection errors
This is expected without Docker. The app automatically switches to in-memory storage.

### CORS errors
The backend is configured to accept requests from `http://localhost:5173`. If using a different port:
```bash
FRONTEND_URL=http://localhost:3000 npm run dev
```

## 📚 Resources

- [Vite Documentation](https://vitejs.dev/)
- [Express.js Guide](https://expressjs.com/)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [LocalStack Guide](https://docs.localstack.cloud/)
- [Google Gemini API](https://ai.google.dev/)

## 📄 License

MIT License - feel free to use this project for learning or as a portfolio piece!

---

**Built with ❤️ for the Vincit Rising Star Application**
