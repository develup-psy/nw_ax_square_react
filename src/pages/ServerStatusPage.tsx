import * as React from 'react'

import ServerStatus from '../components/main/ServerStatus'

export default function ServerStatusPage():
React.ReactElement {
  return (
    <main className="server-status-page">
      <div className="server-status-page-top">
        <div className="page-container server-status-page-top-inner">
          <a
            className="server-status-back"
            href="/"
          >
            ← NW AX 운영스퀘어
          </a>

          <span className="server-status-page-brand">
            React Test
          </span>
        </div>
      </div>

      <ServerStatus />
    </main>
  )
}
