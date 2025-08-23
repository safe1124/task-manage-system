# Python 3.11 이미지 사용
FROM python:3.11-slim

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 업데이트 및 필수 패키지 설치
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 의존성 파일 복사 (상대 경로로)
COPY backend/requirements.txt ./requirements.txt

# Python 의존성 설치
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사 (backend 폴더 내용만)
COPY backend/ .

# 포트 노출 (Railway는 PORT 환경변수 사용)
EXPOSE ${PORT:-8000}

# 애플리케이션 실행 (Railway의 PORT 환경변수 사용)
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}