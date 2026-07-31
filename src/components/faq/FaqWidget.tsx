import { useState, type FormEvent } from 'react'
import { useFaqSearchQuery } from '../../hooks/useFaqQuery'
import './FaqWidget.css'

export function FaqWidget() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const { data: results = [], isFetching } = useFaqSearchQuery(query, open)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
  }

  return (
    <>
      <button
        type="button"
        className="faq-widget__toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Ayuda"
        title="Ayuda"
      >
        ?
      </button>

      {open && (
        <div className="faq-widget__panel">
          <div className="faq-widget__header">
            <h3 className="faq-widget__title">Centro de ayuda</h3>
          </div>
          <form className="faq-widget__search" onSubmit={handleSubmit}>
            <input
              type="search"
              className="form-input"
              placeholder="Buscar en preguntas frecuentes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </form>
          <div className="faq-widget__results">
            {isFetching && (
              <div className="faq-widget__loading">
                <div className="spinner" />
              </div>
            )}
            {!isFetching && query && results.length === 0 && (
              <div className="faq-widget__empty">No se encontraron resultados</div>
            )}
            {!isFetching &&
              results.map((item) => (
                <div
                  key={item.faqArticleId}
                  className="faq-widget__item"
                  onClick={() =>
                    setExpandedId((prev) =>
                      prev === item.faqArticleId ? null : item.faqArticleId,
                    )
                  }
                >
                  <div className="faq-widget__question">{item.question}</div>
                  {expandedId === item.faqArticleId && (
                    <div className="faq-widget__answer">{item.answer}</div>
                  )}
                </div>
              ))}
            {!isFetching && !query && (
              <div className="faq-widget__empty">
                Escribe para buscar ayuda sobre el sistema
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
