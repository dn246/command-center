// Selectors over the synthetic Command Center dataset.
// All category/score definitions live here (see "assumptions" in each block).
import data from '../data/command_center_data.json'

export const meta = data.meta
export const initiatives = data.initiatives
export const members = data.team_members

const ACTIVE = new Set(['assigned', 'accepted', 'started', 'completed'])
const ON_PACE = (meta?.period?.expected_linear_attainment_pct ?? 43.5) / 100

// Short, human names + accent key per initiative.
export const INI = {
  'INI-01': { short: 'Seasonal Push', key: 'ini01' },
  'INI-02': { short: 'Dormant Reactivation', key: 'ini02' },
  'INI-03': { short: 'Whitespace Sprint', key: 'ini03' },
  'INI-04': { short: 'New Member Ramp', key: 'ini04' },
}

export const EL_NAME = 'Diana' // the enablement lead viewing the workspace

// --- per-member helpers --------------------------------------------------
const activeEntries = (m) =>
  Object.entries(m.initiatives).filter(([, v]) => ACTIVE.has(v.status))

export const isAssigned = (m) => activeEntries(m).length > 0
export const isUnassigned = (m) => !isAssigned(m)
export const isNew = (m) => m.profile.tenure_band === '0-1 yr'

// Assumption: "needs attention" = high disengagement risk, OR an urgent
// priority score (>=70), OR any data/other flag raised on the member.
export const needsAttention = (m) =>
  m.ai.disengagement_risk === 'high' ||
  (typeof m.ai.priority_score === 'number' && m.ai.priority_score >= 70) ||
  (Array.isArray(m.flags) && m.flags.length > 0)

export const priority = (m) =>
  typeof m.ai.priority_score === 'number' ? m.ai.priority_score : -1

// --- labels --------------------------------------------------------------
export function nbaLabel(nba) {
  if (!nba || !nba.type) return { text: '—', muted: true }
  const map = {
    monitor: 'Monitor',
    schedule_coaching: 'Schedule coaching',
    unstall_opportunities: 'Unstall opportunities',
    join_initiative: 'Join initiative',
  }
  let text = map[nba.type] ?? nba.type
  if (nba.type === 'join_initiative' && nba.initiative_id && INI[nba.initiative_id]) {
    text = `Join · ${INI[nba.initiative_id].short}`
  }
  return { text, type: nba.type }
}

// Order risk for sorting: high is "worst" (highest). Unknown/null sorts lowest.
export const RISK_RANK = { high: 3, medium: 2, low: 1 }
export const riskRank = (risk) => RISK_RANK[risk] ?? 0

// Per-member AI "accuracy" = the model's own confidence rating (its self-assessed
// data completeness/freshness). No ground-truth accuracy exists in the data.
export const CONF_RANK = { high: 3, medium: 2, low: 1, insufficient_data: 0 }
export const confRank = (c) => CONF_RANK[c] ?? 0
export function confMeta(c) {
  switch (c) {
    case 'high': return { label: 'High', level: 3 }
    case 'medium': return { label: 'Medium', level: 2 }
    case 'low': return { label: 'Low', level: 1 }
    default: return { label: 'Insufficient', level: 0 }
  }
}

export function riskMeta(risk) {
  switch (risk) {
    case 'high':
      return { label: 'High', tone: 'bad' }
    case 'medium':
      return { label: 'Medium', tone: 'warn' }
    case 'low':
      return { label: 'Low', tone: 'good' }
    default:
      return { label: '—', tone: 'muted' }
  }
}

// Row shape consumed by the tables.
export function toRow(m) {
  return {
    id: m.id,
    name: m.display_name,
    tenureBand: m.profile.tenure_band,
    segment: m.profile.segment,
    risk: m.ai.disengagement_risk,
    confidence: m.ai?.confidence ?? null,
    priority: priority(m),
    initiatives: activeEntries(m).map(([id, v]) => ({
      id,
      progress: typeof v.progress === 'number' ? v.progress : null,
      target: v.target ?? null,
      status: v.status,
    })),
    nba: nbaLabel(m.ai.next_best_action),
    reasoning: Array.isArray(m.ai.reason_codes) ? m.ai.reason_codes : [],
  }
}

const byName = (a, b) => a.name.localeCompare(b.name)
const byPriority = (a, b) => b.priority - a.priority

// --- aggregate selectors -------------------------------------------------
export function overview(mem = members, inis = initiatives) {
  const assigned = mem.filter(isAssigned).length
  return {
    members: mem.length,
    initiatives: inis.length,
    assigned,
    unassigned: mem.length - assigned,
  }
}

export function initiativeStats(inis = initiatives, mem = members) {
  return inis.map((ini) => {
    const rows = mem.map((m) => m.initiatives[ini.id] || {})
    const active = rows.filter((r) => ACTIVE.has(r.status))
    const numeric = active.filter(
      (r) => typeof r.progress === 'number' && r.target,
    )
    const sumP = numeric.reduce((s, r) => s + r.progress, 0)
    const sumT = numeric.reduce((s, r) => s + r.target, 0)
    const completed = active.filter((r) => r.status === 'completed').length
    const behind = numeric.filter(
      (r) => r.status !== 'completed' && r.progress / r.target < ON_PACE,
    ).length
    // Assumption: score = total progress / total target across assigned members.
    // When no assigned member has started (sumT 0), the initiative is "early".
    const score = sumT > 0 ? Math.round((100 * sumP) / sumT) : null
    return {
      id: ini.id,
      name: ini.name,
      short: ini.short ?? INI[ini.id]?.short ?? ini.name,
      key: ini.key ?? INI[ini.id]?.key ?? 'ini01',
      metric: ini.metric,
      targetPerMember: ini.target_per_member,
      assigned: active.length,
      completed,
      behind,
      score,
      // No progress accumulated yet (e.g. the ramp just started) → show "Early", not 0%.
      early: sumP === 0,
    }
  })
}

// Assumption: the dataset has no ground-truth "accuracy", so we surface the
// model's own confidence rating (its self-assessed data completeness/freshness)
// as the honest stand-in. Null confidence is counted as insufficient_data.
export function aiConfidence(mem = members) {
  const levels = { high: 0, medium: 0, low: 0, insufficient_data: 0 }
  for (const m of mem) {
    const c = m.ai?.confidence
    if (c && c in levels) levels[c] += 1
    else levels.insufficient_data += 1
  }
  const total = mem.length
  return {
    total,
    ...levels,
    pctHigh: Math.round((100 * levels.high) / total),
    pctUsable: Math.round((100 * (levels.high + levels.medium)) / total),
  }
}

// Premade eligibility criteria, linked to the data model. Segment and tenure
// options are derived from the actual team; book criteria are a checkable field
// plus a threshold the lead enters. Each selected criterion is a structured
// object so it can be matched against members (for the recommendation tooltip).
export function eligibilityOptions(mem = members) {
  const segments = [...new Set(mem.map((m) => m.profile?.segment).filter(Boolean))].sort()
  const tenures = [...new Set(mem.map((m) => m.profile?.tenure_band).filter(Boolean))].sort()
  return {
    segment: segments.map((s) => ({ id: `segment:${s}`, type: 'segment', value: s, label: s })),
    tenure: tenures.map((t) => ({ id: `tenure:${t}`, type: 'tenure', value: t, label: `Tenure ${t}` })),
  }
}

// Metrics the system already tracks — the things an initiative can count. The
// first four are the metric types the seeded initiatives (INI-01…04) use; the
// rest are per-member activity/book series the dataset records. The initiative
// stores the metric `id`; `metricLabel` renders it for people.
export const METRIC_OPTIONS = [
  { id: 'client_conversations', label: 'Client conversations' },
  { id: 'dormant_clients_contacted', label: 'Dormant clients contacted' },
  { id: 'proposals_sent', label: 'Proposals sent' },
  { id: 'ramp_milestones_completed', label: 'Ramp milestones completed' },
  { id: 'meetings_held', label: 'Meetings held' },
  { id: 'whitespace_clients_converted', label: 'Whitespace clients converted' },
]

export function metricLabel(id) {
  return METRIC_OPTIONS.find((m) => m.id === id)?.label ?? id
}

// Book criteria the lead checks and gives a threshold to. Defaults mirror the
// criteria the seeded initiatives (INI-01…04) already use.
export const BOOK_FIELDS = [
  { id: 'active_clients', label: 'Active clients', defaultValue: 20 },
  { id: 'dormant_clients', label: 'Dormant clients', defaultValue: 10 },
  { id: 'whitespace_clients', label: 'Whitespace clients', defaultValue: 5 },
]

// Does a member satisfy a single structured criterion?
export function criterionMatches(member, c) {
  if (c.type === 'segment') return member.profile?.segment === c.value
  if (c.type === 'tenure') return member.profile?.tenure_band === c.value
  if (c.type === 'book') return (member.book?.[c.field] ?? 0) >= Number(c.value)
  return false
}

export function matchedCriteria(member, criteria = []) {
  return criteria.filter((c) => criterionMatches(member, c))
}

// Is a member actually eligible under the chosen criteria? Multi-select pills of
// the same kind are "any of" (match Core OR Developing), while different kinds
// must all hold (segment AND tenure AND each book threshold). No criteria → all
// members qualify.
export function meetsCriteria(member, criteria = []) {
  if (!criteria.length) return true
  const groups = {}
  for (const c of criteria) {
    const key = c.type === 'book' ? `book:${c.field}` : c.type
    ;(groups[key] ||= []).push(c)
  }
  return Object.values(groups).every((group) => group.some((c) => criterionMatches(member, c)))
}

// How fresh is this member's activity data (data_quality.activity_data_age_days).
export function dataAgeLabel(member) {
  const d = member.data_quality?.activity_data_age_days
  if (d == null) return 'Unknown'
  if (d === 0) return 'Today'
  return `${d} day${d === 1 ? '' : 's'} ago`
}

export function buckets(mem = members) {
  const rows = mem.map(toRow)
  const all = [...rows].sort(byName)
  const attn = mem.filter(needsAttention).map(toRow).sort(byPriority)
  const unassigned = mem.filter(isUnassigned).map(toRow).sort(byName)
  const fresh = mem.filter(isNew).map(toRow).sort(byName)
  return { all, needsAttention: attn, unassigned, new: fresh }
}
