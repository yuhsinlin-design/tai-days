import { useEffect, useRef, useState } from 'react'
import { Lunar } from 'lunar-javascript'
import Header from './components/Header'
import DateSection from './components/DateSection'
import VocabCard from './components/VocabCard'
import PerforationLine from './components/PerforationLine'
import { getTheme } from './themes'
import type { CalendarTheme, FruitSpec } from './themes'
import { bgPng, pinSvg } from './assets'
import { getTaiwanEvent } from './utils/taiwanEvents'
import { generateDockIcon, scheduleMidnight } from './utils/generateDockIcon'
import { hasWordAudio, playWordAudio } from './utils/audio'

interface DayData {
  year: number
  month: number
  day: number
  word: string
  pronunciation: string
  meaning: string
  sentence: string
  translation: string
}

// ─── Layout constants ─────────────────────────────────────────────────────────
const PAGE_W = 320
const PAGE_H = 292

const COLORS = { weekday: '#0036C7', weekend: '#C70000' }

// ─── Date helpers ─────────────────────────────────────────────────────────────
function isWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6
}

const MONTHS_ZH = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']
const MONTHS_EN = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER']
const WEEKDAYS  = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六']

function getDateForOffset(offset: number) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const lunar = Lunar.fromDate(d)
  const isLeap = lunar.getMonth() < 0
  const event: string = getTaiwanEvent(d, lunar)
  return {
    year:    d.getFullYear(),
    month:   d.getMonth() + 1,
    day:     d.getDate(),
    weekday: WEEKDAYS[d.getDay()],
    monthZh: MONTHS_ZH[d.getMonth()],
    monthEn: MONTHS_EN[d.getMonth()],
    lunar:   (isLeap ? '閏' : '') + lunar.getMonthInChinese() + '月' + lunar.getDayInChinese(),
    date:    d,
    event,
  }
}

// ─── Fruit renderer ────────────────────────────────────────────────────────────
function renderFruit(f: FruitSpec, i: number) {
  const img = <img src={f.src} alt="" style={{ maxWidth: 'none', ...f.imgStyle }} />
  const clipped = f.wrapperStyle
    ? <div style={{ overflow: 'hidden', ...f.wrapperStyle }}>{img}</div>
    : img
  const transformed = f.innerTransform
    ? <div style={{ flexShrink: 0, transform: f.innerTransform }}>{clipped}</div>
    : clipped
  return <div key={i} style={f.containerStyle}>{transformed}</div>
}

// ─── Shared page content ────────────────────────────────────────────────────────
interface CalendarPageProps {
  info: ReturnType<typeof getDateForOffset>
  entry: DayData | undefined
  dateColor: string
  theme: CalendarTheme
}

function CalendarPage({ info, entry, dateColor, theme }: CalendarPageProps) {
  // Audio is keyed by the content date (YYYY-MM-DD); only set when a recording exists.
  const audioDate = entry
    ? `${entry.year}-${String(entry.month).padStart(2, '0')}-${String(entry.day).padStart(2, '0')}`
    : undefined
  const wordAudioDate = audioDate && hasWordAudio(audioDate) ? audioDate : undefined
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fcfbf8', overflow: 'hidden' }}>
      {/* Warm paper gradient — very faint, lifts the flat white so the sheet reads
          as real stock: a touch warmer/brighter at the top-left where light falls,
          settling cooler toward the bottom-right. */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(120% 90% at 28% 18%, #fffdf9 0%, #fcfbf8 45%, #f5f1e9 100%)',
      }} />
      <div style={{ position: 'absolute', inset: 0, mixBlendMode: 'luminosity', opacity: 0.42, pointerEvents: 'none' }}>
        <img src={bgPng} alt=""
          style={{ position: 'absolute', inset: 0, maxWidth: 'none', objectFit: 'cover', width: '100%', height: '100%' }} />
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 320, height: 152,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <DateSection lunar={info.lunar} day={info.day} weekday={info.weekday} color={dateColor} event={info.event} />
      </div>
      {theme.fruits.map(renderFruit)}
      <div style={{ position: 'absolute', top: 152, left: 12, width: 296 }}>
        <VocabCard
          word={entry?.word ?? '—'}
          pronunciation={entry?.pronunciation ?? ''}
          meaning={entry?.meaning ?? '尚無資料'}
          sentence={entry?.sentence ?? ''}
          translation={entry?.translation ?? ''}
          wordAudioDate={wordAudioDate}
          onPlayWord={playWordAudio}
        />
      </div>

    </div>
  )
}

// ─── App ───────────────────────────────────────────────────────────────────────
// Two-buffer system (A/B) — the inactive layer always pre-renders the next day so
// the swap on tear is instantaneous with no repaint. The FRONT buffer is the sheet
// you grab: drag it down and it tears free at the perforation line, following the
// cursor; release past the threshold to let it fall, or short of it to snap back.

interface BufState {
  offA: number   // day-offset shown by layer A
  offB: number   // day-offset shown by layer B
  top: 'A' | 'B' // which layer is currently front (visible on top)
}

const INIT_STATE: BufState = { offA: 0, offB: 1, top: 'A' }

// Drag-to-tear tuning
const TEAR_THRESHOLD = 64                 // px dragged past which release completes the tear
const CLICK_EPS      = 4                  // movement under this on release counts as a click → tear
const FALL_DIST      = PAGE_H + 80        // how far the released sheet travels off-screen

type TearMode = 'idle' | 'drag' | 'snap' | 'fall'

export default function App() {
  const [st, setStRaw] = useState<BufState>(INIT_STATE)
  const stRef = useRef<BufState>(INIT_STATE)

  // Single atomic commit path — ref stays in sync for any closure that reads it.
  const commit = (next: BufState | ((s: BufState) => BufState)) => {
    const value = typeof next === 'function' ? next(stRef.current) : next
    stRef.current = value
    setStRaw(value)
  }

  const [data, setData]         = useState<DayData[]>([])
  const [hovering, setHovering] = useState(false)
  const [mouseX, setMouseX]     = useState(PAGE_W / 2)

  // Drag-to-tear state: how far the front sheet is pulled down, and the phase that
  // controls whether a CSS transition is applied (drag = none, snap/fall = animate).
  const [tearY, setTearY]       = useState(0)
  const [tearMode, setTearMode] = useState<TearMode>('idle')

  const tearingRef  = useRef(false)   // busy during release animation — blocks new drags
  const mouseXRef   = useRef(PAGE_W / 2)
  const draggingRef = useRef(false)
  const startYRef   = useRef(0)
  const tearYRef    = useRef(0)
  const originRef   = useRef(PAGE_W / 2)

  const { offA, offB, top: whichTop } = st
  const aIsTop      = whichTop === 'A'
  const frontOffset = aIsTop ? offA : offB

  useEffect(() => {
    const load = async () => {
      const api = (window as any).electronAPI
      if (api) {
        const result = await api.readCalendarData()
        if (result) setData(result)
      } else {
        const res = await fetch('/data/calendar.json')
        setData(await res.json())
      }
    }
    load()
  }, [])

  useEffect(() => {
    const api = (window as any).electronAPI
    if (!api?.setDockIcon) return
    const update = () => generateDockIcon(new Date()).then(url => api.setDockIcon(url)).catch(() => {})
    document.fonts.ready.then(update)
    return scheduleMidnight(update)
  }, [])

  // ── Layer data helpers ─────────────────────────────────────────────────────────
  const findEntry = (info: ReturnType<typeof getDateForOffset>) =>
    data.find(d => d.month === info.month && d.day === info.day) ?? data[0]

  const layerProps = (offset: number): CalendarPageProps => {
    const info = getDateForOffset(offset)
    return {
      info,
      entry: findEntry(info),
      dateColor: isWeekend(info.date) ? COLORS.weekend : COLORS.weekday,
      theme: getTheme(info.month),
    }
  }

  const propsA = layerProps(offA)
  const propsB = layerProps(offB)

  const frontInfo  = getDateForOffset(frontOffset)
  const frontTheme = getTheme(frontInfo.month)

  // ── Drag-to-tear interaction ─────────────────────────────────────────────────
  // The front buffer is the grabbable sheet. Pressing down starts a drag; moving
  // pulls it down from the perforation line (no transition, 1:1 with the cursor).
  // Releasing either lets it fall (dragged past the threshold, or a plain click) or
  // snaps it back (released short). On a completed fall the buffers swap.
  const setTear = (y: number) => { tearYRef.current = y; setTearY(y) }

  function beginDrag(clientY: number) {
    if (tearingRef.current) return
    draggingRef.current = true
    startYRef.current   = clientY
    originRef.current   = mouseXRef.current
    setTearMode('drag')
  }

  function moveDrag(clientY: number) {
    if (!draggingRef.current) return
    setTear(Math.max(0, clientY - startYRef.current))
  }

  function completeTear() {
    tearingRef.current = true
    setTearMode('fall')
    // Enable the transition first, then push the target on the next frame so the
    // browser animates from the current dragged position rather than jumping.
    requestAnimationFrame(() => requestAnimationFrame(() => setTear(FALL_DIST)))
    setTimeout(() => {
      // Swap buffers: the back layer (next day) becomes the new front; the old
      // front is recycled to show the day after next. Reset the sheet to rest.
      commit(s => {
        const back    = s.top === 'A' ? s.offB : s.offA
        const newBack = back + 1
        return {
          offA: s.top === 'A' ? newBack : s.offA,
          offB: s.top === 'B' ? newBack : s.offB,
          top:  s.top === 'A' ? 'B' : 'A',
        }
      })
      setTearMode('idle')
      setTear(0)
      tearingRef.current = false
    }, 480)
  }

  function snapBack() {
    setTearMode('snap')
    requestAnimationFrame(() => setTear(0))
    setTimeout(() => setTearMode('idle'), 300)
  }

  function endDrag() {
    if (!draggingRef.current) return
    draggingRef.current = false
    const y = tearYRef.current
    if (y >= TEAR_THRESHOLD || y < CLICK_EPS) completeTear()
    else snapBack()
  }

  return (
    <div style={{ width: 320, height: 320, position: 'relative', overflow: 'hidden', background: '#fcfbf8',
      boxShadow: '0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12)' }}>

      {/* Page stack strips — thin paper-edge effect at the bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 25, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', bottom: 5, left: 0, right: 0, height: 2, background: '#f8f5ef' }} />
        <div style={{ position: 'absolute', bottom: 2, left: 0, right: 0, height: 3, background: '#f2ede4' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: '#ece6da' }} />
      </div>

      {/* Header — fixed above page area */}
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 20 }}>
        <Header year={frontInfo.year} monthZh={frontInfo.monthZh} monthEn={frontInfo.monthEn}
          headerColor={frontTheme.headerColor} headerTextColor={frontTheme.headerTextColor}
          dayOffset={frontOffset} />
      </div>

      {/* Pins */}
      <div style={{
        position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)',
        zIndex: 21, width: 84, height: 20,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        pointerEvents: 'none',
      }}>
        <img src={pinSvg} alt="" style={{ width: 20, height: 20, display: 'block' }} />
        <img src={pinSvg} alt="" style={{ width: 20, height: 20, display: 'block' }} />
      </div>

      {/* ── Page area ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute', top: 28, left: 0, width: PAGE_W, height: PAGE_H,
          overflow: 'hidden', userSelect: 'none',
          cursor: tearingRef.current ? 'default' : (draggingRef.current ? 'grabbing' : (hovering ? 'grab' : 'default')),
        }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => { setHovering(false); setMouseX(PAGE_W / 2); endDrag() }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = Math.max(20, Math.min(PAGE_W - 20, e.clientX - rect.left))
          mouseXRef.current = x
          setMouseX(x)
          moveDrag(e.clientY)
        }}
        onMouseDown={(e) => beginDrag(e.clientY)}
        onMouseUp={endDrag}
      >
        {/* Front sheet — the grabbable page. Pulls down with the drag, tilting a
            touch around the tear line; transition is on only while snapping/falling. */}
        {(() => {
          const frontStyle = {
            transform: `translateY(${tearY}px) rotate(${(tearY * 0.022).toFixed(2)}deg)`,
            transformOrigin: `${originRef.current}px 0px`,
            transition: tearMode === 'snap'
              ? 'transform 300ms cubic-bezier(0.34, 1.3, 0.64, 1)'           // springy snap-back
              : tearMode === 'fall'
                ? 'transform 460ms cubic-bezier(0.55, 0, 0.85, 0.6), opacity 460ms ease-in'  // gravity fall
                : 'none',
            opacity: tearMode === 'fall' ? 0 : 1,
            filter: tearY > 0 ? 'drop-shadow(0 5px 9px rgba(0,0,0,0.22))' : 'none',
            willChange: 'transform',
          } as const
          // While a sheet is being dragged or falling it must ride ABOVE the pad's
          // bottom stack strips (zIndex 25) — a torn page lifts off in front of the
          // remaining pad, never behind its edge. At rest the front sheet sits low (2).
          const frontZ = tearMode === 'idle' ? 2 : 30
          return (
            <>
              {/* Buffer A */}
              <div style={{ position: 'absolute', inset: 0, zIndex: aIsTop ? frontZ : 0, ...(aIsTop ? frontStyle : null) }}>
                <CalendarPage {...propsA} />
              </div>
              {/* Buffer B */}
              <div style={{ position: 'absolute', inset: 0, zIndex: aIsTop ? 0 : frontZ, ...(aIsTop ? null : frontStyle) }}>
                <CalendarPage {...propsB} />
              </div>
            </>
          )
        })()}

        {/* Page depth — the frame casts shadow onto whatever page sits in it:
            a firm shadow at the top (header clip pressing the paper down) and a
            faint vignette on the other three edges so the sheet reads as one of a
            thick stack rather than a flat fill. Always on top, never interactive. */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none',
          boxShadow: 'inset 0 7px 9px -6px rgba(0,0,0,0.30), inset 6px 0 8px -7px rgba(0,0,0,0.10), inset -6px 0 8px -7px rgba(0,0,0,0.10), inset 0 -7px 9px -7px rgba(0,0,0,0.12)',
        }} />

        {/* Perforation tear line — fixed at the top of the pad, stays put while the
            torn sheet falls away beneath it. Sits above the falling sheet (z30) so the
            tear line stays crisp on top throughout the fall. */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 40, pointerEvents: 'none' }}>
          <PerforationLine />
        </div>

        {/* Drag reveal hint — as the front sheet is pulled down, a gradient at the
            top deepens to show the next page is peeking out from underneath. */}
        {tearY > 0 && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, zIndex: 8, pointerEvents: 'none',
            height: Math.min(tearY * 0.6, 32),
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.10), transparent)',
            transition: tearMode === 'snap' ? 'height 300ms cubic-bezier(0.34,1.3,0.64,1)' : 'none',
          }} />
        )}

      </div>
    </div>
  )
}
