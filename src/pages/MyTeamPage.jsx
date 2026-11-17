import { useState } from 'react'
import {
  PageHeader, Tabs, SearchField, DataTable, Avatar, RiskBadge, NbaPill, InitiativeChip, InfoNote,
} from '../components/ui'
import SelectionBar from '../components/SelectionBar'
import { useData } from '../lib/store'
import { riskMeta } from '../lib/teamData'

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

export default function MyTeamPage({ onCreateInitiative }) {
  const { buckets } = useData()
  const b = buckets()
  const rows = b.all

  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [anchorId, setAnchorId] = useState(null)
  const [stubMsg, setStubMsg] = useState('')

  // Plain click toggles a row (and sets the range anchor); shift-click selects
  // the contiguous range between the anchor and the clicked row, Drive-style.
  const onRowSelect = (id, e) => {
    setStubMsg('')
    if (e.shiftKey && anchorId) {
      const order = rows.map((r) => r.id)
      const a = order.indexOf(anchorId)
      const bI = order.indexOf(id)
      if (a !== -1 && bI !== -1) {
        const [lo, hi] = a < bI ? [a, bI] : [bI, a]
        setSelectedIds(new Set(order.slice(lo, hi + 1)))
        return
      }
    }
    setSelectedIds((prev) => {
      const nextSet = new Set(prev)
      if (nextSet.has(id)) nextSet.delete(id)
      else nextSet.add(id)
      return nextSet
    })
    setAnchorId(id)
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
    setAnchorId(null)
    setStubMsg('')
  }

  const assignToNew = () => {
    onCreateInitiative?.(Array.from(selectedIds))
    clearSelection()
  }

  const selecting = selectedIds.size > 0

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
        subtitle="Look up any team member's status, or select people to launch an initiative."
      />

      <div className="mb-4">
        <Tabs tabs={tabs} active="all" />
      </div>

      {selecting ? (
        <SelectionBar
          count={selectedIds.size}
          stubMsg={stubMsg}
          onCancel={clearSelection}
          onAssignNew={assignToNew}
          onAssignExisting={() => setStubMsg('Assign to existing — coming soon')}
          onOutreach={() => setStubMsg('Outreach — coming soon')}
        />
      ) : (
        <div className="mb-4 flex items-center justify-between gap-3">
          <SearchField placeholder="Search team members" />
          <span className="flex items-center gap-1.5 text-[12px] text-ink-3">
            Tip: click rows to select · shift-click for a range
            <InfoNote>Click a team member to select them and reveal bulk actions. Shift-click selects a range. Filters and search are shown for structure in this mid-fi prototype; the “All” view is rendered.</InfoNote>
          </span>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        minW="900px"
        selectable
        selectedIds={selectedIds}
        onRowSelect={onRowSelect}
      />
    </>
  )
}
