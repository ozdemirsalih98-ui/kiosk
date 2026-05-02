import './InningStrip.css'

export default function InningStrip({ white, yellow, count }) {
  const total = Math.max(white.length, yellow.length)
  const start = Math.max(0, total - count)
  const items = []

  for (let i = start; i < total; i++) {
    items.push({
      inning: i + 1,
      whiteScore: white[i] ?? null,
      yellowScore: yellow[i] ?? null,
    })
  }

  if (items.length === 0) return (
    <div className="inning-strip">
      <div className="strip-empty">— henüz ıstaka yok —</div>
    </div>
  )

  return (
    <div className="inning-strip">
      <div className="strip-inner">
        {items.map(({ inning, whiteScore, yellowScore }) => (
          <div key={inning} className="strip-col">
            <div className="strip-score white">
              {whiteScore === null ? '' : whiteScore === 0 ? '—' : whiteScore}
            </div>
            <div className="strip-score yellow">
              {yellowScore === null ? '' : yellowScore === 0 ? '—' : yellowScore}
            </div>
            <div className="strip-inning">{inning}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
