export default function DashboardPage() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
        {[
          { label: 'Total Users', value: '—', color: '#6C63FF' },
          { label: 'Active Providers', value: '—', color: '#00C49F' },
          { label: 'Open Requests', value: '—', color: '#FF6B6B' },
          { label: 'Revenue (MTD)', value: '—', color: '#FFB347' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              backgroundColor: '#1a1a2e',
              borderRadius: 16,
              padding: 24,
              border: '1px solid #2a2a4a',
            }}
          >
            <p style={{ fontSize: 14, color: '#888', margin: '0 0 8px 0' }}>{label}</p>
            <p style={{ fontSize: 32, fontWeight: 800, color, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, backgroundColor: '#1a1a2e', borderRadius: 16, padding: 24, border: '1px solid #2a2a4a' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Recent Activity</h2>
        <p style={{ color: '#888' }}>Connect the backend API to see real-time data here.</p>
      </div>
    </div>
  );
}
