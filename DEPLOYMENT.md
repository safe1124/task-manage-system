# 🚀 AishTask 전세계 배포 가이드

## 📋 개요
Docker 환경에서 개발된 풀스택 태스크 관리 애플리케이션을 전세계에 배포하는 가이드입니다.

## 🏗️ 아키텍처
- **Frontend**: Next.js 15 (Vercel 배포)
- **Backend**: FastAPI (Railway/Render 배포)
- **Database**: PostgreSQL (Railway/Render 관리형 DB)
- **Authentication**: 세션 기반 쿠키 인증

## 🚀 배포 옵션

### Option 1: Railway (추천)

#### 백엔드 배포
1. [Railway](https://railway.app) 계정 생성
2. GitHub 연동 후 이 저장소 선택
3. 환경 변수 설정:
   ```
   ENVIRONMENT=production
   DATABASE_URL=postgresql://... (Railway에서 자동 제공)
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
4. `railway.toml` 설정이 자동으로 적용됨

#### 데이터베이스 설정
1. Railway에서 PostgreSQL 플러그인 추가
2. 자동 생성된 DATABASE_URL 확인
3. 마이그레이션 실행:
   ```bash
   railway run alembic upgrade head
   ```

### Option 2: Render

#### 백엔드 배포
1. [Render](https://render.com) 계정 생성
2. GitHub 저장소 연결
3. `render.yaml` 설정 사용
4. 환경 변수 설정

### 프론트엔드 배포 (Vercel)

1. [Vercel](https://vercel.com) 계정 생성
2. GitHub 저장소 가져오기
3. 빌드 설정:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

4. 환경 변수 설정:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-backend.up.railway.app
   NODE_ENV=production
   ```

## 🔧 로컬 프로덕션 테스트

Docker Compose로 프로덕션 환경 테스트:

```bash
# 프로덕션 환경 빌드 및 실행
docker-compose -f docker-compose.prod.yml up --build

# 접속 확인
curl http://localhost:8000/check
curl http://localhost:3000
```

## 🌍 도메인 설정

### 커스텀 도메인 (선택사항)
1. **Vercel**: 프로젝트 설정 > Domains
2. **Railway**: 프로젝트 설정 > Custom Domain
3. **DNS 설정**: A/CNAME 레코드 추가

### SSL 인증서
- Vercel, Railway 모두 자동 SSL 제공
- 커스텀 도메인에도 자동 적용

## 📊 모니터링 설정

### Health Check 엔드포인트
- 백엔드: `GET /check`
- 프론트엔드: Next.js 내장 헬스체크

### 로그 모니터링
- Railway: 실시간 로그 대시보드
- Vercel: Function 로그 및 Analytics

## 🔒 보안 설정

### 환경 변수 (필수)
```bash
# 백엔드
DATABASE_URL=postgresql://...
ENVIRONMENT=production
FRONTEND_URL=https://...
SECRET_KEY=secure-random-key

# 프론트엔드  
NEXT_PUBLIC_BACKEND_URL=https://...
```

### CORS 설정
프로덕션에서는 특정 도메인만 허용하도록 설정됨

## 🚀 배포 체크리스트

### 배포 전 확인사항
- [ ] 모든 환경 변수 설정 완료
- [ ] 데이터베이스 마이그레이션 완료
- [ ] 로컬에서 프로덕션 빌드 테스트
- [ ] CORS 설정 확인
- [ ] Health check 엔드포인트 동작 확인

### 배포 후 확인사항
- [ ] 백엔드 API 응답 확인
- [ ] 프론트엔드 로딩 확인
- [ ] 로그인/회원가입 기능 테스트
- [ ] 태스크 CRUD 기능 테스트
- [ ] 세션 인증 동작 확인

## 🆘 트러블슈팅

### 일반적인 문제들

1. **CORS 오류**
   - `FRONTEND_URL` 환경변수 확인
   - 백엔드 allowed_origins 설정 확인

2. **데이터베이스 연결 오류**
   - `DATABASE_URL` 형식 확인
   - 마이그레이션 실행 여부 확인

3. **세션 인증 실패**
   - 쿠키 SameSite 설정 확인
   - HTTPS 환경에서 Secure 쿠키 설정

4. **빌드 실패**
   - Node.js/Python 버전 확인
   - 의존성 설치 확인

## 🔄 CI/CD 설정 (선택사항)

GitHub Actions를 통한 자동 배포:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        uses: railway/cli@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## 📞 지원

배포 중 문제가 발생하면:
1. 로그 확인 (Railway/Vercel 대시보드)
2. Health check 엔드포인트 테스트
3. 환경 변수 설정 재확인
4. GitHub Issues에 문제 보고

---

## 🎉 배포 완료!

성공적으로 배포되면:
- **프론트엔드**: https://your-app.vercel.app
- **백엔드**: https://your-api.up.railway.app
- **API 문서**: https://your-api.up.railway.app/docs

전세계 어디서나 접속 가능한 태스크 관리 애플리케이션 완성! 🌍✨
