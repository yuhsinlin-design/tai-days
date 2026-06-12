interface HeaderProps {
  year: number
  monthZh: string
  monthEn: string
  headerColor: string
  headerTextColor?: string
  // How many pages have been torn off — drives the drop-shadow thickness.
  // 0 = full stack (thick shadow), grows as user pages forward.
  dayOffset?: number
}

// As more pages are torn the remaining stack thins and the drop shadow shrinks.
// Range: offset 0 → blur 10px / opacity 0.24 (thick stack)
//        offset 365 → blur 2px / opacity 0.08 (single sheet)
function stackDropShadow(offset: number): string {
  const t = Math.min(Math.max(offset, 0) / 365, 1)
  const blur    = (10 - 8 * t).toFixed(1)
  const opacity = (0.24 - 0.16 * t).toFixed(2)
  return `0px 2px ${blur}px rgba(0,0,0,${opacity})`
}

// The header's depth shadow uses a DARKENED version of the header colour itself,
// not pure black. A black shadow over a bright header (lime, yellow) goes muddy;
// a same-hue darker shade always reads as a clean, natural shadow.
function darken(hex: string, factor: number, alpha: number): string {
  const m = hex.replace('#', '')
  const r = Math.round(parseInt(m.slice(0, 2), 16) * factor)
  const g = Math.round(parseInt(m.slice(2, 4), 16) * factor)
  const b = Math.round(parseInt(m.slice(4, 6), 16) * factor)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function Header({ year, monthZh, monthEn, headerColor, headerTextColor = 'white', dayOffset = 0 }: HeaderProps) {
  return (
    <div
      className="drag-region relative flex items-center justify-between px-4"
      style={{
        background: headerColor,
        height: 28,
        width: 320,
        filter: `drop-shadow(${stackDropShadow(dayOffset)})`,
        transition: 'background-color 200ms ease, filter 200ms ease',
      }}
    >
      {/* Year */}
      <span className="font-sans font-bold leading-normal" style={{ fontSize: 8, color: headerTextColor }}>
        {year}
      </span>

      {/* Month */}
      <div className="flex items-center gap-0.5">
        <span className="font-sans font-bold leading-normal" style={{ fontSize: 8, color: headerTextColor }}>{monthZh}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
          <line x1="6" y1="1.5" x2="6" y2="10.5" stroke={headerTextColor} strokeWidth="1"/>
        </svg>
        <span className="font-sans font-bold leading-normal" style={{ fontSize: 8, color: headerTextColor }}>{monthEn}</span>
      </div>

      {/* Inner shadow overlay — gives the handle bar a raised, physical depth.
          Same-hue darkened shade so it never goes muddy on bright headers. */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 'inherit',
        boxShadow: `inset 0px -1px 4px 0px ${darken(headerColor, 0.6, 0.45)}`,
        transition: 'box-shadow 200ms ease',
      }} />
    </div>
  )
}
