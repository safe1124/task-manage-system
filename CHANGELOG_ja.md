# 更新履歴（patch1.0）

## 目的
フロントエンドが空白表示になる・CORS エラーで API がブロックされる問題を解消し、タスク UI を正常表示できるようにしました。

## 主な変更点
- フロントエンドの API 呼び出しを絶対 URL から `/api` プロキシに統一
  - 変更: `frontend/next.config.ts`（`rewrites` で `/api/:path*` → `http://localhost:8600/:path*`）
  - 変更: `frontend/src/app/tasks/TaskListClient.tsx`
  - 変更: `frontend/src/components/HeaderClient.tsx`
  - 変更: `frontend/src/app/tasks/[id]/page.tsx`

- 初期遷移の安定化
  - 変更: `frontend/src/app/page.tsx` をクライアントリダイレクト → サーバーサイド `redirect('/tasks')` に変更

- UI 復元/改善
  - `TaskListClient.tsx` に検索・フィルタ・並び替え、追加フォーム、グリッド/リスト切替、スワイプ削除、期限バッジを実装

- バックエンド CORS 設定の拡張
  - 変更: `backend/main.py` に `http://localhost:3000` / `http://127.0.0.1:3000` を追加
  - （参考）ローカル実行向け `backend/run_server.py` によりポート `8600` で起動

- 開発環境の安定化
  - 変更: `frontend/package.json` の `dev` を `next dev -p 3000 -H 0.0.0.0` に調整（Turbopack を無効化して HMR 安定化）

## 動作確認
- バックエンド: `curl http://localhost:8600/check` → `{ "status": "ok" }`
- フロントエンド: `cd frontend && npm run dev` → `http://localhost:3000`
- API 経路: ブラウザから `GET /api/tasks/` が 200 で応答され一覧が表示される

## 既知の注意点 / ネットワーク
- ホットスポット等のネットワーク環境では `localhost` 解決が不安定な場合があります。`http://127.0.0.1:3000` の利用を推奨します。

## 起動コマンド（参考）
```bash
# Backend
cd backend
source ../.venv/bin/activate
python3 run_server.py  # 0.0.0.0:8600

# Frontend
cd ../frontend
npm run dev            # 0.0.0.0:3000
```


