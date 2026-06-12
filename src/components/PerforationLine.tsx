// Tear-off perforation — a row of fine die-cut slits, not a bold dashed border.
// Each dash is a faint dark mark with a crisp 1px highlight directly below it (the
// cut edge catching light = subtle emboss, not a glowing halo). color-burn blended
// so it sinks into the paper. 3px dash + 3px gap = 6px pitch.
const DASH_W = 3
const GAP    = 3
const COUNT  = Math.ceil(320 / (DASH_W + GAP))   // fill full widget width

export default function PerforationLine() {
  return (
    <div style={{
      position: 'absolute', top: 1, left: 0, width: 320,
      display: 'flex', gap: GAP,
      mixBlendMode: 'color-burn', pointerEvents: 'none', overflow: 'hidden',
    }}>
      {Array.from({ length: COUNT }, (_, i) => (
        <div key={i} style={{
          width: DASH_W, height: 1, flexShrink: 0,
          background: 'rgba(0,0,0,0.20)',
          boxShadow: '0px 1px 0px 0px rgba(255,255,255,0.55)',
        }} />
      ))}
    </div>
  )
}
