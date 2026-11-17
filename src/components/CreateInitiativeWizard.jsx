// Full-screen "build a new initiative" wizard (Gusto pattern): a top progress bar,
// a back chevron + centered title + close ✕, one centered screen of related fields
// at a time, and a primary Continue button bottom-right. Related fields are grouped
// into steps; the last data step is the member picker, then Review → Confirmation.
import { useMemo, useState } from 'react'
import { ChevronLeft, X, Check } from 'lucide-react'
import { useData } from '../lib/store'
import { eligibilityCatalog } from '../lib/teamData'
import { Avatar } from './ui'
import { Button, FieldLabel, TextInput, NumberField, DateField, Textarea, OptionPill } from './form'
import MemberPicker from './MemberPicker'

const EMPTY = { name: '', description: '', start: '', end: '', target: '', metric: '', eligibility: [] }

const STEPS = [
  { id: 'basics', title: 'Name your initiative' },
  { id: 'timeline', title: 'Set the timeline' },
  { id: 'goal', title: 'Set the goal' },
  { id: 'eligibility', title: 'Who is eligible?' },
  { id: 'assign', title: 'Assign team members' },
  { id: 'review', title: 'Review and launch' },
]

export default function CreateInitiativeWizard({ seedIds = [], onClose }) {
  const { members, createInitiative, assignMembers } = useData()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ ...EMPTY })
  const [addedIds, setAddedIds] = useState(seedIds)
  const [launched, setLaunched] = useState(null) // { id, count } once saved

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const toggleEligibility = (label) =>
    setForm((f) => ({
      ...f,
      eligibility: f.eligibility.includes(label)
        ? f.eligibility.filter((x) => x !== label)
        : [...f.eligibility, label],
    }))
  const dirty = useMemo(
    () =>
      addedIds.length > 0 ||
      form.eligibility.length > 0 ||
      Object.entries(form).some(([k, v]) => k !== 'eligibility' && String(v).trim() !== ''),
    [form, addedIds],
  )

  const canContinue = (() => {
    switch (STEPS[step].id) {
      case 'basics': return form.name.trim() !== ''
      case 'timeline': return form.start !== '' && form.end !== '' && form.end >= form.start
      case 'goal': return Number(form.target) > 0
      case 'eligibility': return form.eligibility.length > 0
      case 'assign': return addedIds.length > 0
      default: return true
    }
  })()

  const requestClose = () => {
    if (launched || !dirty || window.confirm('Discard this initiative? Your entries will be lost.')) {
      onClose()
    }
  }

  const launch = () => {
    const id = createInitiative({ ...form, eligible: form.eligibility.join(', ') })
    assignMembers(id, addedIds, { target: form.target })
    setLaunched({ id, count: addedIds.length })
  }

  const next = () => {
    if (!canContinue) return
    if (STEPS[step].id === 'review') launch()
    else setStep((s) => s + 1)
  }

  const progress = launched ? 100 : ((step + 1) / STEPS.length) * 100
  const wide = STEPS[step].id === 'assign'

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas">
      {/* Progress bar */}
      <div className="h-1 w-full bg-sunken">
        <div className="h-full bg-ink transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <div className="w-10">
          {!launched && step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              aria-label="Back"
              className="grid h-9 w-9 place-items-center rounded-tile text-ink-2 transition hover:bg-sunken hover:text-ink"
            >
              <ChevronLeft size={20} />
            </button>
          )}
        </div>
        <span className="text-[14px] font-semibold text-ink">New initiative</span>
        <div className="flex w-10 justify-end">
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-tile text-ink-2 transition hover:bg-sunken hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className={`mx-auto w-full ${wide ? 'max-w-3xl' : 'max-w-xl'}`}>
          {launched ? (
            <Confirmation form={form} launched={launched} onDone={onClose} />
          ) : (
            <>
              <h1 className="mb-1 text-[26px] font-semibold tracking-tight text-ink">{STEPS[step].title}</h1>
              <p className="mb-7 text-[14px] text-ink-2">Step {step + 1} of {STEPS.length}</p>
              <StepBody
                id={STEPS[step].id}
                form={form}
                set={set}
                toggleEligibility={toggleEligibility}
                members={members}
                addedIds={addedIds}
                setAddedIds={setAddedIds}
              />
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      {!launched && (
        <footer className="flex items-center justify-end border-t border-line bg-card px-6 py-4">
          <Button onClick={next} disabled={!canContinue}>
            {STEPS[step].id === 'review' ? 'Save and launch initiative' : 'Continue'}
          </Button>
        </footer>
      )}
    </div>
  )
}

function StepBody({ id, form, set, toggleEligibility, members, addedIds, setAddedIds }) {
  switch (id) {
    case 'basics':
      return (
        <div className="space-y-5">
          <div>
            <FieldLabel htmlFor="ini-name">Initiative name</FieldLabel>
            <TextInput id="ini-name" value={form.name} onChange={set('name')} placeholder="e.g. Winter Whitespace Sprint" autoFocus />
          </div>
          <div>
            <FieldLabel htmlFor="ini-desc" hint="optional">Description</FieldLabel>
            <Textarea id="ini-desc" value={form.description} onChange={set('description')} placeholder="What is this initiative about and why now?" />
          </div>
        </div>
      )
    case 'timeline':
      return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="ini-start">Start date</FieldLabel>
            <DateField id="ini-start" value={form.start} onChange={set('start')} />
          </div>
          <div>
            <FieldLabel htmlFor="ini-end">End date</FieldLabel>
            <DateField id="ini-end" value={form.end} onChange={set('end')} min={form.start || undefined} />
          </div>
        </div>
      )
    case 'goal':
      return (
        <div className="space-y-5">
          <div>
            <FieldLabel htmlFor="ini-target">Target per member</FieldLabel>
            <NumberField id="ini-target" value={form.target} onChange={set('target')} placeholder="e.g. 6" min={1} />
          </div>
          <div>
            <FieldLabel htmlFor="ini-metric" hint="what you're counting">Metric</FieldLabel>
            <TextInput id="ini-metric" value={form.metric} onChange={set('metric')} placeholder="e.g. client conversations" />
          </div>
        </div>
      )
    case 'eligibility':
      return <EligibilityPicker selected={form.eligibility} onToggle={toggleEligibility} />

    case 'assign':
      return (
        <>
          <p className="-mt-4 mb-5 text-[14px] text-ink-2">
            Members you selected are already added. Add or remove anyone before launching.
          </p>
          <MemberPicker members={members} addedIds={addedIds} onChange={setAddedIds} />
        </>
      )
    case 'review':
      return <Review form={form} members={members} addedIds={addedIds} />
    default:
      return null
  }
}

function EligibilityPicker({ selected, onToggle }) {
  const catalog = eligibilityCatalog()
  return (
    <div className="space-y-6">
      <p className="-mt-4 text-[14px] text-ink-2">
        Pick the criteria that define who qualifies. You still choose exactly who to assign next.
      </p>
      {catalog.map((grp) => (
        <div key={grp.group}>
          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-3">{grp.group}</div>
          <div className="flex flex-wrap gap-2">
            {grp.options.map((opt) => (
              <OptionPill
                key={opt.id}
                label={opt.label}
                selected={selected.includes(opt.label)}
                onClick={() => onToggle(opt.label)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-3 last:border-0">
      <span className="text-[13px] text-ink-3">{label}</span>
      <span className="max-w-[60%] text-right text-[14px] text-ink">{children || <span className="text-ink-3">—</span>}</span>
    </div>
  )
}

function Review({ form, members, addedIds }) {
  const added = addedIds.map((id) => members.find((m) => m.id === id)).filter(Boolean)
  return (
    <div className="space-y-6">
      <div className="rounded-card border border-line bg-card px-5 py-2">
        <Row label="Name">{form.name}</Row>
        <Row label="Description">{form.description}</Row>
        <Row label="Timeline">{form.start && form.end ? `${form.start} → ${form.end}` : null}</Row>
        <Row label="Goal">{Number(form.target) > 0 ? `${form.target} ${form.metric || 'activities'} per member` : null}</Row>
        <Row label="Eligibility">{form.eligibility.join(', ')}</Row>
      </div>
      <div>
        <div className="mb-2 text-[13px] font-medium text-ink">Assigning {added.length} {added.length === 1 ? 'member' : 'members'}</div>
        <div className="flex flex-wrap gap-2">
          {added.map((m) => (
            <span key={m.id} className="inline-flex items-center gap-2 rounded-full border border-line bg-card py-1 pl-1 pr-3">
              <Avatar name={m.display_name} size={24} />
              <span className="text-[13px] text-ink">{m.display_name}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function Confirmation({ form, launched, onDone }) {
  return (
    <div className="mx-auto max-w-md pt-6 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-good-soft text-good">
        <Check size={32} />
      </div>
      <h1 className="mt-5 text-[24px] font-semibold tracking-tight text-ink">Initiative launched</h1>
      <p className="mt-2 text-[14px] text-ink-2">
        <span className="font-medium text-ink">{form.name}</span> is live with{' '}
        {launched.count} {launched.count === 1 ? 'member' : 'members'} assigned
        {form.start && form.end ? `, running ${form.start} → ${form.end}` : ''}.
      </p>
      <div className="mt-7">
        <Button onClick={onDone} className="px-6">Done</Button>
      </div>
    </div>
  )
}
