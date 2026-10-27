import { useStore } from '../store'
import { STATUSES, PRIORITIES } from '../utils/helpers'

export default function FilterBar({ flt, hideStatus }) {
  const { state } = useStore()
  const { f, set, clear, active } = flt
  const people = [...new Set(state.tasks.map((t) => t.assignee).filter(Boolean))]
  const Sel = ({ k, label, opts }) => (
    <select aria-label={label} className="inp !w-auto" value={f[k]} onChange={(e) => set(k, e.target.value)}>
      <option value="">{label}</option>{opts.map((o) => <option key={o.v ?? o} value={o.v ?? o}>{o.l ?? o}</option>)}
    </select>
  )
  return (
    <div className="card mb-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        <input className="inp min-w-48 flex-1" placeholder="Search title, description, label or project…" value={f.q} onChange={(e) => set('q', e.target.value)} />
        <Sel k="project" label="All projects" opts={state.projects.map((p) => ({ v: p.id, l: p.name }))} />
        <Sel k="priority" label="Any priority" opts={PRIORITIES} />
        <Sel k="assignee" label="Anyone" opts={people} />
        {!hideStatus && <Sel k="status" label="Any status" opts={STATUSES} />}
        <select aria-label="Deadline" className="inp !w-auto" value={f.due} onChange={(e) => set('due', e.target.value)}>
          <option value="all">Any deadline</option><option value="overdue">Overdue</option><option value="week">Due in 7 days</option>
        </select>
        <select aria-label="Sort" className="inp !w-auto" value={f.sort} onChange={(e) => set('sort', e.target.value)}>
          <option value="due">Sort: deadline</option><option value="priority">Sort: priority</option><option value="title">Sort: title</option><option value="newest">Sort: newest</option>
        </select>
      </div>
      {active.length > 0 && <div className="flex items-center gap-2 text-xs"><span className="font-semibold text-brand">{active.length} filter{active.length > 1 ? 's' : ''} active:</span>{active.map((k) => <span key={k} className="rounded-full bg-teal-50 px-2 py-0.5 text-teal-800">{k}</span>)}<button className="font-semibold underline" onClick={clear}>Clear all</button></div>}
    </div>
  )
}
