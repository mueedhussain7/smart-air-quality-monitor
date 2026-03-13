interface Props {
  dark: boolean
  setDark: (d: boolean) => void
  threshold: number
  setThreshold: (t: number) => void
  refresh: number
  setRefresh: (r: number) => void
}
export default function Settings({ dark }: Props) {
  return <div style={{ color: dark ? '#E8F4FF' : '#0B1526' }}>Settings coming soon</div>
}