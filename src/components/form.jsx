// Small token-based form primitives. The project had no form controls; these are
// the shared inputs used by the create-initiative wizard and member picker.
// Everything uses the @theme tokens (no hardcoded colors/radii).

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
