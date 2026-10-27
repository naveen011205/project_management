import { useState } from 'react'
import { useStore } from './store'
import { useFilters } from './hooks/useFilters'
import Dashboard from './components/Dashboard'
import Projects from './components/Projects'
import Tasks from './components/Tasks'
import Board from './components/Board'
import TaskDrawer from './components/TaskDrawer'

const NAV = [['dashboard', '▦', 'Dashboard'], ['projects', '◧', 'Projects'], ['tasks', '☰', 'Tasks'], ['board', '▥', 'Board']]

export default function App() {
  const { state, dispatch, toast, confirm } = useStore()
  const [view, setView] = useState('dashboard')
  const [drawer, setDrawer] = useState(null) // { task } | { isNew: true }
  const flt = useFilters()
  const collapsed = !!state.prefs.collapsed
  const openTask = (task) => setDrawer({ task })
  const newTask = () => setDrawer({ isNew: true })
  return (
    <div className="flex min-h-screen">
      <aside className={`sticky top-0 flex h-screen shrink-0 flex-col bg-ink text-stone-200 transition-all ${collapsed ? 'w-16' : 'w-52'}`}>
        <div className="flex items-center justify-between p-4 font-bold text-white">{!collapsed && <span>Hivework</span>}<button aria-label="Toggle sidebar" onClick={() => dispatch({ type: 'pref', p: { collapsed: !collapsed } })}>{collapsed ? '»' : '«'}</button></div>
        <nav className="flex-1 space-y-1 px-2">{NAV.map(([id, icon, label]) => (
          <button key={id} onClick={() => setView(id)} title={label} className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${view === id ? 'bg-teal-700 text-white' : 'hover:translate-x-1 hover:bg-white/10'}`}><span className="transition-transform group-hover:scale-125">{icon}</span>{!collapsed && label}</button>))}</nav>
        <button className="m-2 rounded-lg px-3 py-2 text-left text-xs hover:bg-white/10" title="Reset to demo data" onClick={() => confirm('Replace all data with the demo data?', () => { dispatch({ type: 'reset' }); toast('Demo data restored') }, 'Reset')}>{collapsed ? '↺' : '↺ Reset demo data'}</button>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-6">
        <div key={view} className="anim-view"><h1 className="mb-4 text-2xl font-bold">{NAV.find((n) => n[0] === view)[2]}</h1>
        {view === 'dashboard' && <Dashboard onOpenTask={openTask} />}
        {view === 'projects' && <Projects onViewTasks={(id) => { flt.set('project', id); setView('tasks') }} />}
        {view === 'tasks' && <Tasks flt={flt} onOpen={openTask} onNew={newTask} />}
        {view === 'board' && <Board flt={flt} onOpen={openTask} onNew={newTask} />}
      </div></main>
      {drawer && <TaskDrawer key={drawer.task?.id || 'new'} task={drawer.task} defaultProject={flt.f.project} onClose={() => setDrawer(null)} />}
    </div>
  )
}
