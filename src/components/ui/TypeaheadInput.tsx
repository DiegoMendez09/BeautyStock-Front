import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import type { TypeaheadEntity } from '../../api/typeahead'
import { useTypeaheadQuery } from '../../hooks/useTypeaheadQuery'
import type { TypeaheadItem } from '../../types'
import './TypeaheadInput.css'

interface TypeaheadInputProps {
  entity: TypeaheadEntity
  label: string
  placeholder?: string
  minLength?: number
  take?: number
  valueLabel?: string
  onSelect: (item: TypeaheadItem) => void
  onClear?: () => void
}

export function TypeaheadInput({
  entity,
  label,
  placeholder = 'Buscar...',
  minLength = 0,
  take = 20,
  valueLabel,
  onSelect,
  onClear,
}: TypeaheadInputProps) {
  const id = useId()
  const listId = `${id}-list`
  const rootRef = useRef<HTMLDivElement>(null)
  const [text, setText] = useState(valueLabel ?? '')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const { data: results = [], isFetching } = useTypeaheadQuery(entity, open ? text : '', {
    enabled: open,
    minLength,
    take,
  })

  useEffect(() => {
    if (valueLabel !== undefined) {
      setText(valueLabel)
    }
  }, [valueLabel])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const selectItem = (item: TypeaheadItem) => {
    setText(item.label)
    setOpen(false)
    setActiveIndex(-1)
    onSelect(item)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
      e.preventDefault()
      selectItem(results[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="typeahead" ref={rootRef}>
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <div className="typeahead__control">
        <input
          id={id}
          type="search"
          className="form-input typeahead__input"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={placeholder}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setOpen(true)
            setActiveIndex(-1)
            if (!e.target.value) onClear?.()
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {text && (
          <button
            type="button"
            className="typeahead__clear"
            aria-label="Limpiar"
            onClick={() => {
              setText('')
              setOpen(false)
              onClear?.()
            }}
          >
            ×
          </button>
        )}
      </div>
      {open && (
        <ul id={listId} className="typeahead__list" role="listbox">
          {isFetching && <li className="typeahead__hint">Buscando…</li>}
          {!isFetching && results.length === 0 && (
            <li className="typeahead__hint">Sin resultados</li>
          )}
          {results.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={`typeahead__option${index === activeIndex ? ' is-active' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectItem(item)}
              >
                <span className="typeahead__option-label">{item.label}</span>
                {item.secondary && (
                  <span className="typeahead__option-secondary">{item.secondary}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
