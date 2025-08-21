from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.endpoints.tasks import router as tasks_router
from backend.endpoints.users import router as users_router

app = FastAPI()

# 프론트 접근 허용 (3000, 4989)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4989",
        "http://127.0.0.1:4989",
    ],
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
    uvicorn.run(app, host="0.0.0.0", port=8600)