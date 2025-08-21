"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import ModernDropdown from '@/components/ModernDropdown';
import SimpleDateTimePicker from '@/components/SimpleDateTimePicker';
import { Task } from '@/types/task';
import { formatDateTimeJa } from '@/lib/date';
import { authFetch } from '@/lib/auth';
import { useAuth } from "@/contexts/AuthContext";

// Use Railway backend URL for Vercel deployment
const API_BASE = "https://3minutetasker.up.railway.app";

export default function TaskListClient() {
  const { loading: authLoading } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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
  }, [keyword, statusFilter, sort]);

  useEffect(() => {
    if (authLoading) {
      return; 
    }
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
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onDelete={deleteTask}
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
function TaskCard({ task, onDelete }: {
  task: Task;
  onDelete: (taskId: number) => void;
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
            期限: {formatDateTimeJa(new Date(task.due_date))}
          </div>
        )}

        <div className="text-xs text-gray-500">
          作成: {formatDateTimeJa(new Date(task.created_at))}
        </div>
      </div>
    </div>
  );
}

// Task Row Component
function TaskRow({ task, onDelete }: {
  task: Task;
  onDelete: (taskId: number) => void;
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
            disabled
            className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status as keyof typeof statusColors]}`}
          >
            <option value="todo">未完了</option>
            <option value="in_progress">進行中</option>
            <option value="done">完了</option>
          </select>

          <select
            value={task.priority}
            disabled
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
              期限: {formatDateTimeJa(new Date(task.due_date))}
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


