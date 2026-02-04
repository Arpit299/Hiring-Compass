import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

// Log when app mounts for debugging
console.log('[App] Starting React app mount...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('[App] Root element not found! Check index.html');
} else {
  console.log('[App] Root element found, creating React app...');
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    );
    console.log('[App] React app mounted successfully');
  } catch (error) {
    console.error('[App] Failed to mount React app:', error);
    rootElement.innerHTML = `<div style="color: red; padding: 20px; font-family: monospace;">Failed to initialize app: ${error instanceof Error ? error.message : String(error)}</div>`;
  }
}
