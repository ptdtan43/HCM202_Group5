let context = null
let muted = false

export function setMuted(value) {
  muted = value
}

function getContext() {
  if (!context) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return null
    context = new AudioContextClass()
  }
  if (context.state === 'suspended') context.resume()
  return context
}

function tone({ freq, start = 0, duration = 0.15, type = 'sine', volume = 0.16, slideTo }) {
  if (muted) return
  const ac = getContext()
  if (!ac) return
  const t0 = ac.currentTime + start
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration)
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(gain).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

const chord = (notes, step, duration) =>
  notes.forEach((freq, i) => tone({ freq, start: i * step, duration, type: 'triangle', volume: 0.15 }))

export const sfx = {
  tick: () => tone({ freq: 1500, duration: 0.03, type: 'square', volume: 0.04 }),
  land: () => tone({ freq: 660, duration: 0.2, type: 'triangle' }),
  correct: () => {
    tone({ freq: 880, duration: 0.12, type: 'triangle' })
    tone({ freq: 1320, start: 0.1, duration: 0.22, type: 'triangle' })
  },
  wrong: () => tone({ freq: 180, duration: 0.4, type: 'sawtooth', volume: 0.1 }),
  loseTurn: () => tone({ freq: 440, slideTo: 220, duration: 0.45, type: 'triangle', volume: 0.14 }),
  bankrupt: () => {
    tone({ freq: 392, slideTo: 90, duration: 1, type: 'sawtooth', volume: 0.12 })
    tone({ freq: 196, slideTo: 45, start: 0.08, duration: 1, type: 'square', volume: 0.06 })
  },
  countdown: () => tone({ freq: 1000, duration: 0.08, volume: 0.12 }),
  timeout: () => {
    tone({ freq: 260, duration: 0.18, type: 'square', volume: 0.08 })
    tone({ freq: 200, start: 0.22, duration: 0.3, type: 'square', volume: 0.08 })
  },
  solve: () => chord([523.25, 659.25, 783.99, 1046.5], 0.09, 0.3),
  fanfare: () => chord([392, 523.25, 659.25, 783.99, 1046.5, 1318.5], 0.12, 0.45),
}
