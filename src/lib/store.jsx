// The app's single mutable data layer.
//
// The rest of the app derives everything from a frozen JSON import (teamData.js).
// Creating an initiative and assigning members needs runtime state that survives
// across views, so this Context holds a deep-cloned, editable copy of the data and
// exposes the same selectors (now parameterized) plus two write actions.
import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import data from '../data/command_center_data.json'
import { overview, buckets, initiativeStats, aiConfidence } from './teamData'

const ACCENT_KEYS = ['ini01', 'ini02', 'ini03', 'ini04']
// Mirror of ui.jsx keyFor so a created initiative stores the same accent its
// chips/cards will render with (INI-05 → ini01, cycling every 4).
const accentKeyFor = (id) => {
  const n = parseInt(String(id).replace(/\D/g, ''), 10)
  return Number.isFinite(n) && n > 0 ? ACCENT_KEYS[(n - 1) % 4] : 'ini01'
}

const clone = (v) =>
  typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v))

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [members, setMembers] = useState(() => clone(data.team_members))
  const [initiatives, setInitiatives] = useState(() => clone(data.initiatives))

  // Append a new initiative; returns its id so the caller can assign members.
  const createInitiative = useCallback((form) => {
    let id
    setInitiatives((prev) => {
      id = `INI-${String(prev.length + 1).padStart(2, '0')}`
      const ini = {
        id,
        name: form.name?.trim() || 'Untitled initiative',
        description: form.description?.trim() || '',
        start: form.start || null,
        end: form.end || null,
        metric: form.metric?.trim() || 'activities',
        target_per_member: Number(form.target) || 0,
        eligible: form.eligible?.trim() || '',
        short: form.name?.trim() || 'Untitled initiative',
        key: accentKeyFor(id),
      }
      return [...prev, ini]
    })
    return id
  }, [])

  // Put each selected member on the initiative as freshly "assigned".
  const assignMembers = useCallback((initiativeId, memberIds, { target } = {}) => {
    const ids = new Set(memberIds)
    setMembers((prev) =>
      prev.map((m) =>
        ids.has(m.id)
          ? {
              ...m,
              initiatives: {
                ...m.initiatives,
                [initiativeId]: {
                  status: 'assigned',
                  progress: 0,
                  target: Number(target) || 0,
                  days_to_first_action: null,
                  historical_responsiveness: 'medium',
                },
              },
            }
          : m,
      ),
    )
  }, [])

  const value = useMemo(
    () => ({
      members,
      initiatives,
      overview: () => overview(members, initiatives),
      buckets: () => buckets(members),
      initiativeStats: () => initiativeStats(initiatives, members),
      aiConfidence: () => aiConfidence(members),
      createInitiative,
      assignMembers,
    }),
    [members, initiatives, createInitiative, assignMembers],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within <DataProvider>')
  return ctx
}
