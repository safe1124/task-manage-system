# Frontend 開発方法
## 開発環境
- Node.js : 18.20.4
- Next.js : 14.2.15
- chakra-ui ^2.10.3

## 簡単な開発方法
- Next.js では，各ディレクトリがファイルパスとなります．各ディレクトリ内に `page.tsx` を作成するとアクセスできます．
    - Ex) `/frontend/hoge/page.tsx` には `localhost:4989/hoge` でアクセスできます．

## ユーザ認証が必要な場合
### GET Request
```typescript
export const hogeAPI = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/new_api_name`, {
    headers: { Authorization: `Bearer ${token}` },
  },);
  
  return response.data;
};
```

### POST Request
```typescript
export const hogeAPI = async (hoge : string) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/new_api_name`,
   { message }, 
   {headers: { Authorization: `Bearer ${token}` }}
   );

  return response.data;
};
```

## ユーザ認証が不要な場合
### GET Request
```typescript
export const hogeAPI = async () => {
  const response = await axios.get(`${API_URL}/new_api_name`);
  
  return response.data;
};
```

### POST Request
```typescript
export const hogeAPI = async (hoge : string) => {
  const response = await axios.post(`${API_URL}/new_api_name`,  { message });

  return response.data;
};
```