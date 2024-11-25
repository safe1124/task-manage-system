from fastapi import APIRouter, FastAPI, Depends, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(debug=True)
router = APIRouter()

# CORSの設定をより詳細に定義
origins = [
    "http://localhost:4989",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,  # Preflightリクエストのキャッシュ時間（秒）
)

@app.get("/check")
def check_api():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000, reload=True)