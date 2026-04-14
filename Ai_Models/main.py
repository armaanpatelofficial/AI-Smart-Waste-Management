from google import genai
from fastapi import FastAPI
from pydantic import BaseModel
import json
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

# 🚀 SwachhBot Next-Gen Chat API
# Using the NEW google-genai SDK 
client = genai.Client(api_key="AIzaSyDfGmh27D8ek1WM-wFuGulM2lqcuKMWs10")

app = FastAPI()

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    message: str

@app.get("/")
async def root():
    return {
        "status": "SwachhBot AI is Running",
        "api": "/chat",
        "instructions": "Use POST /chat to interact with the bot"
    }

SYSTEM_PROMPT = """
You are a Waste Management Assistant for India.

Classify waste into:
- Biodegradable
- Recyclable
- Hazardous
- Mixed

Rules:
1. If multiple items → classify each
2. Give disposal method
3. Keep answers short
4. Return ONLY JSON

Format:
{
  "items": [
    {"name": "", "category": "", "disposal": ""}
  ],
  "suggestion": ""
}
"""

@app.post("/chat")
async def chat(query: Query):
    try:
        # Prompt construction
        prompt = SYSTEM_PROMPT + "\nUser: " + query.message
        
        # New SDK call
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt
        )

        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        
        cleaned = text.strip()
        data = json.loads(cleaned)
        return data
    except Exception as e:
        error_msg = str(e)
        print(f"Chat Error: {error_msg}")
        return {
            "items": [{"name": "System", "category": "Error", "disposal": "Check Logs"}],
            "suggestion": f"I hit an error: {error_msg}. Please check your Gemini API key or internet connection."
        }

if __name__ == "__main__":
    # CRITICAL: Bind to 127.0.0.1 for browser access
    print("\n----------------------------------------------")
    print("🚀 SwachhBot AI Server [Version 2.0]")
    print("👉 ACCESS AT: http://localhost:8005")
    print("----------------------------------------------\n")
    uvicorn.run(app, host="127.0.0.1", port=8005)