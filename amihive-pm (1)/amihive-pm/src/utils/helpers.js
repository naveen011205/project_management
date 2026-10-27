export const STATUSES = ['To Do', 'In Progress', 'In Review', 'Completed']
export const PRIORITIES = ['Low', 'Medium', 'High']
export const PROJECT_STATUSES = ['Planning', 'Active', 'On Hold', 'Completed']
export const uid = () => Math.random().toString(36).slice(2, 10)
export const iso = (d = new Date()) => d.toISOString().slice(0, 10)
export const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d) }
export const fmt = (d) => (d ? new Date(d + 'T00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '—')
export const stamp = (t) => new Date(t).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
export const isOverdue = (t) => t.status !== 'Completed' && t.dueDate && t.dueDate < iso()
export const isBlocked = (t, all) => t.status !== 'Completed' && (t.dependsOn || []).some((id) => all.find((x) => x.id === id && x.status !== 'Completed'))
export const progress = (pid, tasks) => { const ts = tasks.filter((t) => t.projectId === pid); return ts.length ? Math.round((ts.filter((t) => t.status === 'Completed').length / ts.length) * 100) : 0 }
export const PCOLOR = { Low: 'bg-stone-100 text-stone-600', Medium: 'bg-sky-100 text-sky-700', High: 'bg-rose-100 text-rose-700' }
const RANK = { Low: 1, Medium: 2, High: 3 }
export function filterTasks(tasks, projects, f) {
  const q = f.q.trim().toLowerCase(), end = addDays(7)
  const pname = (id) => projects.find((p) => p.id === id)?.name || ''
  const out = tasks.filter((t) =>
    (!q || [t.title, t.description, (t.labels || []).join(' '), pname(t.projectId)].join(' ').toLowerCase().includes(q)) &&
    (!f.project || t.projectId === f.project) && (!f.priority || t.priority === f.priority) &&
    (!f.assignee || t.assignee === f.assignee) && (!f.status || t.status === f.status) &&
    (f.due === 'all' || (f.due === 'overdue' ? isOverdue(t) : t.dueDate && t.dueDate >= iso() && t.dueDate <= end)))
  const cmp = { due: (a, b) => (a.dueDate || '9').localeCompare(b.dueDate || '9'), priority: (a, b) => RANK[b.priority] - RANK[a.priority], title: (a, b) => a.title.localeCompare(b.title), newest: (a, b) => b.createdAt - a.createdAt }
  return out.sort(cmp[f.sort])
}
export const EMPTY_FILTERS = { q: '', project: '', priority: '', assignee: '', status: '', due: 'all', sort: 'due' }
