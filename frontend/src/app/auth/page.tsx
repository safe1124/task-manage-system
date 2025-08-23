"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import styles from "./auth.module.css";

export default function AuthPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const { theme } = useTheme();
  const [mode, setMode] = useState<"login" | "register">("login");

  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Check for client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

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
        const data = await res.json().catch(() => ({}));
        const detail = data.detail || `エラーコード: ${res.status}`;
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
        const data = await res.json();
        setMsg("ログイン中...");
        const loginSuccess = await login(data.session_id || "success");
        if (!loginSuccess) {
          setMsg("ログインに成功しましたが、プロファイル取得に失敗しました。");
        }
        // Redirect is now handled by the login function's state update triggering
        // the useEffect in this component. No need to call router.replace here.
      }
    } catch (e: any) {
      setMsg("ネットワークエラーが発生しました。");
    }
  }

  // Prevents flashing the login form for an already authenticated user.
  if (loading || user) {
    return (
      <div className={styles.authLoadingContainer}>
        <div className={styles.authLoadingCard}>
          <div className={styles.authLoadingTitle}>認証情報を確認中...</div>
          <div className={styles.authLoadingSpinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>{mode === "login" ? "ログイン" : "新規登録"}</h1>
        
        <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
          {mode === "register" && (
            <div className={styles.authFormGroup}>
              <label className={styles.authLabel}>お名前</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="お名前を入力"
                className={styles.authInput}
                required
              />
            </div>
          )}
          
          <div className={styles.authFormGroup}>
            <label className={styles.authLabel}>メールアドレス</label>
            <input
              type="email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              placeholder="メールアドレスを入力"
              className={styles.authInput}
              required
            />
          </div>
          
          <div className={styles.authFormGroup}>
            <label className={styles.authLabel}>パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              className={styles.authInput}
              required
            />
          </div>
          
          <div className={styles.authButtonGroup}>
            <button type="submit" className={`${styles.authBtn} ${styles.authBtnPrimary}`}>
              {mode === "login" ? "ログイン" : "登録"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setMsg(null);
                setName("");
                setMail("");
                setPassword("");
              }}
              className={`${styles.authBtn} ${styles.authBtnSecondary}`}
            >
              {mode === "login" ? "新規登録へ" : "ログインへ"}
            </button>
          </div>
        </form>
        
        {msg && (
          <div className={`${styles.authMessage} ${
            msg.includes("成功") || msg.includes("完了") 
              ? styles.authMessageSuccess
              : msg.includes("エラー") || msg.includes("失敗")
              ? styles.authMessageError
              : styles.authMessageInfo
          }`}>
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}


