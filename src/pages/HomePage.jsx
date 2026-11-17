import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import {
  PageHeader, SectionTitle, StatCard, InitiativeCard, DataTable,
  Avatar, RiskBadge, NbaPill, ViewAllLink, ConfidenceMeter,
} from '../components/ui'
import { useData } from '../lib/store'
import {
  riskMeta, riskRank, confMeta, confRank, EL_NAME, meta,
} from '../lib/teamData'

const HOME_LIMIT = 5

function NameCell(row) {
  return (
    <div className="flex items-center gap-2.5">
      <Avatar name={row.name} size={30} />
      <span className="font-medium text-ink">{row.name}</span>
    </div>
  )
}

// Column defs. `sortable` + `sortAccessor` turn the header into a sort control.
const nameCol = {
  key: 'name', header: 'Name', render: NameCell,
  sortable: true, sortAccessor: (r) => r.name.toLowerCase(), defaultDir: 'asc',
}
const tenureCol = {
  key: 'tenure', header: 'Tenure',
  render: (r) => <span className="text-ink-2">{r.tenureBand}</span>,
  sortable: true, sortAccessor: (r) => r.tenureBand, defaultDir: 'asc',
}
const riskCol = {
  key: 'risk', header: 'Risk',
  render: (r) => { const m = riskMeta(r.risk); return <RiskBadge tone={m.tone} label={m.label} /> },
  sortable: true, sortAccessor: (r) => riskRank(r.risk), defaultDir: 'desc',
}
const accuracyCol = {
  key: 'accuracy', header: 'AI accuracy',
  render: (r) => { const m = confMeta(r.confidence); return <ConfidenceMeter level={m.level} label={m.label} /> },
  sortable: true, sortAccessor: (r) => confRank(r.confidence), defaultDir: 'desc',
}
const nbaCol = { key: 'nba', header: 'Next best action', render: (r) => <NbaPill nba={r.nba} /> }

function MiniTable({ title, note, rows, columns, onMore, defaultSort }) {
  const [sort, setSort] = useState(defaultSort || null)

  const onSort = (key) => {
    const col = columns.find((c) => c.key === key)
    setSort((prev) =>
      prev && prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: col?.defaultDir || 'asc' },
    )
  }

  let sorted = rows
  const col = sort && columns.find((c) => c.key === sort.key)
  if (col?.sortAccessor) {
    const f = sort.dir === 'asc' ? 1 : -1
    sorted = [...rows].sort((a, b) => {
      const av = col.sortAccessor(a)
      const bv = col.sortAccessor(b)
      const d = typeof av === 'string' ? av.localeCompare(bv) : av - bv
      return d * f
    })
  }
  const shown = sorted.slice(0, HOME_LIMIT)
  const extra = sorted.length - shown.length

  return (
    <div>
      <SectionTitle note={note}>
        {title} <span className="font-normal text-ink-3">· {rows.length}</span>
      </SectionTitle>
      <DataTable columns={columns} rows={shown} sort={sort} onSort={onSort} />
      {extra > 0 && (
        <button
          onClick={onMore}
          className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-ink-2 transition hover:text-ink"
        >
          {extra} more in My Team <ArrowRight size={14} />
        </button>
      )}
    </div>
  )
}

export default function HomePage({ setPage }) {
  const { overview, initiativeStats, buckets } = useData()
  const o = overview()
  const inis = initiativeStats()
  const b = buckets()
  const goTeam = () => setPage('team')

  return (
    <>
      <PageHeader
        title={`Hello, welcome back ${EL_NAME}`}
        subtitle={`Here's how your team and initiatives are tracking. ${meta.period.name} · ${meta.period.days_elapsed} of ${meta.period.days_total} days elapsed · as of Nov 9, 2026.`}
      />

      {/* Overview */}
      <section className="mb-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard tint="blue" label="Team members" value={o.members} />
          <StatCard label="Initiatives" value={o.initiatives} sub="this quarter" />
          <StatCard tint="purple" label="Assigned to initiatives" value={o.assigned} sub={`of ${o.members}`} />
          <StatCard label="Unassigned" value={o.unassigned} sub="eligible, not assigned" />
        </div>
      </section>

      {/* Initiatives */}
      <section className="mb-9">
        <SectionTitle
          note="Score = combined progress toward target across assigned members. Falling behind = active members below the Q4 on-pace line (43.5%)."
          action={<ViewAllLink onClick={() => setPage('initiatives')}>View all initiatives</ViewAllLink>}
        >
          Initiatives
        </SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {inis.map((ini) => <InitiativeCard key={ini.id} ini={ini} />)}
        </div>
      </section>

      {/* Attention lists — two tables side by side, sortable by column header */}
      <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MiniTable
          title="Who needs attention"
          note="High disengagement risk, an urgent priority score (≥70), or a raised flag. AI accuracy is the model's confidence in this person's signals — sort any column via its header."
          rows={b.needsAttention}
          columns={[nameCol, riskCol, accuracyCol, nbaCol]}
          defaultSort={{ key: 'risk', dir: 'desc' }}
          onMore={goTeam}
        />
        <MiniTable
          title="Who's new"
          note="Team members in their first year (tenure 0–1 yr)."
          rows={b.new}
          columns={[nameCol, tenureCol, nbaCol]}
          defaultSort={{ key: 'name', dir: 'asc' }}
          onMore={goTeam}
        />
      </section>

    </>
  )
}
