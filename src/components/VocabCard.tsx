import { soundSvg } from '../assets'

interface VocabCardProps {
  word: string
  pronunciation: string
  meaning: string
  sentence: string
  translation: string
  fixedHeight?: boolean
  // Date key (YYYY-MM-DD) of an available word recording. When set, the 音 row
  // shows a tappable play button; when absent the button is hidden.
  wordAudioDate?: string
  onPlayWord?: (date: string) => void
}

const CARD_BORDER = '#1e1810'   // warm dark — less harsh than pure black on paper

function Tag({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[100px] shrink-0"
      style={{ width: 16, height: 16, border: `1px solid ${CARD_BORDER}` }}>
      <span className="font-sans font-bold leading-normal" style={{ fontSize: 10, color: CARD_BORDER }}>
        {label}
      </span>
    </div>
  )
}

function SoundIcon() {
  return (
    <div className="flex items-center justify-center overflow-hidden rounded-[4px] shrink-0" style={{ width: 16, height: 16 }}>
      <img src={soundSvg} alt="" style={{ width: 13, height: 13 }} />
    </div>
  )
}

export default function VocabCard({ word, pronunciation, meaning, sentence, translation, fixedHeight, wordAudioDate, onPlayWord }: VocabCardProps) {
  return (
    <div
      className="bg-white border-2 border-[#1e1810] border-solid flex flex-col items-start rounded-[12px] overflow-hidden"
      style={fixedHeight ? { height: 128 } : { maxHeight: 126 }}
    >
      {/* Row 1: 詞 + 音 */}
      <div className="flex items-center justify-between shrink-0 w-full">
        <div className="border-r border-[#1e1810] border-solid flex gap-2 items-center min-w-0" style={{ flex: '1 0 0', padding: 8 }}>
          <Tag label="詞" />
          <span className="font-sans font-normal text-black leading-normal whitespace-nowrap" style={{ fontSize: 10 }}>
            {word}
          </span>
        </div>
        {/* Whole 音 cell is the play target when a recording exists — a 16px icon is
            too small to hit. stopPropagation so the tap never reaches the page-area
            drag handler underneath (which would otherwise tear the page). */}
        <div
          role={wordAudioDate ? 'button' : undefined}
          aria-label={wordAudioDate ? '播放發音' : undefined}
          onMouseDown={wordAudioDate ? (e) => e.stopPropagation() : undefined}
          onMouseUp={wordAudioDate ? (e) => e.stopPropagation() : undefined}
          onClick={wordAudioDate ? (e) => { e.stopPropagation(); onPlayWord?.(wordAudioDate) } : undefined}
          className={`flex gap-2 items-center justify-between min-w-0 ${wordAudioDate ? 'cursor-pointer' : ''}`}
          style={{ flex: '1 0 0', padding: 8, height: 32 }}
        >
          <div className="flex gap-2 items-center min-w-0">
            <Tag label="音" />
            <span className="font-normal text-black leading-normal" style={{ fontSize: 10, fontFamily: "'GenSekiGothic2TC', sans-serif" }}>
              {pronunciation}
            </span>
          </div>
          {wordAudioDate && <SoundIcon />}
        </div>
      </div>

      {/* Row 2: 義 */}
      <div className="border-t border-[#1e1810] border-solid flex gap-2 items-center shrink-0 w-full" style={{ padding: 8 }}>
        <Tag label="意" />
        <span className="font-sans font-normal text-black leading-normal" style={{ fontSize: 10 }}>
          {meaning}
        </span>
      </div>

      {/* Row 3: 句 — sentence wraps; play button pinned to the right edge */}
      <div className="border-t border-[#1e1810] border-solid flex gap-2 items-center shrink-0 w-full" style={{ padding: 8 }}>
        <Tag label="句" />
        <div className="flex flex-col items-start justify-center min-w-0" style={{ flex: '1 0 0' }}>
          <span className="font-sans font-normal text-black leading-normal" style={{ fontSize: 10 }}>
            {sentence}
          </span>
          <p className="font-sans font-normal leading-normal" style={{ fontSize: 8, color: '#606060' }}>
            {translation}
          </p>
        </div>
      </div>
    </div>
  )
}
