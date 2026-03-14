import { useState } from 'react'
import type { Page } from './types'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Alerts from './pages/Alerts'
import SystemStatus from './pages/SystemStatus'
import Settings from './pages/Settings'

export default function App() {
  const [dark, setDark] = useState(true)
  const [page, setPage] = useState<Page>('dashboard')
  const [threshold, setThreshold] = useState(1000)
  const [refresh, setRefresh] = useState(10)
  const bg = dark ? '#070E1A' : '#F0F6FF'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: bg, transition: 'all 0.3s' }}>
      <Sidebar dark={dark} page={page} setPage={setPage} setDark={setDark} />
      <main style={{ flex: 1, padding: '28px', overflowY: 'auto', minWidth: 0 }}>
        {page === 'dashboard' && <Dashboard dark={dark} threshold={threshold} refresh={refresh} />}
        {page === 'analytics' && <Analytics dark={dark} />}
        {page === 'alerts'    && <Alerts dark={dark} />}
        {page === 'system'    && <SystemStatus dark={dark} />}
        {page === 'settings'  && <Settings dark={dark} setDark={setDark} threshold={threshold} setThreshold={setThreshold} refresh={refresh} setRefresh={setRefresh} />}
      </main>
    </div>
  )
}