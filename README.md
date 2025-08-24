# タスク管理 Web アプリケーション

## 🏗️ アーキテクチャの概要

これは、最新のテクノロジーを使用して構築されたフルスタックタスク管理Webアプリケーションで、フロントエンド、バックエンド、データベースレイヤを明確に分離する機能を備えています。

## 📋 システムアーキテクチャ

### フロントエンドレイヤ
- **Next.js 15.0.3** - サーバ側のレンダリングと静的サイト生成のための反応ベースのフレームワーク
- **React 18.3.1** - インタラクティブなユーザーインターフェイスを構築するためのコンポーネントベースのUIライブラリ
- **TypeScript** - Type-safe JavaScript による開発エクスペリエンスの向上
- **Tailwind CSS** - 応答性とモダンなスタイリングのためのユーティリティファーストCSSフレームワーク
- **テーマサポート** - ダーク/ライトモード切り替え機能内蔵

### バックエンド層
- **高速API 0.115.2** - RESTful API を構築するためのハイパフォーマンスな Python Web フレームワーク
- **Python 3.11** - パフォーマンスとタイプヒントが向上した最新バージョンの Python
- **SQLAchemy 2.0** - 現代の Python SQL ツールキットとオブジェクトリレーショナルマッピング (ORM)
- **Uvicorn** - 実稼働環境向けの高速 ASGI サーバ
- **セッションベースの認証** - セキュアなユーザー認証とセッション管理

### データベース層
- **ポストグレSQL 16** - 高度な機能を備えた実稼働グレードのリレーショナルデータベース
- **SQLite** - 開発およびテスト環境用の軽量データベース
- **Alembic** - バージョン管理とスキーマ管理のためのデータベース移行ツール

### 導入とインフラストラクチャ
- **Docker** - Alpine Linux によるコンテナ化により、メモリ使用を最適化
- **Vercel** - 自動 CI/CD およびグローバル CDN によるフロントエンドの導入
- **鉄道** - PostgreによるバックエンドホスティングSQL データベース統合
- **Netlify** - フォーム処理による代替フロントエンド導入オプション

## 🔄 データフローアーキテクチャ

アプリケーションは、最新の 3 層アーキテクチャ パターンに従います:

1. **クライアント層** - Next.js フロントエンドは、HTTP REST API を介してバックエンドと通信します
2. ** アプリケーション層** - FastAPI は要求の処理、ビジネスロジックの処理、認証の管理を行います
3. **データ層** - PostgreSQL/SQLite データベースに対する SQLlchemy ORM インターフェイス

## 🚀主な機能

- **タスク管理** - 優先度の高いタスクの作成、読み取り、更新、および削除
- **ユーザー認証** - セッション管理による安全なログイン/ログアウト
- **レスポンシブデザイン** - 追い風CSSによるモバイルファーストアプローチ
- **Type Safety** - フロントエンドとバックエンド間の完全な TypeScript 統合
- **データベースの移行** - Alembicによるスキーマの自動バージョン設定
- **コンテナ型導入** - 一貫性のある環境に対するDockerサポート

## 🛠️ テクノロジスタックの概要

| レイヤ | テクノロジー | 目的 |
|-------|------------|---------|
| フロントエンド | Next.js + React + TypeScript | ユーザーThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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
