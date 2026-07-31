import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { queryClient } from './lib/queryClient'
import { useAuthStore } from './stores/authStore'
import './styles/global.css'

function BootstrapAuth({ children }: { children: React.ReactNode }) {
  const bootstrap = useAuthStore((s) => s.bootstrap)

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  return children
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BootstrapAuth>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </BootstrapAuth>
    </QueryClientProvider>
  </StrictMode>,
)
