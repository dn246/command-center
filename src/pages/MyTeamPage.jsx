import {
  PageHeader, Tabs, SearchField, DataTable, Avatar, RiskBadge, NbaPill, InitiativeChip, InfoNote,
} from '../components/ui'
import { buckets, riskMeta } from '../lib/teamData'

const columns = [
  {
    key: 'name',
    header: 'Name',
    render: (r) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={r.name} size={32} />
        <div className="leading-tight">
          <div className="font-medium text-ink">{r.name}</div>
          <div className="text-[12px] text-ink-3">{r.segment}</div>
        </div>
      </div>
    ),
  },
  { key: 'tenure', header: 'Tenure band', render: (r) => <span className="text-ink-2">{r.tenureBand}</span> },
  {
    key: 'risk',
    header: 'Risk',
    render: (r) => { const m = riskMeta(r.risk); return <RiskBadge tone={m.tone} label={m.label} /> },
  },
  {
    key: 'initiatives',
    header: 'Initiatives',
    render: (r) =>
      r.initiatives.length ? (
        <div className="flex flex-wrap gap-1">
          {r.initiatives.map((i) => <InitiativeChip key={i.id} id={i.id} progress={i.progress} target={i.target} />)}
        </div>
      ) : (
        <span className="text-ink-3">—</span>
      ),
  },
  { key: 'nba', header: 'AI next best action', render: (r) => <NbaPill nba={r.nba} /> },
  {
    key: 'reasoning',
    header: 'AI reasoning',
    tdClass: 'max-w-[260px]',
    render: (r) =>
      r.reasoning.length ? (
        <span className="text-[12px] leading-snug text-ink-2">{r.reasoning.join(' · ')}</span>
      ) : (
        <span className="text-ink-3">—</span>
      ),
  },
]

export default function MyTeamPage() {
  const b = buckets()
  const tabs = [
    { id: 'all', label: 'All', count: b.all.length },
    { id: 'attention', label: 'Needs Attention', count: b.needsAttention.length },
    { id: 'unassigned', label: 'Unassigned', count: b.unassigned.length },
    { id: 'new', label: 'New', count: b.new.length },
  ]

  return (
    <>
      <PageHeader
        title="My Team"
        subtitle="Look up any team member's status before a coaching conversation."
      />

      <div className="mb-4">
        <Tabs tabs={tabs} active="all" />
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <SearchField placeholder="Search team members" />
        <span className="flex items-center gap-1.5 text-[12px] text-ink-3">
          Showing all {b.all.length}
          <InfoNote>Filters and search are shown for structure in this mid-fi prototype; the “All” view is rendered.</InfoNote>
        </span>
      </div>

      <DataTable columns={columns} rows={b.all} minW="900px" />
    </>
  )
}
