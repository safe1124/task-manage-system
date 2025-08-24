"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import styles from "./auth.module.css";

export default function AuthPage() {
  const router = useRouter();
  const { login, loginAsGuest, user, isLoading } = useAuth();
  const { theme } = useTheme();
  const [mode, setMode] = useState<"login" | "register">("login");

  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // 계정 정보 모달 상태
  const [showAccountInfo, setShowAccountInfo] = useState(false);
  const [accountInfo, setAccountInfo] = useState<{ id: string; password: string } | null>(null);

  // Check for client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/tasks');
    }
  }, [user, isLoading, router]);

  async function submit() {
    console.log("Submit function called");
    setMsg(null);
    
    if (mode === 'register') {
      // 회원가입 로직
      const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 
                        (isProduction ? 'https://unique-perception-production.up.railway.app' : 'http://localhost:8000');
      
      try {
        const res = await fetch(`${backendUrl}/users/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, mail, password }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const detail = data.detail || `エラーコード: ${res.status}`;
          if (res.status === 409) setMsg(`登録失敗: ${detail}`);
          else if (res.status === 422) setMsg("入力形式が正しくありません。");
          else setMsg(`サーバーエラー: ${detail}`);
          return;
        }

        setMsg("登録が完了しました。ログインしてください。");
        setMode("login");
        setName("");
        setMail("");
        setPassword("");
      } catch (e: any) {
        setMsg("ネットワークエラーが発生しました。");
      }
    } else {
      // 로그인 로직 - AuthContext의 login 함수 사용
      setMsg("ログイン中...");
      
      try {
        const loginSuccess = await login(mail, password);
        
        if (loginSuccess) {
          setMsg("ログイン成功！");
          // AuthContext의 user 상태 변경으로 인해 useEffect에서 자동으로 리다이렉트됨
        } else {
          setMsg("ログインに失敗しました。メールアドレスとパスワードを確認してください。");
        }
      } catch (e: any) {
        console.error("Login error:", e);
        setMsg("ネットワークエラーが発生しました。");
      }
    }
  }

  async function startGuestMode() {
    console.log("Guest mode function called");
    setMsg(null);
    
    try {
      setMsg("체험 모드를 시작중...");
      const result = await loginAsGuest();
      
      if (!result.success) {
        setMsg("체험 모드 시작에 실패했습니다. 다시 시도해주세요.");
        return;
      }
      
      if (result.accountInfo) {
        setAccountInfo(result.accountInfo);
        setShowAccountInfo(true);
        setMsg(null);
      }
      
      // 리다이렉트는 계정 정보 모달을 닫을 때 처리
    } catch (e: any) {
      setMsg("체험 모드 시작 중 오류가 발생했습니다.");
    }
  }

  // 계정 정보 모달 닫기 및 태스크 페이지로 이동
  function closeAccountInfoModal() {
    setShowAccountInfo(false);
    setAccountInfo(null);
    router.replace('/tasks');
  }

  // Prevents flashing the login form for an already authenticated user.
  if (isLoading || user) {
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
        
        {mode === "login" && (
          <div className={styles.authGuestSection}>
            <div className={styles.authDivider}>
              <span>または</span>
            </div>
            <button
              type="button"
              onClick={startGuestMode}
              className={`${styles.authBtn} ${styles.authBtnGuest}`}
            >
              体験モード
            </button>
            <p className={styles.authGuestNote}>
              アカウント登録なしでタスク管理機能をお試しいただけます
            </p>
          </div>
        )}
        
        {msg && (
          <div className={`${styles.authMessage} ${
            msg.includes("성공") || msg.includes("완료") 
              ? styles.authMessageSuccess
              : msg.includes("오류") || msg.includes("실패")
              ? styles.authMessageError
              : styles.authMessageInfo
          }`}>
            {msg}
          </div>
        )}
      </div>
      
      {/* 계정 정보 모달 */}
      {showAccountInfo && accountInfo && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>체험 계정이 생성되었습니다</h2>
              <button 
                className={styles.modalCloseBtn}
                onClick={closeAccountInfoModal}
                title="닫기"
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>당신의 ID, PW는 다음과 같습니다</p>
              <div className={styles.accountInfoBox}>
                <div className={styles.accountInfoItem}>
                  <label>ID:</label>
                  <span className={styles.accountInfoValue}>{accountInfo.id}</span>
                </div>
                <div className={styles.accountInfoItem}>
                  <label>Password:</label>
                  <span className={styles.accountInfoValue}>{accountInfo.password}</span>
                </div>
              </div>
              <p className={styles.modalWarning}>
                만일을 대비해서 보존해 주세요
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.modalConfirmBtn}
                onClick={closeAccountInfoModal}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
