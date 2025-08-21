from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.endpoints.tasks import router as tasks_router
from backend.endpoints.users import router as users_router

# 데이터베이스 초기화 
from backend.database import Base, engine

# 테이블 생성
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS 설정 - 배포환경에서 모든 origin 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 배포환경에서는 모든 origin 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/check")
def health():
    return {"status": "ok"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}

# 一般化されたエラーハンドラ（人間に分かりやすいメッセージ）
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.requests import Request
from sqlalchemy.exc import IntegrityError

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"error": "入力値が不正です", "details": exc.errors()})

@app.exception_handler(IntegrityError)
async def integrity_exception_handler(request: Request, exc: IntegrityError):
    return JSONResponse(status_code=409, content={"error": "データ整合性エラー（重複など）", "detail": str(exc.orig) if hasattr(exc, 'orig') else str(exc)})

app.include_router(tasks_router)
app.include_router(users_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8600)