interface DateSectionProps {
  lunar: string
  day: number
  weekday: string
  color: string
  event?: string
}

export default function DateSection({ lunar, day, weekday, color, event }: DateSectionProps) {
  return (
    <div className="flex flex-col items-center" style={{ gap: 4 }}>
      {/* 農曆 pill badge — expands to show 節慶/節氣 when present */}
      <div
        className="flex items-center border border-black rounded-[1000px] shrink-0"
        style={{ padding: '2px 4px', gap: 2 }}
      >
        <span className="font-sans font-bold text-black leading-normal whitespace-nowrap" style={{ fontSize: 8 }}>
          {lunar}
        </span>
        {event && (
          <>
            {/* Icon/dot — exact Figma spec: 10×10px container, circle positioned
                left-[41.67%] right-[41.67%] top-1/2 -translate-y-1/2 aspect-[1] */}
            <div style={{ position: 'relative', width: 10, height: 10, flexShrink: 0, overflow: 'hidden' }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '41.67%',
                right: '41.67%',
                aspectRatio: '1',
                transform: 'translateY(-50%)',
                background: '#000',
                borderRadius: '50%',
              }} />
            </div>
            <span className="font-sans font-bold text-black leading-normal whitespace-nowrap" style={{ fontSize: 8 }}>
              {event}
            </span>
          </>
        )}
      </div>

      {/* 大日期 + 星期（含兩側橫線） */}
      <div className="flex flex-col items-center shrink-0">
        <p className="leading-none whitespace-nowrap" style={{
          fontSize: 72, fontWeight: 900, color, fontFamily: "'Roboto Slab', serif",
          // Letterpress — number sits pressed into the paper: light catches the
          // lower groove edge (white highlight below), shadow at the top inner edge.
          textShadow: '0 1px 0 rgba(255,255,255,0.65), 0 -0.5px 0.5px rgba(0,0,0,0.18), 0 2px 3px rgba(0,0,0,0.10)',
        }}>
          {String(day).padStart(2, '0')}
        </p>
        <div className="flex items-center w-full" style={{ gap: 8 }}>
          <div style={{ background: color, height: 1, width: 24, flexShrink: 0 }} />
          <p className="font-sans font-bold text-center leading-normal whitespace-nowrap" style={{ fontSize: 18, color }}>
            {weekday}
          </p>
          <div style={{ background: color, height: 1, width: 24, flexShrink: 0 }} />
        </div>
      </div>
    </div>
  )
}
