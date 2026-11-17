import { Flag } from 'lucide-react'
import { PageHeader } from '../components/ui'

export default function InitiativesPage() {
  return (
    <>
      <PageHeader
        title="Initiatives"
        subtitle="Create, assign, and track enablement initiatives across your team."
      />
      <div className="grid place-items-center rounded-card border border-dashed border-line-strong bg-card py-20 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-sunken text-ink-3">
          <Flag size={22} />
        </div>
        <h2 className="mt-4 text-[16px] font-semibold text-ink">Initiatives management is coming soon</h2>
        <p className="mt-1 max-w-sm text-[13px] text-ink-2">
          This is where the lead will build initiatives, set targets, and assign or unassign team
          members. Scoped for a later pass — the page exists here to hold its place in the navigation.
        </p>
      </div>
    </>
  )
}
