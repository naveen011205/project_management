import { useState } from 'react'
import { useStore } from '../store'
import FilterBar from './FilterBar'
import { Badge, PriorityBadge } from './ui'
import { STATUSES, filterTasks, isOverdue, isBlocked, fmt } from '../utils/helpers'

export default function Board({ flt, onOpen, onNew }) {
  const { state: { projects, tasks }, dispatch, toast } = useStore()
  const [over, setOver] = useState(null)
  const rows = filterTasks(tasks, projects, flt.f)
  const drop = (e, status) => {
    e.preventDefault(); setOver(null)
    const t = tasks.find((x) => x.id === e.dataTransfer.getData('text/plain'))
    if (!t || t.status === status) return
    if ((status === 'In Progress' || status === 'Completed') && isBlocked(t, tasks)) return toast('Blocked: finish its dependencies first', 'error')
    dispatch({ type: 'patchTasks', ids: [t.id], patch: { status } }); toast(`Moved to ${status}`)
  }
  return (
    <div>
      <div className="mb-3 flex justify-end"><button className="btn-p" onClick={onNew}>+ New task</button></div>
      <FilterBar flt={flt} hideStatus />
      <div className="grid gap-3 overflow-x-auto md:grid-cols-2 xl:grid-cols-4">
        {STATUSES.map((s) => {
          const col = rows.filter((t) => t.status === s)
          return (
            <div key={s} onDragOver={(e) => { e.preventDefault(); setOver(s) }} onDragLeave={() => setOver(null)} onDrop={(e) => drop(e, s)} className={`min-h-48 rounded-xl p-2 transition ${over === s ? 'bg-teal-100 ring-2 ring-brand' : 'bg-stone-200/60'}`}>
              <div className="mb-2 flex items-center justify-between px-1 font-bold">{s}<span className="rounded-full bg-white px-2 text-sm">{col.length}</span></div>
              <div className="space-y-2">
                {col.map((t) => {
                  const blocked = isBlocked(t, tasks), late = isOverdue(t)
                  return (
                    <div key={t.id} draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', t.id); e.currentTarget.style.opacity = '.4' }} onDragEnd={(e) => { e.currentTarget.style.opacity = '' }} onClick={() => onOpen(t)} className={`anim-pop cursor-grab rounded-lg border bg-white p-3 text-sm shadow-sm transition duration-200 hover:-translate-y-1 hover:rotate-[0.4deg] hover:shadow-lg active:cursor-grabbing ${blocked ? 'border-amber-400' : late ? 'border-red-400' : 'border-stone-200'} ${t.priority === 'High' ? 'border-l-4 border-l-rose-500' : ''}`}>
                      <p className="font-semibold">{t.title}</p><p className="text-xs text-stone-500">{projects.find((p) => p.id === t.projectId)?.name}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1"><PriorityBadge p={t.priority} />{blocked && <Badge cls="bg-amber-100 text-amber-800">Blocked</Badge>}{late && <Badge cls="bg-red-100 text-red-700">Overdue</Badge>}<span className="ml-auto text-xs text-stone-500">{t.assignee} · {fmt(t.dueDate)}</span></div>
                    </div>)
                })}
                {col.length === 0 && <p className="p-3 text-center text-xs text-stone-500">Drop tasks here</p>}
              </div>
            </div>)
        })}
      </div>
    </div>
  )
}
