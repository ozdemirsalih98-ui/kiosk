'use strict'

// ═══ FIREBASE ════════════════════════════════════════════════════════
firebase.initializeApp({
  apiKey: "AIzaSyBlYSJbBnkL-PoPM_VH3uLDBe545awkO04",
  authDomain: "aktepe-94711.firebaseapp.com",
  projectId: "aktepe-94711",
  storageBucket: "aktepe-94711.firebasestorage.app",
  messagingSenderId: "721383862652",
  appId: "1:721383862652:web:dc1de116bacae16f5c74f9"
})
const db = firebase.firestore()

// ═══ SETTINGS ════════════════════════════════════════════════════════
const DEFAULT_SETTINGS = {
  countdownDuration: 40,
  warmupDuration: 300,
  maxTimeouts: 3,
  autoTimer: false,
  autoTimerDelay: 2,
}

function loadSettings() {
  try {
    const saved = localStorage.getItem('bilardo-settings')
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

function saveSettings(s) {
  localStorage.setItem('bilardo-settings', JSON.stringify(s))
}

let settings = loadSettings()

// ═══ GAME STATE ══════════════════════════════════════════════════════
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

function createGame(s) {
  return {
    white: createPlayer(s.maxTimeouts),
    yellow: createPlayer(s.maxTimeouts),
    currentTurn: 'white',
    currentInning: 1,
    matchEnded: false,
    winner: null,
  }
}

let game    = createGame(settings)
let history = []
let future  = []

// ═══ GAME ACTIONS ════════════════════════════════════════════════════
function pushHistory() {
  history.push(JSON.parse(JSON.stringify(game)))
  future = []
}

function incrementRun() {
  if (game.matchEnded) return
  pushHistory()
  game[game.currentTurn].currentRun += 1
  render()
}

function decrementRun() {
  if (game.matchEnded) return
  pushHistory()
  game[game.currentTurn].currentRun = Math.max(0, game[game.currentTurn].currentRun - 1)
  render()
}

function confirmTurn() {
  if (game.matchEnded) return
  pushHistory()
  const p = game.currentTurn
  const player = game[p]
  const run = player.currentRun
  const allScores = [...player.inningHistory, run].sort((a, b) => b - a)
  const nextTurn = p === 'white' ? 'yellow' : 'white'
  const newInning = p === 'yellow' ? game.currentInning + 1 : game.currentInning

  game[p] = {
    ...player,
    totalScore: player.totalScore + run,
    completedTurns: player.completedTurns + 1,
    currentRun: 0,
    highSeries: [allScores[0] ?? 0, allScores[1] ?? 0],
    inningHistory: [...player.inningHistory, run],
  }
  game.currentTurn = nextTurn
  game.currentInning = newInning
  render()
}

function useTimeoutAction(player) {
  game[player].timeoutsLeft = Math.max(0, game[player].timeoutsLeft - 1)
  render()
}

function endMatch() {
  if (game.matchEnded) return
  pushHistory()
  let winner = 'draw'
  if (game.white.totalScore > game.yellow.totalScore) winner = 'white'
  else if (game.yellow.totalScore > game.white.totalScore) winner = 'yellow'
  game.matchEnded = true
  game.winner = winner
  render()
}

function undo() {
  if (history.length === 0) return
  future.unshift(JSON.parse(JSON.stringify(game)))
  game = history.pop()
  render()
}

function redo() {
  if (future.length === 0) return
  history.push(JSON.parse(JSON.stringify(game)))
  game = future.shift()
  render()
}

function resetMatch() {
  game    = createGame(settings)
  history = []
  future  = []
  render()
}

function averaj(player) {
  const p = game[player]
  if (game.matchEnded) {
    if (p.inningHistory.length === 0) return '0.000'
    return (p.totalScore / p.inningHistory.length).toFixed(3)
  }
  const inningCount = p.inningHistory.length + (game.currentTurn === player ? 1 : 0)
  if (inningCount === 0) return '0.000'
  return ((p.totalScore + p.currentRun) / inningCount).toFixed(3)
}

// ═══ COUNTDOWN ═══════════════════════════════════════════════════════
let countdownRemaining = settings.countdownDuration
let countdownTotal     = settings.countdownDuration
let countdownRunning   = false
let countdownInterval  = null
let autoRestartTimer   = null
let warmupMode         = false

function countdownTick() {
  countdownRemaining -= 1
  if (countdownRemaining <= 0) {
    if (warmupMode) {
      stopWarmup()
    } else {
      countdownRemaining = settings.countdownDuration
      countdownStop()
      useTimeoutAction(game.currentTurn)
      if (game[game.currentTurn].timeoutsLeft > 0) {
        countdownStart()
      }
    }
  }
  renderCountdown()
}

function countdownStart() {
  if (countdownRunning) return
  countdownRunning = true
  countdownInterval = setInterval(countdownTick, 1000)
  renderCountdown()
}

function countdownStop() {
  countdownRunning = false
  clearInterval(countdownInterval)
  countdownInterval = null
  renderCountdown()
}

function countdownToggle() {
  cancelAutoRestart()
  if (countdownRunning) countdownStop()
  else countdownStart()
}

function countdownReset() {
  countdownStop()
  countdownRemaining = settings.countdownDuration
  countdownTotal     = settings.countdownDuration
  renderCountdown()
}

function countdownStartFull() {
  countdownStop()
  countdownRemaining = settings.countdownDuration
  countdownTotal     = settings.countdownDuration
  countdownStart()
}

function countdownStartCustom(n) {
  countdownStop()
  countdownRemaining = n
  countdownTotal     = n
  countdownStart()
}

function cancelAutoRestart() {
  if (autoRestartTimer) { clearTimeout(autoRestartTimer); autoRestartTimer = null }
}

function canStartWarmup() {
  return game.white.inningHistory.length === 0
      && game.yellow.inningHistory.length === 0
      && game.white.currentRun === 0
      && game.yellow.currentRun === 0
}

function startWarmup() {
  if (!canStartWarmup()) return
  warmupMode = true
  document.getElementById('page-scoreboard').classList.add('warmup-active')
  cancelAutoRestart()
  countdownStartCustom(settings.warmupDuration)
  renderWarmupBtn()
}

function stopWarmup() {
  warmupMode = false
  document.getElementById('page-scoreboard').classList.remove('warmup-active')
  countdownReset()
  renderWarmupBtn()
}

function renderWarmupBtn() {
  const btn = document.getElementById('btn-warmup')
  if (warmupMode) {
    btn.textContent = 'ISINMAYI BİTİR'
    btn.disabled    = false
  } else {
    btn.textContent = 'ISINMA BAŞLAT'
    btn.disabled    = !canStartWarmup()
  }
}

// ═══ PLAYER NAMES ════════════════════════════════════════════════════
let playerNames = { white: 'PLAYER A', yellow: 'PLAYER B' }

function renderHeaders() {
  document.getElementById('name-white').textContent  = playerNames.white
  document.getElementById('name-yellow').textContent = playerNames.yellow
}

// ═══ PLAYER SELECT MODAL ═════════════════════════════════════════════
let playerModalOpen   = false
let playerModalTarget = null
let playerModalList   = []
let playerModalIndex  = 0

async function openPlayerModal(target) {
  playerModalOpen   = true
  playerModalTarget = target
  playerModalList   = []
  playerModalIndex  = 0
  document.getElementById('player-modal-title').textContent =
    `OYUNCU SEÇ — ${target === 'white' ? 'PLAYER A' : 'PLAYER B'}`
  document.getElementById('player-list').innerHTML = '<div class="player-list-loading">Yükleniyor…</div>'
  document.getElementById('modal-player-select').style.display = 'flex'

  try {
    const snap = await db.collection('kullanicilar')
      .where('rol', '==', 'oyuncu')
      .where('tip', '==', 'bilardo')
      .get()
    playerModalList = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    renderPlayerModal()
  } catch (e) {
    document.getElementById('player-list').innerHTML =
      `<div class="player-list-loading">Hata: ${e.message}</div>`
  }
}

function closePlayerModal() {
  playerModalOpen = false
  document.getElementById('modal-player-select').style.display = 'none'
}

function confirmPlayerSelection() {
  if (playerModalList.length === 0) return
  const p = playerModalList[playerModalIndex]
  playerNames[playerModalTarget] = p.adSoyad || 'OYUNCU'
  closePlayerModal()
  renderHeaders()
}

function playerModalNext() {
  if (playerModalList.length === 0) return
  playerModalIndex = (playerModalIndex + 1) % playerModalList.length
  renderPlayerModal()
}

function playerModalPrev() {
  if (playerModalList.length === 0) return
  playerModalIndex = (playerModalIndex - 1 + playerModalList.length) % playerModalList.length
  renderPlayerModal()
}

function renderPlayerModal() {
  const list = document.getElementById('player-list')
  if (playerModalList.length === 0) {
    list.innerHTML = '<div class="player-list-loading">Oyuncu bulunamadı</div>'
    return
  }
  list.innerHTML = playerModalList.map((p, i) => `
    <div class="player-item${i === playerModalIndex ? ' selected' : ''}" data-index="${i}">
      <span class="pi-name">${p.adSoyad || '—'}</span>
      <span class="pi-stat">${p.genelAvg   ?? '—'}</span>
      <span class="pi-stat">${p.enYuksekAvg ?? '—'}</span>
      <span class="pi-stat">${p.eys1        ?? '—'}</span>
      <span class="pi-stat">${p.eys2        ?? '—'}</span>
      <span class="pi-stat">${p.toplamPuan  ?? '—'}</span>
    </div>`).join('')
  list.querySelector('.player-item.selected')?.scrollIntoView({ block: 'nearest' })
}

// ═══ CONFIRM END ═════════════════════════════════════════════════════
let confirmEndOpen = false
let confirmFocus   = 'no'

function openConfirmEnd() {
  confirmEndOpen = true
  confirmFocus   = 'no'
  renderConfirmEnd()
  document.getElementById('modal-confirm-end').style.display = 'flex'
}

function closeConfirmEnd() {
  confirmEndOpen = false
  document.getElementById('modal-confirm-end').style.display = 'none'
}

function confirmEndExecute() {
  closeConfirmEnd()
  endMatch()
}

function renderConfirmEnd() {
  document.getElementById('btn-confirm-yes').classList.toggle('focused', confirmFocus === 'yes')
  document.getElementById('btn-confirm-no').classList.toggle('focused', confirmFocus === 'no')
}

// ═══ NAV MODE ════════════════════════════════════════════════════════
const NAV_ORDER = ['playerA', 'playerB', 'settings']
let navMode  = false
let navFocus = 'playerA'

function toggleNavMode() {
  navMode = !navMode
  if (!navMode) navFocus = 'playerA'
  renderNav()
}

function navLeft() {
  const i = NAV_ORDER.indexOf(navFocus)
  navFocus = NAV_ORDER[(i - 1 + NAV_ORDER.length) % NAV_ORDER.length]
  renderNav()
}

function navRight() {
  const i = NAV_ORDER.indexOf(navFocus)
  navFocus = NAV_ORDER[(i + 1) % NAV_ORDER.length]
  renderNav()
}

function navOk() {
  if (navFocus === 'settings') openSettings()
}

// ═══ D-PAD HANDLERS ══════════════════════════════════════════════════
function handleIncrement() {
  incrementRun()
  if (settings.autoTimer) {
    countdownStop()
    cancelAutoRestart()
    autoRestartTimer = setTimeout(() => { autoRestartTimer = null; countdownStartFull() }, settings.autoTimerDelay * 1000)
  }
}

function handleConfirm() {
  confirmTurn()
  cancelAutoRestart()
  if (settings.autoTimer) countdownStartFull()
  else countdownReset()
}

function dpadRight()  {
  if (playerModalOpen) return
  if (confirmEndOpen) { confirmFocus = 'yes'; renderConfirmEnd(); return }
  navMode ? navRight() : handleIncrement()
}
function dpadLeft()   {
  if (playerModalOpen) { closePlayerModal(); return }
  if (confirmEndOpen) { confirmFocus = 'no'; renderConfirmEnd(); return }
  navMode ? navLeft() : decrementRun()
}
function dpadOk()     {
  if (playerModalOpen) { confirmPlayerSelection(); return }
  if (confirmEndOpen) { confirmFocus === 'yes' ? confirmEndExecute() : closeConfirmEnd(); return }
  navMode ? navOk() : handleConfirm()
}
function dpadUp()     {
  if (playerModalOpen) { playerModalPrev(); return }
  if (!navMode && !confirmEndOpen) redo()
}
function dpadDown()   {
  if (playerModalOpen) { playerModalNext(); return }
  if (!navMode && !confirmEndOpen) undo()
}

// ═══ PAGE NAVIGATION ═════════════════════════════════════════════════
function openSettings() {
  document.getElementById('s-countdown').value  = settings.countdownDuration
  document.getElementById('s-warmup').value     = Math.round(settings.warmupDuration / 60)
  document.getElementById('s-timeouts').value   = settings.maxTimeouts
  document.getElementById('s-autodelay').value  = settings.autoTimerDelay
  const cb = document.getElementById('s-autotimer')
  cb.checked = settings.autoTimer
  document.getElementById('s-autotimer-label').textContent = settings.autoTimer ? 'AÇIK' : 'KAPALI'

  document.getElementById('page-scoreboard').style.display = 'none'
  document.getElementById('page-settings').style.display   = 'flex'
}

function closeSettings() {
  document.getElementById('page-settings').style.display   = 'none'
  document.getElementById('page-scoreboard').style.display = 'flex'
}

function applySettings() {
  settings.countdownDuration = Number(document.getElementById('s-countdown').value)
  settings.warmupDuration    = Number(document.getElementById('s-warmup').value) * 60
  settings.maxTimeouts       = Number(document.getElementById('s-timeouts').value)
  settings.autoTimer         = document.getElementById('s-autotimer').checked
  settings.autoTimerDelay    = Math.max(1, Number(document.getElementById('s-autodelay').value))
  saveSettings(settings)

  countdownRemaining = settings.countdownDuration
  countdownTotal     = settings.countdownDuration
  if (warmupMode) stopWarmup()
  countdownStop()

  closeSettings()
  render()
}

// ═══ RENDER ══════════════════════════════════════════════════════════
// ─── renderCountdown ─────────────────────────────
function renderCountdown() {
  const TOTAL = 30
  const bar   = document.getElementById('countdown-bar')
  const segs  = document.getElementById('countdown-segments')
  const dur   = countdownTotal
  const activeCount = Math.round((countdownRemaining / dur) * TOTAL)

  // segments
  let html = ''
  for (let i = 0; i < TOTAL; i++) {
    const isActive = i >= (TOTAL - activeCount)
    let color = 'rgba(255,255,255,0.04)'
    if (isActive) {
      const pos = i / (TOTAL - 1)
      if (pos < 0.5) color = '#00cc44'
      else if (pos < 0.75) color = '#cccc00'
      else color = '#cc2200'
    }
    html += `<div class="countdown-segment" style="background:${color}"></div>`
  }
  segs.innerHTML = html

  // number
  let numEl = bar.querySelector('.countdown-number')
  const showNumber = countdownRunning || countdownRemaining < countdownTotal
  if (showNumber) {
    if (!numEl) { numEl = document.createElement('div'); numEl.className = 'countdown-number'; bar.appendChild(numEl) }
    numEl.textContent = countdownRemaining
  } else {
    if (numEl) numEl.remove()
  }

  const btn = document.getElementById('btn-countdown')
  if (countdownRunning) { btn.textContent = '⏸ DURDUR'; btn.classList.add('running') }
  else                  { btn.textContent = '▶ SÜRE BAŞLAT'; btn.classList.remove('running') }
}

// ─── renderInningStrip ───────────────────────────
function renderInningStrip() {
  const white  = game.white.inningHistory
  const yellow = game.yellow.inningHistory
  const total  = Math.max(white.length, yellow.length)
  const el     = document.getElementById('inning-strip')

  if (total === 0) { el.innerHTML = '<div class="strip-empty">— henüz ıstaka yok —</div>'; return }

  let html = '<div class="strip-inner">'
  for (let i = 0; i < total; i++) {
    const ws = white[i] ?? null
    const ys = yellow[i] ?? null
    html += `<div class="strip-col">
      <div class="strip-score white">${ws === null ? '' : ws === 0 ? '—' : ws}</div>
      <div class="strip-score yellow">${ys === null ? '' : ys === 0 ? '—' : ys}</div>
      <div class="strip-inning">${i + 1}</div>
    </div>`
  }
  html += '</div>'
  el.innerHTML = html
}

// ─── renderPlayer(color) ─────────────────────────
function renderPlayer(color) {
  const p          = game[color]
  const isActive   = game.currentTurn === color
  const scoreStr   = String(p.totalScore)
  const digitClass = `d${Math.min(scoreStr.length, 4)}`

  document.getElementById(`score-${color}`).textContent  = p.totalScore
  document.getElementById(`score-${color}`).className    = `score-value ${digitClass}`

  // ball visibility
  const ball = document.getElementById(`ball-${color}`)
  if (isActive) ball.classList.add('visible')
  else          ball.classList.remove('visible')

  // timeout dots
  const dotsEl = document.getElementById(`timeouts-${color}`)
  let dots = ''
  for (let i = 0; i < settings.maxTimeouts; i++) {
    dots += `<div class="sc-dot${i < p.timeoutsLeft ? '' : ' used'}"></div>`
  }
  dotsEl.innerHTML = dots

  // stats
  document.getElementById(`inning-${color}`).textContent = color === 'white'
    ? (game.matchEnded ? p.inningHistory.length : p.inningHistory.length + (game.currentTurn === 'white' ? 1 : 0))
    : (game.matchEnded ? p.inningHistory.length : p.inningHistory.length + (game.currentTurn === 'yellow' ? 1 : 0))

  document.getElementById(`avg-${color}`).textContent  = averaj(color)
  document.getElementById(`eys1-${color}`).textContent = p.highSeries[0] || '—'
  document.getElementById(`eys2-${color}`).textContent = p.highSeries[1] || '—'
}

// ─── renderCenter ────────────────────────────────
function renderCenter() {
  const run = game[game.currentTurn].currentRun
  const runEl = document.getElementById('run-val')
  runEl.textContent = run
  runEl.className   = `center-box-value run-val ${game.currentTurn}`

  document.getElementById('btn-undo').disabled = navMode || history.length === 0
  document.getElementById('btn-redo').disabled = navMode || future.length === 0
}

// ─── renderNav ───────────────────────────────────
function renderNav() {
  const btn = document.getElementById('btn-nav-toggle')
  if (navMode) { btn.textContent = '◀▶ YÖN: AKTİF'; btn.classList.add('active') }
  else         { btn.textContent = '◀▶ YÖN: PASİF'; btn.classList.remove('active') }

  document.getElementById('header-a').className     = `sb-header-a${navMode && navFocus === 'playerA'   ? ' nav-focused' : ''}`
  document.getElementById('header-b').className     = `sb-header-b${navMode && navFocus === 'playerB'   ? ' nav-focused' : ''}`
  document.getElementById('btn-settings-open').className = `btn-settings${navMode && navFocus === 'settings' ? ' nav-focused' : ''}`
}

// ─── renderMatchEndModal ─────────────────────────
function renderMatchEndModal() {
  const modal = document.getElementById('modal-match-end')
  if (!game.matchEnded) { modal.style.display = 'none'; return }
  modal.style.display = 'flex'

  const w = game.winner
  const winnerLabel = w === 'draw' ? 'BERABERE' : w === 'white' ? 'PLAYER A KAZANDI' : 'PLAYER B KAZANDI'
  const winnerEl = document.getElementById('modal-winner')
  winnerEl.textContent = winnerLabel
  winnerEl.className   = `modal-winner ${w}`

  document.getElementById('modal-score-white').textContent  = game.white.totalScore
  document.getElementById('modal-score-yellow').textContent = game.yellow.totalScore
  document.getElementById('modal-avg-white').textContent    = `AVG ${averaj('white')}`
  document.getElementById('modal-avg-yellow').textContent   = `AVG ${averaj('yellow')}`
  document.getElementById('modal-inning-count').textContent = `${game.yellow.inningHistory.length} ıstaka oynandı`
}

function render() {
  renderPlayer('white')
  renderPlayer('yellow')
  renderCenter()
  renderNav()
  renderInningStrip()
  renderMatchEndModal()
  renderWarmupBtn()
  renderHeaders()
}

// ═══ EVENT LISTENERS ═════════════════════════════════════════════════
document.getElementById('btn-right').addEventListener('click', dpadRight)
document.getElementById('btn-left').addEventListener('click', dpadLeft)
document.getElementById('btn-ok').addEventListener('click', dpadOk)
document.getElementById('btn-undo').addEventListener('click', dpadDown)
document.getElementById('btn-redo').addEventListener('click', dpadUp)
document.getElementById('btn-countdown').addEventListener('click', countdownToggle)
document.getElementById('btn-nav-toggle').addEventListener('click', toggleNavMode)
document.getElementById('btn-warmup').addEventListener('click', () => { warmupMode ? stopWarmup() : startWarmup() })
document.getElementById('btn-end-match').addEventListener('click', openConfirmEnd)
document.getElementById('btn-confirm-yes').addEventListener('click', confirmEndExecute)
document.getElementById('btn-confirm-no').addEventListener('click', closeConfirmEnd)
document.getElementById('header-a').addEventListener('click', () => openPlayerModal('white'))
document.getElementById('header-b').addEventListener('click', () => openPlayerModal('yellow'))
document.getElementById('player-list').addEventListener('click', e => {
  const item = e.target.closest('.player-item')
  if (!item) return
  playerModalIndex = Number(item.dataset.index)
  confirmPlayerSelection()
})
document.getElementById('btn-settings-open').addEventListener('click', openSettings)
document.getElementById('btn-settings-cancel').addEventListener('click', closeSettings)
document.getElementById('btn-settings-save').addEventListener('click', applySettings)
document.getElementById('btn-new-match').addEventListener('click', () => { resetMatch(); countdownReset(); navMode = false; navFocus = 'playerA'; renderNav() })

document.getElementById('s-autotimer').addEventListener('change', function () {
  document.getElementById('s-autotimer-label').textContent = this.checked ? 'AÇIK' : 'KAPALI'
})

// ═══ INIT ════════════════════════════════════════════════════════════
render()
renderCountdown()
