import { mango1Png, mango2Png, mango3Png } from '../assets'

interface Props {
  month: number
}

export default function FruitDecoration({ month: _month }: Props) {
  return (
    <>
      {/* 左中小芒果 — left:32 top:133 size:60 (image 28) */}
      <div className="absolute overflow-hidden pointer-events-none"
        style={{ left: 32, top: 133, width: 60, height: 60 }}>
        <img src={mango2Png} alt="" className="absolute max-w-none"
          style={{ width: '131.17%', height: '131.17%', left: '-17.99%', top: '-15.54%' }} />
      </div>

      {/* 右上旋轉芒果 — left:216 top:41 size:80 rotate(90deg) (image 30) */}
      <div className="absolute pointer-events-none flex items-center justify-center"
        style={{ left: 216, top: 41, width: 80, height: 80 }}>
        <div style={{ transform: 'rotate(90deg)', width: 80, height: 80 }}>
          <div className="relative overflow-hidden" style={{ width: 80, height: 80 }}>
            <img src={mango3Png} alt="" className="absolute max-w-none"
              style={{ width: '134.84%', height: '134.84%', left: '-16.13%', top: '-16.13%' }} />
          </div>
        </div>
      </div>

      {/* 左下旋轉芒果 — left:101 top:382 rotate(-86.56deg) (image 29) */}
      <div className="absolute pointer-events-none flex items-center justify-center"
        style={{ left: 101, top: 382, width: 123.169, height: 129.737 }}>
        <div style={{ transform: 'rotate(-86.56deg)' }}>
          <div className="relative overflow-hidden" style={{ width: 123, height: 116, opacity: 0.6 }}>
            <img src={mango1Png} alt="" className="absolute max-w-none"
              style={{ width: '150.9%', height: '159.95%', left: '-25.27%', top: '-32.02%' }} />
          </div>
        </div>
      </div>

      {/* 右下小芒果 — calc(50%+76.5px, 50%+163.5px) → (236.5, 323.5) size:73×69 (image 29) */}
      <div className="absolute overflow-hidden pointer-events-none"
        style={{ left: 'calc(50% + 76.5px)', top: 'calc(50% + 163.5px)', width: 73, height: 69,
          transform: 'translate(-50%, -50%)' }}>
        <img src={mango1Png} alt="" className="absolute max-w-none"
          style={{ width: '150.9%', height: '159.95%', left: '-25.27%', top: '-32.02%' }} />
      </div>
    </>
  )
}
