import iconTemplate from '../assets/icon-template.png'
import bgPng from '../assets/bg.png'

const MONTHS_ZH = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function generateDockIcon(date: Date): Promise<string> {
  // Explicitly load fonts that may not be used in the DOM
  await Promise.all([
    document.fonts.load(`400 96px "GenSekiGothic2TC"`),
    document.fonts.load(`900 224px "Roboto Slab"`),
  ])
  console.log('[dock] fonts loaded:', [...document.fonts].map(f => `${f.family} ${f.weight}`).join(', '))

  // All values directly from Figma (512×512 design, no scaling)
  const SIZE = 512
  const HEADER_H = 100
  const STRIP_H = 20
  const BODY_END = SIZE - STRIP_H * 2  // 472

  // Text group centered at calc(50% + 30px)
  const TEXT_CENTER_Y = SIZE / 2 + 30  // 286
  const MONTH_SIZE = 96
  const DAY_SIZE = 224
  const GAP = 4

  const groupH = MONTH_SIZE + GAP + DAY_SIZE  // 324
  const groupTop = TEXT_CENTER_Y - groupH / 2
  const monthY = groupTop + MONTH_SIZE / 2
  const dayY   = groupTop + MONTH_SIZE + GAP + DAY_SIZE / 2

  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!

  // Draw original design as base (header, pins, shadows, strips)
  const [templateImg, bgImg] = await Promise.all([loadImage(iconTemplate), loadImage(bgPng)])
  ctx.drawImage(templateImg, 0, 0, SIZE, SIZE)

  // Clear body area
  ctx.fillStyle = '#fcfbf8'
  ctx.fillRect(0, HEADER_H, SIZE, BODY_END - HEADER_H)

  // Re-apply paper texture (luminosity blend, 35% opacity) — matches Figma spec
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, HEADER_H, SIZE, BODY_END - HEADER_H)
  ctx.clip()
  ctx.globalAlpha = 0.35
  ctx.globalCompositeOperation = 'luminosity'
  ctx.drawImage(bgImg, 0, HEADER_H, SIZE, SIZE - HEADER_H)
  ctx.restore()

  // Redraw bottom strips
  ctx.fillStyle = '#faf5ed'
  ctx.fillRect(0, BODY_END, SIZE, STRIP_H)
  ctx.fillStyle = '#ece6da'
  ctx.fillRect(0, BODY_END + STRIP_H, SIZE, STRIP_H)

  // Month label
  ctx.fillStyle = '#000000'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ;(ctx as any).letterSpacing = '0px'
  ctx.font = `400 ${MONTH_SIZE}px "GenSekiGothic2TC", sans-serif`
  ctx.fillText(MONTHS_ZH[date.getMonth()], SIZE / 2, monthY)

  // Day number — Roboto Slab Black with letter-spacing from Figma
  ;(ctx as any).letterSpacing = '4.48px'
  ctx.font = `900 ${DAY_SIZE}px "Roboto Slab", serif`
  ctx.fillText(String(date.getDate()), SIZE / 2, dayY)
  ;(ctx as any).letterSpacing = '0px'

  // macOS Dock scales the icon image to fill its tile. Other apps follow Apple's
  // icon grid — artwork occupies ~80% of the canvas with transparent margin around
  // it. A full-bleed image therefore renders ~20% larger than its neighbors. So we
  // composite the artwork onto a transparent canvas inset to the grid, with rounded
  // corners (the source is a square).
  const content = Math.round(SIZE * 0.805)     // 412
  const margin = (SIZE - content) / 2          // 50
  const radius = Math.round(content * 0.2237)  // squircle corner ≈ 92

  const out = document.createElement('canvas')
  out.width = SIZE
  out.height = SIZE
  const octx = out.getContext('2d')!
  octx.beginPath()
  octx.roundRect(margin, margin, content, content, radius)
  octx.clip()
  octx.drawImage(canvas, margin, margin, content, content)

  return out.toDataURL('image/png')
}

export function scheduleMidnight(callback: () => void): () => void {
  let timeoutId: ReturnType<typeof setTimeout>
  const scheduleNext = () => {
    const now = new Date()
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    timeoutId = setTimeout(() => { callback(); scheduleNext() }, tomorrow.getTime() - now.getTime())
  }
  scheduleNext()
  return () => clearTimeout(timeoutId)
}
