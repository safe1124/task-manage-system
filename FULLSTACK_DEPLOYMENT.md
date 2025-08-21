# 🚀 AiSH タスク管理システム - 풀스택 배포 가이드

## 🎯 **풀스택 배포란?**

**프론트엔드 + 백엔드 + 데이터베이스**를 **하나의 서비스**로 배포하는 방법입니다.

### 📊 **기존 vs 풀스택**

| 구분 | 기존 방식 | 풀스택 방식 |
|------|-----------|-------------|
| **프론트엔드** | Vercel/Netlify | 백엔드와 함께 |
| **백엔드** | Railway | 프론트엔드와 함께 |
| **데이터베이스** | 별도 서비스 | 백엔드 내장 |
| **URL** | 2개 | 1개 |
| **관리** | 복잡 | 간단 |

---

## 🚀 **방법 1: Railway 풀스택 배포 (추천)**

### **1단계: 현재 백엔드 배포 확인**
- Railway에서 백엔드가 정상 동작하는지 확인
- 헬스체크: `https://your-domain.railway.app/check`

### **2단계: 풀스택 설정 적용**
```bash
# 수정된 파일들을 GitHub에 푸시
git add -A
git commit -m "🚀 풀스택 배포 설정 추가"
git push origin main
```

### **3단계: Railway 자동 재배포**
- GitHub 푸시 후 **3-5분** 대기
- Railway에서 **"Deploy Logs"** 확인
- **"Build Logs"**에서 빌드 진행상황 확인

### **4단계: 배포 완료 확인**
- **하나의 URL**에서 프론트엔드 + 백엔드 모두 동작
- 예: `https://coding-test-production-xxxx.up.railway.app`

---

## 🔧 **풀스택 배포 설정 상세**

### **Dockerfile 구조**
```dockerfile
# 1단계: 프론트엔드 빌드
FROM node:18-alpine AS frontend-build
# Next.js 빌드 및 최적화

# 2단계: 백엔드 + 프론트엔드 통합
FROM python:3.11-slim
# Python 백엔드 + Node.js 프론트엔드
# 정적 파일 서빙
```

### **백엔드 설정**
```python
# main.py
from fastapi.staticfiles import StaticFiles

# 프론트엔드 정적 파일 서빙
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
```

### **Railway 설정**
```json
{
  "build": {
    "builder": "DOCKERFILE"  // Docker 기반 빌드
  }
}
```

---

## 🌐 **배포 후 동작 방식**

### **URL 구조**
```
https://your-domain.railway.app/
├── /                    → 프론트엔드 (React/Next.js)
├── /api/tasks          → 백엔드 API
├── /api/users          → 백엔드 API
└── /check              → 헬스체크
```

### **요청 처리 흐름**
1. **프론트엔드 요청** → Next.js 서버
2. **API 요청** → FastAPI 백엔드
3. **데이터베이스** → SQLite (내장)
4. **응답** → 사용자 브라우저

---

## 🛠️ **문제 해결**

### **빌드 실패 시**
1. **"Build Logs"** 탭에서 에러 확인
2. **Node.js 버전** 호환성 확인
3. **Python 패키지** 의존성 확인

### **런타임 에러 시**
1. **"Deploy Logs"** 탭에서 에러 확인
2. **포트 설정** 확인 (PORT 환경변수)
3. **데이터베이스** 연결 확인

### **일반적인 문제들**
- **메모리 부족**: Railway Pro 플랜으로 업그레이드
- **빌드 시간 초과**: Docker 이미지 최적화
- **의존성 충돌**: requirements.txt 정리

---

## 💰 **비용 및 리소스**

### **Railway 요금제**
- **Free**: $5/월 크레딧
- **Pro**: $20/월 (더 많은 리소스)

### **리소스 사용량**
- **CPU**: 0.5-2 vCPU
- **메모리**: 512MB-2GB
- **스토리지**: 1-10GB

---

## 🔄 **업데이트 방법**

### **자동 배포**
```bash
# 맥북에서 코드 수정
git add -A
git commit -m "✨ 새 기능 추가"
git push origin main

# Railway 자동 재배포 (3-5분)
```

### **수동 재배포**
- Railway 대시보드에서 **"Redeploy"** 버튼 클릭

---

## 🎉 **풀스택 배포 완료 후**

### **확인사항**
- [ ] 프론트엔드 접속 가능
- [ ] 백엔드 API 동작 확인
- [ ] 데이터베이스 연결 확인
- [ ] 모든 기능 정상 동작

### **다음 단계**
1. **도메인 연결** (선택사항)
2. **SSL 인증서** 자동 설정
3. **모니터링** 설정
4. **백업** 전략 수립

---

## 💡 **핵심 포인트**

✅ **하나의 URL**에서 모든 서비스 제공  
✅ **GitHub 연동**으로 자동 배포  
✅ **Docker 기반** 안정적인 빌드  
✅ **확장 가능한** 아키텍처  

**🚀 이제 하나의 링크로 전체 애플리케이션에 접속할 수 있습니다!**
