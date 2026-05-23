import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Blackline Method — Private Training, Dallas Design District'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0A0A',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Georgia, serif',
          padding: '80px',
        }}
      >
        <div
          style={{
            color: '#F5F5F0',
            fontSize: 96,
            letterSpacing: '0.35em',
            fontWeight: 300,
            textTransform: 'uppercase',
            lineHeight: 1,
            marginBottom: 32,
          }}
        >
          BLACKLINE
        </div>
        <div
          style={{
            width: 64,
            height: 1,
            background: '#C8965A',
            marginBottom: 32,
          }}
        />
        <div
          style={{
            color: '#C8965A',
            fontSize: 18,
            letterSpacing: '0.25em',
            fontFamily: 'system-ui, sans-serif',
            fontWeight: 400,
            textTransform: 'uppercase',
          }}
        >
          Private Training · Dallas Design District
        </div>
      </div>
    ),
    { ...size }
  )
}
