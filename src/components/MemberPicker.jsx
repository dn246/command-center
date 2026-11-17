// Two-list member picker for the Assign step (Google Calendar styling).
//   Left  — source list: a search field + "Recommended" / "All" tabs.
//           Recommended = ranked by AI opportunity estimate (highest value first);
//           All = alphabetical. A row toggles the member in/out of Added.
//   Right — "Added" list: pre-populated from the team-view selection; remove with ✕.
import { useMemo, useState } from 'react'
import { Search, Check, Plus, X } from 'lucide-react'
import { Avatar } from './ui'

const sub = (m) => [m.profile?.segment, m.profile?.territory].filter(Boolean).join(' · ')

function SourceRow({ member, added, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(member.id)}
      className="flex w-full items-center gap-3 rounded-tile px-2.5 py-2 text-left transition hover:bg-sunken"
    >
      <Avatar name={member.display_name} size={34} />
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-[14px] font-medium text-ink">{member.display_name}</span>
        <span className="block truncate text-[12px] text-ink-3">{sub(member)}</span>
      </span>
      {added ? (
        <Check size={18} className="shrink-0 text-link" />
      ) : (
        <Plus size={18} className="shrink-0 text-ink-3" />
      )}
    </button>
  )
}

export default function MemberPicker({ members, addedIds, onChange }) {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('recommended')
  const addedSet = useMemo(() => new Set(addedIds), [addedIds])

  const toggle = (id) => {
    if (addedSet.has(id)) onChange(addedIds.filter((x) => x !== id))
    else onChange([...addedIds, id])
  }

  const source = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = members.filter((m) => !q || m.display_name.toLowerCase().includes(q))
    if (tab === 'recommended') {
      list = [...list].sort(
        (a, b) => (b.ai?.opportunity_estimate_usd ?? 0) - (a.ai?.opportunity_estimate_usd ?? 0),
      )
    } else {
      list = [...list].sort((a, b) => a.display_name.localeCompare(b.display_name))
    }
    return list
  }, [members, query, tab])

  const added = useMemo(
    () => addedIds.map((id) => members.find((m) => m.id === id)).filter(Boolean),
    [addedIds, members],
  )

  const TABS = [
    { id: 'recommended', label: 'Recommended' },
    { id: 'all', label: 'All' },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Source list */}
      <div className="flex min-h-0 flex-col rounded-card border border-line bg-card">
        <div className="border-b border-line p-3">
          <div className="flex items-center gap-2 rounded-tile border border-line bg-card px-3 py-2 text-ink-3 focus-within:border-link">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search team members"
              className="w-full bg-transparent text-[13px] text-ink placeholder:text-ink-3 outline-none"
            />
          </div>
          <div className="mt-3 flex items-center gap-1">
            {TABS.map((t) => {
              const on = t.id === tab
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`rounded-full px-3 py-1 text-[13px] font-medium transition ${
                    on ? 'bg-ink text-card' : 'text-ink-2 hover:bg-sunken'
                  }`}
                >
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>
        <div className="max-h-[320px] min-h-[200px] overflow-y-auto p-2">
          {source.length === 0 ? (
            <p className="px-2.5 py-6 text-center text-[13px] text-ink-3">No matches</p>
          ) : (
            source.map((m) => (
              <SourceRow key={m.id} member={m} added={addedSet.has(m.id)} onToggle={toggle} />
            ))
          )}
        </div>
      </div>

      {/* Added list */}
      <div className="flex min-h-0 flex-col rounded-card border border-line bg-card">
        <div className="border-b border-line px-4 py-3 text-[13px] font-semibold text-ink">
          Added <span className="font-normal text-ink-3">· {added.length}</span>
        </div>
        <div className="max-h-[320px] min-h-[200px] overflow-y-auto p-2">
          {added.length === 0 ? (
            <p className="px-2.5 py-6 text-center text-[13px] text-ink-3">
              No members yet. Add people from the list on the left.
            </p>
          ) : (
            added.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-tile px-2.5 py-2 transition hover:bg-sunken"
              >
                <Avatar name={m.display_name} size={34} />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-[14px] font-medium text-ink">{m.display_name}</span>
                  <span className="block truncate text-[12px] text-ink-3">{sub(m)}</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggle(m.id)}
                  aria-label={`Remove ${m.display_name}`}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-tile text-ink-3 transition hover:bg-line hover:text-ink"
                >
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
