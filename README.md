This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Deployment Commands

### Netlify Deployment (Recommended)
```bash
# Build for Netlify
npm run deploy:netlify

# Deploy using script
npm run deploy

# Deploy directly with Vercel CLI (if needed)
npm run deploy:vercel

# Trigger deployment via webhook (requires VERCEL_DEPLOY_HOOK_URL)
npm run trigger-deploy
```

### Setting up Netlify Deployment
1. **GitHub 연동**: Netlify에서 GitHub 저장소 연결
2. **빌드 설정**: 
   - Build command: `npm run build`
   - Publish directory: `out`
3. **환경변수 설정**:
   - `NEXT_PUBLIC_BACKEND_URL`: `https://unique-perception-production.up.railway.app`
4. **자동 배포**: main 브랜치에 push하면 자동 배포

### Setting up Vercel Auto-deployment (Alternative)
1. Go to Vercel Dashboard → Your Project → Settings → Git
2. Create a Deploy Hook and copy the URL
3. Set environment variable: `VERCEL_DEPLOY_HOOK_URL=<your_hook_url>`

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:4989](http://localhost:4989) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
