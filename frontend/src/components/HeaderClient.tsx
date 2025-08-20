"use client";

import { useState } from "react";
import ModernDropdown from './ModernDropdown';

const API_BASE = "http://localhost:8600";

export default function HeaderClient() {
  const [open, setOpen] = useState(false);

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
    const res = await fetch(`${API_BASE}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), description: desc || null, status: "todo", priority }),
    });
    if (res.ok) {
      setTitle("");
      setDesc("");
      setPriority(3);
      window.dispatchEvent(new Event("tasks:reload"));
    }
  }

  function doSearch() {
    const evt = new CustomEvent("tasks:search", { detail: { q, status: statusFilter, sort } });
    window.dispatchEvent(evt);
    setOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-20 bg-[#0b1b3b]/90 backdrop-blur border-b border-white/10 text-white">
        <nav className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <button className="font-semibold hover:opacity-80" onClick={() => setOpen(true)}>タスク</button>
          <a href="/tasks" className="text-lg sm:text-2xl font-semibold brand-gradient">Airionタスク管理システム</a>
          <div className="w-14" />
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[320px] bg-white text-black shadow-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">メニュー</div>
              <button onClick={() => setOpen(false)} className="text-sm opacity-70">閉じる</button>
            </div>

            <section className="mb-6">
              <h3 className="font-medium mb-2">キーワード検索</h3>
              <input className="border rounded p-2 w-full mb-2" placeholder="キーワード" value={q} onChange={(e)=>setQ(e.target.value)} />
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
              <button onClick={doSearch} className="w-full rounded bg-black text-white py-2">検索</button>
            </section>

            <section>
              <h3 className="font-medium mb-2">タスク追加</h3>
              <input className="border rounded p-2 w-full mb-2" placeholder="タイトル" value={title} onChange={(e)=>setTitle(e.target.value)} />
              <input className="border rounded p-2 w-full mb-2" placeholder="詳細" value={desc} onChange={(e)=>setDesc(e.target.value)} />
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
              <button onClick={createTask} className="w-full rounded bg-black text-white py-2">追加</button>
            </section>
          </aside>
        </div>
      )}
    </>
  );
}


