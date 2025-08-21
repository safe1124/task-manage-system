"use client";
// Updated for Vercel deployment - ESLint errors fixed
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");

  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.replace('/tasks');
    }
  }, [user, loading, router]);

  async function submit() {
    setMsg(null);
    const endpoint = mode === 'register' ? '/api/users/register' : '/api/users/login';
    const body = mode === 'register' ? { name, mail, password } : { mail, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const detail = errorData.detail || `エラーコード: ${res.status}`;
        if (res.status === 409) setMsg(`登録失敗: ${detail}`);
        else if (res.status === 422) setMsg("入力形式が正しくありません。");
        else if (res.status === 401) setMsg("ログイン失敗: " + detail);
        else setMsg(`サーバーエラー: ${detail}`);
        return;
      }

      if (mode === 'register') {
        setMsg("登録が完了しました。ログインしてください。");
        setMode("login");
        setName("");
        setMail("");
        setPassword("");
      } else {
        await res.json(); // Response data not needed for login
        setMsg("ログイン中...");
        const loginSuccess = await login();
        if (!loginSuccess) {
          setMsg("ログインに成功しましたが、プロファイル取得に失敗しました。");
        }
        // Redirect is now handled by the login function's state update triggering
        // the useEffect in this component. No need to call router.replace here.
      }
    } catch {
      setMsg("ネットワークエラーが発生しました。");
    }
  }

  // Prevents flashing the login form for an already authenticated user.
  if (loading || user) {
    return <div className="min-h-screen p-8 text-center text-white">認証情報を確認中...</div>;
  }

  return (
    <div className="min-h-screen py-16 px-6 text-white">
      <div className="max-w-md mx-auto glass p-6">
        <h1 className="text-xl font-semibold mb-4">{mode === "login" ? "ログイン" : "新規登録"}</h1>
        {mode === "register" && (
          <input className="border rounded p-2 w-full mb-3 text-black" placeholder="お名前" value={name} onChange={(e)=>setName(e.target.value)} />
        )}
        <input className="border rounded p-2 w-full mb-3 text-black" placeholder="メール" type="email" value={mail} onChange={(e)=>setMail(e.target.value)} />
        <input className="border rounded p-2 w-full mb-3 text-black" placeholder="パスワード" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={submit} className="rounded bg-foreground text-background px-3 py-2">送信</button>
          <button onClick={()=>{setMode(mode === "login" ? "register" : "login"); setMsg(null);}} className="rounded bg-white/10 px-3 py-2">
            {mode === "login" ? "新規登録へ" : "ログインへ"}
          </button>
        </div>
        {msg && <div className="mt-3 text-sm opacity-90">{msg}</div>}
      </div>
    </div>
  );
}


