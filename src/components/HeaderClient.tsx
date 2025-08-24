"use client";
import { useState } from "react";
import ModernDropdown from './ModernDropdown';
import { authFetch } from '@/lib/auth';
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function HeaderClient() {
  const [open, setOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const { theme } = useTheme();

  // Drawer state
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("created_desc");

  // Create form
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState(3);

  async function createTask() {
    if (!title.trim()) return;
    const res = await authFetch(`/api/tasks/`, { // Use authFetch and /api proxy
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), description: desc || null, status: "todo", priority }),
    });
    if (res.ok) {
      setTitle("");
      setDesc("");
      setPriority(3);
      window.dispatchEvent(new Event("tasks:reload"));
      setOpen(false); // Close the drawer on success
    } else {
      alert("タスクの追加に失敗しました。");
    }
  }

  function doSearch() {
    const evt = new CustomEvent("tasks:search", { detail: { q, status: statusFilter, sort } });
    window.dispatchEvent(evt);
    setOpen(false);
  }

  return (
    <>
      <header className={`sticky top-0 z-20 backdrop-blur border-b transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-white/90 border-gray-200 text-gray-900' 
          : 'bg-[#0b1b3b]/90 border-white/10 text-white'
      }`}>
        <nav className="max-w-5xl mx-auto flex items-center px-4 py-3 relative">
          <div className="flex items-center">
            <button className="font-semibold hover:opacity-80" onClick={() => setOpen(true)}>タスク</button>
          </div>
          
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <a href={user ? "/tasks" : "/auth"} className="text-lg sm:text-2xl font-semibold brand-gradient">
              都市大課題管理
            </a>
          </div>
          
          <div className="flex items-center gap-3 ml-auto">
            {isLoading ? (
              <div className="h-6 w-24 bg-gray-700 animate-pulse rounded"></div>
            ) : !user ? (
              <a href="/auth" className="text-sm opacity-80 hover:underline">ログイン/登録</a>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  {user.avatar_url && (
                    <img src={user.avatar_url} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                  )}
                  <span>{user.name} さんようこそ</span>
                </div>
                <a href="/profile" className="text-sm opacity-80 hover:underline">プロフィール</a>
                <button className="text-sm opacity-80 hover:underline" onClick={logout}>ログアウト</button>
              </>
            )}
          </div>
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className={`absolute left-0 top-0 h-full w-[320px] shadow-xl p-4 overflow-y-auto ${
            theme === 'light' 
              ? 'bg-white text-gray-900' 
              : 'bg-gray-900 text-white'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">メニュー</div>
              <button onClick={() => setOpen(false)} className="text-sm opacity-70">閉じる</button>
            </div>

            <section className="mb-6">
              <h3 className="font-medium mb-2">キーワード検索</h3>
              <input className={`border rounded p-2 w-full mb-2 ${
                theme === 'light' 
                  ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500' 
                  : 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
              }`} placeholder="キーワード" value={q} onChange={(e)=>setQ(e.target.value)} />
              <div className="mb-2">
                <ModernDropdown
                  options={[
                    { value: "", label: "すべて" },
                    { value: "todo", label: "未着手" },
                    { value: "in_progress", label: "進行中" },
                    { value: "done", label: "完了" }
                  ]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder="ステータス"
                  className="w-full"
                />
              </div>
              <div className="mb-3">
                <ModernDropdown
                  options={[
                    { value: "created_desc", label: "作成日(新しい順)" },
                    { value: "created_asc", label: "作成日(古い順)" },
                    { value: "due_asc", label: "期限(早い順)" },
                    { value: "due_desc", label: "期限(遅い順)" },
                    { value: "priority_asc", label: "優先度(低→高)" },
                    { value: "priority_desc", label: "優先度(高→低)" }
                  ]}
                  value={sort}
                  onChange={setSort}
                  placeholder="並び順"
                  className="w-full"
                />
              </div>
              <button onClick={doSearch} className={`w-full rounded py-2 ${
                theme === 'light' 
                  ? 'bg-gray-900 text-white hover:bg-gray-800' 
                  : 'bg-white text-gray-900 hover:bg-gray-100'
              }`}>検索</button>
            </section>

            <section>
              <h3 className="font-medium mb-2">タスク追加</h3>
              <input className={`border rounded p-2 w-full mb-2 ${
                theme === 'light' 
                  ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500' 
                  : 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
              }`} placeholder="タイトル" value={title} onChange={(e)=>setTitle(e.target.value)} />
              <input className={`border rounded p-2 w-full mb-2 ${
                theme === 'light' 
                  ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500' 
                  : 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
              }`} placeholder="詳細" value={desc} onChange={(e)=>setDesc(e.target.value)} />
              <div className="mb-3">
                <ModernDropdown
                  options={[
                    { value: "1", label: "優先度 1" },
                    { value: "2", label: "優先度 2" },
                    { value: "3", label: "優先度 3" },
                    { value: "4", label: "優先度 4" },
                    { value: "5", label: "優先度 5" }
                  ]}
                  value={priority.toString()}
                  onChange={(value) => setPriority(Number(value))}
                  placeholder="優先度"
                  className="w-full"
                />
              </div>
              <button onClick={createTask} className={`w-full rounded py-2 ${
                theme === 'light' 
                  ? 'bg-gray-900 text-white hover:bg-gray-800' 
                  : 'bg-white text-gray-900 hover:bg-gray-100'
              }`}>追加</button>
            </section>
          </aside>
        </div>
      )}
    </>
  );
}


