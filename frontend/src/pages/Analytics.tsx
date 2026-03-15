import { useState, useEffect } from 'react'
import type { Reading } from '../types'
import axios from 'axios'

interface Props { dark: boolean }

const MONO = "'DM Mono', monospace"
const BODY = "'DM Sans', sans-serif"

const T = {
  dark:  { card: '#0F1E35', cardBorder: '#162440', text: '#E8F4FF', textSub: '#5B7FA6', textMuted: '#2D4A6E', cyan: '#00D4FF', green: '#00E5A0', amber: '#FFB020', red: '#FF4560', divider: '#111E33' },
  light: { card: '#FFFFFF', cardBorder: '#DCE8F7', text: '#0B1526', textSub: '#5B7FA6', textMuted: '#A0B8D0', cyan: '#0096CC', green: '#00A870', amber: '#E08000', red: '#E02040', divider: '#E8F0FA' },
}

function AreaChart({ data, field, color }: { data: Reading[]; field: keyof Reading; color: string }) {
  const vals = data.map(d => Number(d[field]))
  const min = Math.min(...vals), max = Math.max(...vals), r = max - min || 1
  const W = 1000, H = 100
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * W},${H - ((v - min) / r) * H}`)
  const id = `ac${String(field)}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '110px' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0"   />
        </linearGradient>
      </defs>
      <path d={`M0,${H} ${pts.map(p => 'L' + p).join(' ')} L${W},${H} Z`} fill={`url(#${id})`} />
      <path d={`M${pts.join(' L')}`} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  )
}

export default function Analytics({ dark }: Props) {
  const t = dark ? T.dark : T.light
  const [history, setHistory] = useState<Reading[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('http://localhost:3000/api/history?from=2000-01-01&to=2099-12-31')
      .then(res => { setHistory(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color: dark ? '#5B7FA6' : '#5B7FA6', fontFamily: MONO, fontSize: '13px' }}>Loading...</div>

  if (!history.length) return (
    <div style={{ color: dark ? '#FF4560' : '#E02040', fontFamily: MONO, fontSize: '13px' }}>
      No data yet — run the simulator!
    </div>
  )

  const avg = (field: keyof Reading) =>
    (history.reduce((s, d) => s + Number(d[field]), 0) / history.length)

  const stats = [
    { label: 'Avg Temperature', value: avg('temperature').toFixed(1) + '°C', color: t.cyan    },
    { label: 'Avg Humidity',    value: avg('humidity').toFixed(1) + '%',     color: '#7C9FFF' },
    { label: 'Avg Gas Level',   value: Math.round(avg('gas_ppm')) + ' ppm',  color: t.red     },
    { label: 'Avg AQI',         value: Math.round(avg('aqi_estimate')) + '', color: t.green   },
  ]

  const metrics = [
    { key: 'temperature'   as keyof Reading, label: 'Temperature °C', color: t.cyan    },
    { key: 'humidity'      as keyof Reading, label: 'Humidity %',     color: '#7C9FFF' },
    { key: 'gas_ppm'       as keyof Reading, label: 'Gas ppm',        color: t.red     },
    { key: 'aqi_estimate'  as keyof Reading, label: 'AQI',            color: t.green   },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: t.text, letterSpacing: '-0.3px' }}>
          Analytics
        </h1>
        <p style={{ color: t.textSub, fontSize: '11px', marginTop: '4px', fontFamily: MONO }}>
          {history.length} total readings in database
        </p>
      </div>

      {/* Avg stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: t.card, border: `1px solid ${t.cardBorder}`,
            borderRadius: '14px', padding: '16px',
            boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,100,200,0.07)',
          }}>
            <p style={{ color: t.textSub, fontSize: '10px', fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: MONO }}>
              {s.label}
            </p>
            <p style={{ fontSize: '24px', fontWeight: 700, margin: 0, fontFamily: MONO, color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* 4 charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
        {metrics.map(m => (
          <div key={String(m.key)} style={{
            background: t.card, border: `1px solid ${t.cardBorder}`,
            borderRadius: '14px', padding: '16px',
            boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,100,200,0.07)',
          }}>
            <p style={{ color: t.textSub, fontSize: '10px', fontWeight: 700, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: MONO }}>
              {m.label}
            </p>
            <AreaChart data={history} field={m.key} color={m.color} />
          </div>
        ))}
      </div>

      {/* Recent readings table */}
      <div style={{
        background: t.card, border: `1px solid ${t.cardBorder}`,
        borderRadius: '14px', overflow: 'hidden',
        boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,100,200,0.07)',
      }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${t.divider}` }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: t.text }}>Recent Readings</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: `${t.cyan}10` }}>
              {['Time', 'Temp °C', 'Humidity %', 'Gas ppm', 'AQI'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: t.cyan, fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: MONO }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.slice(-10).reverse().map((row, i) => (
              <tr key={row.id} style={{ borderTop: `1px solid ${t.divider}` }}>
                <td style={{ padding: '10px 16px', color: t.textSub, fontSize: '11px', fontFamily: MONO }}>
                  {new Date(row.recorded_at).toLocaleTimeString()}
                </td>
                <td style={{ padding: '10px 16px', fontWeight: 600, color: t.text, fontFamily: MONO }}>{row.temperature}</td>
                <td style={{ padding: '10px 16px', fontWeight: 600, color: t.text, fontFamily: MONO }}>{row.humidity}</td>
                <td style={{ padding: '10px 16px', fontWeight: 600, color: t.text, fontFamily: MONO }}>{row.gas_ppm}</td>
                <td style={{ padding: '10px 16px', fontWeight: 600, color: t.text, fontFamily: MONO }}>{row.aqi_estimate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}