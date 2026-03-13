interface Props { dark: boolean }
export default function Analytics({ dark }: Props) {
  return <div style={{ color: dark ? '#E8F4FF' : '#0B1526' }}>Analytics coming soon</div>
}