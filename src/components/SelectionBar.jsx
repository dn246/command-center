// Google-Drive-style bulk action bar. Appears under the page header once one or
// more team members are selected. Only "Assign to new initiative" is wired
// end-to-end; "Assign to existing" and "Outreach" are visual stubs for this pass.
import { X, Flag, FolderInput, Mail } from 'lucide-react'

function Action({ icon: Icon, label, onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="inline-flex items-center gap-1.5 rounded-tile px-2.5 py-1.5 text-[13px] font-medium text-ink-2 transition hover:bg-sunken hover:text-ink"
    >
      <Icon size={16} />
      {label}
    </button>
  )
}

export default function SelectionBar({ count, onCancel, onAssignNew, onAssignExisting, onOutreach, stubMsg }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-1 rounded-tile border border-line bg-card px-2.5 py-2 shadow-sm">
      <button
        type="button"
        onClick={onCancel}
        aria-label="Clear selection"
        className="grid h-8 w-8 place-items-center rounded-tile text-ink-2 transition hover:bg-sunken hover:text-ink"
      >
        <X size={18} />
      </button>
      <span className="mr-1 text-[14px] font-semibold text-ink">{count} selected</span>
      <span className="mx-1 h-5 w-px bg-line" />
      <Action icon={Flag} label="Assign to new initiative" onClick={onAssignNew} />
      <Action icon={FolderInput} label="Assign to existing" onClick={onAssignExisting} title="Coming soon" />
      <Action icon={Mail} label="Outreach" onClick={onOutreach} title="Coming soon" />
      {stubMsg && <span className="ml-auto pl-2 text-[12px] italic text-ink-3">{stubMsg}</span>}
    </div>
  )
}
