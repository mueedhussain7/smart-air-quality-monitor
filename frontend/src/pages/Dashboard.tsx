interface Props { dark: boolean; threshold: number; refresh: number }
export default function Dashboard({ dark }: Props) {
  return <div style={{ color: dark ? '#E8F4FF' : '#0B1526' }}>Dashboard coming soon</div>
}