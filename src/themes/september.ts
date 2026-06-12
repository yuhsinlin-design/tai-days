import type { CalendarTheme } from './types'
import { pearPng, pearSlicePng } from '../assets'

const september: CalendarTheme = {
  month: 9,
  headerColor: '#d8ec25',
  headerTextColor: '#000000',
  fruits: [
    {
      // Left pear — large, flipped vertically and rotated, bleeds off left
      src: pearPng,
      containerStyle: {
        position: 'absolute',
        left: -1, top: 110, width: 192, height: 192,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      },
      innerTransform: 'rotate(172.86deg) scaleY(-1)',
      wrapperStyle: {
        position: 'relative', width: 172, height: 172,
      },
      imgStyle: {
        position: 'absolute',
        inset: 0, width: '100%', height: '100%',
        objectFit: 'cover',
      },
    },
    {
      // Right pear — rotated 7.14deg, bleeds off right edge
      src: pearPng,
      containerStyle: {
        position: 'absolute',
        left: 197, top: 5, width: 165, height: 165,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      },
      innerTransform: 'rotate(7.14deg)',
      wrapperStyle: {
        position: 'relative', width: 148, height: 148,
      },
      imgStyle: {
        position: 'absolute',
        inset: 0, width: '100%', height: '100%',
        objectFit: 'cover',
      },
    },
    {
      // Left pear slice — small, multiply blend, rotated
      src: pearSlicePng,
      containerStyle: {
        position: 'absolute',
        left: -43, top: 71, width: 132, height: 132,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        mixBlendMode: 'multiply', pointerEvents: 'none',
      },
      innerTransform: 'rotate(-10.74deg)',
      wrapperStyle: {
        position: 'relative', width: 113, height: 113,
        overflow: 'hidden',
      },
      imgStyle: {
        position: 'absolute',
        width: '123.21%', height: '123.21%',
        left: '-11.66%', top: '-11.45%',
        maxWidth: 'none',
      },
    },
    {
      // Right upper pear slice — smaller, multiply blend, rotated
      src: pearSlicePng,
      containerStyle: {
        position: 'absolute',
        left: 181, top: -39, width: 113, height: 113,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        mixBlendMode: 'multiply', pointerEvents: 'none',
      },
      innerTransform: 'rotate(-10.74deg)',
      wrapperStyle: {
        position: 'relative', width: 97, height: 97,
        overflow: 'hidden',
      },
      imgStyle: {
        position: 'absolute',
        width: '123.21%', height: '123.21%',
        left: '-11.66%', top: '-11.45%',
        maxWidth: 'none',
      },
    },
  ],
}

export default september
