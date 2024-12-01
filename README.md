# Airion Employment Test
- 最終更新：2024/12/1
- 作成者：Seinosuke
- 不明点や質問があれば s-saito@airion.co.jp までご連絡ください。

# 試験概要
- 期間：1週間
- 採点基準：[こちらのNotion](https://airion.notion.site/7c2f22a677244af895894e71efd21e3c)を参考にしてください
- 提出方法：
Zipファイルを解凍しそれを元に新しいGitHubリポジトリを作成してください。
そのリポジトリのURLを`s-saito@airion.co.jp`まで提出してください。


## 注意点
本テストの機能要件は以下の通りです：
- タスク管理機能：必須要件です。必ず実装してください。
- ユーザー管理機能：可能であれば実装してください（任意要件）。
タスク管理機能の実装を優先し、時間やリソースに余裕がある場合はユーザー管理機能の実装を検討してください。

## 必要要件
- docker for mac or windows
- VScode
- windowsの場合，wsl

# 開発環境立ち上げ方法
## Step1 : コードの clone or Fork
- Git Clone/Fork を行い，ローカルにコードを落とす．

## Step2 : Dev Container 起動
- Clone したディレクトリに移動して， `code .` を入力するか VScode 上から clone したディレクトリを開く．
- `Command(Ctrl) + Shift + P` を入力するとコマンドパレットが開くので `Dev Containers: Rebuild Container Without Cache` または`Dev Containers: Rebuild Container Without Cache`を選択．
    - VScode を開くと右下に `Reopen ...` のようなボタンが出てくるのでこちらを押しても同様の事が可能
- コンテナが起動するまでしばらく待つ

## Step3 : DBマイグレーションの実行
- DBを利用するためにデータベーステーブルの作成が必要になってくる。
- そこでUserテーブルのみ作成しておく。（必要があればUserテーブルに修正を加えて頂いて構いません。）
- `/sample/alembic.sample.ini`, `/sample/env.sample.py` を利用してマイグレーションを実行する
- 以下のコマンドを実行していく
```bash
cd /workspace/backend
alembic init migrations

cp /workspace/sample/alembic.sample.ini /workspace/backend/alembic.ini 
cp /workspace/sample/env.sample.py /workspace/backend/migrations/env.py

alembic revision --autogenerate -m "First Create User Table"
alembic upgrade head
```

### 上記のコマンドでエラーを吐く場合
以下コマンドで過去の過去のマイグレーションの状態を削除する。
```bash
psql -h db -p 5432 -U postgres -d postgres
# password入力画面が出るので「postgres」と入力
```
テーブル内容を削除する
```bash
DELETE FROM alembic_version;
```

- 以上のコマンドを完了させ，データベース内にテーブルが正常作成されているか確認する
```bash
psql -h db -p 5432 -U postgres -d postgres
# password入力画面が出るので「postgres」と入力


# 接続後，data tables コマンドを入力して4つのテーブルが作成されていることを確認する．
postgres=# \dt
              List of relations
 Schema |      Name       | Type  |  Owner   
--------+-----------------+-------+----------
 public | alembic_version | table | postgres
 public | user_table      | table | postgres
(2 rows)
```

- 確認できたら、postgreから抜ける。
```bash
\q
```

## Step4 : フロントエンド起動
- 以下のコマンドを実行してフロントエンドを立ち上げる．

```bash
cd /workspace/frontend
npm install
yarn dev -p 4989
```

`localhost:4989` をブラウザで開き，立ち上がっていることを確認する．

## Step5 : バックエンド起動
- 以下のコマンドを実行してバックエンドを立ち上げる．
```bash
cd /workspace/backend
uvicorn main:app --reload --port=8600
```

- VScodeの拡張機能である `Thunder Client` や `Postman` を利用してAPIのテストを行う．
- `http://localhost:8600/check` に GET リクエストを送信すると正常に起動しているかの確認が行える．

## Tips
- FastAPIで作成されたAPIを確認するには `localhost:8600/docs` を参照する．
- [Frontend開発方法](/public/frontend.md)
- [Backend開発方法](/public/backend.md)
