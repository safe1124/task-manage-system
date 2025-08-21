#!/usr/bin/env python3
import sys
import os

# Add the parent directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app
import uvicorn

if __name__ == "__main__":
    # Railway에서 제공하는 PORT 환경변수 사용, 없으면 8600 사용
    port = int(os.environ.get("PORT", 8600))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
