interface Props { dark: boolean }
export default function Alerts({ dark }: Props) {
  return <div style={{ color: dark ? '#E8F4FF' : '#0B1526' }}>Alerts coming soon</div>
}