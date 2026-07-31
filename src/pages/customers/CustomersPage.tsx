import { useState } from 'react'
import { TypeaheadInput } from '../../components/ui/TypeaheadInput'
import type { TypeaheadItem } from '../../types'

export function CustomersPage() {
  const [selected, setSelected] = useState<TypeaheadItem | null>(null)

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Clientes</h1>
        <p className="page-subtitle">Búsqueda typeahead sobre el dataset de clientes</p>
      </header>

      <div className="page-filters" style={{ maxWidth: 420 }}>
        <TypeaheadInput
          entity="customers"
          label="Buscar cliente"
          placeholder="Nombre o correo..."
          minLength={1}
          valueLabel={selected?.label ?? ''}
          onSelect={setSelected}
          onClear={() => setSelected(null)}
        />
      </div>

      {selected ? (
        <div className="card">
          <h2 className="card-title">{selected.label}</h2>
          <p>ID: {selected.id}</p>
          {selected.secondary && <p>{selected.secondary}</p>}
        </div>
      ) : (
        <div className="empty-state">Escribe para localizar un cliente sin cargar el listado completo</div>
      )}
    </div>
  )
}
