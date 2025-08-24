"use client";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { authFetch } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, reloadUser } = useAuth();
  const { theme } = useTheme();
  
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
    } else if (user) {
      setName(user.name);
      setAvatarUrl(user.avatar_url || "");
    }
  }, [user, authLoading, router]);

  async function saveProfile() {
    setMsg(null);
    const res = await authFetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, avatar_url: avatarUrl || undefined }),
    });
    setMsg(res.ok ? "プロフィールを保存しました" : "保存に失敗しました");
    if (res.ok) await reloadUser(); // Reload user data in context to update header
  }

  async function changePassword() {
    setMsg(null);
    if (!currentPassword || !newPassword) {
      setMsg("両方のパスワードフィールドを入力してください。");
      return;
    }
    const res = await authFetch("/api/users/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });

    if (res.ok) {
      setMsg("パスワードを変更しました");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg(`失敗: ${data.detail || '不明なエラー'}`);
    }
  }

  if (authLoading || !user) {
    return <div className={`min-h-screen p-8 text-center ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>読み込み中...</div>;
  }

  return (
    <div className={`min-h-screen py-16 px-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
      <div className="max-w-md mx-auto glass p-6">
        <h1 className={`text-xl font-semibold mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>プロフィール</h1>
        
        <p className={`mb-1 ${theme === 'light' ? 'text-gray-700' : 'text-white'}`}>名前: {user.name}</p>
        <p className={`mb-4 ${theme === 'light' ? 'text-gray-700' : 'text-white'}`}>メール: {user.mail}</p>

        <div className={`pt-4 border-t ${theme === 'light' ? 'border-gray-200' : 'border-white/10'}`}>
            <label className={`text-sm block mb-1 ${theme === 'light' ? 'text-gray-600' : 'text-white/70'}`}>表示名</label>
            <input className={`border rounded p-2 w-full mb-3 ${
              theme === 'light' 
                ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500' 
                : 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
            }`} placeholder="お名前" value={name} onChange={(e)=>setName(e.target.value)} />
            
            <label className={`text-sm block mb-1 ${theme === 'light' ? 'text-gray-600' : 'text-white/70'}`}>プロフィール画像URL（任意）</label>
            <input className={`border rounded p-2 w-full mb-4 ${
              theme === 'light' 
                ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500' 
                : 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
            }`} placeholder="https://example.com/avatar.jpg" value={avatarUrl} onChange={(e)=>setAvatarUrl(e.target.value)} />
            <button onClick={saveProfile} className={`rounded px-3 py-2 ${
              theme === 'light' 
                ? 'bg-gray-900 text-white hover:bg-gray-800' 
                : 'bg-white text-gray-900 hover:bg-gray-100'
            }`}>プロフィール保存</button>
        </div>

        <div className={`mt-4 pt-4 border-t ${theme === 'light' ? 'border-gray-200' : 'border-white/10'}`}>
          <h2 className={`font-medium mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>パスワード変更</h2>
          <input className={`border rounded p-2 w-full mb-3 ${
            theme === 'light' 
              ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500' 
              : 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
          }`} placeholder="現在のパスワード" type="password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} />
          <input className={`border rounded p-2 w-full mb-3 ${
            theme === 'light' 
              ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500' 
              : 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
          }`} placeholder="新しいパスワード" type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} />
          <button onClick={changePassword} className={`rounded px-3 py-2 ${
            theme === 'light' 
              ? 'bg-gray-200 text-gray-900 hover:bg-gray-300' 
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}>パスワード変更</button>
        </div>
        
        {msg && <div className={`mt-3 text-sm ${theme === 'light' ? 'text-gray-700' : 'text-white/90'}`}>{msg}</div>}
      </div>
    </div>
  );
}


