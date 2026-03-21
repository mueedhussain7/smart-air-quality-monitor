interface Props {
  dark: boolean
  setDark: (d: boolean) => void
  threshold: number
  setThreshold: (t: number) => void
  refresh: number
  setRefresh: (r: number) => void
}

const MONO = "'DM Mono', monospace"
const BODY = "'DM Sans', sans-serif"

const T = {
  dark:  { card: '#0F1E35', cardBorder: '#162440', text: '#E8F4FF', textSub: '#5B7FA6', cyan: '#00D4FF', cyanSoft: '#00D4FF15', green: '#00E5A0', divider: '#111E33' },
  light: { card: '#FFFFFF', cardBorder: '#DCE8F7', text: '#0B1526', textSub: '#5B7FA6', cyan: '#0096CC', cyanSoft: '#0096CC15', green: '#00A870', divider: '#E8F0FA' },
}

export default function Settings({ dark, setDark, threshold, setThreshold, refresh, setRefresh }: Props) {
  const t = dark ? T.dark : T.light

  const rows = [
    {
      label: 'Dark Mode',
      desc: 'Switch between light and dark theme',
      ctrl: (
        <div
          onClick={() => setDark(!dark)}
          style={{
            width: '44px', height: '24px', borderRadius: '12px',
            background: dark ? t.cyan : '#A0B8D0',
            position: 'relative', transition: 'all 0.3s', cursor: 'pointer',
          }}
        >
          <div style={{
            width: '18px', height: '18px', borderRadius: '50%',
            background: 'white', position: 'absolute', top: '3px',
            left: dark ? '23px' : '3px', transition: 'left 0.3s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px',
          }}>{dark ? '🌙' : '☀️'}</div>
        </div>
      ),
    },
    {
      label: 'Gas Alert Threshold',
      desc: `Red alert fires above ${threshold} ppm`,
      ctrl: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="range" min={200} max={2000} step={50}
            value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            style={{ width: '120px', accentColor: t.cyan }}
          />
          <span style={{ fontFamily: MONO, fontSize: '13px', fontWeight: 700, color: t.cyan, minWidth: '65px', textAlign: 'right' }}>
            {threshold} ppm
          </span>
        </div>
      ),
    },
    {
      label: 'Refresh Interval',
      desc: 'How often the dashboard polls the backend',
      ctrl: (
        <div style={{ display: 'flex', gap: '6px' }}>
          {[5, 10, 30, 60].map(s => (
            <button key={s} onClick={() => setRefresh(s)} style={{
              padding: '4px 10px', borderRadius: '6px',
              border: `1px solid ${refresh === s ? t.cyan : t.cardBorder}`,
              background: refresh === s ? t.cyanSoft : 'transparent',
              color: refresh === s ? t.cyan : t.textSub,
              fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', fontFamily: BODY,
            }}>{s}s</button>
          ))}
        </div>
      ),
    },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: t.text, letterSpacing: '-0.3px' }}>
          Settings
        </h1>
        <p style={{ color: t.textSub, fontSize: '11px', marginTop: '4px', fontFamily: MONO }}>
          Customise AirWatch
        </p>
      </div>

      {/* Settings rows */}
      <div style={{
        background: t.card, border: `1px solid ${t.cardBorder}`,
        borderRadius: '14px', overflow: 'hidden',
        boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,100,200,0.07)',
        marginBottom: '14px',
      }}>
        {rows.map((row, i) => (
          <div key={row.label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px',
            borderTop: i > 0 ? `1px solid ${t.divider}` : 'none',
          }}>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: t.text }}>{row.label}</p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: t.textSub }}>{row.desc}</p>
            </div>
            {row.ctrl}
          </div>
        ))}
      </div>

      {/* About card */}
      <div style={{
        background: dark ? `${t.cyan}08` : `${t.cyan}06`,
        border: `1px solid ${t.cyan}25`,
        borderRadius: '14px', padding: '18px',
      }}>
        <p style={{ margin: '0 0 6px', fontWeight: 700, color: t.cyan, fontSize: '11px', fontFamily: MONO, letterSpacing: '0.5px' }}>
          ABOUT AIRWATCH
        </p>
        <p style={{ margin: 0, fontSize: '12px', color: t.textSub, lineHeight: '1.8', fontFamily: MONO }}>
          Smart Indoor Air Quality Monitor<br />
          Mueed Hussain · M.Sc. Applied AI · OsloMet · 2026<br />
          ESP32 + DHT22 + MQ-135 → MQTT TLS → Node.js → PostgreSQL → React
        </p>
      </div>
    </div>
  )
}