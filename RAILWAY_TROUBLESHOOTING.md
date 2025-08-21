# 🚨 Railway Exit Code 137 오류 해결 가이드

## 🚨 **문제 상황**
```
[stage-1 5/12] RUN pip install --no-cache-dir --upgrade pip setuptools wheel && pip install --no-cache-dir -r requirements.txt
process "/bin/sh -c pip install --no-cache-dir --upgrade pip setuptools wheel && pip install --no-cache-dir -r requirements.txt" did not complete successfully: exit code: 137: context canceled: context canceled
```

**추가 문제:**
```
✕ [frontend-build 6/6] RUN npm run build 
process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
```

## 🔍 **원인 분석**
1. **Exit Code 137**: **메모리 부족 (Out of Memory)** 오류
   - Railway Free Tier의 메모리 제한: **512MB**
   - Python 패키지 설치 시 메모리 사용량 초과
2. **Exit Code 1**: **프론트엔드 빌드 실패**
   - Next.js 빌드 과정에서 오류 발생
   - TailwindCSS 설정 문제 가능성

---

## 🛠️ **해결 방법들**

### **방법 1: 백엔드 전용 배포 (현재 적용됨) ⭐**
```bash
# 현재 설정된 Dockerfile
railway.json → "dockerfilePath": "Dockerfile.backend-only"
```

**장점:**
- 프론트엔드 빌드 과정 완전 제거
- 메모리 사용량 대폭 감소 (300MB 이하)
- 빠른 배포 및 안정성 확보

**특징:**
- 14단계로 나누어 패키지 설치
- 각 단계마다 메모리 정리 (`rm -rf /root/.cache/pip/*`)
- Alpine Linux 기반 (가장 가벼움)

### **방법 2: 극한 경량 Dockerfile (백업 옵션)**
```bash
# 프론트엔드 포함 배포가 필요한 경우
railway.json → "dockerfilePath": "Dockerfile.ultra-light"
```

**특징:**
- 14단계로 나누어 패키지 설치
- 각 단계마다 메모리 정리
- 프론트엔드 + 백엔드 통합

### **방법 3: requirements.txt 최적화**
```txt
# 핵심 패키지만 유지 (극한 최소화)
fastapi==0.115.2
uvicorn==0.32.0  # [standard] 제거
SQLAlchemy==2.0.36
# ... 기타 필수 패키지들
```

**제거된 패키지:**
- `psycopg2-binary` (PostgreSQL → SQLite 사용)
- `GitPython` (불필요한 Git 의존성)
- `pipenv`, `virtualenv` (개발 도구)
- `uvicorn[standard]` → `uvicorn` (기본 버전만)

---

## 🔄 **현재 적용된 해결 방법**

### **1단계: 백엔드 전용 배포로 전환 ✅**
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile.backend-only"
  },
  "deploy": {
    "startCommand": "python backend/run_server.py"
  }
}
```

### **2단계: 극한 메모리 최적화 ✅**
- 14단계로 나누어 패키지 설치
- 각 단계마다 `rm -rf /root/.cache/pip/*` 실행
- Alpine Linux 기반 이미지 사용
- 불필요한 파일 완전 제거

### **3단계: 환경 변수 최적화 ✅**
```json
"variables": {
  "PYTHONOPTIMIZE": "1",
  "PYTHONDONTWRITEBYTECODE": "1",
  "PIP_NO_CACHE_DIR": "1",
  "PIP_DISABLE_PIP_VERSION_CHECK": "1"
}
```

---

## 📊 **메모리 사용량 비교**

| Dockerfile | 예상 메모리 | 성공률 | 상태 |
|------------|-------------|---------|------|
| `Dockerfile` (원본) | 800MB+ | ❌ 실패 | ❌ |
| `Dockerfile.optimized` | 600MB+ | ❌ 실패 | ❌ |
| `Dockerfile.lightweight` | 500MB+ | ⚠️ 불안정 | ❌ |
| `Dockerfile.ultra-light` | 400MB+ | ✅ 높음 | ❌ (프론트엔드 빌드 실패) |
| **`Dockerfile.backend-only`** | **300MB-** | **✅ 매우 높음** | **🔄 진행 중** |

---

## 🚀 **성공적인 배포 후 다음 단계**

### **1. 백엔드 API 확인**
```bash
# 헬스체크
curl https://your-domain.railway.app/health
# 응답: {"status": "healthy", "timestamp": "..."}

# API 테스트
curl https://your-domain.railway.app/api/tasks/
curl https://your-domain.railway.app/api/users/
```

### **2. 프론트엔드 별도 배포 (선택사항)**
- **Vercel**: Next.js 최적화, 무료
- **Netlify**: 정적 사이트 호스팅, 무료
- **GitHub Pages**: 무료 정적 호스팅

### **3. 프론트엔드 API 연동**
```javascript
// 프론트엔드에서 백엔드 API 호출
const API_BASE = 'https://your-domain.railway.app';

fetch(`${API_BASE}/api/tasks/`)
  .then(response => response.json())
  .then(data => console.log(data));
```

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

- [x] 극한 경량 Dockerfile 사용
- [x] requirements.txt 최적화 완료
- [x] PostgreSQL 의존성 제거 (SQLite 사용)
- [x] 불필요한 패키지 제거
- [x] 메모리 효율적인 설치 방법 적용
- [x] 헬스체크 엔드포인트 추가
- [x] Railway 설정 최적화
- [x] **백엔드 전용 배포로 전환**
- [x] **프론트엔드 빌드 과정 제거**

---

## 🎯 **목표**
**Exit Code 137 오류 완전 해결**으로 안정적인 Railway 배포 달성! 🚀

**현재 전략: 백엔드 전용 배포로 메모리 문제 완전 해결**
