import './CenterPanel.css'

export default function CenterPanel({
  inning, run, currentTurn,
  isCountdownRunning,
  onToggleCountdown, onIncrement, onDecrement, onConfirm, onUndo, onRedo,
  canUndo, canRedo,
  onEndMatch, onOpenSettings,
  weights = {},
}) {
  const { inningWeight = 3, controlsWeight = 8, runWeight = 3 } = weights

  return (
    <div className="center-panel">
      <div className="center-box inning-box" style={{ flex: `${inningWeight} 1 0` }}>
        <div className="center-box-label">INNING</div>
        <div className="center-box-value inning-val">{inning}</div>
      </div>

      <div className="center-controls" style={{ flex: `${controlsWeight} 1 0` }}>
        <button
          className={`btn-countdown ${isCountdownRunning ? 'running' : ''}`}
          onClick={onToggleCountdown}
        >
          {isCountdownRunning ? '⏸ DURDUR' : '▶ SÜRE BAŞLAT'}
        </button>

        <div className="dpad">
          <div className="dpad-row">
            <button className="dpad-btn up" onClick={onRedo} disabled={!canRedo}>↑</button>
          </div>
          <div className="dpad-row">
            <button className="dpad-btn left" onClick={onDecrement}>←</button>
            <button className="dpad-btn center" onClick={onConfirm}>OK</button>
            <button className="dpad-btn right" onClick={onIncrement}>→</button>
          </div>
          <div className="dpad-row">
            <button className="dpad-btn down" onClick={onUndo} disabled={!canUndo}>↓</button>
          </div>
        </div>

        <div className="center-sub-btns">
          <button className="btn-end-match" onClick={onEndMatch}>MAÇ BİTİR</button>
          <button className="btn-settings" onClick={onOpenSettings}>⚙</button>
        </div>
      </div>

      <div className="center-box run-box" style={{ flex: `${runWeight} 1 0` }}>
        <div className="center-box-label">RUN</div>
        <div className={`center-box-value run-val ${currentTurn}`}>{run}</div>
      </div>
    </div>
  )
}
