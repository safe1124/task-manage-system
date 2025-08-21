# Next.js + FastAPI 풀스택 애플리케이션을 위한 Dockerfile
FROM node:18-alpine AS frontend-build

# 프론트엔드 빌드
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Python 백엔드 + Nginx 실행 환경
FROM python:3.11-slim

# 시스템 패키지 설치 (Nginx 포함)
RUN apt-get update && apt-get install -y \
    gcc \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# 백엔드 설정
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 백엔드 코드 복사
COPY backend/ ./backend/
COPY db_manager.py ./

# 프론트엔드 정적 빌드 결과 복사
COPY --from=frontend-build /app/frontend/out ./frontend/out

# Nginx 설정 복사
COPY nginx.conf /etc/nginx/nginx.conf

# Supervisor 설정 (백엔드와 Nginx 동시 실행)
RUN mkdir -p /var/log/supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 포트 설정 (Railway 동적 포트 지원)
EXPOSE 8080

# Supervisor로 백엔드와 Nginx 동시 실행
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
