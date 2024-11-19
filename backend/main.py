from fastapi import APIRouter, FastAPI, Depends, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from uuid import UUID

from endpoints import auth, user, admin, chat
from dependencies import get_current_user, get_db

app = FastAPI(debug=True)
router = APIRouter()

# CORSの設定をより詳細に定義
origins = [
    "http://localhost:3000",
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

# 既存のルーターの追加
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(user.router, prefix="/usesr", tags=["users"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])

def custom_jsonable_encoder(obj):
    if isinstance(obj, UUID):
        return str(obj)
    return jsonable_encoder(obj)

app.json_encoder = custom_jsonable_encoder

@app.middleware("http")
async def authenticate(request: Request, call_next):
    # OPTIONSリクエストは認証をスキップ
    if request.method == "OPTIONS":
        return await call_next(request)

    # 認証不要のパスリスト
    public_paths = [
        "/auth/login",
        "/auth/register",
        "/docs",
        "/openapi.json",
        "/check",
        "/favicon.ico"
    ]

    if any(request.url.path.startswith(path) for path in public_paths):
        return await call_next(request)
    
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(
            status_code=401,
            detail="認証ヘッダーが見つかりません",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    try:
        token_type, token = auth_header.split()
        if token_type.lower() != "bearer":
            raise HTTPException(
                status_code=401,
                detail="不正な認証形式です",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        db = next(get_db())
        try:
            user = get_current_user(token, db)
            request.state.user = user
        finally:
            db.close()
            
    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="不正な認証トークンです",
            headers={"WWW-Authenticate": "Bearer"}
        )
        
    return await call_next(request)

@app.get("/check")
def check_api():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000, reload=True)