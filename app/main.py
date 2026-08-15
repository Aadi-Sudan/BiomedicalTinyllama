from fastapi import FastAPI, Body
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from app.schemas import ChatRequest, ChatResponse
from app.model import TinyLlamaChatbot
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chatbot = TinyLlamaChatbot(model_path="AadiSudan/biomedical-tinyllama")

app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")


@app.get("/", response_class=HTMLResponse)
def home():
    return FileResponse("frontend/index.html")


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest = Body(...)):
    print("/chat received:", request.input)
    reply = chatbot.generate_response(request.input, request.history)
    return ChatResponse(response=reply)
