import type { HTMLAttributes, ReactNode } from 'react'

type DataListProps = {
  children: ReactNode
  /** Nombre accesible de la región (listas administrativas). */
  label?: string
  className?: string
} & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'>

/**
 * Contenedor de tablas que en viewports estrechos convierte cada fila
 * en una tarjeta apilada (label/valor vía `data-label` en cada `<td>`).
 *
 * Uso:
 * ```tsx
 * <DataList label="Clientes">
 *   <table className="data-table">...</table>
 * </DataList>
 * ```
 * En cada celda: `<td data-label="Nombre">…</td>`
 * Acciones sin etiqueta: `<td data-label="" className="data-table__actions">…</td>`
 * Fila a ancho completo (p. ej. detalle expandido): `<td colSpan={n} className="data-table__expand">`
 */
export function DataList({ children, label, className, ...rest }: DataListProps) {
  const classes = ['table-wrapper', 'table-wrapper--cards', className].filter(Boolean).join(' ')

  return (
    <div
      className={classes}
      role={label ? 'region' : undefined}
      aria-label={label}
      {...rest}
    >
      {children}
    </div>
  )
}
