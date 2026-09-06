import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { DataProvider } from './data/DataContext'
import { SeasonProvider } from './data/SeasonContext'
import { I18nProvider } from './i18n/I18nContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <DataProvider>
            <SeasonProvider>
              <App />
            </SeasonProvider>
          </DataProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </I18nProvider>
  </React.StrictMode>,
)
