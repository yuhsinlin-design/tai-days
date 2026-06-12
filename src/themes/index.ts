import january from './january'
import february from './february'
import march from './march'
import april from './april'
import may from './may'
import june from './june'
import july from './july'
import august from './august'
import september from './september'
import october from './october'
import november from './november'
import december from './december'
import type { CalendarTheme } from './types'

export type { CalendarTheme, FruitSpec } from './types'

const themes: Record<number, CalendarTheme> = {
  1:  january,
  2:  february,
  3:  march,
  4:  april,
  5:  may,
  6:  june,
  7:  july,
  8:  august,
  9:  september,
  10: october,
  11: november,
  12: december,
}

export function getTheme(month: number): CalendarTheme {
  return themes[month] ?? july
}
