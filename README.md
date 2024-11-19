# Airion Base Chat System
- 最終更新：2024/11/10
- 作成者：a-uchino
- 不明点や質問があれば Airion Slackの `#開発` チャンネルまでお願いします．
    - 個別のPJに依存する質問は各クライアントさんチャンネルでお願いします．

## 必要要件
- docker for mac or windows
- VScode
- windowsの場合，wsl

### AWSにデプロイする際の注意点
- 本システムを AWS の EC2 にデプロイする際には `t2.micro` だとスペック不足でサーバが落ちてしまうので，`t2.medium` を選択するようにしてください．

# 開発環境立ち上げ方法
## Step1 : コードの clone or Fork
- Git Clone を行い，ローカルにコードを落とす．

## Step2 : Dev Container 起動
- Clone したディレクトリに移動して， `code .` を入力するか VScode 上から clone したディレクトリを開く．
- `Command(Ctrl) + Shift + P` を入力するとコマンドパレットが開くので `Dev Containers: Rebuild Container Without Cache` を選択．
    - VScode を開くと右下に `Reopen ...` のようなボタンが出てくるのでこちらを押しても同様の事が可能
- コンテナが起動するまでしばらく待つ

## Step3 : DBマイグレーションの実行
- DBを利用するためにデータベーステーブルの作成が必要になってくる
- `/sample/alembic.ini`, `/sample/env.py` を利用してマイグレーションを実行する
- 以下のコマンドを実行していく
```bash
cd /workspace/backend
alembic init migrations

cp /workspace/sample/alembic.sample.ini /workspace/backend/alembic.ini 
cp /workspace/sample/env.sample.py /workspace/backend/migrations/env.py

alembic revision --autogenerate -m "create tables"
alembic upgrade head
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
 public | chat_log        | table | postgres
 public | role_table      | table | postgres
 public | user_table      | table | postgres
(4 rows)
```

## Step4 : 環境変数の設定
- JWT token を生成する際に `secret_key` などが必要となってくる
- 以下のコマンドを入力して，環境変数サンプルファイルをコピーする
```bash
cp /workspace/backend/.env.sample /workspace/backend/.env
```
- 以下のコマンドを入力して， `secret key` の生成を行う
```bash
node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
```
- 出力されたキーを `.env` ファイルに貼り付ける
```text
# JWT Secret Key settings
SECRET_KEY = "ここに貼り付け"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440
```
- プロジェクトで環境変数(ex. API keyなど)を利用する場合には `.env` ファイルに追記していく

## Step5 : フロントエンド起動
- 以下のコマンドを実行してフロントエンドを立ち上げる．

```bash
cd /workspace/frontend
npm install
yarn dev
```

`localhost:3000` をブラウザで開き，立ち上がっていることを確認する．

## Step6 : バックエンド起動
- 以下のコマンドを実行してバックエンドを立ち上げる．
```bash
cd /workspace/backend
uvicorn main:app --reload
```

- VScodeの拡張機能である `Thunder Client` や `Postman` を利用してAPIのテストを行う．
- `http://localhost:8000/check` に GET リクエストを送信すると正常に起動しているかの確認が行える．

## Tips
- FastAPIで作成されたAPIを確認するには `localhost:8000/docs` を参照する．
- [Frontend開発方法](/public/frontend.md)
- [Backend開発方法](/public/backend.md)
