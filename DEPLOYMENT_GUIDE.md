# 🚀 AiSH 태스크 관리 시스템 - 배포 가이드

## 🚀 **Railway 배포 (추천)**

### **1단계: 프로젝트 준비**
```bash
# GitHub 저장소에 코드 푸시
git add -A
git commit -m "🚀 Railway 배포 준비"
git push origin main
```

### **2단계: Railway 프로젝트 생성**
1. [Railway.app](https://railway.app) 접속
2. **"New Project"** 클릭
3. **"Deploy from GitHub repo"** 선택
4. GitHub 저장소 연결

### **3단계: 자동 배포**
- GitHub 푸시 후 **3-5분** 대기
- Railway에서 **"Deploy Logs"** 확인
- **"Build Logs"**에서 빌드 진행상황 확인

---

## 🔧 **문제 해결**

### **Exit Code 137 오류 (메모리 부족)**
이 오류는 Railway의 메모리 제한으로 인해 발생합니다.

#### **해결 방법 1: 최적화된 Dockerfile 사용**
```bash
# 최적화된 Dockerfile 사용
# Dockerfile.optimized 파일이 자동으로 사용됩니다
```

#### **해결 방법 2: requirements.txt 최적화**
- 불필요한 패키지 제거
- 가벼운 대안 사용
- 메모리 효율적인 설치 방법 적용

#### **해결 방법 3: Railway 설정 최적화**
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile.optimized"
  }
}
```

### **빌드 실패 시 확인사항**
1. **"Build Logs"** 탭에서 에러 확인
2. **메모리 사용량** 확인
3. **패키지 의존성** 충돌 확인
4. **Node.js/Python 버전** 호환성 확인

---

## 🌐 **배포 후 확인**

### **헬스체크**
```bash
# 헬스체크 엔드포인트
curl https://your-domain.railway.app/health
# 응답: {"status": "healthy", "timestamp": "..."}

# 기존 체크 엔드포인트
curl https://your-domain.railway.app/check
# 응답: {"status": "ok"}
```

### **API 테스트**
```bash
# 태스크 목록 조회
curl https://your-domain.railway.app/api/tasks/

# 사용자 목록 조회
curl https://your-domain.railway.app/api/users/
```

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
# 코드 수정 후
git add -A
git commit -m "✨ 새 기능 추가"
git push origin main

# Railway 자동 재배포 (3-5분)
```

### **수동 재배포**
- Railway 대시보드에서 **"Redeploy"** 버튼 클릭

---

## 🎉 **배포 완료 후**

### **확인사항**
- [ ] 웹사이트 접속 가능
- [ ] 백엔드 API 동작 확인
- [ ] 헬스체크 응답 확인
- [ ] 모든 기능 정상 동작

### **다음 단계**
1. **도메인 연결** (선택사항)
2. **SSL 인증서** 자동 설정
3. **모니터링** 설정
4. **백업** 전략 수립
