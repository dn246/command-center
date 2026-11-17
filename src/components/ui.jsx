import { Info, ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react'

// ---- accent maps (full literal class names so Tailwind keeps them) -------
const INI_ACCENT = {
  ini01: { text: 'text-ini01', dot: 'bg-ini01', soft: 'bg-ini01-soft' },
  ini02: { text: 'text-ini02', dot: 'bg-ini02', soft: 'bg-ini02-soft' },
  ini03: { text: 'text-ini03', dot: 'bg-ini03', soft: 'bg-ini03-soft' },
  ini04: { text: 'text-ini04', dot: 'bg-ini04', soft: 'bg-ini04-soft' },
}
const INI_HEX = { ini01: '#2d6cdf', ini02: '#7c5cdb', ini03: '#14a08a', ini04: '#b9860b' }
const keyFor = (id) => ({ 'INI-01': 'ini01', 'INI-02': 'ini02', 'INI-03': 'ini03', 'INI-04': 'ini04' }[id] || 'ini01')

const TONE = {
  good: { dot: 'bg-good', text: 'text-good', soft: 'bg-good-soft' },
  warn: { dot: 'bg-warn', text: 'text-warn', soft: 'bg-warn-soft' },
  bad: { dot: 'bg-bad', text: 'text-bad', soft: 'bg-bad-soft' },
  muted: { dot: 'bg-ink-3', text: 'text-ink-3', soft: 'bg-sunken' },
}

// ---- Avatar (initials on a soft deterministic tint) ---------------------
const AV_TINTS = ['#e6f1fd', '#edeefc', '#e2f6f2', '#fbf2da', '#fde9ef', '#e9f6e7']
const AV_INK = ['#2d6cdf', '#7c5cdb', '#14a08a', '#b9860b', '#d6557f', '#3a9d5b']
function hash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}
export function Avatar({ name, size = 32 }) {
  const i = hash(name) % AV_INK.length
  const initials = name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        background: AV_TINTS[i],
        color: AV_INK[i],
        fontSize: size * 0.4,
      }}
    >
      {initials}
    </span>
  )
}

// ---- Progress ring ------------------------------------------------------
export function ProgressRing({ value, color = '#2d6cdf', size = 56, stroke = 6 }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = value == null ? 0 : Math.max(0, Math.min(100, value))
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ececef" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c}
        />
      </svg>
      <span className="absolute text-[13px] font-semibold text-ink">
        {value == null ? '—' : `${value}%`}
      </span>
    </div>
  )
}

// ---- Stat card ----------------------------------------------------------
const TINT = { blue: 'bg-tint-blue', purple: 'bg-tint-purple', none: 'bg-card border border-line' }
export function StatCard({ label, value, sub, tint = 'none' }) {
  return (
    <div className={`rounded-card p-5 ${TINT[tint]}`}>
      <div className="text-[13px] font-medium text-ink-2">{label}</div>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-[28px] font-semibold leading-none tracking-tight text-ink">{value}</span>
        {sub && <span className="pb-0.5 text-[13px] text-ink-2">{sub}</span>}
      </div>
    </div>
  )
}

// ---- Risk badge ---------------------------------------------------------
export function RiskBadge({ tone, label }) {
  const t = TONE[tone] || TONE.muted
  if (tone === 'muted') return <span className="text-ink-3">—</span>
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${t.soft} ${t.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
      {label}
    </span>
  )
}

// ---- Next-best-action pill ---------------------------------------------
export function NbaPill({ nba }) {
  if (!nba || nba.muted) return <span className="text-ink-3">—</span>
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] font-medium text-ink">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />
      {nba.text}
    </span>
  )
}

// ---- Initiative chip ----------------------------------------------------
export function InitiativeChip({ id, progress, target }) {
  const a = INI_ACCENT[keyFor(id)]
  const prog = progress != null && target != null ? `${progress}/${target}` : null
  return (
    <span className={`inline-flex items-center gap-1 rounded-tile px-2 py-0.5 text-[11px] font-medium ${a.soft} ${a.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${a.dot}`} />
      {id}
      {prog && <span className="opacity-70">· {prog}</span>}
    </span>
  )
}

// ---- Tabs (visual) ------------------------------------------------------
export function Tabs({ tabs, active }) {
  return (
    <div className="flex items-center gap-1 border-b border-line">
      {tabs.map((t) => {
        const on = t.id === active
        return (
          <button
            key={t.id}
            className={`-mb-px border-b-2 px-3 py-2.5 text-[13px] font-medium transition ${
              on ? 'border-ink text-ink' : 'border-transparent text-ink-2 hover:text-ink'
            }`}
          >
            {t.label}
            {typeof t.count === 'number' && (
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] ${on ? 'bg-sunken text-ink' : 'bg-sunken text-ink-3'}`}>
                {t.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ---- Search field (visual) ---------------------------------------------
import { Search } from 'lucide-react'
export function SearchField({ placeholder = 'Search' }) {
  return (
    <div className="flex w-full max-w-sm items-center gap-2 rounded-tile border border-line bg-card px-3 py-2 text-ink-3">
      <Search size={16} />
      <input
        disabled
        placeholder={placeholder}
        className="w-full bg-transparent text-[13px] text-ink placeholder:text-ink-3 outline-none"
      />
    </div>
  )
}

// ---- Confidence meter (per-member AI "accuracy" = model confidence) ------
// Three rising bars, filled to `level` (0–3). Neutral ink so it doesn't read
// as a status colour alongside the red/amber Risk badge in the same row.
export function ConfidenceMeter({ level, label }) {
  return (
    <span className="inline-flex items-center gap-2" title={`AI confidence: ${label}`}>
      <span className="flex items-end gap-[3px]" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-[4px] rounded-sm ${i <= level ? 'bg-ink' : 'bg-line-strong'}`}
            style={{ height: 5 + i * 3 }}
          />
        ))}
      </span>
      <span className={`text-[12px] ${level === 0 ? 'text-ink-3' : 'text-ink-2'}`}>{label}</span>
    </span>
  )
}

// ---- Data table ---------------------------------------------------------
// Columns may set `sortable: true`; when `sort`/`onSort` are provided the header
// becomes a button with a sort chevron (double = inactive, up/down = active).
export function DataTable({ columns, rows, emptyText = 'No team members', minW, sort, onSort }) {
  return (
    <div className="overflow-x-auto rounded-card border border-line bg-card">
      <table className="w-full border-collapse text-left" style={minW ? { minWidth: minW } : undefined}>
        <thead>
          <tr className="border-b border-line">
            {columns.map((c) => {
              const active = sort && sort.key === c.key
              const Icon = active ? (sort.dir === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown
              return (
                <th key={c.key} className={`px-4 py-3 text-[12px] font-medium text-ink-3 ${c.thClass || ''}`}>
                  {c.sortable && onSort ? (
                    <button
                      type="button"
                      onClick={() => onSort(c.key)}
                      className={`-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 transition hover:text-ink ${active ? 'text-ink' : ''}`}
                    >
                      {c.header}
                      <Icon size={13} className={active ? 'text-ink' : 'text-ink-3'} />
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-[13px] text-ink-3">
                {emptyText}
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-line last:border-0 transition hover:bg-sunken/60">
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-3 align-middle text-[13px] text-ink ${c.tdClass || ''}`}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---- Initiative card ----------------------------------------------------
export function InitiativeCard({ ini }) {
  const hex = INI_HEX[ini.key]
  const a = INI_ACCENT[ini.key]
  return (
    <div className="rounded-card border border-line bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${a.dot}`} />
            <span className="text-[12px] font-medium text-ink-3">{ini.id}</span>
          </div>
          <h3 className="mt-1 truncate text-[15px] font-semibold text-ink">{ini.short}</h3>
        </div>
        {ini.early ? (
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-dashed border-line-strong text-[11px] font-medium text-ink-3">
            Early
          </span>
        ) : (
          <ProgressRing value={ini.score} color={hex} />
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-tile bg-sunken px-3 py-2">
          <div className="text-[18px] font-semibold text-ink">{ini.assigned}</div>
          <div className="text-[11px] text-ink-2">Assigned</div>
        </div>
        <div className="rounded-tile bg-sunken px-3 py-2">
          <div className={`text-[18px] font-semibold ${ini.behind > 0 ? 'text-bad' : 'text-ink'}`}>{ini.behind}</div>
          <div className="text-[11px] text-ink-2">Falling behind</div>
        </div>
      </div>
    </div>
  )
}

// ---- Page + section headers --------------------------------------------
export function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-[26px] font-semibold tracking-tight text-ink">{title}</h1>
      {subtitle && <p className="mt-1 text-[14px] text-ink-2">{subtitle}</p>}
    </div>
  )
}

export function SectionTitle({ children, note, action }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <h2 className="text-[15px] font-semibold text-ink">{children}</h2>
      {note && <InfoNote>{note}</InfoNote>}
      {action && <div className="ml-auto pl-3">{action}</div>}
    </div>
  )
}

// Right-aligned "View all X" text link (dark teal, underlined — matches reference).
export function ViewAllLink({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[14px] font-medium text-link underline underline-offset-2 transition hover:opacity-75"
    >
      {children}
    </button>
  )
}

export function InfoNote({ children }) {
  return (
    <span className="group relative inline-flex items-center">
      <Info size={14} className="text-ink-3" />
      <span className="pointer-events-none absolute left-5 top-1/2 z-10 w-64 -translate-y-1/2 rounded-tile border border-line bg-card px-3 py-2 text-[12px] leading-snug text-ink-2 opacity-0 shadow-lg transition group-hover:opacity-100">
        {children}
      </span>
    </span>
  )
}

export { INI_HEX, keyFor }
