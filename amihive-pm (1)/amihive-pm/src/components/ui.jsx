import { PCOLOR } from '../utils/helpers'

export const Badge = ({ children, cls = 'bg-stone-100 text-stone-600' }) => <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{children}</span>
export const PriorityBadge = ({ p }) => <Badge cls={PCOLOR[p]}>{p}</Badge>

export function Field({ label, error, children }) {
  return <label className="block text-sm font-medium">{label}<div className="mt-1">{children}</div>{error && <p className="mt-1 text-xs text-red-600">{error}</p>}</label>
}
export function Empty({ title, hint, action }) {
  return <div className="rounded-xl border border-dashed border-stone-300 p-10 text-center"><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-stone-500">{hint}</p>{action && <div className="mt-3">{action}</div>}</div>
}
export const Spinner = () => <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />

export function Modal({ title, onClose, children, side }) {
  return (
    <div className="anim-fade fixed inset-0 z-40 flex bg-black/40 backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`flex max-h-full flex-col overflow-hidden bg-white shadow-xl ${side ? 'anim-drawer ml-auto h-full w-full max-w-xl' : 'anim-pop m-auto w-full max-w-lg rounded-xl'}`}>
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3"><h2 className="font-bold">{title}</h2><button aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full text-xl leading-none text-stone-500 hover:bg-stone-100 hover:text-ink" onClick={onClose}>×</button></div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}
export function ConfirmDialog({ message, onYes, label, onClose }) {
  return (
    <div className="anim-fade fixed inset-0 z-50 flex bg-black/40"><div className="card anim-pop m-auto w-full max-w-sm shadow-xl">
      <p className="text-sm">{message}</p>
      <div className="mt-4 flex justify-end gap-2"><button className="btn-s" onClick={onClose}>Cancel</button><button className="btn-d" onClick={() => { onYes(); onClose() }}>{label}</button></div>
    </div></div>
  )
}
export function Toasts({ toasts }) {
  return <div className="fixed bottom-4 right-4 z-[60] space-y-2">{toasts.map((t) => <div key={t.id} role="status" className={`anim-toast rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg ${t.type === 'error' ? 'bg-red-600' : 'bg-teal-700'}`}>{t.msg}</div>)}</div>
}
