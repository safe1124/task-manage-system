FROM mcr.microsoft.com/devcontainers/python:3.11

ARG NODE_VERSION=18
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get update && apt-get install -y nodejs

WORKDIR /workspace

# PostgreSQLクライアントのインストール
RUN apt-get update && apt-get install -y postgresql-client

# ユーザーをvscodeに切り替え
USER vscode

CMD ["bash"]