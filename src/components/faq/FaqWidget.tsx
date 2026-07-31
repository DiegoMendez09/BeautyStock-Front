import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { searchFaq } from '../../api/faq'
import { Can } from '../auth/Can'
import { P } from '../../lib/permissions'
import { useCartStore } from '../../stores/cartStore'
import { useChatStore, type ChatMessage } from '../../stores/chatStore'
import type { FaqProductCard } from '../../types'
import './FaqWidget.css'

const ADMIN_SUGGESTIONS = ['Cómo inicio sesión', 'stock mínimo', 'registrar una venta']
const STORE_SUGGESTIONS = ['labial', 'shampoo', 'crema hidratante']

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)
}

function ChatToggleIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden focusable="false">
        <path d="M18 6 6 18" strokeLinecap="round" />
        <path d="m6 6 12 12" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden focusable="false">
      <path
        d="M21 11.5a8.5 8.5 0 0 1-9.3 8.45L5 21l1.2-4.05A8.5 8.5 0 1 1 21 11.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ProductCards({
  items,
  enableCart,
}: {
  items: FaqProductCard[]
  enableCart: boolean
}) {
  const addItem = useCartStore((s) => s.addItem)
  const [addedId, setAddedId] = useState<number | null>(null)

  const handleAdd = (item: FaqProductCard) => {
    if (item.stockOnHand <= 0) return
    addItem({
      productVariantId: item.productVariantId,
      productId: item.productId,
      productName: item.productName,
      variantName: item.variantName,
      sku: item.sku,
      unitPrice: item.price,
      maxStock: item.stockOnHand,
      imageUrl: item.imageUrl,
      quantity: 1,
    })
    setAddedId(item.productVariantId)
    window.setTimeout(() => setAddedId((prev) => (prev === item.productVariantId ? null : prev)), 1800)
  }

  return (
    <div className="faq-chat faq-chat--bot">
      {items.map((item) => (
        <div key={item.productVariantId} className="faq-product-card">
          <div className="faq-product-card__body">
            <p className="faq-product-card__name">{item.productName}</p>
            <p className="faq-product-card__meta">
              {item.variantName}
              {item.sku ? ` · SKU ${item.sku}` : ''}
            </p>
            <p className="faq-product-card__price">{formatPrice(item.price)}</p>
            <p className="faq-product-card__stock">
              {item.stockOnHand > 0 ? `Stock: ${item.stockOnHand}` : 'Sin stock'}
            </p>
          </div>
          <div className="faq-product-card__actions">
            <Link
              to={`/tienda/producto/${item.productId}`}
              className="faq-product-card__link"
            >
              Ver producto
            </Link>
            {enableCart && (
              <button
                type="button"
                className="btn btn-primary faq-product-card__add"
                disabled={item.stockOnHand <= 0}
                onClick={() => handleAdd(item)}
              >
                {addedId === item.productVariantId ? 'Agregado' : 'Agregar al carrito'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function ChatPanel({ variant }: { variant: 'admin' | 'store' }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const messages = useChatStore((s) => s.messages)
  const ensureFresh = useChatStore((s) => s.ensureFresh)
  const appendMessages = useChatStore((s) => s.appendMessages)
  const resetConversation = useChatStore((s) => s.resetConversation)
  const touch = useChatStore((s) => s.touch)

  const enableCart = variant === 'store'
  const suggestions = variant === 'store' ? STORE_SUGGESTIONS : ADMIN_SUGGESTIONS
  const showSuggestions = messages.length <= 1

  useEffect(() => {
    ensureFresh()
  }, [ensureFresh])

  useEffect(() => {
    if (!open) return
    touch()
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open, busy, touch])

  const ask = async (raw: string) => {
    const q = raw.trim()
    if (!q || busy) return

    ensureFresh()
    setInput('')
    appendMessages([{ id: crypto.randomUUID(), role: 'user', text: q }])
    setBusy(true)

    try {
      const result = await searchFaq(q)
      const next: ChatMessage[] = []
      const articleCount = result.articles.length
      const productCount = result.products.length

      if (articleCount === 0 && productCount === 0) {
        next.push({
          id: crypto.randomUUID(),
          role: 'bot',
          text: 'No encontré artículos ni productos para eso. Prueba con otras palabras clave.',
        })
      } else {
        const parts: string[] = []
        if (productCount > 0) {
          parts.push(
            `${productCount} producto${productCount === 1 ? '' : 's'}`,
          )
        }
        if (articleCount > 0) {
          parts.push(
            `${articleCount} artículo${articleCount === 1 ? '' : 's'} de ayuda`,
          )
        }
        next.push({
          id: crypto.randomUUID(),
          role: 'bot',
          text: `Encontré ${parts.join(' y ')}:`,
        })
        if (productCount > 0) {
          next.push({ id: crypto.randomUUID(), role: 'products', items: result.products })
        }
        if (articleCount > 0) {
          next.push({ id: crypto.randomUUID(), role: 'results', items: result.articles })
        }
      }

      appendMessages(next)
    } catch {
      appendMessages([
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

  const handleNewConversation = () => {
    resetConversation()
    setInput('')
  }

  return (
    <>
      <button
        type="button"
        className={`faq-widget__toggle${variant === 'store' ? ' faq-widget__toggle--store' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Cerrar asistente' : 'Asistente de ayuda'}
        title="Asistente BeautyStock"
        aria-expanded={open}
      >
        <ChatToggleIcon open={open} />
      </button>

      {open && (
        <div
          className={`faq-widget__panel${variant === 'store' ? ' faq-widget__panel--store' : ''}`}
          role="dialog"
          aria-label="Chat de ayuda"
        >
          <div className="faq-widget__header">
            <div>
              <h3 className="faq-widget__title">Asistente BeautyStock</h3>
              <p className="faq-widget__status">{busy ? 'Buscando…' : 'En línea'}</p>
            </div>
            <button
              type="button"
              className="faq-widget__new"
              onClick={handleNewConversation}
              title="Nueva conversación"
            >
              Nueva conversación
            </button>
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

              if (msg.role === 'products') {
                return (
                  <ProductCards key={msg.id} items={msg.items} enableCart={enableCart} />
                )
              }

              return (
                <div key={msg.id} className={`faq-chat faq-chat--${msg.role}`}>
                  <div className="faq-chat__bubble">{msg.text}</div>
                </div>
              )
            })}
          </div>

          {showSuggestions && (
            <div className="faq-widget__suggestions">
              {suggestions.map((s) => (
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
              placeholder={
                variant === 'store'
                  ? 'Pregunta por un producto…'
                  : 'Escribe tu pregunta…'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
              autoFocus
            />
            <button
              type="submit"
              className="btn btn-primary faq-widget__send"
              disabled={busy || !input.trim()}
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export type FaqWidgetVariant = 'admin' | 'store'

export function FaqWidget({ variant = 'admin' }: { variant?: FaqWidgetVariant }) {
  if (variant === 'store') {
    return <ChatPanel variant="store" />
  }

  return (
    <Can permission={P.Faq.View}>
      <ChatPanel variant="admin" />
    </Can>
  )
}
