from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.endpoints.tasks import router as tasks_router
from backend.endpoints.users import router as users_router

# 데이터베이스 초기화 
from backend.database import Base, engine

# 모델들을 import하여 테이블 정의를 등록
from backend.models import User, Task

# 테이블 생성
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS 설정 - 동적 origin 확인을 위한 커스텀 미들웨어
import os
import re
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

class CustomCORSMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, allow_credentials: bool = False):
        super().__init__(app)
        self.allow_credentials = allow_credentials
        
        # 기본 허용 origins
        self.base_origins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://3minutetasker.vercel.app",
        ]
        
        # 패턴 기반 origin 허용 (모든 vercel.app 서브도메인 허용)
        self.allowed_patterns = [
            r"^https://[a-z0-9-]+\.vercel\.app$"
        ]

    def is_allowed_origin(self, origin: str) -> bool:
        # 기본 origins 체크
        if origin in self.base_origins:
            return True
            
        # 패턴 기반 체크
        for pattern in self.allowed_patterns:
            if re.match(pattern, origin):
                return True
                
        return False

    async def dispatch(self, request: Request, call_next):
        # CORS preflight 요청 처리
        if request.method == "OPTIONS":
            origin = request.headers.get("origin")
            if origin and self.is_allowed_origin(origin):
                allow_request_headers = request.headers.get("access-control-request-headers", "content-type, authorization")
                response = Response()
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Vary"] = "Origin"
                response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
                response.headers["Access-Control-Allow-Headers"] = allow_request_headers
                if self.allow_credentials:
                    response.headers["Access-Control-Allow-Credentials"] = "true"
                return response
            else:
                return Response(status_code=403)

        # 일반 요청 처리
        response = await call_next(request)
        
        origin = request.headers.get("origin")
        if origin and self.is_allowed_origin(origin):
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Vary"] = "Origin"
            if self.allow_credentials:
                response.headers["Access-Control-Allow-Credentials"] = "true"
        
        return response

# 커스텀 CORS 미들웨어 적용
app.add_middleware(CustomCORSMiddleware, allow_credentials=True)

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