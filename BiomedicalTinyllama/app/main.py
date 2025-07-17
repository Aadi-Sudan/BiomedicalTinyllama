from fastapi import FastAPI
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from app.schemas import ChatRequest, ChatResponse
from app.model import TinyLlamaChatbot
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Body


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chatbot = TinyLlamaChatbot(model_path="./tinyllama-custom")

app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")

@app.get("/", response_class=HTMLResponse)
def home():
    return FileResponse("frontend/index.html")

@app.post("/chat", response_model=ChatResponse)


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest = Body(...)):
    print("/chat received:", request.input)
    reply = chatbot.generate_response(request.input)
    return ChatResponse(response=reply)

    reply = chatbot.generate_response(request.input)
    return ChatResponse(response=reply)
