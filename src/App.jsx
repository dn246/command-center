import { useState, useEffect } from 'react'
import AppShell from './components/AppShell'
import HomePage from './pages/HomePage'
import MyTeamPage from './pages/MyTeamPage'
import InitiativesPage from './pages/InitiativesPage'
import CreateInitiativeWizard from './components/CreateInitiativeWizard'
import DataViewer from './legacy/DataViewer'

export default function App() {
  const [page, setPage] = useState('home')
  const [hash, setHash] = useState(window.location.hash)
  // null = closed; an array of member ids = wizard open, Added list pre-seeded.
  const [wizardSeed, setWizardSeed] = useState(null)

  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Raw data inspector, kept out of the main nav.
  if (hash === '#data') return <DataViewer />

  const openWizard = (ids = []) => setWizardSeed(ids)

  return (
    <>
      <AppShell page={page} setPage={setPage}>
        {page === 'home' && <HomePage setPage={setPage} />}
        {page === 'team' && <MyTeamPage onCreateInitiative={openWizard} />}
        {page === 'initiatives' && <InitiativesPage />}
      </AppShell>

      {wizardSeed !== null && (
        <CreateInitiativeWizard
          seedIds={wizardSeed}
          onClose={() => {
            setWizardSeed(null)
            setPage('team')
          }}
        />
      )}
    </>
  )
}
