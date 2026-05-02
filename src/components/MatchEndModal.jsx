import './MatchEndModal.css'

export default function MatchEndModal({ state, averaj, onReset }) {
  const { white, yellow, winner, currentInning } = state

  const winnerLabel = winner === 'draw' ? 'BERABERE' : winner === 'white' ? 'PLAYER A KAZANDI' : 'PLAYER B KAZANDI'

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-title">MAÇ SONU</div>
        <div className={`modal-winner ${winner}`}>{winnerLabel}</div>

        <div className="modal-stats">
          <div className="modal-player-stat">
            <div className="modal-player-name">PLAYER A</div>
            <div className="modal-score white">{white.totalScore}</div>
            <div className="modal-avg">AVG {averaj('white')}</div>
          </div>
          <div className="modal-vs">VS</div>
          <div className="modal-player-stat">
            <div className="modal-player-name">PLAYER B</div>
            <div className="modal-score yellow">{yellow.totalScore}</div>
            <div className="modal-avg">AVG {averaj('yellow')}</div>
          </div>
        </div>

        <div className="modal-inning">{currentInning} ıstaka oynandı</div>

        <button className="btn-new-match" onClick={onReset}>
          YENİ MAÇ
        </button>
      </div>
    </div>
  )
}
