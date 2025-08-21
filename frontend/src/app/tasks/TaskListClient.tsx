"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import ModernDropdown from '@/components/ModernDropdown';
import SimpleDateTimePicker from '@/components/SimpleDateTimePicker';
import { Task } from '@/types/task';
import { parseLocalDateTime, formatDateTimeJa } from '@/lib/date';
import { authFetch } from '@/lib/auth';
import { useAuth } from "@/contexts/AuthContext";

// Use environment variable for API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export default function TaskListClient() {
  const { user, loading: authLoading } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [counts, setCounts] = useState<{todo:number; inProgress:number; done:number}>({todo:0, inProgress:0, done:0});
  const [loading, setLoading] = useState<boolean>(true); // Start with loading true
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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set("q", keyword);
      if (statusFilter) params.set("status_in", statusFilter);
      if (sort) params.set("sort", sort);
      
      const url = `${API_BASE}/tasks/?${params.toString()}`;
      const res = await authFetch(url, { cache: "no-store" });

      if (!res.ok) {
        // A 401 here means the token became invalid. The context should handle the redirect.
        if (res.status === 401) {
          setError("認証が切れました。再度ログインしてください。");
          return;
        }
        throw new Error(`タスクの読み込みに失敗しました: ${res.status}`);
      }
      const data = (await res.json()) as Task[];
      setTasks(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "不明なエラーが発生しました。";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [keyword, statusFilter, sort]); // Removed user from dependencies

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
    // Wait until the authentication check is complete.
    if (authLoading) {
      return; 
    }
    // Load tasks regardless of authentication status (anonymous users get their own tasks)
    load();
  }, [authLoading, load]);

  const createTask = async () => {
    if (!newTitle.trim()) return;
    try {
      const res = await authFetch(`${API_BASE}/tasks/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          priority: newPriority,
          due_date: newDueDate || null,
        }),
      });

      if (!res.ok) {
        throw new Error(`タスクの作成に失敗しました: ${res.status}`);
      }

      const newTask = await res.json();
      setTasks(prev => [newTask, ...prev]);
      setNewTitle("");
      setNewDescription("");
      setNewPriority(3);
      setNewDueDate("");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "不明なエラーが発生しました。";
      setError(errorMessage);
    }
  };

  const updateTask = async (task: Task, updates: Partial<Task>) => {
    try {
      const res = await authFetch(`${API_BASE}/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        throw new Error(`タスクの更新に失敗しました: ${res.status}`);
      }

      const updatedTask = await res.json();
      setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "不明なエラーが発生しました。";
      setError(errorMessage);
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      const res = await authFetch(`${API_BASE}/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error(`タスクの削除に失敗しました: ${res.status}`);
      }
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "不明なエラーが 발생しました。";
      setError(errorMessage);
    }
  };

  const handleStatusChange = (task: Task, newStatus: string) => {
    updateTask(task, { status: newStatus as Task['status'] });
  };

  const handlePriorityChange = (task: Task, newPriority: number) => {
    updateTask(task, { priority: newPriority });
  };

  const handleDueDateChange = (task: Task, newDueDate: string) => {
    updateTask(task, { due_date: newDueDate || null });
  };

  const handleSwipeDelete = (taskId: number) => {
    deleteTask(taskId);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">タスク管理</h1>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{counts.todo}</div>
              <div className="text-sm text-gray-600">未完了</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{counts.inProgress}</div>
              <div className="text-sm text-gray-600">進行中</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{counts.done}</div>
              <div className="text-sm text-gray-600">完了</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-wrap gap-4 mb-6">
            <input
              type="text"
              placeholder="タスクを検索..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <ModernDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "", label: "すべてのステータス" },
                { value: "todo", label: "未完了" },
                { value: "in_progress", label: "進行中" },
                { value: "done", label: "完了" }
              ]}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <ModernDropdown
              value={sort}
              onChange={setSort}
              options={[
                { value: "created_desc", label: "作成日順（新しい）" },
                { value: "created_asc", label: "作成日順（古い）" },
                { value: "due_desc", label: "期限順（近い）" },
                { value: "due_asc", label: "期限順（遠い）" },
                { value: "priority_desc", label: "優先度順（高い）" },
                { value: "priority_asc", label: "優先度順（低い）" }
              ]}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setIsGridView(!isGridView)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {isGridView ? "リスト表示" : "グリッド表示"}
            </button>
          </div>

          {/* Create Task Form */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4">新しいタスク</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="タスクのタイトル"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="説明（オプション）"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>優先度: 低</option>
                <option value={2}>優先度: 中</option>
                <option value={3}>優先度: 高</option>
                <option value={4}>優先度: 緊急</option>
                <option value={5}>優先度: 最優先</option>
              </select>
              <SimpleDateTimePicker
                value={newDueDate}
                onChange={setNewDueDate}
                placeholder="期限（オプション）"
              />
            </div>
            <button
              onClick={createTask}
              disabled={!hasForm}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              タスクを作成
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Tasks Display */}
        {!loading && (
          <div className="space-y-4">
            {isGridView ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onPriorityChange={handlePriorityChange}
                    onDueDateChange={handleDueDateChange}
                    onDelete={deleteTask}
                    onSwipeDelete={handleSwipeDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onPriorityChange={handlePriorityChange}
                    onDueDateChange={handleDueDateChange}
                    onDelete={deleteTask}
                    onSwipeDelete={handleSwipeDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Task Card Component
function TaskCard({ task, onStatusChange, onPriorityChange, onDueDateChange, onDelete, onSwipeDelete }: {
  task: Task;
  onStatusChange: (task: Task, status: string) => void;
  onPriorityChange: (task: Task, priority: number) => void;
  onDueDateChange: (task: Task, dueDate: string) => void;
  onDelete: (taskId: number) => void;
  onSwipeDelete: (taskId: number) => void;
}) {
  const priorityColors = {
    1: "bg-gray-100 text-gray-800",
    2: "bg-blue-100 text-blue-800",
    3: "bg-yellow-100 text-yellow-800",
    4: "bg-orange-100 text-orange-800",
    5: "bg-red-100 text-red-800"
  };

  const statusColors = {
    todo: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    done: "bg-green-100 text-green-800"
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2">{task.title}</h3>
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          ×
        </button>
      </div>
      
      {task.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
            優先度 {task.priority}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status as keyof typeof statusColors]}`}>
            {task.status === 'todo' ? '未完了' : task.status === 'in_progress' ? '進行中' : '完了'}
          </span>
        </div>

        {task.due_date && (
          <div className="text-sm text-gray-600">
            期限: {formatDateTimeJa(task.due_date)}
          </div>
        )}

        <div className="text-xs text-gray-500">
          作成: {formatDateTimeJa(task.created_at)}
        </div>
      </div>
    </div>
  );
}

// Task Row Component
function TaskRow({ task, onStatusChange, onPriorityChange, onDueDateChange, onDelete, onSwipeDelete }: {
  task: Task;
  onStatusChange: (task: Task, status: string) => void;
  onPriorityChange: (task: Task, priority: number) => void;
  onDueDateChange: (task: Task, dueDate: string) => void;
  onDelete: (taskId: number) => void;
  onSwipeDelete: (taskId: number) => void;
}) {
  const priorityColors = {
    1: "bg-gray-100 text-gray-800",
    2: "bg-blue-100 text-blue-800",
    3: "bg-yellow-100 text-yellow-800",
    4: "bg-orange-100 text-orange-800",
    5: "bg-red-100 text-red-800"
  };

  const statusColors = {
    todo: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    done: "bg-green-100 text-green-800"
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{task.title}</h3>
          {task.description && (
            <p className="text-gray-600 text-sm mt-1">{task.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task, e.target.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status as keyof typeof statusColors]}`}
          >
            <option value="todo">未完了</option>
            <option value="in_progress">進行中</option>
            <option value="done">完了</option>
          </select>

          <select
            value={task.priority}
            onChange={(e) => onPriorityChange(task, Number(e.target.value))}
            className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}
          >
            <option value={1}>低</option>
            <option value={2}>中</option>
            <option value={3}>高</option>
            <option value={4}>緊急</option>
            <option value={5}>最優先</option>
          </select>

          {task.due_date && (
            <div className="text-sm text-gray-600">
              期限: {formatDateTimeJa(task.due_date)}
            </div>
          )}

          <button
            onClick={() => onDelete(task.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}


