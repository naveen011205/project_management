import { useState } from 'react'
import { useStore } from '../store'
import FilterBar from './FilterBar'
import { Empty, Badge, PriorityBadge, Spinner } from './ui'
import { STATUSES, PRIORITIES, filterTasks, isOverdue, isBlocked, fmt, uid, iso, addDays } from '../utils/helpers'
import { fetchMockTasks } from '../utils/api'

export default function Tasks({ flt, onOpen, onNew }) {
  const { state: { projects, tasks }, dispatch, toast, confirm } = useStore()
  const [sel, setSel] = useState([])
  const [loading, setLoading] = useState(false)
  const rows = filterTasks(tasks, projects, flt.f)
  const pname = (id) => projects.find((p) => p.id === id)?.name
  const allSel = rows.length > 0 && rows.every((r) => sel.includes(r.id))
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const bulk = (patch) => {
    const blocked = patch.status && patch.status !== 'To Do' && patch.status !== 'In Review' && tasks.filter((t) => sel.includes(t.id)).some((t) => isBlocked(t, tasks))
    if (blocked) return toast('Some selected tasks are blocked by dependencies', 'error')
    dispatch({ type: 'patchTasks', ids: sel, patch }); toast(`${sel.length} task(s) updated`); setSel([])
  }
  const importApi = async () => {
    setLoading(true)
    try {
      const items = await fetchMockTasks(5)
      const now = Date.now(), pid = flt.f.project || projects[0]?.id
      if (!pid) throw new Error('Create a project first')
      dispatch({ type: 'importTasks', tasks: items.map((i, n) => ({ id: uid(), projectId: pid, title: i.title, description: 'Imported from mock API', status: i.done ? 'Completed' : 'To Do', priority: 'Medium', assignee: i.assignee, labels: ['imported'], startDate: iso(), dueDate: addDays(n + 3), hours: 2, dependsOn: [], comments: [], activity: [{ t: now, msg: 'Imported from mock API' }], createdAt: now })) })
      toast(`Imported ${items.length} tasks`)
    } catch (e) { toast(e.message?.includes('Network') ? 'Could not reach the mock API. Check your connection.' : e.message || 'Import failed', 'error') }
    setLoading(false)
  }
  return (
    <div>
      <div className="mb-3 flex flex-wrap justify-end gap-2"><button className="btn-s" onClick={importApi} disabled={loading}>{loading ? <Spinner /> : null} Import from API</button><button className="btn-p" onClick={onNew}>+ New task</button></div>
      <FilterBar flt={flt} />
      {sel.length > 0 && (
        <div className="card mb-3 flex flex-wrap items-center gap-2 bg-teal-50 text-sm"><b>{sel.length} selected</b>
          <select className="inp !w-auto" value="" onChange={(e) => e.target.value && bulk({ status: e.target.value })}><option value="">Set status…</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          <select className="inp !w-auto" value="" onChange={(e) => e.target.value && bulk({ priority: e.target.value })}><option value="">Set priority…</option>{PRIORITIES.map((s) => <option key={s}>{s}</option>)}</select>
          <button className="btn-d" onClick={() => confirm(`Delete ${sel.length} task(s)?`, () => { dispatch({ type: 'delTasks', ids: sel }); toast('Tasks deleted'); setSel([]) }, 'Delete')}>Delete</button>
          <button className="btn-s" onClick={() => setSel([])}>Clear</button></div>)}
      {rows.length === 0 ? <Empty title="No tasks found" hint="Try clearing filters or create a task." action={flt.active.length ? <button className="btn-s" onClick={flt.clear}>Clear all filters</button> : <button className="btn-p" onClick={onNew}>New task</button>} /> : (
        <div className="card overflow-x-auto !p-0"><table className="w-full min-w-[780px] text-left text-sm">
          <thead className="border-b border-stone-200 text-stone-500"><tr><th className="px-4 py-3"><input type="checkbox" aria-label="Select all" checked={allSel} onChange={() => setSel(allSel ? [] : rows.map((r) => r.id))} /></th>{['Task', 'Project', 'Status', 'Priority', 'Assignee', 'Due'].map((h) => <th key={h} className="px-3 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>{rows.map((t) => (
            <tr key={t.id} className="border-b border-stone-100 last:border-0 transition-colors hover:bg-teal-50/60">
              <td className="px-4"><input type="checkbox" aria-label={`Select ${t.title}`} checked={sel.includes(t.id)} onChange={() => toggle(t.id)} /></td>
              <td className="px-3 py-3"><button className="text-left font-semibold hover:text-brand" onClick={() => onOpen(t)}>{t.title}</button>
                <div className="mt-1 flex flex-wrap gap-1">{isBlocked(t, tasks) && <Badge cls="bg-amber-100 text-amber-800">Blocked</Badge>}{isOverdue(t) && <Badge cls="bg-red-100 text-red-700">Overdue</Badge>}{t.labels.map((l) => <Badge key={l}>{l}</Badge>)}</div></td>
              <td className="px-3">{pname(t.projectId)}</td><td className="px-3">{t.status}</td><td className="px-3"><PriorityBadge p={t.priority} /></td><td className="px-3">{t.assignee || '—'}</td><td className="px-3">{fmt(t.dueDate)}</td>
            </tr>))}</tbody></table></div>)}
    </div>
  )
}
