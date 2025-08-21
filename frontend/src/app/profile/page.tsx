"use client";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { authFetch } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

// Use Railway backend URL for Vercel deployment
const API_BASE = "https://3minutetasker.up.railway.app";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, reloadUser } = useAuth();
  
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
    const res = await authFetch(`${API_BASE}/users/me`, {
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
    const res = await authFetch(`${API_BASE}/users/change-password`, {
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
    return <div className="min-h-screen p-8 text-center text-white">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen py-16 px-6 text-white">
      <div className="max-w-md mx-auto glass p-6">
        <h1 className="text-xl font-semibold mb-4">プロフィール</h1>
        
        <p className="mb-1">名前: {user.name}</p>
        <p className="mb-4">メール: {user.mail}</p>

        <div className="pt-4 border-t border-white/10">
            <label className="text-sm opacity-70 block mb-1">表示名</label>
            <input className="border rounded p-2 w-full mb-3 text-black" placeholder="お名前" value={name} onChange={(e)=>setName(e.target.value)} />
            
            <label className="text-sm opacity-70 block mb-1">プロフィール画像URL（任意）</label>
            <input className="border rounded p-2 w-full mb-4 text-black" placeholder="https://example.com/avatar.jpg" value={avatarUrl} onChange={(e)=>setAvatarUrl(e.target.value)} />
            <button onClick={saveProfile} className="rounded bg-foreground text-background px-3 py-2">プロフィール保存</button>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <h2 className="font-medium mb-2">パスワード変更</h2>
          <input className="border rounded p-2 w-full mb-3 text-black" placeholder="現在のパスワード" type="password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} />
          <input className="border rounded p-2 w-full mb-3 text-black" placeholder="新しいパスワード" type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} />
          <button onClick={changePassword} className="rounded bg-white/10 px-3 py-2">パスワード変更</button>
        </div>
        
        {msg && <div className="mt-3 text-sm opacity-90">{msg}</div>}
      </div>
    </div>
  );
}


