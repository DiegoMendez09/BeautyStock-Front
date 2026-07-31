import { useState, type InputHTMLAttributes } from 'react'
import './PasswordInput.css'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
}

export function PasswordInput({
  label,
  id,
  className,
  ...inputProps
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const inputId = id ?? 'password'

  return (
    <div className="form-group">
      <label className="form-label" htmlFor={inputId}>
        {label}
      </label>
      <div className="password-input__control">
        <input
          {...inputProps}
          id={inputId}
          type={visible ? 'text' : 'password'}
          className={`form-input password-input__field${className ? ` ${className}` : ''}`}
        />
        <button
          type="button"
          className="password-input__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A9.8 9.8 0 0112 5c5 0 9.3 3.1 11 7.5a11.5 11.5 0 01-4.1 4.9M6.1 6.1A11.5 11.5 0 001 12.5C2.7 16.9 7 20 12 20a9.8 9.8 0 005.1-1.4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M1 12.5C2.7 8.1 7 5 12 5s9.3 3.1 11 7.5C21.3 16.9 17 20 12 20S2.7 16.9 1 12.5z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12.5" r="3" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
