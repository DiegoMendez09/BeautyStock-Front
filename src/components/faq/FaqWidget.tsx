import { useEffect, useRef, useState, type FormEvent } from 'react'
import { searchFaq } from '../../api/faq'
import { Can } from '../auth/Can'
import { P } from '../../lib/permissions'
import type { FaqSearchResult } from '../../types'
import './FaqWidget.css'

type ChatMessage =
  | { id: string; role: 'bot' | 'user'; text: string }
  | { id: string; role: 'results'; items: FaqSearchResult[] }

const WELCOME =
  'Hola, soy el asistente de BeautyStock. Escribe tu duda (stock, ventas, login…) y te muestro artículos relacionados.'

const SUGGESTIONS = ['Cómo inicio sesión', 'stock mínimo', 'registrar una venta']

export function FaqWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'bot', text: WELCOME },
  ])
  const [busy, setBusy] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open, busy])

  const ask = async (raw: string) => {
    const q = raw.trim()
    if (!q || busy) return

    setInput('')
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', text: q }])
    setBusy(true)

    try {
      const items = await searchFaq(q)
      if (items.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'bot',
            text: 'No encontré artículos para eso. Prueba con otras palabras clave.',
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'bot',
            text: `Encontré ${items.length} resultado${items.length === 1 ? '' : 's'}:`,
          },
          { id: crypto.randomUUID(), role: 'results', items },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'bot',
          text: 'No pude consultar la ayuda ahora. Intenta de nuevo en un momento.',
        },
      ])
    } finally {
      setBusy(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    void ask(input)
  }

  return (
    <Can permission={P.Faq.View}>
      <button
        type="button"
        className="faq-widget__toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Asistente de ayuda"
        title="Asistente de ayuda"
      >
        {open ? '×' : '💬'}
      </button>

      {open && (
        <div className="faq-widget__panel" role="dialog" aria-label="Chat de ayuda">
          <div className="faq-widget__header">
            <div>
              <h3 className="faq-widget__title">Asistente BeautyStock</h3>
              <p className="faq-widget__status">{busy ? 'Buscando…' : 'En línea'}</p>
            </div>
          </div>

          <div className="faq-widget__messages" ref={listRef}>
            {messages.map((msg) => {
              if (msg.role === 'results') {
                return (
                  <div key={msg.id} className="faq-chat faq-chat--bot">
                    {msg.items.map((item) => (
                      <details key={item.faqArticleId} className="faq-chat__card">
                        <summary>{item.question}</summary>
                        <p>{item.answer}</p>
                        {item.categoryName && (
                          <span className="faq-chat__tag">{item.categoryName}</span>
                        )}
                      </details>
                    ))}
                  </div>
                )
              }

              return (
                <div
                  key={msg.id}
                  className={`faq-chat faq-chat--${msg.role}`}
                >
                  <div className="faq-chat__bubble">{msg.text}</div>
                </div>
              )
            })}
          </div>

          {messages.length <= 1 && (
            <div className="faq-widget__suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="faq-chip" onClick={() => void ask(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <form className="faq-widget__composer" onSubmit={handleSubmit}>
            <input
              type="text"
              className="form-input faq-widget__input"
              placeholder="Escribe tu pregunta…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
              autoFocus
            />
            <button type="submit" className="btn btn-primary faq-widget__send" disabled={busy || !input.trim()}>
              Enviar
            </button>
          </form>
        </div>
      )}
    </Can>
  )
}
