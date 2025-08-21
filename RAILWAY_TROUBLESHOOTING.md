# 🚨 Railway Exit Code 137 오류 해결 가이드

## 🚨 **문제 상황**
```
[stage-1 5/12] RUN pip install --no-cache-dir --upgrade pip setuptools wheel && pip install --no-cache-dir -r requirements.txt
process "/bin/sh -c pip install --no-cache-dir --upgrade pip setuptools wheel && pip install --no-cache-dir -r requirements.txt" did not complete successfully: exit code: 137: context canceled: context canceled
```

## 🔍 **원인 분석**
`Exit Code 137`은 **메모리 부족 (Out of Memory)** 오류입니다.
- Railway Free Tier의 메모리 제한: **512MB**
- Python 패키지 설치 시 메모리 사용량 초과
- 특히 `psycopg2-binary`, `cryptography` 등 무거운 패키지들이 문제

---

## 🛠️ **해결 방법들**

### **방법 1: 극한 경량 Dockerfile 사용 (추천)**
```bash
# 현재 설정된 Dockerfile
railway.json → "dockerfilePath": "Dockerfile.ultra-light"
```

**특징:**
- 14단계로 나누어 패키지 설치
- 각 단계마다 메모리 정리
- Alpine Linux 기반 (가장 가벼움)

### **방법 2: 백엔드 전용 배포**
```bash
# 백엔드만 먼저 배포
railway.backend.json → "dockerfilePath": "Dockerfile.backend-only"
```

**장점:**
- 프론트엔드 빌드 과정 제거
- 메모리 사용량 대폭 감소
- 빠른 배포 가능

### **방법 3: requirements.txt 최적화**
```txt
# 핵심 패키지만 유지
fastapi==0.115.2
uvicorn[standard]==0.32.0
SQLAlchemy==2.0.36
# ... 기타 필수 패키지들
```

**제거된 패키지:**
- `psycopg2-binary` (PostgreSQL → SQLite 사용)
- `GitPython` (불필요한 Git 의존성)
- `pipenv`, `virtualenv` (개발 도구)

---

## 🔄 **단계별 해결 과정**

### **1단계: 극한 경량 Dockerfile 시도**
```bash
# 현재 설정된 상태로 재배포
git push origin main
# Railway에서 자동 재배포 시작
```

### **2단계: 여전히 실패 시 백엔드 전용 배포**
```bash
# railway.json 수정
"dockerfilePath": "Dockerfile.backend-only"
git add -A
git commit -m "🔧 백엔드 전용 배포로 변경"
git push origin main
```

### **3단계: 최후의 수단 - 패키지 더 줄이기**
```bash
# requirements.txt에서 더 많은 패키지 제거
# 핵심 기능만 유지하는 최소 구성
```

---

## 📊 **메모리 사용량 비교**

| Dockerfile | 예상 메모리 사용량 | 빌드 성공률 |
|------------|-------------------|-------------|
| `Dockerfile` (원본) | 800MB+ | ❌ 실패 |
| `Dockerfile.optimized` | 600MB+ | ❌ 실패 |
| `Dockerfile.lightweight` | 500MB+ | ⚠️ 불안정 |
| `Dockerfile.ultra-light` | 400MB+ | ✅ 성공 가능성 높음 |
| `Dockerfile.backend-only` | 300MB+ | ✅ 성공 가능성 매우 높음 |

---

## 🚀 **성공적인 배포 후 다음 단계**

### **1. 헬스체크 확인**
```bash
curl https://your-domain.railway.app/health
# 응답: {"status": "healthy", "timestamp": "..."}
```

### **2. API 테스트**
```bash
curl https://your-domain.railway.app/api/tasks/
curl https://your-domain.railway.app/api/users/
```

### **3. 프론트엔드 추가 (선택사항)**
- 백엔드가 안정화된 후
- Vercel/Netlify로 프론트엔드 별도 배포
- API 연동 설정

---

## 💡 **예방 방법**

### **1. 패키지 관리**
- 정기적으로 `pip list`로 불필요한 패키지 확인
- 개발 도구는 `requirements-dev.txt`로 분리
- 프로덕션용 `requirements.txt`는 최소한만 유지

### **2. Docker 이미지 최적화**
- 멀티스테이지 빌드 활용
- `.dockerignore` 파일로 불필요한 파일 제외
- Alpine Linux 기반 이미지 사용

### **3. Railway 설정 최적화**
- 적절한 헬스체크 설정
- 재시작 정책 설정
- 리소스 모니터링

---

## 🆘 **여전히 문제가 발생한다면**

### **1. Railway Pro 플랜 고려**
- $20/월로 메모리 제한 증가
- 더 많은 리소스 할당

### **2. 대안 플랫폼 검토**
- **Render**: 무료, 메모리 제한 완화
- **Fly.io**: 무료, 더 많은 리소스
- **Heroku**: 무료 티어 종료로 인해 제외

### **3. 아키텍처 변경**
- 마이크로서비스 분리
- 정적 사이트 + API 서버 분리
- CDN 활용

---

## 📝 **체크리스트**

- [ ] 극한 경량 Dockerfile 사용
- [ ] requirements.txt 최적화 완료
- [ ] PostgreSQL 의존성 제거 (SQLite 사용)
- [ ] 불필요한 패키지 제거
- [ ] 메모리 효율적인 설치 방법 적용
- [ ] 헬스체크 엔드포인트 추가
- [ ] Railway 설정 최적화

---

## 🎯 **목표**
**Exit Code 137 오류 완전 해결**으로 안정적인 Railway 배포 달성! 🚀
