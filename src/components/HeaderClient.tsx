"use client";
import { useState } from "react";
import ModernDropdown from './ModernDropdown';
import { authFetch } from '@/lib/auth';
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

// 사용자 메뉴 드롭다운 컴포넌트
function UserMenuDropdown({ user, logout, theme }: { user: any; logout: () => void; theme: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-md hover:bg-black/10 transition-colors"
      >
        {user.avatar_url && (
          <img src={user.avatar_url} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
        )}
        <div className={`w-4 h-0.5 ${theme === 'light' ? 'bg-gray-900' : 'bg-white'} transition-colors relative`}>
          <div className={`absolute w-4 h-0.5 ${theme === 'light' ? 'bg-gray-900' : 'bg-white'} transform rotate-90`}></div>
        </div>
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className={`absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg border z-20 ${
            theme === 'light' 
              ? 'bg-white border-gray-200 text-gray-900' 
              : 'bg-gray-800 border-gray-600 text-white'
          }`}>
            <div className="p-3 border-b border-current/10">
              <div className="text-sm font-medium truncate">{user.name} さん</div>
              <div className="text-xs opacity-70 truncate">{user.mail}</div>
            </div>
            <div className="py-1">
              <a 
                href="/profile" 
                className="block px-3 py-2 text-sm hover:bg-black/5 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                プロフィール
              </a>
              <button 
                onClick={() => { logout(); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-black/5 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

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
    const res = await authFetch(`/api/tasks/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), description: desc || null, status: "todo", priority }),
    });
    if (res.ok) {
      setTitle("");
      setDesc("");
      setPriority(3);
      window.dispatchEvent(new Event("tasks:reload"));
      setOpen(false);
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
        <nav className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          {/* 왼쪽: 햄버거 메뉴 */}
          <button 
            onClick={() => setOpen(true)}
            className="flex flex-col gap-1 p-2 hover:opacity-80 transition-opacity"
            aria-label="メニューを開く"
          >
            <div className={`w-5 h-0.5 ${theme === 'light' ? 'bg-gray-900' : 'bg-white'} transition-colors`}></div>
            <div className={`w-5 h-0.5 ${theme === 'light' ? 'bg-gray-900' : 'bg-white'} transition-colors`}></div>
            <div className={`w-5 h-0.5 ${theme === 'light' ? 'bg-gray-900' : 'bg-white'} transition-colors`}></div>
          </button>
          
          {/* 중앙: 로고 */}
          <div className="flex-1 flex items-center justify-center px-2">
            {user ? (
              <a href="/tasks" className="text-base sm:text-lg md:text-xl font-semibold brand-gradient text-center">
                都市大課題管理
              </a>
            ) : (
              <span className="text-base sm:text-lg md:text-xl font-semibold brand-gradient text-center cursor-default">
                都市大課題管理
              </span>
            )}
          </div>
          
          {/* 우측: 사용자 정보 햄버거 메뉴 */}
          <div className="relative">
            {isLoading ? (
              <div className="h-8 w-8 bg-gray-700 animate-pulse rounded-full"></div>
            ) : !user ? (
              <a 
                href="/auth" 
                className="text-sm px-3 py-1 rounded-md border border-current opacity-80 hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  // 기존 세션 정리
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('session_id');
                    document.cookie = 'session_id=; path=/; max-age=0; samesite=lax';
                  }
                }}
              >
                ログイン
              </a>
            ) : (
              <UserMenuDropdown user={user} logout={logout} theme={theme} />
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
            <div className="flex items-center justify-between mb-6">
              <div className="text-xl font-semibold">メニュー</div>
              <button 
                onClick={() => setOpen(false)} 
                className="text-2xl opacity-70 hover:opacity-100 transition-opacity w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* 네비게이션 메뉴 */}
            <section className="mb-6">
              <h3 className="font-medium mb-3 text-sm uppercase tracking-wide opacity-60">ナビゲーション</h3>
              <div className="space-y-2">
                <a href="/tasks" className="block p-3 rounded-lg hover:bg-black/5 transition-colors" onClick={() => setOpen(false)}>
                  <div className="font-medium">タスク管理</div>
                  <div className="text-sm opacity-60">やることリストの管理</div>
                </a>
                <a href="/profile" className="block p-3 rounded-lg hover:bg-black/5 transition-colors" onClick={() => setOpen(false)}>
                  <div className="font-medium">プロフィール</div>
                  <div className="text-sm opacity-60">アカウント情報の管理</div>
                </a>
                {!user && (
                  <a href="/auth" className="block p-3 rounded-lg hover:bg-black/5 transition-colors" onClick={() => setOpen(false)}>
                    <div className="font-medium">ログイン</div>
                    <div className="text-sm opacity-60">アカウントにログイン</div>
                  </a>
                )}
              </div>
            </section>

            {user && (
              <>
                {/* 검색 섹션 */}
                <section className="mb-6">
                  <h3 className="font-medium mb-3 text-sm uppercase tracking-wide opacity-60">検索</h3>
                  <input className={`border rounded-lg p-3 w-full mb-3 ${
                    theme === 'light' 
                      ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500' 
                      : 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  }`} placeholder="キーワード検索" value={q} onChange={(e)=>setQ(e.target.value)} />
                  <div className="mb-3">
                    <ModernDropdown
                      options={[
                        { value: "", label: "すべてのステータス" },
                        { value: "todo", label: "未着手" },
                        { value: "in_progress", label: "進行中" },
                        { value: "done", label: "完了" }
                      ]}
                      value={statusFilter}
                      onChange={setStatusFilter}
                      placeholder="ステータスフィルター"
                      className="w-full"
                    />
                  </div>
                  <div className="mb-4">
                    <ModernDropdown
                      options={[
                        { value: "created_desc", label: "作成日（新しい順）" },
                        { value: "created_asc", label: "作成日（古い順）" },
                        { value: "due_asc", label: "締切日（早い順）" },
                        { value: "due_desc", label: "締切日（遅い順）" },
                        { value: "priority_desc", label: "優先度（高い順）" },
                        { value: "priority_asc", label: "優先度（低い順）" }
                      ]}
                      value={sort}
                      onChange={setSort}
                      placeholder="並び替え"
                      className="w-full"
                    />
                  </div>
                  <button 
                    onClick={doSearch}
                    className={`w-full p-3 rounded-lg font-medium transition-colors ${
                      theme === 'light'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    検索
                  </button>
                </section>

                {/* 태스크 추가 섹션 */}
                <section>
                  <h3 className="font-medium mb-3 text-sm uppercase tracking-wide opacity-60">タスク追加</h3>
                  <input className={`border rounded-lg p-3 w-full mb-3 ${
                    theme === 'light' 
                      ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500' 
                      : 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  }`} placeholder="タイトル" value={title} onChange={(e)=>setTitle(e.target.value)} />
                  <input className={`border rounded-lg p-3 w-full mb-3 ${
                    theme === 'light' 
                      ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500' 
                      : 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  }`} placeholder="説明" value={desc} onChange={(e)=>setDesc(e.target.value)} />
                  <div className="mb-4">
                    <ModernDropdown
                      options={[
                        { value: "1", label: "優先度 1 （非常に高い）" },
                        { value: "2", label: "優先度 2 （高い）" },
                        { value: "3", label: "優先度 3 （普通）" },
                        { value: "4", label: "優先度 4 （低い）" },
                        { value: "5", label: "優先度 5 （非常に低い）" }
                      ]}
                      value={priority.toString()}
                      onChange={(value) => setPriority(Number(value))}
                      placeholder="優先度"
                      className="w-full"
                    />
                  </div>
                  <button 
                    onClick={createTask}
                    className={`w-full p-3 rounded-lg font-medium transition-colors ${
                      theme === 'light'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    追加
                  </button>
                </section>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
