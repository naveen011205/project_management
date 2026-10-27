import { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react'
import { seed } from './utils/seed'
import { uid } from './utils/helpers'
import { ConfirmDialog, Toasts } from './components/ui'

const KEY = 'hivework-v1'
const Ctx = createContext()
export const useStore = () => useContext(Ctx)

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY))
    if (s && Array.isArray(s.projects) && Array.isArray(s.tasks)) {
      const ids = new Set(s.projects.map((p) => p.id))
      return { prefs: {}, ...s, tasks: s.tasks.filter((t) => t && t.id && ids.has(t.projectId)).map((t) => ({ dependsOn: [], comments: [], activity: [], labels: [], ...t })) }
    }
  } catch { /* corrupt data: fall through to demo data */ }
  return seed()
}
const log = (t, msg) => ({ ...t, activity: [{ t: Date.now(), msg }, ...(t.activity || [])] })

function reducer(s, a) {
  switch (a.type) {
    case 'saveProject': return { ...s, projects: s.projects.some((p) => p.id === a.p.id) ? s.projects.map((p) => (p.id === a.p.id ? a.p : p)) : [a.p, ...s.projects] }
    case 'delProject': return { ...s, projects: s.projects.filter((p) => p.id !== a.id), tasks: s.tasks.filter((t) => t.projectId !== a.id) }
    case 'saveTask': {
      const old = s.tasks.find((t) => t.id === a.t.id)
      const t = old ? log(a.t, 'Task edited' + (old.status !== a.t.status ? `: ${old.status} → ${a.t.status}` : '')) : log({ ...a.t, createdAt: Date.now() }, 'Task created')
      return { ...s, tasks: old ? s.tasks.map((x) => (x.id === t.id ? t : x)) : [t, ...s.tasks] }
    }
    case 'patchTasks': return { ...s, tasks: s.tasks.map((t) => (a.ids.includes(t.id) ? log({ ...t, ...a.patch }, Object.entries(a.patch).map(([k, v]) => `${k} → ${v}`).join(', ')) : t)) }
    case 'delTasks': return { ...s, tasks: s.tasks.filter((t) => !a.ids.includes(t.id)).map((t) => ({ ...t, dependsOn: t.dependsOn.filter((d) => !a.ids.includes(d)) })) }
    case 'comment': return { ...s, tasks: s.tasks.map((t) => (t.id === a.id ? log({ ...t, comments: [...t.comments, { id: uid(), t: Date.now(), text: a.text }] }, 'Comment added') : t)) }
    case 'importTasks': return { ...s, tasks: [...a.tasks, ...s.tasks] }
    case 'pref': return { ...s, prefs: { ...s.prefs, ...a.p } }
    case 'reset': return seed()
    default: return s
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, load)
  const [toasts, setToasts] = useState([])
  const [dlg, setDlg] = useState(null)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* storage full/blocked */ } }, [state])
  const toast = useCallback((msg, type = 'success') => {
    const id = uid(); setToasts((x) => [...x, { id, msg, type }]); setTimeout(() => setToasts((x) => x.filter((y) => y.id !== id)), 3000)
  }, [])
  const confirm = useCallback((message, onYes, label = 'Confirm') => setDlg({ message, onYes, label }), [])
  return (
    <Ctx.Provider value={{ state, dispatch, toast, confirm }}>
      {children}
      <Toasts toasts={toasts} />
      {dlg && <ConfirmDialog {...dlg} onClose={() => setDlg(null)} />}
    </Ctx.Provider>
  )
}
