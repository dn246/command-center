import { Plus } from 'lucide-react'
import { PageHeader, InitiativeCard } from '../components/ui'
import { Button } from '../components/form'
import { useData } from '../lib/store'

export default function InitiativesPage({ onCreateInitiative }) {
  const { initiativeStats } = useData()
  const inis = initiativeStats()

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Initiatives"
          subtitle="Create, assign, and track enablement initiatives across your team."
        />
        <Button onClick={() => onCreateInitiative?.([])} className="shrink-0">
          <Plus size={16} /> New initiative
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {inis.map((ini) => <InitiativeCard key={ini.id} ini={ini} />)}
      </div>
    </>
  )
}
