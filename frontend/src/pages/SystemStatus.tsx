import { useState, useEffect } from 'react'
import type { Reading } from '../types'
import axios from 'axios'

interface Props { dark: boolean }

const MONO = "'DM Mono', monospace"

const T = {
  dark:  { card: '#0F1E35', cardBorder: '#162440', text: '#E8F4FF', textSub: '#5B7FA6', textMuted: '#2D4A6E', cyan: '#00D4FF', green: '#00E5A0', amber: '#FFB020', red: '#FF4560', divider: '#111E33' },
  light: { card: '#FFFFFF', cardBorder: '#DCE8F7', text: '#0B1526', textSub: '#5B7FA6', textMuted: '#A0B8D0', cyan: '#0096CC', green: '#00A870', amber: '#E08000', red: '#E02040', divider: '#E8F0FA' },
}

export default function SystemStatus({ dark }: Props) {
  const t = dark ? T.dark : T.light
  const [readings, setReadings] = useState<Reading[]>([])
  const [backendOk, setBackendOk] = useState(false)
  const [latency, setLatency] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [uptime, setUptime] = useState(0)

  useEffect(() => {
    const start = performance.now()
    axios.get('http://localhost:3000/api/history?from=2000-01-01&to=2099-12-31')
      .then(res => {
        const end = performance.now()
        setLatency(Math.round(end - start))
        setReadings(res.data)
        setBackendOk(true)
        setLoading(false)
      })
      .catch(() => {
        setBackendOk(false)
        setLoading(false)
      })

    // Uptime counter
    const id = setInterval(() => setUptime(u => u + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h}h ${m}m ${sec}s`
  }

  const latest = readings[readings.length - 1]
  const todayReadings = readings.filter(r => {
    const d = new Date(r.recorded_at)
    const now = new Date()
    return d.getDate() === now.getDate() &&
           d.getMonth() === now.getMonth() &&
           d.getFullYear() === now.getFullYear()
  })

  const lastReadingTime = latest
    ? new Date(latest.recorded_at).toLocaleTimeString()
    : 'No data'

  const devices = [
    { label: 'ESP32',        status: 'Waiting for HW', color: t.amber, icon: '📡', detail: 'Hardware on order' },
    { label: 'MQTT Broker',  status: backendOk ? 'Connected' : 'Offline', color: backendOk ? t.green : t.red, icon: '🔗', detail: 'HiveMQ Cloud · TLS 1.3' },
    { label: 'PostgreSQL DB',status: backendOk ? 'Running'   : 'Offline', color: backendOk ? t.green : t.red, icon: '🗄', detail: 'localhost:5432 · air_quality' },
  ]

  const metrics = [
    { label: 'Backend Status',       value: backendOk ? 'Online' : 'Offline',        color: backendOk ? t.green : t.red },
    { label: 'API Response Time',    value: latency ? `${latency} ms` : '—',          color: latency && latency < 100 ? t.green : t.amber },
    { label: 'Session Uptime',       value: formatUptime(uptime),                     color: t.cyan },
    { label: 'Total Readings',       value: readings.length.toString(),               color: t.cyan },
    { label: 'Readings Today',       value: todayReadings.length.toString(),          color: t.cyan },
    { label: 'Last Reading',         value: lastReadingTime,                          color: t.green },
    { label: 'MQTT Protocol',        value: 'TLS 1.3 · Port 8883',                   color: t.amber },
    { label: 'Data Source',          value: backendOk ? 'Simulator (HW pending)' : '—', color: t.textSub },
  ]

  if (loading) return <div style={{ color: t.textSub, fontFamily: MONO, fontSize: '13px' }}>Loading...</div>

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: t.text, letterSpacing: '-0.3px' }}>
          System Status
        </h1>
        <p style={{ color: t.textSub, fontSize: '11px', marginTop: '4px', fontFamily: MONO }}>
          Device health and connectivity
        </p>
      </div>

      {/* Device cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
        {devices.map(d => (
          <div key={d.label} style={{
            background: t.card, border: `1px solid ${d.color}30`,
            borderRadius: '14px', padding: '18px',
            boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,100,200,0.07)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '24px' }}>{d.icon}</span>
              <span style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: `${d.color}15`, color: d.color,
                padding: '3px 10px', borderRadius: '20px',
                fontSize: '10px', fontWeight: 700, fontFamily: MONO,
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: d.color, boxShadow: `0 0 6px ${d.color}`,
                  display: 'inline-block',
                }} />
                {d.status}
              </span>
            </div>
            <p style={{ margin: '12px 0 2px', fontWeight: 700, fontSize: '14px', color: t.text }}>{d.label}</p>
            <p style={{ margin: 0, fontSize: '11px', color: t.textSub, fontFamily: MONO }}>{d.detail}</p>
          </div>
        ))}
      </div>

      {/* Metrics table */}
      <div style={{
        background: t.card, border: `1px solid ${t.cardBorder}`,
        borderRadius: '14px', overflow: 'hidden',
        boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,100,200,0.07)',
        marginBottom: '14px',
      }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${t.divider}` }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: t.text }}>System Metrics</h2>
        </div>
        {metrics.map((row, i) => (
          <div key={row.label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 18px',
            borderTop: i > 0 ? `1px solid ${t.divider}` : 'none',
          }}>
            <span style={{ fontSize: '13px', color: t.textSub }}>{row.label}</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: row.color, fontFamily: MONO }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Hardware note */}
      <div style={{
        background: `${t.amber}10`, border: `1px solid ${t.amber}30`,
        borderRadius: '14px', padding: '16px 18px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <span style={{ fontSize: '20px' }}>📦</span>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: t.amber }}>
            Hardware Pending
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: t.textSub }}>
            ESP32 + DHT22 + MQ-135 on order. Currently using simulator for data. 
            System status will update automatically when hardware is connected.
          </p>
        </div>
      </div>
    </div>
  )
}