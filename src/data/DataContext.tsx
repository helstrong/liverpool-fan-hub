import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { loadAll } from './api'
import type { AppData } from './types'

type Status = 'loading' | 'ready' | 'error'

interface State {
  status: Status
  data: AppData | null
  error?: string
}

interface DataContextValue {
  state: State
  refresh: () => void
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ status: 'loading', data: null })

  const load = useCallback((force: boolean) => {
    setState((prev) => ({ ...prev, status: 'loading' }))
    loadAll(force)
      .then((data) => setState({ status: 'ready', data }))
      .catch((e) => setState({ status: 'error', data: null, error: String(e?.message ?? e) }))
  }, [])

  useEffect(() => {
    load(false)
  }, [load])

  return (
    <DataContext.Provider value={{ state, refresh: () => load(true) }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within <DataProvider>')
  return ctx
}
