import { useState, useEffect } from 'react'
import type { Reading } from '../types'
import axios from 'axios'

interface Props { dark: boolean }

const MONO = "'DM Mono', monospace"
const BODY = "'DM Sans', sans-serif"

const T = {
  dark:  { card: '#0F1E35', cardBorder: '#162440', text: '#E8F4FF', textSub: '#5B7FA6', cyan: '#00D4FF', green: '#00E5A0', amber: '#FFB020', amberSoft: '#FFB02015', red: '#FF4560', redSoft: '#FF456015', divider: '#111E33' },
  light: { card: '#FFFFFF', cardBorder: '#DCE8F7', text: '#0B1526', textSub: '#5B7FA6', cyan: '#0096CC', green: '#00A870', amber: '#E08000', amberSoft: '#E0800015', red: '#E02040', redSoft: '#E0204015', divider: '#E8F0FA' },
}

interface AlertItem {
  id: number
  time: string
  severity: 'critical' | 'warning' | 'info'
  msg: string
  ack: boolean
}

function generateAlerts(readings: Reading[]): AlertItem[] {
  const alerts: AlertItem[] = []
  let id = 1
  readings.slice().reverse().forEach(r => {
    const time = new Date(r.recorded_at).toLocaleTimeString()
    if (r.gas_ppm > 1000) {
      alerts.push({ id: id++, time, severity: 'critical', msg: `Gas level reached ${r.gas_ppm} ppm — exceeded threshold`, ack: false })
    } else if (r.gas_ppm > 700) {
      alerts.push({ id: id++, time, severity: 'warning', msg: `Gas level elevated at ${r.gas_ppm} ppm`, ack: false })
    }
    if (r.humidity > 70) {
      alerts.push({ id: id++, time, severity: 'warning', msg: `High humidity detected: ${r.humidity}%`, ack: false })
    }
    if (r.temperature < 18) {
      alerts.push({ id: id++, time, severity: 'info', msg: `Temperature dropped to ${r.temperature}°C`, ack: false })
    }
    if (r.aqi_estimate > 75) {
      alerts.push({ id: id++, time, severity: 'warning', msg: `AQI reached ${r.aqi_estimate} — air quality poor`, ack: false })
    }
  })
  return alerts.slice(0, 20)
}

export default function Alerts({ dark }: Props) {
  const t = dark ? T.dark : T.light
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('http://localhost:3000/api/history?from=2000-01-01&to=2099-12-31')
      .then(res => {
        setAlerts(generateAlerts(res.data))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const ack = (id: number) => setAlerts(alerts.map(a => a.id === id ? { ...a, ack: true } : a))
  const ackAll = () => setAlerts(alerts.map(a => ({ ...a, ack: true })))
  const unread = alerts.filter(a => !a.ack).length

  const CFG = {
    critical: { color: t.red,   bg: t.redSoft,   icon: '⚠️', label: 'CRITICAL' },
    warning:  { color: t.amber, bg: t.amberSoft,  icon: '⚑',  label: 'WARNING'  },
    info:     { color: t.cyan,  bg: `${t.cyan}12`,icon: 'ℹ',  label: 'INFO'     },
  }

  if (loading) return <div style={{ color: t.textSub, fontFamily: MONO, fontSize: '13px' }}>Loading...</div>

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: t.text, letterSpacing: '-0.3px' }}>
            Alerts
          </h1>
          <p style={{ color: t.textSub, fontSize: '11px', marginTop: '4px', fontFamily: MONO }}>
            {unread} unacknowledged · {alerts.length} total
          </p>
        </div>
        {unread > 0 && (
          <button onClick={ackAll} style={{
            padding: '8px 16px', borderRadius: '8px',
            background: `${t.cyan}15`, border: `1px solid ${t.cyan}40`,
            color: t.cyan, fontWeight: 600, fontSize: '12px',
            cursor: 'pointer', fontFamily: BODY,
          }}>Acknowledge All</button>
        )}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
        {(['critical', 'warning', 'info'] as const).map(sev => {
          const cfg = CFG[sev]
          const count = alerts.filter(a => a.severity === sev).length
          return (
            <div key={sev} style={{
              background: t.card, border: `1px solid ${cfg.color}30`,
              borderRadius: '14px', padding: '16px',
              boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,100,200,0.07)',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: '10px',
                background: `${cfg.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
              }}>{cfg.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: cfg.color, fontFamily: MONO }}>{count}</p>
                <p style={{ margin: 0, fontSize: '11px', color: t.textSub }}>{cfg.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Alert list */}
      {alerts.length === 0 ? (
        <div style={{
          background: t.card, border: `1px solid ${t.cardBorder}`,
          borderRadius: '14px', padding: '40px',
          textAlign: 'center', color: t.textSub,
          fontFamily: MONO, fontSize: '13px',
        }}>
          ✓ No alerts — air quality is good!
        </div>
      ) : (
        <div style={{
          background: t.card, border: `1px solid ${t.cardBorder}`,
          borderRadius: '14px', overflow: 'hidden',
          boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,100,200,0.07)',
        }}>
          {alerts.map((a, i) => {
            const cfg = CFG[a.severity]
            return (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 18px',
                borderTop: i > 0 ? `1px solid ${t.divider}` : 'none',
                opacity: a.ack ? 0.45 : 1,
                background: !a.ack ? cfg.bg : 'transparent',
                transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{cfg.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: a.ack ? 400 : 600, color: t.text }}>
                    {a.msg}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: t.textSub, fontFamily: MONO }}>
                    {a.time}
                  </p>
                </div>
                <span style={{
                  fontSize: '10px', padding: '3px 8px', borderRadius: '20px',
                  background: `${cfg.color}20`, color: cfg.color,
                  fontWeight: 700, textTransform: 'uppercase', fontFamily: MONO,
                }}>{a.ack ? "ack'd" : cfg.label}</span>
                {!a.ack && (
                  <button onClick={() => ack(a.id)} style={{
                    padding: '4px 10px', borderRadius: '6px',
                    border: `1px solid ${t.cardBorder}`,
                    background: 'transparent', color: t.textSub,
                    fontSize: '11px', cursor: 'pointer', fontFamily: BODY,
                  }}>Ack</button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}