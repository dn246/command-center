// Two-list member picker for the Assign step (Google Calendar styling).
//   Left  — source list: a search field + "Recommended" / "All" tabs.
//           Recommended = only members who meet the chosen eligibility criteria,
//           ranked by AI opportunity estimate (highest value first);
//           All = everyone, alphabetical. A row toggles the member in/out of Added.
//   Right — "Added" list: pre-populated from the team-view selection; remove with ✕.
// Hovering a source row shows a tooltip: AI confidence, why, which of the chosen
// eligibility criteria the member matches, and when their data was last updated.
import { useMemo, useState } from 'react'
import { Search, Check, Plus, X } from 'lucide-react'
import { Avatar, ConfidenceMeter } from './ui'
import { confMeta, matchedCriteria, meetsCriteria, dataAgeLabel } from '../lib/teamData'

const sub = (m) => [m.profile?.segment, m.profile?.territory].filter(Boolean).join(' · ')

function SourceRow({ member, added, onToggle, onHover }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(member.id)}
      onMouseEnter={(e) => onHover(member, e.currentTarget.getBoundingClientRect())}
      onMouseLeave={() => onHover(null)}
      className="flex w-full items-center gap-3 rounded-tile px-2.5 py-2 text-left transition hover:bg-sunken"
    >
      <Avatar name={member.display_name} size={34} />
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-[14px] font-medium text-ink">{member.display_name}</span>
        <span className="block truncate text-[12px] text-ink-3">{sub(member)}</span>
      </span>
      {added ? (
        <Check size={18} className="shrink-0 text-ink" />
      ) : (
        <Plus size={18} className="shrink-0 text-ink-3" />
      )}
    </button>
  )
}

function RecommendationTooltip({ member, rect, criteria }) {
  const cm = confMeta(member.ai?.confidence)
  const reasons = (member.ai?.reason_codes || []).join(' · ')
  const matches = matchedCriteria(member, criteria)

  const W = 290
  const estH = 200
  let left = rect.right + 10
  if (left + W > window.innerWidth - 8) left = rect.left - W - 10
  if (left < 8) left = 8
  let top = rect.top
  if (top + estH > window.innerHeight - 8) top = window.innerHeight - estH - 8
  if (top < 8) top = 8

  return (
    <div
      style={{ position: 'fixed', top, left, width: W, zIndex: 60 }}
      className="pointer-events-none rounded-tile border border-line bg-card p-3 shadow-lg"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[13px] font-semibold text-ink">{member.display_name}</span>
        <ConfidenceMeter level={cm.level} label={cm.label} />
      </div>
      <div className="mt-2.5 space-y-2.5">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-ink-3">Why AI suggests them</div>
          <div className="mt-0.5 text-[12px] leading-snug text-ink-2">{reasons || '—'}</div>
        </div>
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-ink-3">Matching criteria</div>
          {matches.length ? (
            <div className="mt-1 flex flex-wrap gap-1">
              {matches.map((c) => (
                <span key={c.id} className="inline-flex items-center rounded-full bg-sunken px-2 py-0.5 text-[11px] font-medium text-ink-2">
                  {c.label}
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-0.5 text-[12px] text-ink-2">
              {criteria.length ? 'None of the chosen criteria' : 'No criteria chosen'}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-line pt-2 text-[12px]">
          <span className="text-ink-3">Data updated</span>
          <span className="font-medium text-ink-2">{dataAgeLabel(member)}</span>
        </div>
      </div>
    </div>
  )
}

export default function MemberPicker({ members, addedIds, onChange, criteria = [] }) {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('recommended')
  const [hover, setHover] = useState(null) // { member, rect }
  const addedSet = useMemo(() => new Set(addedIds), [addedIds])

  const onHover = (member, rect) => setHover(member ? { member, rect } : null)

  const toggle = (id) => {
    if (addedSet.has(id)) onChange(addedIds.filter((x) => x !== id))
    else onChange([...addedIds, id])
  }

  const source = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = members.filter((m) => !q || m.display_name.toLowerCase().includes(q))
    if (tab === 'recommended') {
      // Recommended only surfaces people who actually meet the chosen eligibility
      // criteria, ranked by AI opportunity estimate (highest value first).
      list = list
        .filter((m) => meetsCriteria(m, criteria))
        .sort((a, b) => (b.ai?.opportunity_estimate_usd ?? 0) - (a.ai?.opportunity_estimate_usd ?? 0))
    } else {
      list = [...list].sort((a, b) => a.display_name.localeCompare(b.display_name))
    }
    return list
  }, [members, query, tab, criteria])

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
            <p className="px-2.5 py-6 text-center text-[13px] text-ink-3">
              {tab === 'recommended' && !query
                ? 'No members meet the chosen criteria. Switch to All to add anyone.'
                : 'No matches'}
            </p>
          ) : (
            source.map((m) => (
              <SourceRow key={m.id} member={m} added={addedSet.has(m.id)} onToggle={toggle} onHover={onHover} />
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

      {hover && <RecommendationTooltip member={hover.member} rect={hover.rect} criteria={criteria} />}
    </div>
  )
}
