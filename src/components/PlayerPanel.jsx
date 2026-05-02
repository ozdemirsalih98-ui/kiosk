import './PlayerPanel.css'

export default function PlayerPanel({ color, player, averaj, scoreBg, weights = {} }) {
  const isYellow = color === 'yellow'
  const { scoreWeight = 10, eysWeight = 3, avgWeight = 2 } = weights

  const scoreStyle = {
    flex: `${scoreWeight} 1 0`,
    ...(isYellow && scoreBg ? { background: scoreBg } : {}),
  }

  return (
    <div className={`player-col ${color}`}>
      <div className={`score-card ${color}`} style={scoreStyle}>
        <span className="score-value">{player.totalScore}</span>
      </div>
      <div className="eys-row" style={{ flex: `${eysWeight} 1 0` }}>
        <div className="stat-card">
          <div className="stat-label">EYS 1</div>
          <div className="stat-val">{player.highSeries[0] || '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">EYS 2</div>
          <div className="stat-val">{player.highSeries[1] || '—'}</div>
        </div>
      </div>
      <div className="stat-card avg-card" style={{ flex: `${avgWeight} 1 0` }}>
        <span className="stat-label">AVG</span>
        <span className="avg-val">{averaj}</span>
      </div>
    </div>
  )
}
