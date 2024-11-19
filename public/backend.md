# Backend 開発方法
## 開発環境
- Python : 3.11.10
- fastapi : 0.115.2

## ログインが不要なAPIにする場合
- `/backend/main.py` の 38-58行目 `ログインが不要な場合は以下をコメントアウト` となっている部分をコメントアウト

## 新規APIを作成する方法
- 以下のように新規エンドポイントを作成
```
app.include_router(chat.router, prefix="/new_endpoint", tags=["new_endpoint"])
```

- `/endpoints/new_endpoint.py` ファイルを作成し，その中に以下のような形でAPIを記述してく
    - APIの呼び出し方法は `localhost:8000/new_endpoint/API_NAME` となります．
    - ResponseTypeは `/schemas/hoge.py` などで定義する．

```bash
@router.post("/API_NAME", response_model=ApiTest)
def test_api():
    return {"API" : "test"}
```

## API開発のみを行う場合
- APIの開発のみを行う場合には，`.devcontainer` ディレクトリ内を以下のように修正する．

### .devcontainer/devcontainer.json
```json
{
  "name": "FastAPI and PostgreSQL Dev Container",
  "dockerComposeFile": "docker-compose.yml",
  "service": "app",
  "workspaceFolder": "/workspace",
  "forwardPorts": [8000, 5432],
  "postCreateCommand": "cd backend && pip install -r requirements.txt",
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-python.python",
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "ms-azuretools.vscode-docker",
        "ms-python.debugpy",
        "rangav.vscode-thunder-client",
        "ckolkman.vscode-postgres",
        "mtxr.sqltools",
        "mtxr.sqltools-driver-pg"
      ],
      "settings": {
        "python.defaultInterpreterPath": "/usr/bin/python",
        "python.linting.enabled": true,
        "python.linting.pylintEnabled": true,
        "python.formatting.autopep8Path": "/usr/local/py-utils/bin/autopep8",
        "python.formatting.blackPath": "/usr/local/py-utils/bin/black",
        "python.formatting.yapfPath": "/usr/local/py-utils/bin/yapf",
        "python.linting.banditPath": "/usr/local/py-utils/bin/bandit",
        "python.linting.flake8Path": "/usr/local/py-utils/bin/flake8",
        "python.linting.mypyPath": "/usr/local/py-utils/bin/mypy",
        "python.linting.pycodestylePath": "/usr/local/py-utils/bin/pycodestyle",
        "python.linting.pydocstylePath": "/usr/local/py-utils/bin/pydocstyle"
      }
    }
  },
  "remoteUser": "vscode"
}
```

### .devcontainer/docker-compose.yml(変更なし)
```yml
services:
  app:
    build: 
      context: .
      dockerfile: Dockerfile
    volumes:
      - ..:/workspace
    command: sleep infinity
    network_mode: service:db
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/postgres
    
  db:
    image: postgres:13
    restart: unless-stopped
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_USER: postgres
      POSTGRES_DB: postgres

volumes:
  postgres-data:
```

### .devcontainer/Dockerfile
```Dockerfile
FROM mcr.microsoft.com/devcontainers/python:3.11

WORKDIR /workspace

# PostgreSQLクライアントのインストール
RUN apt-get update && apt-get install -y postgresql-client

# ユーザーをvscodeに切り替え
USER vscode

CMD ["bash"]
```