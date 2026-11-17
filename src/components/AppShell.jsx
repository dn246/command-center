import { Home, Users, Flag, Bell, HelpCircle, ChevronDown } from 'lucide-react'
import { Avatar } from './ui'

const NAV = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'team', label: 'My Team', icon: Users },
  // Placeholder for this prototype — present in the nav but not navigable.
  { id: 'initiatives', label: 'Initiatives', icon: Flag, disabled: true },
]

function LeftNav({ page, setPage }) {
  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-r border-line bg-card">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="grid h-8 w-8 place-items-center rounded-tile bg-ink text-card">
          <span className="text-[15px] font-bold">C</span>
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-ink">Command Center</span>
      </div>

      <div className="px-3 pt-2">
        <div className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-ink-3">Workspace</div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const on = page === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => { if (!item.disabled) setPage(item.id) }}
                disabled={item.disabled}
                aria-disabled={item.disabled || undefined}
                aria-current={on ? 'page' : undefined}
                className={`flex items-center gap-2.5 rounded-tile px-3 py-2 text-[14px] font-medium transition ${
                  item.disabled
                    ? 'cursor-not-allowed text-ink-3 opacity-60'
                    : on
                      ? 'bg-sunken text-ink'
                      : 'text-ink-2 hover:bg-sunken/60 hover:text-ink'
                }`}
              >
                <Icon size={18} className={on && !item.disabled ? 'text-ink' : 'text-ink-3'} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

function TopHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-end gap-1 border-b border-line bg-card/80 px-6 backdrop-blur">
      <button className="grid h-9 w-9 place-items-center rounded-tile text-ink-3 transition hover:bg-sunken" aria-label="Help">
        <HelpCircle size={18} />
      </button>
      <button className="grid h-9 w-9 place-items-center rounded-tile text-ink-3 transition hover:bg-sunken" aria-label="Notifications">
        <Bell size={18} />
      </button>
      <div className="mx-2 h-6 w-px bg-line" />
      <button className="flex items-center gap-2.5 rounded-tile px-1.5 py-1.5 transition hover:bg-sunken">
        <Avatar name="Diana Nguyen" size={34} />
        <span className="text-left leading-tight">
          <span className="block text-[13px] font-semibold text-ink">Diana Nguyen</span>
          <span className="block text-[11px] text-ink-2">Enablement Lead</span>
          <span className="block text-[11px] text-ink-3">diana.nguyen@example.com</span>
        </span>
        <ChevronDown size={16} className="text-ink-3" />
      </button>
    </header>
  )
}

export default function AppShell({ page, setPage, children }) {
  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      <LeftNav page={page} setPage={setPage} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader />
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1200px] px-6 py-7">{children}</div>
        </main>
      </div>
    </div>
  )
}
