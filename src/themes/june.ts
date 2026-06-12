import type { CalendarTheme } from './types'
import { lychee1Png, lychee2Png, lychee3Png } from '../assets'

const june: CalendarTheme = {
  month: 6,
  headerColor: '#df3031',
  fruits: [
    {
      // Right lychee — large, rotated 21.14deg
      src: lychee1Png,
      containerStyle: {
        position: 'absolute',
        left: 232, top: 72, width: 110.034, height: 110.034,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      },
      innerTransform: 'rotate(21.14deg)',
      wrapperStyle: {
        position: 'relative', width: 85.076, height: 85.076,
        overflow: 'hidden',
      },
      imgStyle: {
        position: 'absolute',
        width: '138.11%', height: '138.11%',
        left: '-21.58%', top: '-14.88%',
        maxWidth: 'none',
      },
    },
    {
      // Left-top lychee — mirrored and rotated, bleeds above page area
      src: lychee1Png,
      containerStyle: {
        position: 'absolute',
        left: 8, top: -14, width: 96.346, height: 96.346,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      },
      innerTransform: 'rotate(171.8deg) scaleY(-1)',
      wrapperStyle: {
        position: 'relative', width: 85.076, height: 85.076,
        overflow: 'hidden',
      },
      imgStyle: {
        position: 'absolute',
        width: '138.11%', height: '138.11%',
        left: '-21.58%', top: '-14.88%',
        maxWidth: 'none',
      },
    },
    {
      // Right lychee cluster — small, flipped
      src: lychee2Png,
      containerStyle: {
        position: 'absolute',
        left: 227, top: 64, width: 57, height: 57,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      },
      innerTransform: 'rotate(180deg) scaleY(-1)',
      wrapperStyle: {
        position: 'relative', width: 57, height: 57,
        overflow: 'hidden',
      },
      imgStyle: {
        position: 'absolute',
        width: '143.15%', height: '143.15%',
        left: '-18.04%', top: '-18.04%',
        maxWidth: 'none',
      },
    },
    {
      // Bottom-left lychee — rotated -20.29deg
      src: lychee3Png,
      containerStyle: {
        position: 'absolute',
        left: 48, top: 252, width: 96.353, height: 96.353,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      },
      innerTransform: 'rotate(-20.29deg)',
      wrapperStyle: {
        position: 'relative', width: 75, height: 75,
        overflow: 'hidden', opacity: 0.9,
      },
      imgStyle: {
        position: 'absolute',
        width: '159.54%', height: '159.54%',
        left: '-29.75%', top: '-27.46%',
        maxWidth: 'none',
      },
    },
  ],
}

export default june
