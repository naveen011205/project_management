import { useState, useMemo } from 'react'
import { EMPTY_FILTERS } from '../utils/helpers'
// Shared filter state lives in App so filters persist when switching between Tasks and Board.
export function useFilters() {
  const [f, setF] = useState(EMPTY_FILTERS)
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  const clear = () => setF((x) => ({ ...EMPTY_FILTERS, sort: x.sort }))
  const active = useMemo(() => ['q', 'project', 'priority', 'assignee', 'status'].filter((k) => f[k]).concat(f.due !== 'all' ? ['due'] : []), [f])
  return { f, set, clear, active }
}
