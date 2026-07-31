import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { searchFaq } from '../../api/faq'
import type { FaqSearchResult } from '../../types'
import './FaqWidget.css'

export function FaqWidget() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FaqSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const response = await searchFaq(searchQuery.trim())
      setResults(response)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      void performSearch(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, performSearch])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    void performSearch(query)
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
            {loading && (
              <div className="faq-widget__loading">
                <div className="spinner" />
              </div>
            )}
            {!loading && query && results.length === 0 && (
              <div className="faq-widget__empty">No se encontraron resultados</div>
            )}
            {!loading &&
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
            {!loading && !query && (
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
