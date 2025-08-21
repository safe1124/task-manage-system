# 백엔드와 프론트엔드를 하나의 컨테이너에서 실행
FROM node:18-alpine AS frontend-build

# 프론트엔드 빌드
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Python 백엔드 실행 환경
FROM python:3.11-slim

# 시스템 패키지 설치
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 백엔드 설정
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 백엔드 코드 복사
COPY backend/ ./backend/
COPY db_manager.py ./

# 프론트엔드 빌드 결과 복사
COPY --from=frontend-build /app/frontend/out ./static
COPY --from=frontend-build /app/frontend/.next ./backend/.next

# 데이터베이스 초기화
RUN cd backend && python init_db.py

# 포트 설정
EXPOSE 8600

# 서버 실행
CMD ["python", "backend/run_server.py"]
