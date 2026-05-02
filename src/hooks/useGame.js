import { useReducer, useCallback } from 'react'

function createPlayer(maxTimeouts) {
  return {
    totalScore: 0,
    completedTurns: 0,
    currentRun: 0,
    highSeries: [0, 0],
    inningHistory: [],
    timeoutsLeft: maxTimeouts,
  }
}

function createGame(settings) {
  return {
    white: createPlayer(settings.maxTimeouts),
    yellow: createPlayer(settings.maxTimeouts),
    currentTurn: 'white',
    currentInning: 1,
    matchEnded: false,
    winner: null,
  }
}

function withHistory(state, newGame) {
  return { ...state, game: newGame, history: [...state.history, state.game], future: [] }
}

function gameReducer(state, action) {
  const { game, history, future } = state

  switch (action.type) {
    case 'INCREMENT_RUN': {
      if (game.matchEnded) return state
      const p = game.currentTurn
      return withHistory(state, {
        ...game,
        [p]: { ...game[p], currentRun: game[p].currentRun + 1 },
      })
    }

    case 'DECREMENT_RUN': {
      if (game.matchEnded) return state
      const p = game.currentTurn
      return withHistory(state, {
        ...game,
        [p]: { ...game[p], currentRun: Math.max(0, game[p].currentRun - 1) },
      })
    }

    case 'CONFIRM_TURN': {
      if (game.matchEnded) return state
      const player = game.currentTurn
      const p = game[player]
      const run = p.currentRun
      const allScores = [...p.inningHistory, run].sort((a, b) => b - a)
      const nextTurn = player === 'white' ? 'yellow' : 'white'
      const newInning = player === 'yellow' ? game.currentInning + 1 : game.currentInning

      return withHistory(state, {
        ...game,
        [player]: {
          ...p,
          totalScore: p.totalScore + run,
          completedTurns: p.completedTurns + 1,
          currentRun: 0,
          highSeries: [allScores[0] ?? 0, allScores[1] ?? 0],
          inningHistory: [...p.inningHistory, run],
        },
        currentTurn: nextTurn,
        currentInning: newInning,
      })
    }

    case 'USE_TIMEOUT': {
      const player = action.player
      return {
        ...state,
        game: {
          ...game,
          [player]: { ...game[player], timeoutsLeft: Math.max(0, game[player].timeoutsLeft - 1) },
        },
      }
    }

    case 'END_MATCH': {
      let winner = 'draw'
      if (game.white.totalScore > game.yellow.totalScore) winner = 'white'
      else if (game.yellow.totalScore > game.white.totalScore) winner = 'yellow'
      return withHistory(state, { ...game, matchEnded: true, winner })
    }

    case 'UNDO': {
      if (history.length === 0) return state
      return {
        ...state,
        game: history[history.length - 1],
        history: history.slice(0, -1),
        future: [game, ...future],
      }
    }

    case 'REDO': {
      if (future.length === 0) return state
      return {
        ...state,
        game: future[0],
        history: [...history, game],
        future: future.slice(1),
      }
    }

    case 'RESET': {
      return { game: createGame(state.settings), history: [], future: [], settings: state.settings }
    }

    default:
      return state
  }
}

export function useGame(settings) {
  const [state, dispatch] = useReducer(
    gameReducer,
    null,
    () => ({ game: createGame(settings), history: [], future: [], settings })
  )

  const incrementRun = useCallback(() => dispatch({ type: 'INCREMENT_RUN' }), [])
  const decrementRun = useCallback(() => dispatch({ type: 'DECREMENT_RUN' }), [])
  const confirmTurn = useCallback(() => dispatch({ type: 'CONFIRM_TURN' }), [])
  const useTimeoutAction = useCallback((player) => dispatch({ type: 'USE_TIMEOUT', player }), [])
  const endMatch = useCallback(() => dispatch({ type: 'END_MATCH' }), [])
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), [])
  const redo = useCallback(() => dispatch({ type: 'REDO' }), [])
  const resetMatch = useCallback(() => dispatch({ type: 'RESET' }), [])

  function averaj(player) {
    const p = state.game[player]
    if (p.completedTurns === 0) return '0.000'
    return (p.totalScore / p.completedTurns).toFixed(3)
  }

  return {
    state: state.game,
    canUndo: state.history.length > 0,
    canRedo: state.future.length > 0,
    incrementRun,
    decrementRun,
    confirmTurn,
    useTimeoutAction,
    endMatch,
    undo,
    redo,
    resetMatch,
    averaj,
  }
}
