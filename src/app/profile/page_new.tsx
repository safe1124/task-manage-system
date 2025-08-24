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
    try {
      const res = await authFetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatar_url: avatarUrl || undefined }),
      });
      
      if (res.ok) {
        setMsg("プロフィールを保存しました");
        await reloadUser(); // Reload user data in context to update header
      } else {
        const errorData = await res.json().catch(() => ({}));
        setMsg(`保存に失敗しました: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Profile save error:', error);
      setMsg("保存に失敗しました: ネットワークエラー");
    }
  }

  async function changePassword() {
    setMsg(null);
    if (!currentPassword || !newPassword) {
      setMsg("両方のパスワードフィールドを入力してください。");
      return;
    }
    
    // 체험 사용자는 비밀번호 변경 불가
    if (user?.isGuest || user?.name?.includes('体験ユーザー')) {
      setMsg("体験アカウントではパスワードを変更できません。");
      return;
    }
    
    try {
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
        const errorData = await res.json().catch(() => ({}));
        setMsg(`パスワード変更に失敗しました: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Password change error:', error);
      setMsg("パスワード変更に失敗しました: ネットワークエラー");
    }
  }

  if (authLoading || !user) {
    return <div className={`min-h-screen p-8 text-center ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>読み込み中...</div>;
  }

  const isGuestUser = user?.isGuest || user?.name?.includes('体験ユーザー');

  return (
    <div className={`min-h-screen py-16 px-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
      <div className="max-w-md mx-auto glass p-6">
        <h1 className={`text-xl font-semibold mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>プロフィール</h1>
        
        {isGuestUser && (
          <div className={`mb-4 p-3 rounded border ${
            theme === 'light' 
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
              : 'bg-yellow-900/20 border-yellow-700 text-yellow-300'
          }`}>
            体験アカウントです。一部機能が制限されています。
          </div>
        )}
        
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
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } transition-colors w-full mb-3`}>保存</button>
        </div>

        {!isGuestUser && (
          <div className={`pt-4 border-t ${theme === 'light' ? 'border-gray-200' : 'border-white/10'}`}>
            <h2 className={`text-lg font-semibold mb-3 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>パスワード変更</h2>
            <label className={`text-sm block mb-1 ${theme === 'light' ? 'text-gray-600' : 'text-white/70'}`}>現在のパスワード</label>
            <input type="password" className={`border rounded p-2 w-full mb-3 ${
              theme === 'light' 
                ? 'bg-white border-gray-300 text-gray-900' 
                : 'bg-gray-800 border-gray-600 text-white'
            }`} value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} />
            
            <label className={`text-sm block mb-1 ${theme === 'light' ? 'text-gray-600' : 'text-white/70'}`}>新しいパスワード</label>
            <input type="password" className={`border rounded p-2 w-full mb-4 ${
              theme === 'light' 
                ? 'bg-white border-gray-300 text-gray-900' 
                : 'bg-gray-800 border-gray-600 text-white'
            }`} value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} />
            <button onClick={changePassword} className={`rounded px-3 py-2 ${
              theme === 'light' 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            } transition-colors w-full`}>変更</button>
          </div>
        )}

        {msg && (
          <div className={`mt-4 p-3 rounded text-center ${
            msg.includes("失敗") || msg.includes("エラー") || msg.includes("できません")
              ? theme === 'light'
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-red-900/30 text-red-300 border border-red-700'
              : theme === 'light'
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-green-900/30 text-green-300 border border-green-700'
          }`}>
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
