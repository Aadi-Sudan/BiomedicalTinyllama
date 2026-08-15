from pydantic import BaseModel
from typing import List, Optional


class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    input: str
    history: Optional[List[Message]] = []


class ChatResponse(BaseModel):
    response: str
