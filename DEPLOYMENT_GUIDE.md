# 🚀 AiSH タスク管理システム 배포 가이드

## 방법 1: Railway (추천 - 가장 간단!) 

### 1단계: Railway 계정 생성
1. https://railway.app 접속
2. "Login with GitHub" 클릭하여 GitHub 계정으로 로그인

### 2단계: 프로젝트 배포
1. Railway 대시보드에서 "New Project" 클릭
2. "Deploy from GitHub repo" 선택
3. 당신의 GitHub 리포지토리 선택 (`safe1124/coding-test`)
4. "Deploy Now" 클릭

### 3단계: PostgreSQL 데이터베이스 추가
1. 프로젝트 내에서 "New Service" 클릭  
2. "Database" → "PostgreSQL" 선택
3. 자동으로 DATABASE_URL이 생성됩니다

### 4단계: 환경변수 설정
백엔드 서비스의 Variables 탭에서:
```
DATABASE_URL=postgresql://... (자동 생성됨)
PYTHONPATH=/app
```

### 5단계: 배포 완료! 
- Railway가 자동으로 URL을 생성합니다 (예: `https://your-app.railway.app`)
- 프론트엔드와 백엔드가 하나의 URL에서 실행됩니다

---

## 방법 2: Google Cloud Platform (GCP)

### 1단계: GCP 계정 생성
1. https://cloud.google.com 접속
2. "무료로 시작하기" ($300 크레딧 제공)

### 2단계: Cloud Run 배포
```bash
# Google Cloud CLI 설치 후
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud run deploy aish-tasks --source . --region asia-northeast1
```

---

## 방법 3: Render (무료, 속도 느림)

### 1단계: Render 계정 생성
1. https://render.com 접속
2. GitHub 계정으로 로그인

### 2단계: 서비스 생성
1. "New Web Service" 클릭
2. GitHub 리포지토리 연결
3. 설정:
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && python run_server.py`

---

## 🎯 추천 순서

1. **Railway** (가장 쉬움, 소액 과금)
2. **Render** (무료, 느림)
3. **Google Cloud** (빠름, 복잡함)

어떤 방법을 사용하고 싶으신가요?
