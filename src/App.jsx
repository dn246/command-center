import { useMemo, useState } from 'react'
import data from './data/command_center_data.json'
import csvRaw from './data/command_center_data_flat.csv?raw'

// --- minimal CSV parser (handles quoted fields with commas) ---
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += c
    }
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ''))
}

function Tab({ id, active, onClick, children }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={
        'rounded-xl px-4 py-2 text-sm font-medium transition ' +
        (active
          ? 'bg-slate-900 text-white'
          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200')
      }
    >
      {children}
    </button>
  )
}

function CsvTable({ rows, query }) {
  const [header, ...body] = rows
  const filtered = useMemo(() => {
    if (!query) return body
    const q = query.toLowerCase()
    return body.filter((r) => r.some((cell) => cell.toLowerCase().includes(q)))
  }, [body, query])

  return (
    <div className="overflow-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full border-collapse text-left text-xs">
        <thead className="sticky top-0 bg-slate-50">
          <tr>
            {header.map((h, i) => (
              <th
                key={i}
                className="whitespace-nowrap border-b border-slate-200 px-3 py-2 font-semibold text-slate-700"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((r, ri) => (
            <tr key={ri} className="odd:bg-white even:bg-slate-50/50 hover:bg-amber-50">
              {header.map((_, ci) => (
                <td
                  key={ci}
                  className="whitespace-nowrap border-b border-slate-100 px-3 py-1.5 text-slate-600"
                >
                  {r[ci] === '' ? <span className="text-slate-300">null</span> : r[ci]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('csv')
  const [query, setQuery] = useState('')
  const rows = useMemo(() => parseCsv(csvRaw), [])
  const dataRowCount = rows.length - 1

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-6 py-5">
          <h1 className="text-xl font-semibold tracking-tight">The Command Center — Data Package</h1>
          <p className="mt-1 text-sm text-slate-500">
            {data.meta?.title ? data.meta.title + ' · ' : ''}
            as of {data.meta?.as_of_date ?? '—'} · {data.team_members?.length ?? 0} team members ·{' '}
            {data.initiatives?.length ?? 0} initiatives · {dataRowCount} CSV rows
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            <Tab id="csv" active={tab === 'csv'} onClick={setTab}>
              CSV (flat)
            </Tab>
            <Tab id="json" active={tab === 'json'} onClick={setTab}>
              JSON (nested)
            </Tab>
          </div>
          {tab === 'csv' && (
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter rows…"
              className="ml-auto w-64 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          )}
        </div>

        {tab === 'csv' ? (
          <CsvTable rows={rows} query={query} />
        ) : (
          <pre className="max-h-[75vh] overflow-auto rounded-2xl border border-slate-200 bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
