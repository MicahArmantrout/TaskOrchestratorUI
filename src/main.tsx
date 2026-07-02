import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

function setFavicon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#336CFF"/><text x="50" y="58" font-size="50" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" fill="#fff">TO</text></svg>`
  const url = `data:image/svg+xml,${encodeURIComponent(svg)}`
  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.href = url
}

setFavicon()
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
