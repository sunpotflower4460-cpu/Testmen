import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PremiumProvider } from './lib/usePremium'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <PremiumProvider>
        <App />
      </PremiumProvider>
    </ErrorBoundary>
  </StrictMode>,
)
