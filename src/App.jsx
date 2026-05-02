import { useState } from 'react'
import Scoreboard from './pages/Scoreboard'
import Settings from './pages/Settings'

export const DEFAULT_SETTINGS = {
  countdownDuration: 40,
  maxTimeouts: 3,
  historyCount: 10,
  autoTimer: false,
  // Yönetim Paneli — Renkler
  boxBg: '#0e1e38',
  playerBScoreBg: '#c8940a',
  playerAHeaderBg: '#f0f0f0',
  playerBHeaderBg: '#c8940a',
  // Yönetim Paneli — Sütun genişlikleri
  playerColPct: 37,
  // Yönetim Paneli — Yazı boyutları
  scoreFontScale: 100,
  statFontScale: 100,
  // Yönetim Paneli — Kutu yükseklik oranları (flex-grow ağırlıkları)
  scoreWeight: 10,     // oyuncu skor kutusu
  eysWeight: 3,        // EYS 1 + EYS 2 satırı
  avgWeight: 2,        // AVG kutusu
  inningWeight: 3,     // INNING kutusu (merkez)
  controlsWeight: 8,   // D-pad kontrol alanı (merkez)
  runWeight: 3,        // RUN kutusu (merkez)
}

export default function App() {
  const [page, setPage] = useState('scoreboard')
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('bilardo-settings')
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  function saveSettings(newSettings) {
    const merged = { ...DEFAULT_SETTINGS, ...newSettings }
    setSettings(merged)
    localStorage.setItem('bilardo-settings', JSON.stringify(merged))
    setPage('scoreboard')
  }

  if (page === 'settings') {
    return <Settings settings={settings} onSave={saveSettings} onBack={() => setPage('scoreboard')} />
  }

  return <Scoreboard settings={settings} onOpenSettings={() => setPage('settings')} />
}
