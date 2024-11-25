# Backend 開発方法
## 開発環境
- Python : 3.11.10
- fastapi : 0.115.2


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