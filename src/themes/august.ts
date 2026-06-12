import type { CalendarTheme } from './types'
import { watermelonPng } from '../assets'

const august: CalendarTheme = {
  month: 8,
  headerColor: '#1c4a20',
  fruits: [
    {
      // Right watermelon slice — bleeds off the right edge
      src: watermelonPng,
      containerStyle: {
        position: 'absolute',
        left: 186, top: -3, width: 237, height: 158,
        overflow: 'hidden', pointerEvents: 'none',
      },
      imgStyle: {
        position: 'absolute',
        inset: 0, width: '100%', height: '100%',
        objectFit: 'cover',
      },
    },
    {
      // Left watermelon slice — bleeds off the left edge
      src: watermelonPng,
      containerStyle: {
        position: 'absolute',
        left: -102, top: -3, width: 237, height: 158,
        overflow: 'hidden', pointerEvents: 'none',
      },
      imgStyle: {
        position: 'absolute',
        inset: 0, width: '100%', height: '100%',
        objectFit: 'cover',
      },
    },
  ],
}

export default august
