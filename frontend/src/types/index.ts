export interface Reading {
  id: number
  temperature: number
  humidity: number
  gas_ppm: number
  aqi_estimate: number
  recorded_at: string
}

export interface Alert {
  id: number
  time: string
  severity: 'critical' | 'warning' | 'info'
  msg: string
  ack: boolean
}

export type Page = 'dashboard' | 'analytics' | 'alerts' | 'system' | 'settings'