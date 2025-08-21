import { Task } from '@/types/task';
import { parseLocalDateTime, formatDateTimeJa } from '@/lib/date';

async function loadTask(id: string): Promise<Task | null> {
  const res = await fetch(`/api/tasks/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function TaskDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const task = await loadTask(id);
  if (!task) return <div className="p-8">タスクが見つかりません</div>;

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <a href="/tasks" className="text-sm opacity-70 hover:underline">← タスク一覧へ</a>
      <h1 className="text-2xl font-semibold mt-4 mb-2">{task.title}</h1>
      <div className="text-sm opacity-80 mb-4">{task.description}</div>
      <div className="grid gap-2 text-sm">
        <div>状態: {task.status}</div>
        <div>優先度: {task.priority}</div>
        <div>期限: {(() => { const d = parseLocalDateTime(task.due_date) ?? (task.due_date ? new Date(task.due_date) : null); return formatDateTimeJa(d); })()}</div>
        <div>作成日: {new Date(task.created_at).toLocaleString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
        <div>更新日: {new Date(task.updated_at).toLocaleString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    </div>
  );
}


