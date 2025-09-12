from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import logging
from datetime import datetime
import uuid
import os
from dotenv import load_dotenv

# LangChain imports
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.prompts import load_prompt

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="NovaChat API",
    description="Advanced AI Chatbot with Session Management",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize LangChain components
try:
    model = ChatGoogleGenerativeAI(model="gemini-1.5-flash")
    prompt = load_prompt("template.json")
    logger.info("✅ LangChain components initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize LangChain: {e}")
    # Fallback for development
    model = None
    prompt = None

# Session store
store = {}

def get_history(session_id: str) -> ChatMessageHistory:
    """Get or create chat history for a session"""
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
        logger.info(f"📝 Created new session: {session_id}")
    return store[session_id]

# Initialize conversation chain
if model and prompt:
    conversation = RunnableWithMessageHistory(
        prompt | model,
        get_history,
        input_messages_key="input",
        history_messages_key="history"
    )
else:
    conversation = None

def chat(session_id: str, user_input: str) -> str:
    """One chat turn → returns AI reply text only"""
    if not conversation:
        # Fallback response for development
        return f"Hello! I'm NovaChat. You said: '{user_input}'. I'm currently in development mode. Please configure your Google AI API key to enable full functionality."
    
    try:
        response = conversation.invoke(
            {"input": user_input},
            config={"configurable": {"session_id": session_id}}
        )
        return response.content if hasattr(response, 'content') else str(response)
    except Exception as e:
        logger.error(f"❌ Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

# Pydantic models
class ChatRequest(BaseModel):
    session_id: str
    message: str
    config: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    message: Optional[str] = None

class MessageModel(BaseModel):
    id: str
    content: str
    sender: str
    timestamp: str
    reaction: Optional[str] = None

class SessionModel(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str
    message_count: int

# API Endpoints
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "🚀 NovaChat API is running!",
        "version": "1.0.0",
        "status": "healthy",
        "langchain_status": "configured" if conversation else "development_mode"
    }

@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Send a message and get AI response"""
    try:
        logger.info(f"💬 Chat request from session {request.session_id}: {request.message[:50]}...")
        
        # Get AI response
        ai_response = chat(request.session_id, request.message)
        
        logger.info(f"✅ Generated response for session {request.session_id}")
        
        return ChatResponse(
            success=True,
            data={
                "message": ai_response,
                "session_id": request.session_id
            }
        )
    except Exception as e:
        logger.error(f"❌ Chat endpoint error: {e}")
        return ChatResponse(
            success=False,
            error=str(e)
        )

@app.get("/api/v1/sessions/{session_id}/history", response_model=ChatResponse)
async def get_history_endpoint(session_id: str):
    """Get chat history for a session"""
    try:
        logger.info(f"📚 Fetching history for session: {session_id}")
        
        history = get_history(session_id)
        messages = []
        
        for i, msg in enumerate(history.messages):
            messages.append({
                "id": f"{session_id}_{i}",
                "content": msg.content,
                "sender": "user" if msg.type == "human" else "assistant",
                "timestamp": datetime.now().isoformat(),
                "reaction": None
            })
        
        return ChatResponse(
            success=True,
            data=messages
        )
    except Exception as e:
        logger.error(f"❌ History endpoint error: {e}")
        return ChatResponse(
            success=False,
            error=str(e)
        )

@app.post("/api/v1/sessions/{session_id}/reset", response_model=ChatResponse)
async def reset_session_endpoint(session_id: str):
    """Reset/clear chat history for a session"""
    try:
        logger.info(f"🔄 Resetting session: {session_id}")
        
        if session_id in store:
            del store[session_id]
        
        return ChatResponse(
            success=True,
            message="Session reset successfully"
        )
    except Exception as e:
        logger.error(f"❌ Reset endpoint error: {e}")
        return ChatResponse(
            success=False,
            error=str(e)
        )

@app.get("/api/v1/sessions", response_model=ChatResponse)
async def get_sessions_endpoint():
    """Get all active sessions"""
    try:
        logger.info("📋 Fetching all sessions")
        
        sessions = []
        for session_id, history in store.items():
            # Get first message as title
            title = "New Chat"
            if history.messages:
                first_msg = history.messages[0].content
                title = first_msg[:30] + ("..." if len(first_msg) > 30 else "")
            
            sessions.append({
                "id": session_id,
                "title": title,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "message_count": len(history.messages)
            })
        
        # Sort by message count (most active first)
        sessions.sort(key=lambda x: x["message_count"], reverse=True)
        
        return ChatResponse(
            success=True,
            data=sessions
        )
    except Exception as e:
        logger.error(f"❌ Sessions endpoint error: {e}")
        return ChatResponse(
            success=False,
            error=str(e)
        )

@app.delete("/api/v1/sessions/{session_id}", response_model=ChatResponse)
async def delete_session_endpoint(session_id: str):
    """Delete a specific session"""
    try:
        logger.info(f"🗑️ Deleting session: {session_id}")
        
        if session_id in store:
            del store[session_id]
            return ChatResponse(
                success=True,
                message="Session deleted successfully"
            )
        else:
            return ChatResponse(
                success=False,
                error="Session not found"
            )
    except Exception as e:
        logger.error(f"❌ Delete endpoint error: {e}")
        return ChatResponse(
            success=False,
            error=str(e)
        )

# Development server
if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Starting NovaChat API server...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )