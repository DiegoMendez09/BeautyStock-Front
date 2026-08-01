import { paymentMethodLabel } from './labels'

/** Código de método de pago (alineado con el API). */
export type PaymentMethodCode = string

export type PaymentMethodOption = {
  code: PaymentMethodCode
  label: string
}

/** Fallback local si aún no cargó payment-config (solo Efectivo). */
export const DEFAULT_PAYMENT_METHODS: PaymentMethodOption[] = [
  { code: 'Cash', label: 'Efectivo' },
]

/** Normaliza la respuesta del API a opciones de UI. */
export function toPaymentMethodOptions(
  methods: { code: string; label?: string }[] | undefined,
): PaymentMethodOption[] {
  if (!methods?.length) return DEFAULT_PAYMENT_METHODS
  return methods.map((m) => ({
    code: m.code,
    label: m.label?.trim() || paymentMethodLabel(m.code),
  }))
}
