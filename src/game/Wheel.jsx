import { useRef } from 'react'
import { motion } from 'framer-motion'
import { SPIN_SECONDS, WHEEL_SEGMENTS } from './config'

const MotionDiv = motion.div

const SEGMENT_PATH = 'M280 280 L199.04 30.82 A262 262 0 0 1 360.96 30.82 Z'
const SEGMENT_ANGLE = 360 / WHEEL_SEGMENTS.length

const BULBS = [
  [280, 14], [362.2, 27], [436.4, 64.8], [495.2, 123.6], [533, 197.8],
  [546, 280], [533, 362.2], [495.2, 436.4], [436.4, 495.2], [362.2, 533],
  [280, 546], [197.8, 533], [123.6, 495.2], [64.8, 436.4], [27, 362.2],
  [14, 280], [27, 197.8], [64.8, 123.6], [123.6, 64.8], [197.8, 27],
]

function Wheel({ rotation, spinning, canSpin, onSpin, onSpinEnd, onTick }) {
  const lastSegment = useRef(0)

  const handleUpdate = (latest) => {
    const segment = Math.floor((Number(latest.rotate) + SEGMENT_ANGLE / 2) / SEGMENT_ANGLE)
    if (segment !== lastSegment.current) {
      lastSegment.current = segment
      onTick?.()
    }
  }

  return (
    <div className="relative aspect-square w-[min(86vw,max(320px,calc(100dvh_-_25rem)),560px)]">
      <MotionDiv
        className="absolute inset-0"
        initial={false}
        animate={{ rotate: rotation }}
        transition={{ duration: SPIN_SECONDS, ease: [0.15, 0.85, 0.3, 1] }}
        onUpdate={handleUpdate}
        onAnimationComplete={onSpinEnd}
      >
        <svg viewBox="0 0 560 560" className="h-full w-full" aria-hidden="true">
          {WHEEL_SEGMENTS.map((segment, index) => (
            <g key={segment.id} transform={`rotate(${index * SEGMENT_ANGLE} 280 280)`}>
              <path d={SEGMENT_PATH} fill={segment.fill} stroke="#EFE8D8" strokeOpacity="0.18" strokeWidth="1.5" />
              {segment.type === 'score' ? (
                <text x="280" y="104" textAnchor="middle" fontSize="48" fontWeight="800" fill="#E0B040" className="font-condensed">
                  {segment.label}
                </text>
              ) : (
                <text x="280" y="96" textAnchor="middle" fontSize="17" fontWeight="700" letterSpacing="0.5" fill={segment.text}>
                  {segment.label}
                </text>
              )}
            </g>
          ))}
        </svg>
      </MotionDiv>

      <svg viewBox="0 0 560 560" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx="280" cy="280" r="266" fill="none" stroke="#B8892E" strokeWidth="12" />
        {BULBS.map(([cx, cy], index) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="4"
            fill={index % 2 ? '#E0B040' : '#FFF4D6'}
            className={spinning ? (index % 2 ? 'animate-bulb' : 'animate-bulb-alt') : undefined}
          />
        ))}
        <polygon points="256,0 304,0 280,50" fill="#EFE8D8" stroke="#141311" strokeWidth="3" strokeLinejoin="round" />
      </svg>

      <button
        type="button"
        onClick={onSpin}
        disabled={!canSpin}
        className="absolute top-1/2 left-1/2 h-[24%] w-[24%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] border-stage bg-gold font-condensed text-[clamp(22px,2vw,34px)] font-extrabold tracking-[0.04em] text-stage shadow-[0_0_0_2px_#E0B040,0_0_48px_rgba(224,176,64,0.4)] transition duration-200 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:bg-[#3A3731] disabled:text-cream/45 disabled:shadow-[0_0_0_2px_#57524A] disabled:hover:brightness-100"
      >
        QUAY
      </button>
    </div>
  )
}

export default Wheel
