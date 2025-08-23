from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from endpoints.tasks import router as tasks_router
from endpoints.users import router as users_router

app = FastAPI()

# 프론트 접근 허용 (로컬 + 배포 URL)
import os

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4989",
    "http://127.0.0.1:4989",
]

# 프로덕션 환경에서는 특정 도메인만 허용
if os.getenv("ENVIRONMENT") == "production":
    frontend_url = os.getenv("FRONTEND_URL")
    if frontend_url:
        allowed_origins.append(frontend_url)
    # 주요 배포 플랫폼 도메인 허용
    allowed_origins.extend([
        "https://aishtask.vercel.app",
        "https://aishtask-frontend.netlify.app",
    ])
else:
    # 개발 환경에서는 모든 vercel, netlify 등 허용
    allowed_origins.extend([
        "https://*.vercel.app",
        "https://*.netlify.app",
        "https://*.railway.app",
        "https://*.render.com",
        "https://*.github.io",
        "https://*.pages.dev",
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/check")
def health():
    return {"status": "ok"}

app.include_router(tasks_router)
app.include_router(users_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)