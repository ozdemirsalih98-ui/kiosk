# Kod Fihrist — Bilardo Sayaç (Vanilla)

3 dosya: `index.html`, `app.js`, `style.css`. Değişiklik isterken dosya + bölüm adını söyle.

> **Kullanım:** Dosyayı aç, `Ctrl+F` ile bölüm başlığını ara (örn. `─── renderPlayer`).
> Satır numaraları yeni ekleme yapıldıkça kayabilir; başlık metni her zaman doğrudur.

---

## app.js — Tüm JavaScript Mantığı

### Ayarlar ve Sabit Değerler

| Satır | Bölüm | Ne var |
|-------|-------|--------|
| 3 | `═══ SETTINGS` | `DEFAULT_SETTINGS` sabiti (countdownDuration: 40, warmupDuration: 300, maxTimeouts: 3, autoTimer: false) |
| 11 | `loadSettings()` | localStorage'dan okur, eksik anahtarları default ile tamamlar |
| 20 | `saveSettings(s)` | Ayarları localStorage'a yazar |
| 24 | `let settings` | Aktif ayarlar nesnesi |

### Oyun State'i

| Satır | Bölüm | Ne var |
|-------|-------|--------|
| 26 | `═══ GAME STATE` | `createPlayer` ve `createGame` — başlangıç state şekli |
| 49 | `let game` | Aktif oyun state nesnesi |
| 50 | `let history / future` | Undo/redo yığınları (JSON deep-copy ile saklanır) |

### Oyun Aksiyonları

| Satır | Bölüm | Ne var |
|-------|-------|--------|
| 53 | `═══ GAME ACTIONS` | — |
| 54 | `pushHistory()` | Her aksiyon öncesi game'i history'ye ekler, future'ı temizler |
| 59 | `incrementRun()` | Aktif oyuncunun currentRun'ını +1 yapar |
| 66 | `decrementRun()` | currentRun'ı -1 yapar (min 0) |
| 73 | `confirmTurn()` | El onayı: skor güncelle, EYS hesapla, sırayı geç, inning artır |
| 96 | `useTimeoutAction(player)` | Oyuncunun timeoutsLeft'ini 1 düşürür (history'ye girmez) |
| 101 | `endMatch()` | matchEnded=true, winner hesapla |
| 112 | `undo()` | history'den bir adım geri al |
| 119 | `redo()` | future'dan bir adım ileri al |
| 126 | `resetMatch()` | Yeni oyun başlat (settings.maxTimeouts alır) |
| 133 | `averaj(player)` | Anlık AVG; maç bittiyse sabit avg döner |

### Geri Sayım

| Satır | Bölüm | Ne var |
|-------|-------|--------|
| 144 | `═══ COUNTDOWN` | `countdownRemaining`, `countdownRunning`, `countdownInterval`, `autoRestartTimer` değişkenleri |
| 150 | `countdownTick()` | Her saniye çağrılır; sıfırda useTimeoutAction tetikler ve sıfırlanır |
| 160 | `countdownStart()` | setInterval başlatır |
| 167 | `countdownStop()` | clearInterval, running=false |
| 174 | `countdownToggle()` | autoRestart iptal eder, start/stop değiştirir |
| 180 | `countdownReset()` | Durdurur ve countdownDuration'a sıfırlar |
| 186 | `countdownStartFull()` | Sıfırlar ve hemen başlatır (el geçişinde) |
| 192 | `countdownStartCustom(n)` | N saniyeye ayarlayıp başlatır (ısınma için) |
| 198 | `cancelAutoRestart()` | autoRestartTimer'ı iptal eder |

### Nav Modu

| Satır | Bölüm | Ne var |
|-------|-------|--------|
| 202 | `═══ NAV MODE` | `NAV_ORDER`, `navMode`, `navFocus` değişkenleri |
| 207 | `toggleNavMode()` | Nav aktif/pasif, focus sıfırlar |
| 213 | `navLeft() / navRight()` | NAV_ORDER içinde focus döndürür |
| 225 | `navOk()` | navFocus=settings ise ayarları açar |

### D-Pad Yönlendirme

| Satır | Bölüm | Ne var |
|-------|-------|--------|
| 229 | `═══ D-PAD HANDLERS` | — |
| 230 | `handleIncrement()` | +1 run; autoTimer açıksa 2sn sonra countdownStartFull |
| 239 | `handleConfirm()` | confirmTurn + autoTimer'a göre countdown başlat/sıfırla |
| 246 | `dpadRight/Left/Ok/Up/Down` | nav modda yön, normal modda oyun aksiyonu |

### Sayfa Geçişi

| Satır | Bölüm | Ne var |
|-------|-------|--------|
| 252 | `═══ PAGE NAVIGATION` | — |
| 253 | `openSettings()` | Form alanlarını doldurur, settings sayfasını gösterir |
| 265 | `closeSettings()` | Scoreboard'a döner |
| 270 | `applySettings()` | Form değerlerini settings'e yazar, localStorage'a kaydeder, countdownDuration günceller |

### Render Fonksiyonları

| Satır | Bölüm | Ne var |
|-------|-------|--------|
| 285 | `═══ RENDER` | — |
| 287 | `renderCountdown()` | Segment renklerini (yeşil→sarı→kırmızı), btn metnini, sayısal gösterimi günceller |
| 324 | `renderInningStrip()` | `strip-inner` içine strip-col'ları innerHTML ile yeniden yazar |
| 347 | `renderPlayer(color)` | Skor, basamak class (d1–d4), ball visibility, timeout noktaları, EYS/INNING/AVG |
| 380 | `renderCenter()` | RUN değeri ve rengi, undo/redo buton disabled durumu |
| 391 | `renderNav()` | Nav toggle butonu, header-a/b ve settings butonu nav-focused class |
| 402 | `renderMatchEndModal()` | Modal göster/gizle, kazanan etiketi, skorlar, avg, ıstaka sayısı |
| 420 | `render()` | Tüm render fonksiyonlarını sırayla çağırır (render() = tam güncelleme) |

### Event Listeners ve Init

| Satır | Bölüm | Ne var |
|-------|-------|--------|
| 429 | `═══ EVENT LISTENERS` | Tüm buton tıklamaları burada bağlanır |
| ~445 | `═══ INIT` | `render()` ve `renderCountdown()` çağrısı — sayfa açılışında ilk görünüm |

---

## style.css — Tüm Stiller

| Satır | Bölüm | Ne var |
|-------|-------|--------|
| 1 | Sıfırlama | `*, html, body` — overflow:hidden, user-select:none |
| 14 | `═══ SCOREBOARD` | `.scoreboard` tam ekran flex container |
| 23 | `─── HEADER` | `.sb-header`, `.sb-header-a/b` yükseklikler, renkler. A: `#f0f0f0`, B: `#c8940a` |
| 53 | `.nav-focused` | Cyan outline — header ve settings butonu için |
| 60 | `─── MAIN` | `.sb-main`, `.sb-col` (37%), `.sb-col-center` (26%) |
| 71 | `─── STRIP / COUNTDOWN` | `.sb-strip` 77px, `.sb-countdown` 57px |
| 77 | `═══ PLAYER PANEL` | `.player-col`, `.score-card` (background: `#0e1e38`) |
| 102 | Timeout noktaları | `.sc-dot` (yeşil aktif, siyah kullanılmış) |
| 119 | Sıra topu | `.sc-ball` — `ball.jpg`, visible class ile opacity:1 |
| 136 | Skor değeri | `.score-value` d1/d2: 44cqw, d3: 29cqw, d4: 22cqw (container query) |
| 148 | Stat satırı | `.stat-row`, `.stat-eys`, `.stat-inning`, `.stat-avg`, `.stat-label`, `.stat-val`, `.avg-val` |
| 190 | `═══ CENTER PANEL` | `.center-panel`, `.controls-frame` |
| 205 | Nav toggle butonu | `.btn-nav-toggle` — aktif: cyan |
| 214 | Countdown butonu | `.btn-countdown` — running: kırmızı pulse animasyonu |
| 228 | D-Pad | `.dpad-btn` boyutları, renkleri (up:mor, down:turuncu, left:kırmızı, right:yeşil, center:mavi) |
| 247 | Alt butonlar | `.btn-warmup`, `.btn-end-match`, `.btn-settings` |
| 270 | RUN kutusu | `.center-box`, `.run-val` — `clamp(4rem, 9vw, 10rem)`, white/yellow renk |
| 291 | `═══ INNING STRIP` | `.strip-inner` (yatay scroll, scrollbar gizli), `.strip-col`, `.strip-score` |
| 321 | `═══ COUNTDOWN BAR` | `.countdown-bar` (padding:11px 50px), `.countdown-segment`, `.countdown-number` (2rem, absolute orta) |
| 341 | `═══ MATCH END MODAL` | `.modal-overlay` (fixed, z-index:100), `.modal-box` (`#0d1e38`, border `#2a6acc`) |
| 379 | `═══ SETTINGS PAGE` | `.settings-page`, `.settings-form`, `.setting-input`, toggle switch stilleri, `.btn-back`, `.btn-save` |

---

## index.html — Sayfa Yapısı

| Satır | Bölüm | Ne var |
|-------|-------|--------|
| ~15 | `SETTINGS PAGE` | `#page-settings` — başlangıçta `display:none`. Form inputları: `#s-countdown`, `#s-warmup`, `#s-timeouts`, `#s-autotimer` |
| ~54 | `SCOREBOARD PAGE` | `#page-scoreboard` — header, sb-main (col-white, col-center, col-yellow), sb-strip, sb-countdown |
| ~75 | Beyaz oyuncu kolonu | `#score-white`, `#timeouts-white`, `#ball-white`, `#eys1/2-white`, `#inning-white`, `#avg-white` |
| ~104 | Merkez kolon | `#btn-nav-toggle`, `#btn-countdown`, `#btn-redo`, `#btn-left`, `#btn-ok`, `#btn-right`, `#btn-undo`, `#btn-warmup`, `#btn-end-match`, `#btn-settings-open`, `#run-val` |
| ~126 | Sarı oyuncu kolonu | `#score-yellow`, `#timeouts-yellow`, `#ball-yellow`, `#eys1/2-yellow`, `#inning-yellow`, `#avg-yellow` |
| ~152 | `#inning-strip` | InningStrip wrapper — innerHTML ile renderInningStrip() tarafından doldurulur |
| ~159 | `#countdown-bar` | CountdownBar wrapper — renderCountdown() tarafından güncellenir |
| ~165 | `MATCH END MODAL` | `#modal-match-end` — başlangıçta `display:none`. `#modal-winner`, `#modal-score-white/yellow`, `#modal-avg-white/yellow`, `#modal-inning-count` |

---

## Hangi ayar nerede?

| Ayar | Değer | Konum |
|------|-------|-------|
| Geri sayım süresi | 40 sn | `app.js:5` DEFAULT_SETTINGS |
| Isınma süresi | 300 sn (5 dk) | `app.js:6` DEFAULT_SETTINGS |
| Time-out hakkı | 3 | `app.js:7` DEFAULT_SETTINGS |
| Otomatik süre | false | `app.js:8` DEFAULT_SETTINGS |
| Kutu arka planı | `#0e1e38` | `style.css:99` `.score-card` background |
| Header A rengi | `#f0f0f0` | `style.css:32` `.sb-header-a` |
| Header B rengi | `#c8940a` | `style.css:40` `.sb-header-b` |
| Player B skor rengi | `#c8940a` | `index.html` col-yellow score-card inline style |
| Oyuncu sütun genişliği | 37% | `style.css:68` `.sb-col` |
| Merkez sütun genişliği | 26% | `style.css:69` `.sb-col-center` |
| Skor font (1–2 basamak) | 44cqw | `style.css:142` |
| Skor font (3 basamak) | 29cqw | `style.css:143` |
| Skor font (4 basamak) | 22cqw | `style.css:144` |
| RUN kutusu font | clamp(4rem, 9vw, 10rem) | `style.css:272` |
| Countdown sayı font | 2rem | `style.css:336` |
| Istaka şeridi yüksekliği | 77px | `style.css:72` |
| Countdown çubuğu yüksekliği | 57px | `style.css:75` |
| Kontrol alanı flex oranı | 8 | `index.html` controls-frame inline style |
| RUN kutusu flex oranı | 2.8 | `index.html` run-box inline style |
| Skor kutusu flex oranı | 10 | `index.html` score-card inline style |
