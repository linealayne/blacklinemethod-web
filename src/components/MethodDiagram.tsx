interface MethodDiagramProps {
  className?: string
}

export function MethodDiagram({ className = '' }: MethodDiagramProps) {
  // Diamond: center (250,250), pillars at radius 150
  // HORMONES top (250,100), TRAINING right (400,250), NUTRITION bottom (250,400), LIFESTYLE left (100,250)
  const cx = 250
  const cy = 250
  const r = 150
  const pillars = [
    { id: 'hormones', label: 'HORMONES', x: cx, y: cy - r, tx: cx, ty: cy - r - 22, anchor: 'middle' },
    { id: 'training', label: 'TRAINING', x: cx + r, y: cy, tx: cx + r + 18, ty: cy + 4, anchor: 'start' },
    { id: 'nutrition', label: 'NUTRITION', x: cx, y: cy + r, tx: cx, ty: cy + r + 22, anchor: 'middle' },
    { id: 'lifestyle', label: 'LIFESTYLE', x: cx - r, y: cy, tx: cx - r - 18, ty: cy + 4, anchor: 'end' },
  ]

  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="The Blackline Method: Hormones, Training, Nutrition, and Lifestyle — four pillars, one system"
      role="img"
    >
      {/* Outer atmosphere ring */}
      <circle
        cx={cx}
        cy={cy}
        r={195}
        stroke="#C8965A"
        strokeOpacity={0.08}
        strokeWidth={0.75}
        strokeDasharray="2 9"
      />
      <circle
        cx={cx}
        cy={cy}
        r={175}
        stroke="#2A2A2A"
        strokeOpacity={0.6}
        strokeWidth={0.5}
        strokeDasharray="3 12"
      />

      {/* Outer diamond connecting pillars */}
      <polygon
        points={pillars.map((p) => `${p.x},${p.y}`).join(' ')}
        stroke="#2A2A2A"
        strokeWidth={0.75}
        strokeOpacity={0.9}
      />

      {/* Dashed amber spokes from center to each pillar */}
      {pillars.map((p) => (
        <line
          key={p.id + '-spoke'}
          x1={cx}
          y1={cy}
          x2={p.x}
          y2={p.y}
          stroke="#C8965A"
          strokeWidth={0.75}
          strokeOpacity={0.35}
          strokeDasharray="4 7"
        />
      ))}

      {/* Pillar nodes */}
      {pillars.map((p) => (
        <g key={p.id}>
          <circle cx={p.x} cy={p.y} r={5} fill="#0A0A0A" stroke="#2A2A2A" strokeWidth={1} />
          <circle cx={p.x} cy={p.y} r={2} fill="#C8965A" fillOpacity={0.6} />
        </g>
      ))}

      {/* Pillar labels */}
      {pillars.map((p) => (
        <text
          key={p.id + '-label'}
          x={p.tx}
          y={p.ty}
          textAnchor={p.anchor as 'middle' | 'start' | 'end'}
          dominantBaseline={p.id === 'nutrition' ? 'hanging' : p.id === 'hormones' ? 'auto' : 'middle'}
          className="font-sans"
          style={{
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            fontSize: '11px',
            letterSpacing: '0.22em',
            fill: '#8C8A84',
            fillOpacity: 1,
          }}
        >
          {p.label}
        </text>
      ))}

      {/* Center node */}
      <circle cx={cx} cy={cy} r={34} fill="#0A0A0A" stroke="#2A2A2A" strokeWidth={0.75} />
      <circle cx={cx} cy={cy} r={34} stroke="#C8965A" strokeWidth={0.5} strokeOpacity={0.2} />
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          fontSize: '10px',
          letterSpacing: '0.28em',
          fill: '#E2C48F',
          fillOpacity: 0.95,
        }}
      >
        YOU
      </text>
    </svg>
  )
}
