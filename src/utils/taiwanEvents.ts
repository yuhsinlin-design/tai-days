import { Lunar } from 'lunar-javascript'

// 節氣 names from lunar-javascript come in Simplified Chinese for some terms.
// Map only the ones that differ; the rest pass through unchanged.
const JIEQI_TC: Record<string, string> = {
  '惊蛰': '驚蟄',
  '谷雨': '穀雨',
  '小满': '小滿',
  '芒种': '芒種',
  '处暑': '處暑',
}

// Taiwanese lunar-calendar festivals. Key = "lunarMonth/lunarDay".
// Leap months are ignored (same day in non-leap month is used).
const LUNAR_FESTIVALS: Record<string, string> = {
  '1/1':   '春節',
  '1/15':  '元宵節',
  '2/2':   '頭牙',
  '5/5':   '端午節',
  '7/7':   '七夕',
  '7/15':  '中元節',
  '8/15':  '中秋節',
  '9/9':   '重陽節',
  '12/16': '尾牙',
  '12/24': '送神日',
}

// Taiwanese national / solar-calendar holidays. Key = "solarMonth/solarDay".
const SOLAR_HOLIDAYS: Record<string, string> = {
  '1/1':   '元旦',
  '2/28':  '二二八事件',
  '4/4':   '兒童節',
}

// Key dates in Taiwan's democracy and independence movement.
// Priority is lower than official holidays so 2/28 shows 和平紀念日 (the
// official commemoration) rather than repeating the event name.
const TAIWAN_HISTORY: Record<string, string> = {
  '3/18':  '太陽花學運',   // 2014 — students occupy legislature to block cross-strait trade deal
  '4/7':   '鄭南榕殉道',   // 1989 — self-immolation for press freedom & Taiwan independence
  '5/19':  '台灣戒嚴日',   // 1949 — martial law declared; lifted 38 years later on 7/15
  '7/15':  '解嚴紀念日',   // 1987 — end of martial law, world's longest at the time
  '12/10': '美麗島事件',   // 1979 — pro-democracy rally crackdown, watershed moment
}

export function getTaiwanEvent(date: Date, lunar: ReturnType<typeof Lunar.fromDate>): string {
  // 1. 節氣 — Traditional Chinese only
  const jieqi = lunar.getJieQi()
  if (jieqi) return JIEQI_TC[jieqi] ?? jieqi

  // 2. Lunar festivals
  const lunarMonth = Math.abs(lunar.getMonth())
  const lunarDay   = lunar.getDay()
  const lunarKey   = `${lunarMonth}/${lunarDay}`
  if (LUNAR_FESTIVALS[lunarKey]) return LUNAR_FESTIVALS[lunarKey]

  // 除夕: the day before 農曆正月初一
  const tomorrow = new Date(date)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowLunar = Lunar.fromDate(tomorrow)
  if (Math.abs(tomorrowLunar.getMonth()) === 1 && tomorrowLunar.getDay() === 1) return '除夕'

  const solarKey = `${date.getMonth() + 1}/${date.getDate()}`

  // 3. National holidays
  if (SOLAR_HOLIDAYS[solarKey]) return SOLAR_HOLIDAYS[solarKey]

  // 4. Historical democracy & independence milestones
  if (TAIWAN_HISTORY[solarKey]) return TAIWAN_HISTORY[solarKey]

  return ''
}
