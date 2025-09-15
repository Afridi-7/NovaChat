# 🌟 Afridi.ai - Advanced AI Assistant

A beautiful, modern, and feature-rich chatbot application powered by Google's Gemini AI with session-based conversations, real-time messaging, and an intuitive user interface.

## ✨ Features

### 🚀 Core Features
- **Advanced AI Integration**: Powered by Google's Gemini-1.5-Flash model via LangChain
- **Session-based Conversations**: Persistent chat history with multiple conversation threads
- **Real-time Messaging**: Instant responses with typing indicators and smooth animations
- **Modern UI/UX**: Beautiful gradient design with glass-morphism effects
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode**: System preference detection with manual toggle
- **Message Management**: Like/dislike reactions, copy functionality, and timestamps

### 🎨 Design Features
- **Dynamic Gradients**: Purple-to-blue color schemes with animated backgrounds
- **Smooth Animations**: Micro-interactions and transition effects throughout
- **Glass Morphism**: Modern frosted glass effects and subtle shadows
- **Professional Typography**: Inter font with optimized spacing and hierarchy
- **Interactive Elements**: Hover states, focus rings, and touch-friendly interactions
- **Custom Scrollbars**: Styled scrollbars that match the theme

### 🔧 Advanced Features
- **Configurable Personality**: Customizable AI prompts via template.json
- **Voice Recording UI**: Ready for voice input integration
- **File Attachment UI**: Prepared for document and media sharing
- **Message Search**: Find conversations quickly (UI ready)
- **Export Functionality**: Ready for chat history export
- **Error Handling**: Graceful error boundaries and user feedback
- **Health Monitoring**: Backend health checks and status indicators

## 🏗️ Architecture

### Backend (FastAPI + LangChain)
```
backend/
├── main.py                 # FastAPI application with all endpoints
├── template.json           # AI personality configuration
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
└── README.md              # Backend-specific documentation
```

**Key Components:**
- **FastAPI**: Modern, fast web framework for building APIs
- **LangChain**: Framework for developing applications with LLMs
- **Google Generative AI**: Gemini-1.5-Flash model integration
- **Session Management**: In-memory storage with persistent chat history
- **CORS Support**: Cross-origin resource sharing for frontend integration

### Frontend (React + TypeScript + Tailwind CSS)
```
src/
├── components/             # Reusable UI components
│   ├── ChatMessage.tsx        # Individual message display
│   ├── ChatInput.tsx          # Message input with attachments
│   ├── Sidebar.tsx            # Navigation and session management
│   ├── ErrorBoundary.tsx      # Error handling
│   └── LoadingSpinner.tsx     # Loading states
├── hooks/                  # Custom React hooks
│   ├── useChat.ts             # Chat logic and state management
│   └── useTheme.ts            # Theme management
├── services/               # API and external services
│   └── chatApi.ts             # Backend communication
├── types/                  # TypeScript type definitions
│   └── chat.ts                # Chat-related interfaces
├── config/                 # Configuration files
│   └── chatConfig.ts          # Chatbot personality settings
└── App.tsx                 # Main application component
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **Python 3.8+** and pip
- **Google AI API Key** (for Gemini model access)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd Afridi.ai
```

### 2. Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Add your Google AI API key to .env
echo "GOOGLE_API_KEY=your_api_key_here" >> .env

# Start the backend server
python main.py
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup
```bash
# From project root
npm install

# Create environment file
cp .env.example .env

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔌 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Endpoints

#### 1. Health Check
```http
GET /
Response: {
  "message": "🚀 Afridi.ai API is running!",
  "version": "1.0.0",
  "status": "healthy",
  "langchain_status": "configured"
}
```

#### 2. Send Message
```http
POST /api/v1/chat
Content-Type: application/json

{
  "session_id": "user-session-123",
  "message": "Hello, how are you?",
  "config": {
    "temperature": 0.7
  }
}

Response: {
  "success": true,
  "data": {
    "message": "Hello! I'm doing great, thank you for asking...",
    "session_id": "user-session-123"
  }
}
```

#### 3. Get Chat History
```http
GET /api/v1/sessions/{session_id}/history

Response: {
  "success": true,
  "data": [
    {
      "id": "msg-1",
      "content": "Hello, how are you?",
      "sender": "user",
      "timestamp": "2024-01-01T12:00:00Z",
      "reaction": null
    },
    {
      "id": "msg-2",
      "content": "Hello! I'm doing great...",
      "sender": "assistant",
      "timestamp": "2024-01-01T12:00:01Z",
      "reaction": "like"
    }
  ]
}
```

#### 4. Reset Session
```http
POST /api/v1/sessions/{session_id}/reset

Response: {
  "success": true,
  "message": "Session reset successfully"
}
```

#### 5. Get All Sessions
```http
GET /api/v1/sessions

Response: {
  "success": true,
  "data": [
    {
      "id": "session-1",
      "title": "Hello, how are you?",
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-01T12:05:00Z",
      "message_count": 10
    }
  ]
}
```

#### 6. Delete Session
```http
DELETE /api/v1/sessions/{session_id}

Response: {
  "success": true,
  "message": "Session deleted successfully"
}
```

## ⚙️ Configuration

### AI Personality Customization

Edit `backend/template.json` to customize Afridi.ai's personality:

```json
{
  "_type": "prompt",
  "input_variables": ["input", "history"],
  "template": "You are Afridi.ai, an advanced AI assistant with a friendly, intelligent, and helpful personality...\n\nConversation History:\n{history}\n\nHuman: {input}\n\nAfridi.ai:"
}
```

### Environment Variables

#### Backend (.env)
```env
# Google AI Configuration
GOOGLE_API_KEY=your_google_ai_api_key_here

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=true

# Logging
LOG_LEVEL=info

# CORS Origins
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### Frontend (.env)
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Afridi.ai
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_VOICE_RECORDING=true
VITE_ENABLE_FILE_ATTACHMENTS=true
VITE_ENABLE_MESSAGE_REACTIONS=true
VITE_ENABLE_DARK_MODE=true

# UI Configuration
VITE_THEME_PRIMARY_COLOR=#8b5cf6
VITE_THEME_SECONDARY_COLOR=#3b82f6
```

## 🎨 Customization

### Theme Customization

The app uses a modern gradient-based design. You can customize colors in:

1. **Tailwind Config**: Modify `tailwind.config.js` for global color changes
2. **CSS Variables**: Update custom properties in `src/index.css`
3. **Component Styles**: Individual component styling in respective files

### Adding New Features

#### 1. Voice Recording
```typescript
// In ChatInput.tsx
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  // Implement recording logic
};
```

#### 2. File Attachments
```typescript
// Add file upload handler
const handleFileUpload = (files: FileList) => {
  // Process and send files to backend
};
```

#### 3. Real-time Features
```typescript
// WebSocket integration
const ws = new WebSocket('ws://localhost:8000/ws');
ws.onmessage = (event) => {
  // Handle real-time messages
};
```

## 🚀 Deployment

### Frontend Deployment

#### Vercel
```bash
npm run build
npx vercel --prod
```

#### Netlify
```bash
npm run build
npx netlify deploy --prod --dir=dist
```

### Backend Deployment

#### Docker
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Google Cloud Run
```bash
gcloud run deploy Afridi.ai-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Railway
```bash
railway login
railway init
railway up
```

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Install test dependencies
pip install pytest httpx

# Run tests
pytest tests/
```

### Frontend Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### API Testing
```bash
# Test health endpoint
curl http://localhost:8000/

# Test chat endpoint
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id":"test","message":"Hello"}'
```

## 📊 Performance

### Optimization Features
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: WebP format with fallbacks
- **Caching**: Service worker for offline support
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Performance Monitoring**: Web Vitals tracking

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🔒 Security

### Security Features
- **CORS Protection**: Configured origins
- **Input Validation**: Pydantic models
- **Rate Limiting**: Request throttling (ready to implement)
- **Environment Variables**: Secure API key storage
- **Error Handling**: No sensitive data in error messages

### Security Best Practices
- Never commit API keys to version control
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Validate and sanitize all user inputs
- Regular security audits and updates

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with conventional commits: `git commit -m 'feat: add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style
- **Frontend**: ESLint + Prettier configuration
- **Backend**: Black + isort for Python formatting
- **Commits**: Conventional Commits specification
- **Documentation**: JSDoc for functions, clear README updates

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google AI**: For the powerful Gemini language model
- **LangChain**: For the excellent LLM framework
- **FastAPI**: For the modern Python web framework
- **React Team**: For the amazing frontend library
- **Tailwind CSS**: For the utility-first CSS framework
- **Lucide Icons**: For the beautiful icon set

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Email**: qkafridi7@gmail.com
- **Phone-No**: +36702819179

---

**Built with ❤️ using React, TypeScript, FastAPI, and Google AI**

*Afridi.ai - Where conversations meet intelligence*