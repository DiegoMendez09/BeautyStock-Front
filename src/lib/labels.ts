/** Etiquetas en español para códigos internos mostrados en la UI. */

export function paymentMethodLabel(code: string): string {
  switch (code.toLowerCase()) {
    case 'cash':
      return 'Efectivo'
    case 'card':
      return 'Tarjeta'
    case 'transfer':
      return 'Transferencia'
    case 'mixed':
      return 'Mixto'
    default:
      return code
  }
}

export function saleStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'Completada'
    case 'cancelled':
    case 'canceled':
      return 'Cancelada'
    default:
      return status
  }
}

export function severityLabel(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'warning':
      return 'Advertencia'
    case 'info':
      return 'Información'
    case 'error':
      return 'Error'
    case 'critical':
      return 'Crítica'
    default:
      return severity
  }
}

export function roleLabel(role: string): string {
  switch (role) {
    case 'SuperAdministrator':
      return 'Superadministrador'
    case 'Administrator':
      return 'Administrador'
    case 'Customer':
      return 'Cliente'
    case 'Support':
      return 'Soporte'
    default:
      return role
  }
}
