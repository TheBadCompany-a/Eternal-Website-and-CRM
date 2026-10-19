import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppStateProvider } from './state/AppStateContext'
import { ToastProvider } from './toast/ToastProvider'
import { applyStoredTheme } from './theme/theme'
import { LanguageProvider } from './i18n/LanguageContext'
import { ConfigNeeded } from './components/ConfigNeeded'
import { isSupabaseConfigured } from './lib/supabaseClient'

applyStoredTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
    {isSupabaseConfigured ? (
      <AppStateProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AppStateProvider>
    ) : (
      <ConfigNeeded />
    )}
    </LanguageProvider>
  </StrictMode>,
)
