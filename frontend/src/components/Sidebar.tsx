import type { Page } from '../types'

interface Props {
  dark: boolean
  page: Page
  setPage: (p: Page) => void
  unreadAlerts?: number
}

const MONO = "'DM Mono', monospace"
const BODY = "'DM Sans', sans-serif"

const T = {
  dark:  { sidebar: '#0B1526', divider: '#111E33', textSub: '#5B7FA6', cyan: '#00D4FF', green: '#00E5A0', greenSoft: '#00E5A015', red: '#FF4560' },
  light: { sidebar: '#FFFFFF', divider: '#E8F0FA', textSub: '#5B7FA6', cyan: '#0096CC', green: '#00A870', greenSoft: '#00A87015', red: '#E02040' },
}

const NAV: { id: Page; icon: string; label: string }[] = [
  { id: 'dashboard', icon: '⬡', label: 'Dashboard'    },
  { id: 'analytics', icon: '◈', label: 'Analytics'    },
  { id: 'alerts',    icon: '⚑', label: 'Alerts'       },
  { id: 'system',    icon: '◉', label: 'System Status' },
  { id: 'settings',  icon: '⚙', label: 'Settings'     },
]

export default function Sidebar({ dark, page, setPage, unreadAlerts = 0 }: Props) {
  const t = dark ? T.dark : T.light

  return (
    <aside style={{
      width: '200px', minHeight: '100vh', background: t.sidebar,
      borderRight: `1px solid ${t.divider}`, display: 'flex',
      flexDirection: 'column', position: 'sticky', top: 0,
      height: '100vh', flexShrink: 0,
      boxShadow: dark ? '4px 0 24px rgba(0,0,0,0.4)' : '2px 0 12px rgba(0,100,200,0.06)',
    }}>

      {/* Logo */}
      <div style={{ padding: '20px 18px 14px', borderBottom: `1px solid ${t.divider}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 34, height: 34, borderRadius: '10px',
            background: `linear-gradient(135deg, ${t.cyan}22, ${t.green}22)`,
            border: `1px solid ${t.cyan}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
          }}>🌬</div>
          <div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: '12px', letterSpacing: '1px', color: t.cyan }}>
              AIRWATCH
            </div>
            <div style={{ fontSize: '9px', color: t.textSub, letterSpacing: '1px' }}>
              IOT · OSLO
            </div>
          </div>
        </div>
      </div>

      {/* Live pill */}
      <div style={{ padding: '12px 18px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: t.greenSoft, border: `1px solid ${t.green}40`,
          borderRadius: '20px', padding: '4px 10px',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: t.green,
            boxShadow: `0 0 8px ${t.green}`, display: 'inline-block',
          }} />
          <span style={{ fontSize: '10px', fontWeight: 700, color: t.green, fontFamily: MONO, letterSpacing: '0.5px' }}>
            LIVE
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '4px 10px' }}>
        {NAV.map(item => (
          <button key={item.id} onClick={() => setPage(item.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px', borderRadius: '10px', border: 'none',
            cursor: 'pointer', fontFamily: BODY, fontSize: '13px',
            fontWeight: page === item.id ? 700 : 400,
            background: page === item.id ? `${t.cyan}15` : 'transparent',
            color: page === item.id ? t.cyan : t.textSub,
            transition: 'all 0.15s', marginBottom: '2px', textAlign: 'left',
            borderLeft: page === item.id ? `2px solid ${t.cyan}` : '2px solid transparent',
          }}>
            <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.id === 'alerts' && unreadAlerts > 0 && (
              <span style={{
                background: t.red, color: 'white', borderRadius: '10px',
                fontSize: '10px', fontWeight: 700, padding: '1px 6px',
              }}>{unreadAlerts}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Dark mode toggle */}
      <div style={{ padding: '14px 18px', borderTop: `1px solid ${t.divider}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: t.textSub }}>{dark ? 'Dark' : 'Light'} Mode</span>
          <div style={{
            width: '44px', height: '24px', borderRadius: '12px',
            background: dark ? t.cyan : '#A0B8D0',
            position: 'relative', transition: 'all 0.3s',
          }}>
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%',
              background: 'white', position: 'absolute', top: '3px',
              left: dark ? '23px' : '3px', transition: 'left 0.3s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px',
            }}>{dark ? '🌙' : '☀️'}</div>
          </div>
        </div>
      </div>

    </aside>
  )
}