import { useCallback, useRef } from 'react'
import { useGame } from '../hooks/useGame'
import { useCountdown } from '../hooks/useCountdown'
import PlayerPanel from '../components/PlayerPanel'
import CenterPanel from '../components/CenterPanel'
import CountdownBar from '../components/CountdownBar'
import InningStrip from '../components/InningStrip'
import MatchEndModal from '../components/MatchEndModal'
import './Scoreboard.css'

export default function Scoreboard({ settings, onOpenSettings }) {
  const {
    state, canUndo, canRedo,
    incrementRun, decrementRun, confirmTurn,
    useTimeoutAction, endMatch, undo, redo, resetMatch, averaj,
  } = useGame(settings)

  const handleCountdownTimeout = useCallback(() => {
    useTimeoutAction(state.currentTurn)
  }, [useTimeoutAction, state.currentTurn])

  const { remaining, isRunning, toggle, pause, startFull, reset } = useCountdown(
    settings.countdownDuration,
    handleCountdownTimeout
  )

  const autoRestartRef = useRef(null)

  function cancelAutoRestart() {
    if (autoRestartRef.current) {
      clearTimeout(autoRestartRef.current)
      autoRestartRef.current = null
    }
  }

  function handleIncrement() {
    incrementRun()
    if (settings.autoTimer) {
      pause()
      cancelAutoRestart()
      autoRestartRef.current = setTimeout(() => {
        startFull()
        autoRestartRef.current = null
      }, 2000)
    }
  }

  function handleConfirm() {
    confirmTurn()
    cancelAutoRestart()
    if (settings.autoTimer) startFull()
    else reset()
  }

  function handleToggle() {
    cancelAutoRestart()
    toggle()
  }

  function handleReset() {
    cancelAutoRestart()
    resetMatch()
    reset()
  }

  const timeoutsA = Array.from({ length: settings.maxTimeouts }, (_, i) => i < state.white.timeoutsLeft)
  const timeoutsB = Array.from({ length: settings.maxTimeouts }, (_, i) => i < state.yellow.timeoutsLeft)

  const cssVars = {
    '--box-bg': settings.boxBg,
    '--score-scale': settings.scoreFontScale / 100,
    '--stat-scale': settings.statFontScale / 100,
  }

  const colPct = settings.playerColPct
  const centerPct = 100 - colPct * 2

  return (
    <div className="scoreboard" style={cssVars}>
      <header className="sb-header">
        <div className="sb-header-a" style={{ background: settings.playerAHeaderBg }}>
          <div className="header-timeouts">
            {timeoutsA.map((active, i) => (
              <div key={i} className={`hdr-dot ${active ? '' : 'used'}`} />
            ))}
          </div>
          <span className="header-name">PLAYER A</span>
          <div className={`header-ball white ${state.currentTurn === 'white' ? 'visible' : ''}`} />
        </div>
        <div className="sb-header-b" style={{ background: settings.playerBHeaderBg }}>
          <div className={`header-ball yellow ${state.currentTurn === 'yellow' ? 'visible' : ''}`} />
          <span className="header-name">PLAYER B</span>
          <div className="header-timeouts">
            {timeoutsB.map((active, i) => (
              <div key={i} className={`hdr-dot ${active ? '' : 'used'}`} />
            ))}
          </div>
        </div>
      </header>

      <div className="sb-main">
        <div style={{ flex: `0 0 ${colPct}%`, display: 'flex', minWidth: 0 }}>
          <PlayerPanel
            color="white"
            player={state.white}
            averaj={averaj('white')}
            weights={settings}
          />
        </div>
        <div style={{ flex: `0 0 ${centerPct}%`, display: 'flex', minWidth: 0 }}>
          <CenterPanel
            inning={state.currentInning}
            run={state[state.currentTurn].currentRun}
            currentTurn={state.currentTurn}
            isCountdownRunning={isRunning}
            onToggleCountdown={handleToggle}
            onIncrement={handleIncrement}
            onDecrement={decrementRun}
            onConfirm={handleConfirm}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            onEndMatch={endMatch}
            onOpenSettings={onOpenSettings}
            weights={settings}
          />
        </div>
        <div style={{ flex: `0 0 ${colPct}%`, display: 'flex', minWidth: 0 }}>
          <PlayerPanel
            color="yellow"
            player={state.yellow}
            averaj={averaj('yellow')}
            scoreBg={settings.playerBScoreBg}
            weights={settings}
          />
        </div>
      </div>

      <div className="sb-strip">
        <InningStrip
          white={state.white.inningHistory}
          yellow={state.yellow.inningHistory}
          count={settings.historyCount}
        />
      </div>

      <div className="sb-countdown">
        <CountdownBar
          remaining={remaining}
          duration={settings.countdownDuration}
          isRunning={isRunning}
        />
      </div>

      {state.matchEnded && (
        <MatchEndModal state={state} averaj={averaj} onReset={handleReset} />
      )}
    </div>
  )
}
