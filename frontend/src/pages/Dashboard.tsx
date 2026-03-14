import { useState, useEffect } from 'react'
import type { Reading } from '../types'
import axios from 'axios'

interface Props { dark: boolean; threshold: number; refresh: number }

const MONO = "'DM Mono', monospace"
const BODY = "'DM Sans', sans-serif"

const T = {
  dark:  { card: '#0F1E35', cardBorder: '#162440', text: '#E8F4FF', textSub: '#5B7FA6', textMuted: '#2D4A6E', cyan: '#00D4FF', cyanSoft: '#00D4FF15', green: '#00E5A0', amber: '#FFB020', red: '#FF4560', divider: '#111E33' },
  light: { card: '#FFFFFF', cardBorder: '#DCE8F7', text: '#0B1526', textSub: '#5B7FA6', textMuted: '#A0B8D0', cyan: '#0096CC', cyanSoft: '#0096CC15', green: '#00A870', amber: '#E08000', red: '#E02040', divider: '#E8F0FA' },
}

function gasStatus(ppm: number, threshold: number) {
  if (ppm < threshold * 0.45) return { label: 'Good',     color: 'green' }
  if (ppm < threshold * 0.75) return { label: 'Moderate', color: 'amber' }
  return                             { label: 'Danger',   color: 'red'   }
}

function Spark({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data), max = Math.max(...data), r = max - min || 1
  const W = 100, H = 32
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / r) * H}`).join(' ')
  const id = `sp${color.replace(/[^a-z0-9]/gi, '')}`
  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0"   />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill={`url(#${id})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function Gauge({ value, max, color, size = 60 }: { value: number; max: number; color: string; size?: number }) {
  const pct = Math.min(value / max, 1)
  const R = 26, cx = 34, cy = 34, circ = 2 * Math.PI * R, arc = circ * 0.75
  return (
    <svg width={size} height={size} viewBox="0 0 68 68">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#162440" strokeWidth="6"
        strokeDasharray={`${arc} ${circ}`} strokeLinecap="round"
        transform={`rotate(-225 ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${arc * pct} ${circ}`} strokeLinecap="round"
        transform={`rotate(-225 ${cx} ${cy})`} />
      <text x={cx} y={cy + 5} textAnchor="middle" fill={color}
        fontSize="12" fontWeight="700" fontFamily={MONO}>{Math.round(pct * 100)}%</text>
    </svg>
  )
}

function AreaChart({ data, field, color }: { data: Reading[]; field: keyof Reading; color: string }) {
  const vals = data.map(d => Number(d[field]))
  const min = Math.min(...vals), max = Math.max(...vals), r = max - min || 1
  const W = 1000, H = 100
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * W},${H - ((v - min) / r) * H}`)
  const id = `ac${String(field)}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '120px' }} preserveAspectRatio="none">
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

export default function Dashboard({ dark, threshold, refresh }: Props) {
  const t = dark ? T.dark : T.light
  const [latest, setLatest]   = useState<Reading | null>(null)
  const [history, setHistory] = useState<Reading[]>([])
  const [metric, setMetric]   = useState<keyof Reading>('gas_ppm')
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [latestRes, historyRes] = await Promise.all([
        axios.get('http://localhost:3000/api/latest'),
        axios.get(`http://localhost:3000/api/history?from=2000-01-01&to=2099-12-31`),
      ])
      setLatest(latestRes.data)
      setHistory(historyRes.data.slice(-96))
      setLoading(false)
    } catch {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, refresh * 1000)
    return () => clearInterval(id)
  }, [refresh])

  if (loading) return (
    <div style={{ color: t.textSub, fontFamily: MONO, fontSize: '13px' }}>Loading...</div>
  )

  if (!latest) return (
    <div style={{ color: t.red, fontFamily: MONO, fontSize: '13px' }}>
      Could not connect to backend. Make sure server is running on port 3000.
    </div>
  )

  const st  = gasStatus(latest.gas_ppm, threshold)
  const statusColor = t[st.color as keyof typeof t] as string

  const cards = [
    { key: 'temperature' as keyof Reading, label: 'Temperature', value: `${latest.temperature}°C`, color: t.cyan,    icon: '🌡', max: 40   },
    { key: 'humidity'    as keyof Reading, label: 'Humidity',    value: `${latest.humidity}%`,     color: '#7C9FFF', icon: '💧', max: 100  },
    { key: 'gas_ppm'     as keyof Reading, label: 'Gas Level',   value: `${latest.gas_ppm} ppm`,   color: statusColor,icon:'⬡', max: 2000 },
    { key: 'aqi_estimate'as keyof Reading, label: 'AQI',         value: `${latest.aqi_estimate}`,  color: t.green,   icon: '◈', max: 200  },
  ]

  const metrics = [
    { key: 'temperature'  as keyof Reading, label: 'Temp °C',  color: t.cyan    },
    { key: 'humidity'     as keyof Reading, label: 'Humidity', color: '#7C9FFF' },
    { key: 'gas_ppm'      as keyof Reading, label: 'Gas ppm',  color: t.red     },
    { key: 'aqi_estimate' as keyof Reading, label: 'AQI',      color: t.green   },
  ]

  const selM = metrics.find(m => m.key === metric)!

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: t.text, letterSpacing: '-0.3px' }}>
          Dashboard
        </h1>
        <p style={{ color: t.textSub, fontSize: '11px', marginTop: '4px', fontFamily: MONO }}>
          Room 1 · {new Date().toLocaleString()} · refreshing every {refresh}s
        </p>
      </div>

      {/* Alert banner */}
      {latest.gas_ppm > threshold && (
        <div style={{
          background: 'linear-gradient(135deg, #FF4560, #CC2040)',
          color: 'white', borderRadius: '12px', padding: '12px 18px',
          marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px',
          fontWeight: 600, fontSize: '13px',
          boxShadow: '0 4px 20px rgba(255,69,96,0.35)',
        }}>
          <span style={{ fontSize: '18px' }}>⚠️</span>
          Gas level critical! {latest.gas_ppm} ppm exceeds threshold of {threshold} ppm
          <span style={{ marginLeft: 'auto', fontSize: '11px', opacity: 0.85 }}>Take action immediately</span>
        </div>
      )}

      {/* Status bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        background: `${statusColor}12`, border: `1px solid ${statusColor}30`,
        borderRadius: '12px', padding: '10px 16px', marginBottom: '18px',
      }}>
        <span style={{
          width: 10, height: 10, borderRadius: '50%', background: statusColor,
          boxShadow: `0 0 10px ${statusColor}`, display: 'inline-block',
        }} />
        <span style={{ fontWeight: 700, color: statusColor, fontSize: '13px' }}>
          Air Quality: {st.label}
        </span>
        <span style={{ color: t.textSub, fontSize: '11px', marginLeft: 'auto', fontFamily: MONO }}>
          {latest.gas_ppm} ppm · AQI {latest.aqi_estimate} · {latest.temperature}°C
        </span>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '18px' }}>
        {cards.map(c => (
          <div key={String(c.key)} style={{
            background: t.card, border: `1px solid ${t.cardBorder}`,
            borderRadius: '14px', padding: '16px',
            boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,100,200,0.07)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <p style={{ color: t.textSub, fontSize: '10px', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: MONO }}>
                  {c.label}
                </p>
                <p style={{ fontSize: '20px', fontWeight: 700, margin: '5px 0 0', fontFamily: MONO, color: c.color }}>
                  {c.value}
                </p>
              </div>
              <Gauge value={parseFloat(String(c.value))} max={c.max} color={c.color} size={56} />
            </div>
            {history.length > 1 && (
              <Spark data={history.slice(-24).map(d => Number(d[c.key]))} color={c.color} />
            )}
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div style={{
        background: t.card, border: `1px solid ${t.cardBorder}`,
        borderRadius: '14px', padding: '18px',
        boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,100,200,0.07)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: t.text }}>Live Trend</h2>
            <p style={{ color: t.textSub, fontSize: '11px', margin: '2px 0 0', fontFamily: MONO }}>
              {history.length} readings from database
            </p>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {metrics.map(m => (
              <button key={String(m.key)} onClick={() => setMetric(m.key)} style={{
                padding: '4px 10px', borderRadius: '6px',
                border: `1px solid ${metric === m.key ? m.color : t.cardBorder}`,
                background: metric === m.key ? `${m.color}15` : 'transparent',
                color: metric === m.key ? m.color : t.textSub,
                fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: BODY,
              }}>{m.label}</button>
            ))}
          </div>
        </div>
        {history.length > 1
          ? <AreaChart data={history} field={selM.key} color={selM.color} />
          : <div style={{ color: t.textSub, fontSize: '12px', fontFamily: MONO }}>No history data yet — run the simulator!</div>
        }
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <span style={{ fontSize: '10px', color: t.textMuted, fontFamily: MONO }}>Oldest</span>
          <span style={{ fontSize: '10px', color: t.textMuted, fontFamily: MONO }}>Now</span>
        </div>
      </div>
    </div>
  )
}