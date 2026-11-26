import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PremiumProvider } from './lib/usePremium'
import { lang, subscribeLanguage, t } from './lib/i18n'
import './styles/index.css'

// lang 属性は字形の選択（CSSの :lang）にも使うので、言語を切り替えたら合わせて更新する。
function applyDocumentLanguage() {
  document.documentElement.lang = lang
  document.title = t.documentTitle
}
applyDocumentLanguage()
subscribeLanguage(applyDocumentLanguage)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <PremiumProvider>
        <App />
      </PremiumProvider>
    </ErrorBoundary>
  </StrictMode>,
)
