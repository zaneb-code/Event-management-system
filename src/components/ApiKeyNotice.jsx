import { hasApiKey } from '../api/ticketmaster'

export default function ApiKeyNotice() {
  if (hasApiKey) return null

  return (
    <div className="notice notice--warn" role="alert">
      <div className="notice__icon" aria-hidden="true">
        🔑
      </div>
      <div className="notice__body">
        <h3>Add your Ticketmaster API key</h3>
        <p>
          Event data cannot load until a key is configured. In the project folder, copy{' '}
          <code>.env.example</code> to <code>.env</code>, paste your Consumer Key from{' '}
          <a href="https://developer.ticketmaster.com/" target="_blank" rel="noreferrer">
            developer.ticketmaster.com
          </a>
          , then restart the dev server.
        </p>
        <pre className="code-block">
          cp .env.example .env{'\n'}
          # VITE_TICKETMASTER_API_KEY=your_key_here{'\n'}
          npm run dev
        </pre>
      </div>
    </div>
  )
}
