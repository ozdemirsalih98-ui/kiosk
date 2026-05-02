import { useState } from 'react'
import './Settings.css'

function RangeItem({ label, value, unit = '', note = '', min, max, step, onChange }) {
  return (
    <div className="setting-item">
      <label className="setting-label">
        {label}: <strong>{value}{unit}</strong>
        {note && <span className="range-note"> ({note})</span>}
      </label>
      <input type="range" className="range-input" min={min} max={max} step={step}
        value={value} onChange={e => onChange(Number(e.target.value))} />
    </div>
  )
}

export default function Settings({ settings, onSave, onBack }) {
  const [form, setForm] = useState({ ...settings })
  const [tab, setTab] = useState('genel')

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  return (
    <div className="settings-page">
      <div className="settings-title">⚙ Ayarlar</div>

      <div className="settings-tabs">
        <button className={`tab-btn ${tab === 'genel' ? 'active' : ''}`} onClick={() => setTab('genel')}>Genel</button>
        <button className={`tab-btn ${tab === 'panel' ? 'active' : ''}`} onClick={() => setTab('panel')}>Yönetim Paneli</button>
      </div>

      {tab === 'genel' && (
        <div className="settings-form">
          <div className="setting-item">
            <label className="setting-label">Geri Sayım Süresi (saniye)</label>
            <input className="setting-input" type="number" min={10} max={120}
              value={form.countdownDuration}
              onChange={e => set('countdownDuration', Number(e.target.value))} />
          </div>

          <div className="setting-item">
            <label className="setting-label">Time-Out Hakkı</label>
            <select className="setting-input" value={form.maxTimeouts}
              onChange={e => set('maxTimeouts', Number(e.target.value))}>
              <option value={2}>2 hak</option>
              <option value={3}>3 hak</option>
              <option value={4}>4 hak</option>
              <option value={5}>5 hak</option>
            </select>
          </div>

          <div className="setting-item">
            <label className="setting-label">Son Kaç Istaka Gösterilsin</label>
            <select className="setting-input" value={form.historyCount}
              onChange={e => set('historyCount', Number(e.target.value))}>
              <option value={10}>10 ıstaka</option>
              <option value={15}>15 ıstaka</option>
              <option value={20}>20 ıstaka</option>
            </select>
          </div>

          <div className="setting-item setting-toggle">
            <label className="setting-label">Otomatik Süre Başlatma</label>
            <div className="toggle-desc">
              Açık: el geçişinde süre otomatik başlar. +1 basınca durur, 2 sn sonra yeniden başlar.
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={form.autoTimer}
                onChange={e => set('autoTimer', e.target.checked)} />
              <span className="toggle-slider" />
              <span className="toggle-label">{form.autoTimer ? 'AÇIK' : 'KAPALI'}</span>
            </label>
          </div>
        </div>
      )}

      {tab === 'panel' && (
        <div className="settings-form">
          <div className="panel-section-title">RENKLER</div>

          <div className="setting-item setting-color-row">
            <label className="setting-label">Kutu Arka Plan Rengi (tüm kutular)</label>
            <div className="color-row">
              <input type="color" className="color-input" value={form.boxBg}
                onChange={e => set('boxBg', e.target.value)} />
              <span className="color-hex">{form.boxBg}</span>
              <div className="color-preview" style={{ background: form.boxBg }} />
            </div>
          </div>

          <div className="setting-item setting-color-row">
            <label className="setting-label">Player B Skor Kutusu Rengi</label>
            <div className="color-row">
              <input type="color" className="color-input" value={form.playerBScoreBg}
                onChange={e => set('playerBScoreBg', e.target.value)} />
              <span className="color-hex">{form.playerBScoreBg}</span>
              <div className="color-preview" style={{ background: form.playerBScoreBg }} />
            </div>
          </div>

          <div className="setting-item setting-color-row">
            <label className="setting-label">Player A Başlık Rengi</label>
            <div className="color-row">
              <input type="color" className="color-input" value={form.playerAHeaderBg}
                onChange={e => set('playerAHeaderBg', e.target.value)} />
              <span className="color-hex">{form.playerAHeaderBg}</span>
              <div className="color-preview" style={{ background: form.playerAHeaderBg }} />
            </div>
          </div>

          <div className="setting-item setting-color-row">
            <label className="setting-label">Player B Başlık Rengi</label>
            <div className="color-row">
              <input type="color" className="color-input" value={form.playerBHeaderBg}
                onChange={e => set('playerBHeaderBg', e.target.value)} />
              <span className="color-hex">{form.playerBHeaderBg}</span>
              <div className="color-preview" style={{ background: form.playerBHeaderBg }} />
            </div>
          </div>

          <div className="panel-section-title" style={{ marginTop: '0.5rem' }}>SÜTUN GENİŞLİKLERİ</div>

          <RangeItem label="Oyuncu Sütun Genişliği" value={form.playerColPct} unit="%" note={`Merkez: ${100 - form.playerColPct * 2}%`} min={22} max={44} step={1} onChange={v => set('playerColPct', v)} />

          <div className="panel-section-title" style={{ marginTop: '0.5rem' }}>KUTU YÜKSEKLİKLERİ — OYUNCU PANELİ</div>
          <div className="weights-hint">Kutular arası oran. Büyük değer = daha fazla yükseklik.</div>

          <RangeItem label="Skor Kutusu" value={form.scoreWeight} min={2} max={20} step={1} onChange={v => set('scoreWeight', v)} />
          <RangeItem label="EYS 1 + EYS 2 Satırı" value={form.eysWeight} min={1} max={10} step={1} onChange={v => set('eysWeight', v)} />
          <RangeItem label="AVG Kutusu" value={form.avgWeight} min={1} max={10} step={1} onChange={v => set('avgWeight', v)} />

          <div className="panel-section-title" style={{ marginTop: '0.5rem' }}>KUTU YÜKSEKLİKLERİ — MERKEZ PANELİ</div>

          <RangeItem label="INNING Kutusu" value={form.inningWeight} min={1} max={10} step={1} onChange={v => set('inningWeight', v)} />
          <RangeItem label="Kontrol Alanı (D-Pad)" value={form.controlsWeight} min={2} max={20} step={1} onChange={v => set('controlsWeight', v)} />
          <RangeItem label="RUN Kutusu" value={form.runWeight} min={1} max={10} step={1} onChange={v => set('runWeight', v)} />

          <div className="panel-section-title" style={{ marginTop: '0.5rem' }}>YAZI BOYUTLARI</div>

          <RangeItem label="Skor Yazı Boyutu" value={form.scoreFontScale} unit="%" min={40} max={160} step={5} onChange={v => set('scoreFontScale', v)} />
          <RangeItem label="İstatistik Yazı Boyutu" value={form.statFontScale} unit="%" note="EYS, AVG" min={40} max={160} step={5} onChange={v => set('statFontScale', v)} />
        </div>
      )}

      <div className="settings-actions">
        <button className="btn-back" onClick={onBack}>İptal</button>
        <button className="btn-save" onClick={() => onSave(form)}>Kaydet</button>
      </div>
    </div>
  )
}
