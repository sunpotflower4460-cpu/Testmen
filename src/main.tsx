import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PremiumProvider } from './lib/usePremium'
import { lang, t } from './lib/i18n'
import './styles/index.css'

document.documentElement.lang = lang
document.title = t.documentTitle

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <PremiumProvider>
        <App />
      </PremiumProvider>
    </ErrorBoundary>
  </StrictMode>,
)
