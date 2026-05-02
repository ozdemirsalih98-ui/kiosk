import './CountdownBar.css'

const TOTAL = 30

export default function CountdownBar({ remaining, duration, isRunning }) {
  const activeCount = Math.round((remaining / duration) * TOTAL)

  function segmentColor(i) {
    // Segments that are ACTIVE are on the RIGHT side
    const isActive = i >= (TOTAL - activeCount)
    if (!isActive) return 'rgba(255,255,255,0.04)'

    // Color based on position: left=green, middle=yellow, right=red
    const pos = i / (TOTAL - 1)
    if (pos < 0.5) return '#00cc44'
    if (pos < 0.75) return '#cccc00'
    return '#cc2200'
  }

  return (
    <div className={`countdown-bar ${isRunning ? 'running' : ''}`}>
      <div className="countdown-segments">
        {Array.from({ length: TOTAL }, (_, i) => (
          <div
            key={i}
            className="countdown-segment"
            style={{ background: segmentColor(i) }}
          />
        ))}
      </div>
      {isRunning && <div className="countdown-number">{remaining}</div>}
    </div>
  )
}
