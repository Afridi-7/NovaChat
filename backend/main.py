from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import logging
from datetime import datetime
import uuid
import os
import json
from dotenv import load_dotenv

# LangChain imports
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.prompts import load_prompt
from langchain_core.messages import HumanMessage, AIMessage

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Afridi.ai API",
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

# Session store with enhanced metadata
store = {}
session_metadata = {}

def get_history(session_id: str) -> ChatMessageHistory:
    """Get or create chat history for a session"""
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
        session_metadata[session_id] = {
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'title': 'New Chat',
            'message_count': 0,
            'is_starred': False,
            'is_archived': False,
            'tags': []
        }
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

def chat(session_id: str, user_input: str, config: Optional[Dict] = None) -> Dict[str, Any]:
    """One chat turn → returns AI reply with metadata"""
    if not conversation:
        # Fallback response for development
        return {
            'message': f"Hello! I'm Afridi.ai. You said: '{user_input}'. I'm currently in development mode. Please configure your Google AI API key to enable full functionality.",
            'metadata': {
                'model': 'development-mode',
                'tokens': 0,
                'temperature': 0.7,
                'processing_time': 0
            }
        }
    
    try:
        start_time = datetime.now()
        
        # Apply configuration if provided
        if config:
            # You can modify the model parameters here based on config
            pass
        
        response = conversation.invoke(
            {"input": user_input},
            config={"configurable": {"session_id": session_id}}
        )
        
        end_time = datetime.now()
        processing_time = int((end_time - start_time).total_seconds() * 1000)
        
        # Update session metadata
        if session_id in session_metadata:
            session_metadata[session_id]['updated_at'] = datetime.now().isoformat()
            session_metadata[session_id]['message_count'] += 2  # User + AI message
            
            # Update title with first user message if it's still "New Chat"
            if session_metadata[session_id]['title'] == 'New Chat':
                title = user_input[:50] + ("..." if len(user_input) > 50 else "")
                session_metadata[session_id]['title'] = title
        
        content = response.content if hasattr(response, 'content') else str(response)
        
        return {
            'message': content,
            'metadata': {
                'model': 'gemini-1.5-flash',
                'tokens': len(content.split()),  # Rough token estimate
                'temperature': config.get('temperature', 0.7) if config else 0.7,
                'processing_time': processing_time
            }
        }
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
    metadata: Optional[Dict[str, Any]] = None

class SessionModel(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str
    message_count: int
    is_starred: Optional[bool] = False
    is_archived: Optional[bool] = False
    tags: Optional[List[str]] = []

class UpdateTitleRequest(BaseModel):
    title: str

# API Endpoints
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "🚀 Afridi.ai API is running!",
        "version": "1.0.0",
        "status": "healthy",
        "langchain_status": "configured" if conversation else "development_mode",
        "features": {
            "chat": True,
            "sessions": True,
            "voice": False,  # Not implemented yet
            "file_upload": False,  # Not implemented yet
            "search": True,
            "export": True
        }
    }

@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Send a message and get AI response"""
    try:
        logger.info(f"💬 Chat request from session {request.session_id}: {request.message[:50]}...")
        
        # Get AI response with metadata
        result = chat(request.session_id, request.message, request.config)
        
        logger.info(f"✅ Generated response for session {request.session_id}")
        
        return ChatResponse(
            success=True,
            data={
                "message": result['message'],
                "session_id": request.session_id,
                "metadata": result['metadata']
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
                "sender": "user" if isinstance(msg, HumanMessage) else "assistant",
                "timestamp": datetime.now().isoformat(),
                "reaction": None,
                "metadata": {
                    "model": "gemini-1.5-flash" if isinstance(msg, AIMessage) else None,
                    "tokens": len(msg.content.split()) if isinstance(msg, AIMessage) else None
                }
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
        if session_id in session_metadata:
            del session_metadata[session_id]
        
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
        for session_id, metadata in session_metadata.items():
            sessions.append({
                "id": session_id,
                "title": metadata['title'],
                "created_at": metadata['created_at'],
                "updated_at": metadata['updated_at'],
                "message_count": metadata['message_count'],
                "is_starred": metadata.get('is_starred', False),
                "is_archived": metadata.get('is_archived', False),
                "tags": metadata.get('tags', [])
            })
        
        # Sort by updated_at (most recent first)
        sessions.sort(key=lambda x: x["updated_at"], reverse=True)
        
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
        
        deleted = False
        if session_id in store:
            del store[session_id]
            deleted = True
        if session_id in session_metadata:
            del session_metadata[session_id]
            deleted = True
            
        if deleted:
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

@app.put("/api/v1/sessions/{session_id}/title", response_model=ChatResponse)
async def update_session_title(session_id: str, request: UpdateTitleRequest):
    """Update session title"""
    try:
        logger.info(f"✏️ Updating title for session {session_id}: {request.title}")
        
        if session_id in session_metadata:
            session_metadata[session_id]['title'] = request.title
            session_metadata[session_id]['updated_at'] = datetime.now().isoformat()
            
            return ChatResponse(
                success=True,
                message="Title updated successfully"
            )
        else:
            return ChatResponse(
                success=False,
                error="Session not found"
            )
    except Exception as e:
        logger.error(f"❌ Update title error: {e}")
        return ChatResponse(
            success=False,
            error=str(e)
        )

@app.get("/api/v1/sessions/{session_id}/export", response_model=ChatResponse)
async def export_session(session_id: str, format: str = "json"):
    """Export session data"""
    try:
        logger.info(f"📤 Exporting session {session_id} as {format}")
        
        if session_id not in store:
            return ChatResponse(
                success=False,
                error="Session not found"
            )
        
        history = store[session_id]
        metadata = session_metadata.get(session_id, {})
        
        export_data = {
            "session_id": session_id,
            "metadata": metadata,
            "messages": []
        }
        
        for i, msg in enumerate(history.messages):
            export_data["messages"].append({
                "id": f"{session_id}_{i}",
                "content": msg.content,
                "sender": "user" if isinstance(msg, HumanMessage) else "assistant",
                "timestamp": datetime.now().isoformat()
            })
        
        if format == "txt":
            # Convert to plain text
            text_content = f"Afridi.ai Conversation Export\n"
            text_content += f"Session ID: {session_id}\n"
            text_content += f"Title: {metadata.get('title', 'Untitled')}\n"
            text_content += f"Created: {metadata.get('created_at', 'Unknown')}\n\n"
            
            for msg in export_data["messages"]:
                sender = "You" if msg["sender"] == "user" else "Afridi.ai"
                text_content += f"{sender}: {msg['content']}\n\n"
            
            return ChatResponse(
                success=True,
                data={"content": text_content, "format": "txt"}
            )
        
        return ChatResponse(
            success=True,
            data=export_data
        )
    except Exception as e:
        logger.error(f"❌ Export error: {e}")
        return ChatResponse(
            success=False,
            error=str(e)
        )

@app.get("/api/v1/search", response_model=ChatResponse)
async def search_messages(query: str, session_id: Optional[str] = None):
    """Search messages across sessions"""
    try:
        logger.info(f"🔍 Searching for: {query}")
        
        results = []
        sessions_to_search = [session_id] if session_id else store.keys()
        
        for sid in sessions_to_search:
            if sid in store:
                history = store[sid]
                metadata = session_metadata.get(sid, {})
                
                for i, msg in enumerate(history.messages):
                    if query.lower() in msg.content.lower():
                        results.append({
                            "message": {
                                "id": f"{sid}_{i}",
                                "content": msg.content,
                                "sender": "user" if isinstance(msg, HumanMessage) else "assistant",
                                "timestamp": datetime.now().isoformat()
                            },
                            "session_id": sid,
                            "session_title": metadata.get('title', 'Untitled'),
                            "relevance_score": msg.content.lower().count(query.lower())
                        })
        
        # Sort by relevance
        results.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        return ChatResponse(
            success=True,
            data=results[:20]  # Limit to top 20 results
        )
    except Exception as e:
        logger.error(f"❌ Search error: {e}")
        return ChatResponse(
            success=False,
            error=str(e)
        )

# Voice and file upload endpoints (placeholders for future implementation)
@app.post("/api/v1/voice", response_model=ChatResponse)
async def voice_endpoint(session_id: str = Form(...), audio: UploadFile = File(...)):
    """Handle voice input (placeholder)"""
    return ChatResponse(
        success=False,
        error="Voice functionality not yet implemented"
    )

@app.post("/api/v1/upload", response_model=ChatResponse)
async def upload_endpoint(session_id: str = Form(...), file: UploadFile = File(...)):
    """Handle file upload (placeholder)"""
    return ChatResponse(
        success=False,
        error="File upload functionality not yet implemented"
    )

# Development server
if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Starting Afridi.ai API server...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )