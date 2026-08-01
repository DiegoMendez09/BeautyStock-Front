import type { PaymentMethodOption } from '../../lib/paymentMethods'
import { DEFAULT_PAYMENT_METHODS } from '../../lib/paymentMethods'
import './PaymentMethodPicker.css'

type Props = {
  name: string
  value: string
  onChange: (value: string) => void
  /** Métodos habilitados (desde payment-config). */
  methods?: PaymentMethodOption[]
}

/** Radios accesibles según métodos habilitados por el API. */
export function PaymentMethodPicker({ name, value, onChange, methods }: Props) {
  const options = methods?.length ? methods : DEFAULT_PAYMENT_METHODS

  return (
    <fieldset className="payment-method-picker">
      <legend className="form-label">Método de pago</legend>
      <div className="payment-method-picker__options" role="radiogroup" aria-label="Método de pago">
        {options.map((method) => {
          const id = `${name}-${method.code}`
          return (
            <label key={method.code} className="payment-method-picker__option" htmlFor={id}>
              <input
                id={id}
                type="radio"
                name={name}
                value={method.code}
                checked={value === method.code}
                onChange={() => onChange(method.code)}
              />
              <span>{method.label}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
