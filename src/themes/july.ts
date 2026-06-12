import type { CalendarTheme } from './types'
import { mango1Png, mango2Png, mango3Png } from '../assets'

const july: CalendarTheme = {
  month: 7,
  headerColor: '#fb5f0f',
  fruits: [
    {
      // Right-top mango — flex-center container, inner rotation + overflow clip
      src: mango3Png,
      containerStyle: {
        position: 'absolute',
        left: 216, top: 12, width: 80, height: 80,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      },
      innerTransform: 'rotate(90deg)',
      wrapperStyle: {
        position: 'relative', width: 80, height: 80, overflow: 'hidden',
      },
      imgStyle: {
        position: 'absolute',
        width: '134.84%', height: '134.84%',
        left: '-16.13%', top: '-16.13%',
        maxWidth: 'none',
      },
    },
    {
      // Left-center mango — overflow:hidden on container, no inner transform
      src: mango2Png,
      containerStyle: {
        position: 'absolute',
        left: 32, top: 104, width: 60, height: 60,
        overflow: 'hidden', pointerEvents: 'none',
      },
      imgStyle: {
        position: 'absolute',
        width: '131.17%', height: '131.17%',
        left: '-17.99%', top: '-15.54%',
        maxWidth: 'none',
      },
    },
    {
      // Bottom-right mango — overflow:hidden + translate on container, no inner transform
      src: mango1Png,
      containerStyle: {
        position: 'absolute',
        left: 'calc(50% + 82.5px)', top: 'calc(50% + 138.5px)',
        width: 73, height: 69,
        transform: 'translate(-50%, -50%)',
        overflow: 'hidden', pointerEvents: 'none',
      },
      imgStyle: {
        position: 'absolute',
        width: '150.9%', height: '159.95%',
        left: '-25.27%', top: '-32.02%',
        maxWidth: 'none',
      },
    },
  ],
}

export default july
