from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from endpoints.tasks import router as tasks_router
from endpoints.users import router as users_router

app = FastAPI()

# 프론트 접근 허용 (로컬 + 배포 URL)
import os

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:4989",
    "http://127.0.0.1:4989",
]

# 모든 Vercel 앱 URL 허용하기 위한 추가 설정
vercel_domains = [
    "https://coding-test-3minute.vercel.app",
    "https://coding-test-sez2-9fw01ctcu-3minute.vercel.app", 
    "https://aishtask.vercel.app",
    "https://aishtask-frontend.netlify.app",
    "https://tcutask.netlify.app",  # 실제 Netlify 도메인 추가
    "https://unique-perception-production.up.railway.app",
]

# 환경변수에서 추가 URL 허용
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

# 모든 Vercel 도메인 추가
allowed_origins.extend(vercel_domains)

# 동적 CORS origin 체크
def is_allowed_origin(origin: str) -> bool:
    print(f"🔍 Checking origin: {origin}")
    print(f"📋 Allowed origins: {allowed_origins}")
    
    if not origin:
        print("❌ No origin provided")
        return False
    
    # 허용된 정확한 도메인 체크
    if origin in allowed_origins:
        print(f"✅ Origin {origin} found in allowed_origins")
        return True
    
    # Vercel 도메인 패턴 체크 (더 유연하게)
    if origin.endswith('.vercel.app') and 'coding-test' in origin:
        print(f"✅ Origin {origin} matches Vercel pattern")
        return True
    
    # Netlify 도메인 패턴 체크 (더 유연하게)
    if origin.endswith('.netlify.app') and ('aishtask' in origin or 'tcutask' in origin):
        print(f"✅ Origin {origin} matches Netlify pattern")
        return True
    
    print(f"❌ Origin {origin} not allowed")
    return False

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # 정확한 origin 목록 사용
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
        "User-Agent",
        "Referer",
        "sec-ch-ua",
        "sec-ch-ua-mobile",
        "sec-ch-ua-platform",
        "Access-Control-Allow-Credentials"
    ],
    expose_headers=["*"],
)

# OPTIONS 요청을 명시적으로 처리
@app.options("/{full_path:path}")
async def options_handler(full_path: str, request: Request):
    origin = request.headers.get("origin")
    # 허용된 origin인지 확인
    if is_allowed_origin(origin):
        return Response(
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin, User-Agent, Referer, sec-ch-ua, sec-ch-ua-mobile, sec-ch-ua-platform, Access-Control-Allow-Credentials",
                "Access-Control-Allow-Credentials": "true",
                "Vary": "Origin",
            }
        )
    else:
        return Response(status_code=403)

@app.get("/check")
def health():
    return {"status": "ok", "cors_updated": "2025-08-24"}

app.include_router(tasks_router)
app.include_router(users_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)