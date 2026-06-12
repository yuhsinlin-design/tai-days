import type { CSSProperties } from 'react'

export interface FruitSpec {
  src: string
  containerStyle: CSSProperties  // outer positioning wrapper (left/top/size, optional flex-center or overflow:hidden)
  innerTransform?: string         // CSS transform on an inner div (rotate, scaleY, etc.)
  wrapperStyle?: CSSProperties    // overflow:hidden clipping box — size + optional opacity
  imgStyle: CSSProperties         // <img> absolute positioning within the clip
}

export interface CalendarTheme {
  month: number        // 1–12
  headerColor: string  // handle bar background
  headerTextColor?: string  // defaults to white; use black for light-colored headers
  fruits: FruitSpec[]  // ordered list — rendered top-to-bottom in CalendarPage
}
