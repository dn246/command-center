// Small token-based form primitives. The project had no form controls; these are
// the shared inputs used by the create-initiative wizard and member picker.
// Everything uses the @theme tokens (no hardcoded colors/radii).
import { Plus, Check, ChevronDown } from 'lucide-react'

// Square checkbox (for the book-criteria rows).
export function Checkbox({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${
        checked ? 'border-ink bg-ink text-card' : 'border-line-strong bg-card text-transparent hover:border-ink-3'
      }`}
    >
      <Check size={14} />
    </button>
  )
}

// Bumble-style selectable pill. Unselected shows a "+" to indicate adding;
// selected fills in with a check.
export function OptionPill({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium transition ${
        selected
          ? 'border-ink bg-ink text-card'
          : 'border-line bg-card text-ink hover:border-line-strong hover:bg-sunken'
      }`}
    >
      {selected ? <Check size={15} /> : <Plus size={15} className="text-ink-3" />}
      {label}
    </button>
  )
}

const FIELD =
  'w-full rounded-tile border border-line bg-card px-3 py-2.5 text-[14px] text-ink ' +
  'placeholder:text-ink-3 outline-none transition focus:border-link focus:ring-2 focus:ring-link/20'

export function FieldLabel({ children, htmlFor, hint }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-ink">
      {children}
      {hint && <span className="ml-2 font-normal text-ink-3">{hint}</span>}
    </label>
  )
}

export function TextInput({ className = '', ...props }) {
  return <input type="text" className={`${FIELD} ${className}`} {...props} />
}

export function NumberField({ className = '', ...props }) {
  return <input type="number" className={`${FIELD} ${className}`} {...props} />
}

export function DateField({ className = '', ...props }) {
  return <input type="date" className={`${FIELD} ${className}`} {...props} />
}

export function Textarea({ className = '', rows = 4, ...props }) {
  return <textarea rows={rows} className={`${FIELD} resize-none ${className}`} {...props} />
}

// Native select styled like the other fields. Shows the placeholder greyed out
// until a real value is picked; chevron is decorative (the select owns clicks).
export function SelectField({ className = '', placeholder, value, children, ...props }) {
  return (
    <div className="relative">
      <select
        value={value}
        className={`${FIELD} cursor-pointer appearance-none pr-10 ${value ? '' : 'text-ink-3'} ${className}`}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-3" />
    </div>
  )
}

const BTN = {
  primary: 'bg-ink text-card hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed',
  secondary: 'border border-line bg-card text-ink hover:bg-sunken disabled:opacity-40',
  ghost: 'text-ink-2 hover:bg-sunken hover:text-ink disabled:opacity-40',
}
export function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-semibold transition ${BTN[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
