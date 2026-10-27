import { useState } from 'react'
import { useStore } from '../store'
import { Modal, Field, Badge } from './ui'
import { STATUSES, PRIORITIES, uid, iso, stamp, isBlocked } from '../utils/helpers'

export default function TaskDrawer({ task, defaultProject, onClose }) {
  const { state: { projects, tasks }, dispatch, toast, confirm } = useStore()
  const isNew = !task
  const blank = { id: uid(), projectId: defaultProject || projects[0]?.id || '', title: '', description: '', status: 'To Do', priority: 'Medium', assignee: '', labels: [], startDate: iso(), dueDate: '', hours: 0, dependsOn: [], comments: [], activity: [] }
  const [orig] = useState(() => task || blank)
  const [t, setT] = useState(orig)
  const [labels, setLabels] = useState((orig.labels || []).join(', '))
  const [err, setErr] = useState({})
  const [comment, setComment] = useState('')
  const live = tasks.find((x) => x.id === t.id) || t
  const dirty = JSON.stringify({ ...t, labels: labels }) !== JSON.stringify({ ...orig, labels: (orig.labels || []).join(', ') })
  const set = (k) => (e) => setT({ ...t, [k]: e.target.value })
  const close = () => (dirty ? confirm('You have unsaved changes. Discard them?', onClose, 'Discard') : onClose())
  const candidates = tasks.filter((x) => x.projectId === t.projectId && x.id !== t.id && !x.dependsOn.includes(t.id))
  const save = () => {
    const e = {}
    if (!t.title.trim()) e.title = 'Title is required'
    if (!t.projectId) e.projectId = 'Choose a project'
    if (!t.dueDate) e.dueDate = 'Due date is required'
    else if (t.startDate && t.dueDate < t.startDate) e.dueDate = 'Due date must be on or after the start date'
    if (Number(t.hours) < 0 || Number.isNaN(Number(t.hours))) e.hours = 'Hours must be 0 or more'
    setErr(e)
    if (Object.keys(e).length) return
    const next = { ...t, title: t.title.trim(), hours: Number(t.hours), labels: labels.split(',').map((l) => l.trim()).filter(Boolean) }
    if ((next.status === 'In Progress' || next.status === 'Completed') && isBlocked(next, tasks)) { toast('Finish blocking dependencies first', 'error'); return }
    dispatch({ type: 'saveTask', t: next }); toast(isNew ? 'Task created' : 'Task saved'); onClose()
  }
  const toggleDep = (id) => setT({ ...t, dependsOn: t.dependsOn.includes(id) ? t.dependsOn.filter((d) => d !== id) : [...t.dependsOn, id] })
  const addComment = () => { if (!comment.trim()) return; dispatch({ type: 'comment', id: t.id, text: comment.trim() }); setComment(''); toast('Comment added') }
  return (
    <Modal side title={isNew ? 'New task' : 'Task details'} onClose={close}>
      <div className="space-y-3">
        {!isNew && isBlocked(live, tasks) && <Badge cls="bg-amber-100 text-amber-800">Blocked by an unfinished dependency</Badge>}
        <Field label="Title" error={err.title}><input className="inp" value={t.title} onChange={set('title')} /></Field>
        <Field label="Description"><textarea className="inp" rows={3} value={t.description} onChange={set('description')} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Project" error={err.projectId}><select className="inp" value={t.projectId} onChange={(e) => setT({ ...t, projectId: e.target.value, dependsOn: [] })}>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
          <Field label="Assignee"><input className="inp" value={t.assignee} onChange={set('assignee')} /></Field>
          <Field label="Status"><select className="inp" value={t.status} onChange={set('status')}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Priority"><select className="inp" value={t.priority} onChange={set('priority')}>{PRIORITIES.map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Start date"><input type="date" className="inp" value={t.startDate} onChange={set('startDate')} /></Field>
          <Field label="Due date" error={err.dueDate}><input type="date" className="inp" value={t.dueDate} onChange={set('dueDate')} /></Field>
          <Field label="Estimated hours" error={err.hours}><input type="number" min="0" className="inp" value={t.hours} onChange={set('hours')} /></Field>
          <Field label="Labels (comma separated)"><input className="inp" value={labels} onChange={(e) => setLabels(e.target.value)} /></Field>
        </div>
        <div><p className="mb-1 text-sm font-medium">Depends on</p>
          {candidates.length ? <div className="max-h-28 space-y-1 overflow-y-auto rounded-lg border border-stone-200 p-2 text-sm">{candidates.map((c) => <label key={c.id} className="flex gap-2"><input type="checkbox" checked={t.dependsOn.includes(c.id)} onChange={() => toggleDep(c.id)} />{c.title} <span className="text-stone-400">({c.status})</span></label>)}</div> : <p className="text-sm text-stone-500">No other tasks in this project.</p>}</div>
        <div className="flex justify-end gap-2"><button className="btn-s" onClick={close}>Cancel</button><button className="btn-p" onClick={save}>{isNew ? 'Create task' : 'Save changes'}</button></div>
        {!isNew && <>
          <div className="border-t border-stone-200 pt-3"><h3 className="mb-2 font-bold">Comments</h3>
            {live.comments.length ? live.comments.map((c) => <p key={c.id} className="mb-2 rounded-lg bg-stone-100 p-2 text-sm">{c.text}<span className="block text-xs text-stone-400">{stamp(c.t)}</span></p>) : <p className="text-sm text-stone-500">No comments yet.</p>}
            <div className="mt-2 flex gap-2"><input className="inp" placeholder="Write a comment…" value={comment} onChange={(e) => setComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addComment()} /><button className="btn-s" onClick={addComment}>Post</button></div></div>
          <div className="border-t border-stone-200 pt-3"><h3 className="mb-2 font-bold">Activity</h3>
            {live.activity.map((a, i) => <p key={i} className="text-sm text-stone-600">{a.msg} <span className="text-xs text-stone-400">{stamp(a.t)}</span></p>)}</div>
        </>}
      </div>
    </Modal>
  )
}
