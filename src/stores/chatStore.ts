import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FaqProductCard, FaqSearchResult } from '../types'

/** Inactividad máxima antes de reiniciar la conversación (45 min). */
export const CHAT_TTL_MS = 45 * 60 * 1000

export const CHAT_WELCOME =
  'Hola, soy el asistente de BeautyStock. Pregúntame por productos, precios, stock o dudas del sistema.'

export type ChatMessage =
  | { id: string; role: 'bot' | 'user'; text: string }
  | { id: string; role: 'results'; items: FaqSearchResult[] }
  | { id: string; role: 'products'; items: FaqProductCard[] }

function freshSession(): Pick<ChatState, 'sessionId' | 'messages' | 'lastActivityAt'> {
  return {
    sessionId: crypto.randomUUID(),
    messages: [{ id: 'welcome', role: 'bot', text: CHAT_WELCOME }],
    lastActivityAt: Date.now(),
  }
}

interface ChatState {
  sessionId: string
  messages: ChatMessage[]
  lastActivityAt: number
  ensureFresh: () => void
  appendMessages: (msgs: ChatMessage[]) => void
  setMessages: (msgs: ChatMessage[]) => void
  touch: () => void
  resetConversation: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      ...freshSession(),
      ensureFresh: () => {
        const { lastActivityAt } = get()
        if (!lastActivityAt || Date.now() - lastActivityAt > CHAT_TTL_MS) {
          set(freshSession())
        }
      },
      appendMessages: (msgs) =>
        set((state) => ({
          messages: [...state.messages, ...msgs],
          lastActivityAt: Date.now(),
        })),
      setMessages: (msgs) =>
        set({
          messages: msgs,
          lastActivityAt: Date.now(),
        }),
      touch: () => set({ lastActivityAt: Date.now() }),
      resetConversation: () => set(freshSession()),
    }),
    {
      name: 'bs-faq-chat',
      partialize: (state) => ({
        sessionId: state.sessionId,
        messages: state.messages,
        lastActivityAt: state.lastActivityAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.ensureFresh()
      },
    },
  ),
)
