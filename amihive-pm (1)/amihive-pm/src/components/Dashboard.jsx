import { useStore } from '../store'
import { STATUSES, PRIORITIES, isOverdue, progress, fmt, stamp, iso, addDays } from '../utils/helpers'

function Bars({ title, data, colors }) {
  const max = Math.max(1, ...data.map((d) => d[1]))
  return (
    <div className="card lift"><h3 className="mb-3 font-bold">{title}</h3>
      <div className="space-y-2">{data.map(([label, n], i) => (
        <div key={label} className="flex items-center gap-2 text-sm"><span className="w-24 shrink-0 text-stone-600">{label}</span>
          <div className="h-3 flex-1 rounded-full bg-stone-100"><div className={`anim-grow h-3 rounded-full transition-all duration-500 ${colors[i]}`} style={{ width: `${(n / max) * 100}%` }} /></div><span className="w-6 text-right font-semibold">{n}</span></div>))}
      </div></div>
  )
}

export default function Dashboard({ onOpenTask }) {
  const { state: { projects, tasks } } = useStore()
  const done = tasks.filter((t) => t.status === 'Completed').length
  const stats = [['Projects', projects.filter((p) => !p.archived).length], ['Active tasks', tasks.length - done], ['Completed', done], ['Overdue', tasks.filter(isOverdue).length], ['Completion', `${tasks.length ? Math.round((done / tasks.length) * 100) : 0}%`]]
  const recent = tasks.flatMap((t) => t.activity.map((a) => ({ ...a, task: t }))).sort((a, b) => b.t - a.t).slice(0, 6)
  const upcoming = tasks.filter((t) => t.status !== 'Completed' && t.dueDate >= iso() && t.dueDate <= addDays(14)).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 6)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{stats.map(([l, v]) => <div key={l} className={`card lift ${l === 'Overdue' && v ? 'border-amber-400 bg-amber-50' : ''}`}><p className="text-sm text-stone-500">{l}</p><p className="text-3xl font-bold">{v}</p></div>)}</div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Bars title="Tasks by status" data={STATUSES.map((s) => [s, tasks.filter((t) => t.status === s).length])} colors={['bg-stone-400', 'bg-sky-500', 'bg-amber-500', 'bg-teal-600']} />
        <Bars title="Priority distribution" data={PRIORITIES.map((p) => [p, tasks.filter((t) => t.priority === p).length])} colors={['bg-stone-400', 'bg-sky-500', 'bg-rose-500']} />
        <Bars title="Project progress (%)" data={projects.filter((p) => !p.archived).map((p) => [p.name.slice(0, 14), progress(p.id, tasks)])} colors={projects.map(() => 'bg-teal-600')} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card lift"><h3 className="mb-2 font-bold">Upcoming deadlines</h3>
          {upcoming.length ? upcoming.map((t) => <button key={t.id} onClick={() => onOpenTask(t)} className="flex w-full justify-between border-b border-stone-100 py-2 text-left text-sm last:border-0 transition hover:translate-x-1 hover:text-brand"><span>{t.title}</span><span className="text-stone-500">{fmt(t.dueDate)}</span></button>) : <p className="text-sm text-stone-500">Nothing due in the next 14 days.</p>}</div>
        <div className="card lift"><h3 className="mb-2 font-bold">Recent activity</h3>
          {recent.length ? recent.map((a, i) => <p key={i} className="border-b border-stone-100 py-2 text-sm last:border-0"><b>{a.task.title}</b> — {a.msg} <span className="text-xs text-stone-400">{stamp(a.t)}</span></p>) : <p className="text-sm text-stone-500">No activity yet.</p>}</div>
      </div>
    </div>
  )
}
