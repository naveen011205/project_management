import { useState, useMemo } from 'react'
import { useStore } from '../store'
import { Modal, Field, Empty, Badge, PriorityBadge } from './ui'
import { PRIORITIES, PROJECT_STATUSES, progress, fmt, uid, iso } from '../utils/helpers'

function ProjectForm({ project, onClose }) {
  const { dispatch, toast } = useStore()
  const [p, setP] = useState(project || { id: uid(), name: '', description: '', priority: 'Medium', status: 'Planning', startDate: iso(), deadline: '', archived: false })
  const [err, setErr] = useState({})
  const set = (k) => (e) => setP({ ...p, [k]: e.target.value })
  const save = () => {
    const e = {}
    if (!p.name.trim()) e.name = 'Name is required'
    if (!p.deadline) e.deadline = 'Deadline is required'
    else if (p.startDate && p.deadline < p.startDate) e.deadline = 'Deadline must be on or after the start date'
    setErr(e)
    if (Object.keys(e).length) return
    dispatch({ type: 'saveProject', p: { ...p, name: p.name.trim() } }); toast(project ? 'Project updated' : 'Project created'); onClose()
  }
  return (
    <Modal title={project ? 'Edit project' : 'New project'} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Name" error={err.name}><input className="inp" value={p.name} onChange={set('name')} /></Field>
        <Field label="Description"><textarea className="inp" rows={3} value={p.description} onChange={set('description')} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Priority"><select className="inp" value={p.priority} onChange={set('priority')}>{PRIORITIES.map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Status"><select className="inp" value={p.status} onChange={set('status')}>{PROJECT_STATUSES.map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Start date"><input type="date" className="inp" value={p.startDate} onChange={set('startDate')} /></Field>
          <Field label="Deadline" error={err.deadline}><input type="date" className="inp" value={p.deadline} onChange={set('deadline')} /></Field>
        </div>
        <div className="flex justify-end gap-2 pt-2"><button className="btn-s" onClick={onClose}>Cancel</button><button className="btn-p" onClick={save}>Save project</button></div>
      </div>
    </Modal>
  )
}

export default function Projects({ onViewTasks }) {
  const { state: { projects, tasks }, dispatch, toast, confirm } = useStore()
  const [q, setQ] = useState(''), [status, setStatus] = useState(''), [sort, setSort] = useState('deadline'), [showArch, setShowArch] = useState(false), [page, setPage] = useState(1), [edit, setEdit] = useState(null)
  const SIZE = 5
  const rows = useMemo(() => projects.filter((p) => p.archived === showArch && (!status || p.status === status) && (p.name + p.description).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : sort === 'progress' ? progress(b.id, tasks) - progress(a.id, tasks) : a.deadline.localeCompare(b.deadline))), [projects, tasks, q, status, sort, showArch])
  const pages = Math.max(1, Math.ceil(rows.length / SIZE)), cur = Math.min(page, pages)
  return (
    <div>
      <div className="card mb-4 flex flex-wrap gap-2">
        <input className="inp min-w-48 flex-1" placeholder="Search projects…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
        <select className="inp !w-auto" aria-label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}><option value="">Any status</option>{PROJECT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        <select className="inp !w-auto" aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}><option value="deadline">Sort: deadline</option><option value="name">Sort: name</option><option value="progress">Sort: progress</option></select>
        <button className="btn-s" onClick={() => { setShowArch(!showArch); setPage(1) }}>{showArch ? 'Show active' : 'Show archived'}</button>
        <button className="btn-p" onClick={() => setEdit({})}>+ New project</button>
      </div>
      {rows.length === 0 ? <Empty title={showArch ? 'No archived projects' : 'No projects match'} hint="Adjust the filters or create a new project." action={<button className="btn-p" onClick={() => setEdit({})}>New project</button>} /> : (
        <div className="card overflow-x-auto !p-0">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-stone-200 text-stone-500"><tr>{['Project', 'Priority', 'Status', 'Deadline', 'Progress', ''].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>{rows.slice((cur - 1) * SIZE, cur * SIZE).map((p) => (
              <tr key={p.id} className="border-b border-stone-100 transition-colors last:border-0 hover:bg-teal-50/60">
                <td className="px-4 py-3"><button className="font-semibold hover:text-brand" onClick={() => onViewTasks(p.id)}>{p.name}</button><p className="text-xs text-stone-500">{p.description}</p></td>
                <td className="px-4"><PriorityBadge p={p.priority} /></td><td className="px-4"><Badge>{p.status}</Badge></td><td className="px-4">{fmt(p.deadline)}</td>
                <td className="px-4"><div className="flex items-center gap-2"><div className="h-2 w-24 rounded-full bg-stone-100"><div className="anim-grow h-2 rounded-full bg-brand transition-all duration-500" style={{ width: `${progress(p.id, tasks)}%` }} /></div>{progress(p.id, tasks)}%</div></td>
                <td className="space-x-2 whitespace-nowrap px-4 text-right">
                  <button className="font-semibold text-brand hover:underline" onClick={() => setEdit(p)}>Edit</button>
                  <button className="font-semibold" onClick={() => { dispatch({ type: 'saveProject', p: { ...p, archived: !p.archived } }); toast(p.archived ? 'Project restored' : 'Project archived') }}>{p.archived ? 'Restore' : 'Archive'}</button>
                  <button className="font-semibold text-red-600" onClick={() => confirm(`Delete “${p.name}” and all its tasks? This can't be undone.`, () => { dispatch({ type: 'delProject', id: p.id }); toast('Project deleted') }, 'Delete')}>Delete</button></td>
              </tr>))}</tbody>
          </table>
        </div>)}
      <div className="mt-3 flex items-center justify-end gap-2 text-sm"><button className="btn-s" disabled={cur <= 1} onClick={() => setPage(cur - 1)}>Prev</button>Page {cur} of {pages}<button className="btn-s" disabled={cur >= pages} onClick={() => setPage(cur + 1)}>Next</button></div>
      {edit && <ProjectForm project={edit.id ? edit : null} onClose={() => setEdit(null)} />}
    </div>
  )
}
