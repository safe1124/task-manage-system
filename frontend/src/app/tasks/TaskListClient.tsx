"use client";

import { useEffect, useMemo, useState } from "react";
import ModernDropdown from '@/components/ModernDropdown';
import SimpleDateTimePicker from '@/components/SimpleDateTimePicker';
import { Task } from '@/types/task';
import { parseLocalDateTime, formatDateTimeJa } from '@/lib/date';

// Use Next.js rewrite proxy
const API_BASE = "/api";

export default function TaskListClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [counts, setCounts] = useState<{todo:number; inProgress:number; done:number}>({todo:0, inProgress:0, done:0});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // search/filter/sort
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sort, setSort] = useState<string>("created_desc");

  // create form
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<number>(3);
  const [newDueDate, setNewDueDate] = useState("");
  const [isGridView, setIsGridView] = useState(false);

  const hasForm = useMemo(() => newTitle.trim().length > 0, [newTitle]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set("q", keyword);
      if (statusFilter) params.set("status_in", statusFilter);
      if (sort) params.set("sort", sort);
      const sep = params.toString();
      const url = `${API_BASE}/tasks/${sep ? `?${sep}` : ''}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
      const data = (await res.json()) as Task[];
      setTasks(data);
      const todo = data.filter((t)=>t.status==='todo').length;
      const inProgress = data.filter((t)=>t.status==='in_progress').length;
      const done = data.filter((t)=>t.status==='done').length;
      setCounts({todo, inProgress, done});
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  // urgent tasks (due within 24h and not done)
  const urgentTasks = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    return tasks.filter(t => {
      if (!t.due_date || t.status === 'done') return false;
      const dueDate = parseLocalDateTime(t.due_date) ?? new Date(t.due_date);
      return dueDate <= tomorrow;
    });
  }, [tasks]);

  // time until due helper
  const getTimeUntilDue = (dueDate: string | null) => {
    if (!dueDate) return null;
    const now = new Date();
    const parsed = parseLocalDateTime(dueDate);
    const due = parsed ?? new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 0) return { text: "期限切れ", urgent: true, overdue: true } as const;
    if (diffHours < 24) return { text: `${diffHours}時間後`, urgent: true, overdue: false } as const;
    const diffDays = Math.floor(diffHours / 24);
    return { text: `${diffDays}日後`, urgent: false, overdue: false } as const;
  };

  useEffect(() => {
    load();
    // listen header events
    const onReload = () => load();
    const onSearch = (e: any) => {
      const d = e.detail || {};
      setKeyword(d.q ?? keyword);
      setStatusFilter(d.status ?? statusFilter);
      setSort(d.sort ?? sort);
      setTimeout(load, 0);
    };
    window.addEventListener('tasks:reload', onReload);
    window.addEventListener('tasks:search', onSearch as any);
    return () => {
      window.removeEventListener('tasks:reload', onReload);
      window.removeEventListener('tasks:search', onSearch as any);
    };
  }, []);

  async function createTask() {
    if (!hasForm) return;
    try {
      const payload: any = {
        title: newTitle.trim(),
        description: newDescription.trim() || null,
        status: "todo",
        priority: Number(newPriority) || 3,
        // keep local datetime to avoid tz shift
        due_date: newDueDate || null,
      };
      const res = await fetch(`${API_BASE}/tasks/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Failed to create: ${res.status}`);
      setNewTitle("");
      setNewDescription("");
      setNewPriority(3);
      setNewDueDate("");
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Create failed");
    }
  }

  async function updateStatus(task: Task, next: Task["status"]) {
    try {
      const res = await fetch(`${API_BASE}/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error(`Failed to update: ${res.status}`);
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Update failed");
    }
  }

  async function deleteTaskById(taskId: number, title?: string) {
    if (!confirm(`Delete task "${title ?? ''}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, { method: "DELETE" });
      if (res.status !== 204) throw new Error(`Failed to delete: ${res.status}`);
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Delete failed");
    }
  }

  // swipe helper
  function useSwipe(onDelete: () => void) {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let currentElement: HTMLElement | null = null;
    const threshold = 100;
    const reveal = 30;

    function resetElement() {
      if (!currentElement) return;
      const track = currentElement.querySelector('.swipe-track') as HTMLElement;
      const bg = currentElement.querySelector('.swipe-delete-bg') as HTMLElement;
      const icon = currentElement.querySelector('.swipe-delete-icon') as HTMLElement;
      if (track) {
        track.style.transition = 'transform 0.3s ease';
        track.style.transform = 'translateX(0px)';
        track.style.cursor = 'grab';
      }
      if (bg) bg.style.opacity = '0';
      if (icon) icon.style.opacity = '0';
    }

    function handleStart(clientX: number, element: HTMLElement) {
      isDragging = true;
      startX = clientX;
      currentX = clientX;
      currentElement = element;
      const track = element.querySelector('.swipe-track') as HTMLElement;
      if (track) {
        track.style.transition = 'none';
        track.style.cursor = 'grabbing';
      }
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove);
      document.addEventListener('touchend', handleGlobalTouchEnd);
    }

    function handleMove(clientX: number) {
      if (!isDragging || !currentElement) return;
      currentX = clientX;
      const deltaX = Math.min(0, currentX - startX);
      const track = currentElement.querySelector('.swipe-track') as HTMLElement;
      const bg = currentElement.querySelector('.swipe-delete-bg') as HTMLElement;
      const icon = currentElement.querySelector('.swipe-delete-icon') as HTMLElement;
      if (track && bg && icon) {
        track.style.transform = `translateX(${deltaX}px)`;
        const showDelete = Math.abs(deltaX) > reveal;
        bg.style.opacity = showDelete ? '1' : '0';
        icon.style.opacity = showDelete ? '1' : '0';
      }
    }

    function handleEnd() {
      if (!isDragging || !currentElement) return;
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      const deltaX = Math.min(0, currentX - startX);
      if (Math.abs(deltaX) > threshold) onDelete(); else resetElement();
      isDragging = false;
      currentElement = null;
    }

    function handleGlobalMouseMove(e: MouseEvent) { e.preventDefault(); handleMove(e.clientX); }
    function handleGlobalMouseUp(e: MouseEvent) { e.preventDefault(); handleEnd(); }
    function handleGlobalTouchMove(e: TouchEvent) { e.preventDefault(); if (e.touches.length === 1) handleMove(e.touches[0].clientX); }
    function handleGlobalTouchEnd(e: TouchEvent) { e.preventDefault(); handleEnd(); }

    function onMouseDown(e: React.MouseEvent<HTMLDivElement>) { e.preventDefault(); handleStart(e.clientX, e.currentTarget); }
    function onTouchStart(e: React.TouchEvent<HTMLDivElement>) { e.preventDefault(); if (e.touches.length === 1) handleStart(e.touches[0].clientX, e.currentTarget); }

    return { onMouseDown, onTouchStart };
  }

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-2xl font-semibold mb-6 text-center">Airionタスク管理システム</h1>

      {/* Urgent tasks */}
      {urgentTasks.length > 0 && (
        <section className="mb-6 rounded border border-red-500/30 p-4 bg-red-500/10">
          <h2 className="text-lg font-semibold mb-4 text-red-200 flex items-center gap-2">🚨 緊急タスク (24時間以内に完了しましょう)</h2>
          <div className={isGridView ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" : "grid gap-3"}>
            {urgentTasks.map((t) => {
              const timeInfo = getTimeUntilDue(t.due_date);
              return (
                <div key={`urgent-${t.id}`} className="glass p-3 border border-red-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <a href={`/tasks/${t.id}`} className="font-medium text-black hover:underline flex-1">{t.title}</a>
                    <div className="flex items-center gap-2">
                      {timeInfo && (
                        <span className={`text-xs px-2 py-1 rounded ${timeInfo.overdue ? 'bg-red-600 text-white' : 'bg-red-500/30 text-red-200'}`}>{timeInfo.text}</span>
                      )}
                      <button className="text-xs px-2 py-1 bg-red-500/20 text-red-200 hover:bg-red-500/30 rounded" onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteTaskById(t.id, t.title); }} title="緊急タスクを削除">🗑️</button>
                    </div>
                  </div>
                  <p className="text-sm text-black opacity-80">{t.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Controls */}
      <section className="mb-4 rounded border border-white/15 p-4 bg-white/5">
        <div className="flex items-center gap-4 mb-3 text-sm flex-wrap">
          <div className="rounded-full px-3 py-1 bg-gray-500/20 text-gray-200">未着手: {counts.todo}</div>
          <div className="rounded-full px-3 py-1 bg-blue-500/20 text-blue-200">進行中: {counts.inProgress}</div>
          <div className="rounded-full px-3 py-1 bg-emerald-500/20 text-emerald-200">完了: {counts.done}</div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input className="border rounded p-2 bg-transparent" placeholder="キーワード検索" value={keyword} onChange={(e)=>setKeyword(e.target.value)} />
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
            />
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
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button className={`rounded p-2 transition-colors ${isGridView ? 'bg-blue-500/30 text-blue-200' : 'bg-white/10 text-white'}`} onClick={() => setIsGridView(!isGridView)} title={isGridView ? 'リスト表示に切り替え' : 'グリッド表示に切り替え'}>
              {isGridView ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              )}
            </button>
            <button className="rounded bg-foreground text-background px-3 py-2" onClick={load}>検索</button>
          </div>
        </div>
      </section>

      {/* Create form */}
      <section className="mb-8 rounded border border-white/15 p-4 bg-white/5">
        <h2 className="font-medium mb-3">タスクを追加</h2>
        <div className="grid sm:grid-cols-6 gap-3 items-stretch">
          <input className="border rounded-lg h-12 px-3 bg-transparent sm:col-span-1 min-w-0" placeholder="タイトル" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <input className="border rounded-lg h-12 px-3 bg-transparent sm:col-span-1 min-w-0" placeholder="詳細" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
          <div className="sm:col-span-2 min-w-0">
            <SimpleDateTimePicker value={newDueDate} onChange={setNewDueDate} placeholder="期限(選択)" />
          </div>
          <div className="sm:col-span-1 min-w-0">
            <ModernDropdown
              options={[
                { value: "1", label: "優先度 1" },
                { value: "2", label: "優先度 2" },
                { value: "3", label: "優先度 3" },
                { value: "4", label: "優先度 4" },
                { value: "5", label: "優先度 5" }
              ]}
              value={newPriority.toString()}
              onChange={(value) => setNewPriority(Number(value))}
              placeholder="優先度"
              buttonClassName="h-12"
            />
          </div>
          <button className="rounded-lg h-12 bg-foreground text-background px-3 disabled:opacity-50 sm:col-span-1" onClick={createTask} disabled={!hasForm}>追加</button>
        </div>
      </section>

      {loading && <div className="opacity-70">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {/* Tasks */}
      <div className={isGridView ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "grid gap-4"}>
        {tasks.map((t) => {
          const swipe = useSwipe(() => deleteTaskById(t.id, t.title));
          return (
            <div key={t.id} className={`swipe-wrapper ${isGridView ? 'grid-view-card' : ''}`} onMouseDown={swipe.onMouseDown} onTouchStart={swipe.onTouchStart}>
              <div className="swipe-delete-bg">
                <span className="text-white text-lg swipe-delete-icon">🗑️ 削除</span>
              </div>
              <div className={`swipe-track glass text-black task-box-${t.status}`}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <a href={`/tasks/${t.id}`} className="font-medium hover:underline">{t.title}</a>
                    <div className="flex items-center gap-2">
                      {t.due_date && (() => {
                        const timeInfo = getTimeUntilDue(t.due_date);
                        return timeInfo && (
                          <span className={`text-xs px-2 py-0.5 rounded ${timeInfo.overdue ? 'bg-red-600 text-white' : timeInfo.urgent ? 'bg-red-500/30 text-red-200' : 'bg-gray-500/20 text-gray-300'}`}>{timeInfo.text}</span>
                        );
                      })()}
                      <span className={`text-xs px-2 py-0.5 rounded badge ${t.status}`}>{t.status === "todo" ? "未着手" : t.status === "in_progress" ? "進行中" : "完了"}</span>
                    </div>
                  </div>
                  <p className="text-sm mb-3">{t.description}</p>
                  <div className="flex items-center gap-2 text-xs opacity-80 mb-3 flex-wrap">
                    <div>優先度: {t.priority}</div>
                    <div>作成日: {new Date(t.created_at).toLocaleString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    {t.due_date && (() => { const d = parseLocalDateTime(t.due_date) ?? new Date(t.due_date); return (<div>期限: {formatDateTimeJa(d)}</div>); })()}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {t.status === "todo" && (
                      <button className="rounded border px-2 py-1 text-xs bg-blue-500/20 text-black hover:bg-blue-500/30" onClick={(e) => { e.stopPropagation(); e.preventDefault(); updateStatus(t, "in_progress"); }}>▶ 開始</button>
                    )}
                    {t.status === "in_progress" && (
                      <>
                        <button className="rounded border px-2 py-1 text-xs bg-emerald-500/20 text-black hover:bg-emerald-500/30" onClick={(e) => { e.stopPropagation(); e.preventDefault(); updateStatus(t, "done"); }}>✓ 完了</button>
                        <button className="rounded border px-2 py-1 text-xs bg-gray-500/20 text-black hover:bg-gray-500/30" onClick={(e) => { e.stopPropagation(); e.preventDefault(); updateStatus(t, "todo"); }}>↩ 戻す</button>
                      </>
                    )}
                    {t.status === "done" && (
                      <button className="rounded border px-2 py-1 text-xs bg-gray-500/20 text-black hover:bg-gray-500/30" onClick={(e) => { e.stopPropagation(); e.preventDefault(); updateStatus(t, "todo"); }}>↩ 未完了に戻す</button>
                    )}
                    <button className="rounded border px-2 py-1 text-xs bg-red-500/20 text-black hover:bg-red-500/30" onClick={(e) => { e.stopPropagation(); e.preventDefault(); deleteTaskById(t.id, t.title); }}>🗑️ 削除</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


