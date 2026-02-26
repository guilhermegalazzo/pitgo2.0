import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pitgo Admin',
  description: 'Pitgo Marketplace Administration Panel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body style={{ margin: 0, fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#0f0f23', color: '#e0e0e0' }}>
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <nav style={{
              width: 240,
              backgroundColor: '#1a1a2e',
              padding: '24px 16px',
              borderRight: '1px solid #2a2a4a',
            }}>
              <h2 style={{ color: '#6C63FF', margin: '0 0 32px 0', fontSize: 24, fontWeight: 800 }}>
                Pitgo Admin
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  { href: '/', label: '📊 Dashboard' },
                  { href: '/users', label: '👥 Users' },
                  { href: '/providers', label: '🔧 Providers' },
                  { href: '/services', label: '📋 Services' },
                  { href: '/requests', label: '📦 Requests' },
                ].map(({ href, label }) => (
                  <li key={href} style={{ marginBottom: 8 }}>
                    <a href={href} style={{
                      color: '#ccc',
                      textDecoration: 'none',
                      display: 'block',
                      padding: '10px 12px',
                      borderRadius: 8,
                      transition: 'background 0.2s',
                    }}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <main style={{ flex: 1, padding: 32 }}>
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
