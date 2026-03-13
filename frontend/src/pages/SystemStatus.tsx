interface Props { dark: boolean }
export default function SystemStatus({ dark }: Props) {
  return <div style={{ color: dark ? '#E8F4FF' : '#0B1526' }}>System Status coming soon</div>
}