import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { preloadNextScreenImages } from './app/preloadImages'
import './styles/global.css'

// Let the first screen finish loading before fetching other branches.
if (document.readyState === 'complete') {
  preloadNextScreenImages()
} else {
  window.addEventListener('load', preloadNextScreenImages, { once: true })
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Не найден корневой элемент приложения')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
