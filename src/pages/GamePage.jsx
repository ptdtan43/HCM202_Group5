import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, animate, motion } from 'framer-motion'
import Wheel from '../game/Wheel'
import { KEYBOARD_ROWS, RESULT_MS, SOLVE_BONUS, TEAMS, TURN_SECONDS, WHEEL_SEGMENTS } from '../game/config'
import { PART_TITLES, QUESTIONS } from '../game/questions'
import { setMuted, sfx } from '../game/sfx'

const MotionDiv = motion.div
const MotionSpan = motion.span

const KEY_SET = new Set(KEYBOARD_ROWS.flat())
const TIMER_CIRCUMFERENCE = 2 * Math.PI * 26
const EASE_OUT = [0.16, 1, 0.3, 1]

const normalizeLetters = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/Đ/g, 'D')
    .replace(/đ/g, 'd')
    .toUpperCase()
const formatScore = (n) => n.toLocaleString('vi-VN')
const pad = (n) => String(n).padStart(2, '0')
const nextTeamIndex = (index) => (index + 1) % TEAMS.length
const createTeams = () => TEAMS.map((team) => ({ ...team, score: 0, roundScore: 0 }))

const CONFETTI_COLORS = [...TEAMS.map((team) => team.color), '#E0B040']
const CONFETTI = Array.from({ length: 40 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  delay: (i % 10) * 0.22,
  duration: 2.8 + (i % 5) * 0.4,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: 8 + (i % 3) * 4,
}))

const BANNER_STYLES = {
  score: 'bg-gold text-stage',
  multiply: 'bg-[#9B2C20] text-cream',
  lose_turn: 'bg-[#57524A] text-cream',
  bankrupt: 'border-2 border-danger bg-[#0A0A09] text-danger',
  correct: 'border-2 border-gold bg-stage-raised text-gold',
  wrong: 'border-2 border-danger bg-stage-raised text-danger',
}

const ICONS = {
  prev: ['M19 12H5', 'M11 18l-6-6 6-6'],
  next: ['M5 12h14', 'M13 6l6 6-6 6'],
  eye: ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  trophy: ['M8 21h8', 'M12 17v4', 'M7 4h10v5a5 5 0 0 1-10 0V4z', 'M17 5h3v2a3 3 0 0 1-3 3', 'M7 5H4v2a3 3 0 0 0 3 3'],
  sound: ['M11 5L6 9H3v6h3l5 4V5z', 'M15.5 8.5a5 5 0 0 1 0 7', 'M18.5 5.5a9 9 0 0 1 0 13'],
  muted: ['M11 5L6 9H3v6h3l5 4V5z', 'M22 9l-6 6', 'M16 9l6 6'],
  expand: ['M4 9V4h5', 'M20 9V4h-5', 'M4 15v5h5', 'M20 15v5h-5'],
  shrink: ['M9 4v5H4', 'M15 4v5h5', 'M9 20v-5H4', 'M15 20v-5h5'],
}

function Icon({ name, className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {ICONS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(value)
  const from = useRef(value)

  useEffect(() => {
    const controls = animate(from.current, value, {
      duration: 0.9,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    })
    from.current = value
    return () => controls.stop()
  }, [value])

  return formatScore(display)
}

function TimerRing({ seconds, active }) {
  const urgent = active && seconds <= 5
  const progress = active ? seconds / TURN_SECONDS : 1
  return (
    <div className="flex items-center gap-3" aria-label={active ? `Còn ${seconds} giây` : 'Đồng hồ chờ lượt chọn chữ'}>
      <span className="relative flex h-14 w-14 items-center justify-center">
        <svg viewBox="0 0 60 60" aria-hidden="true" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="30" cy="30" r="26" fill="none" stroke="#3A3731" strokeWidth="5" />
          <circle
            cx="30"
            cy="30"
            r="26"
            fill="none"
            stroke={urgent ? '#E2583E' : '#E0B040'}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={TIMER_CIRCUMFERENCE}
            strokeDashoffset={TIMER_CIRCUMFERENCE * (1 - progress)}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            opacity={active ? 1 : 0.35}
          />
        </svg>
        <span className={`relative font-condensed text-3xl leading-none font-extrabold ${urgent ? 'text-danger' : active ? 'text-cream' : 'text-cream-muted'}`}>
          {active ? seconds : TURN_SECONDS}
        </span>
      </span>
      <span className="font-mono text-xs tracking-[0.1em] text-cream-muted lg:text-sm">GIÂY</span>
    </div>
  )
}

function Tile({ char, revealed, delay }) {
  return (
    <span className="relative h-[clamp(52px,4.6vw,88px)] w-[clamp(40px,3.65vw,70px)] [perspective:800px]">
      <MotionSpan
        className="absolute inset-0 [transform-style:preserve-3d]"
        initial={false}
        animate={{ rotateY: revealed ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 70, damping: 14, delay }}
      >
        <span className="absolute inset-0 border-[1.5px] border-gold/40 bg-[#22201C] [backface-visibility:hidden]" />
        <span className="absolute inset-0 flex items-center justify-center bg-cream text-[clamp(28px,2.6vw,50px)] leading-none font-bold text-stage shadow-[0_10px_24px_-12px_rgba(224,176,64,0.6)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {char}
        </span>
      </MotionSpan>
    </span>
  )
}

function QuietButton({ icon, iconAfter, children, ...props }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 text-base font-medium text-cream/80 transition-colors duration-200 hover:text-cream disabled:cursor-not-allowed disabled:opacity-35 lg:text-lg"
      {...props}
    >
      {icon && <Icon name={icon} />}
      {children}
      {iconAfter && <Icon name={iconAfter} />}
    </button>
  )
}

function Overlay({ labelledBy, children }) {
  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
    >
      <MotionDiv
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        initial={{ y: 20, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 12, scale: 0.98 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        className="w-full max-w-3xl border border-cream/15 bg-stage-raised p-8 text-cream shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] lg:p-12"
      >
        {children}
      </MotionDiv>
    </MotionDiv>
  )
}

export default function GamePage() {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [guessed, setGuessed] = useState([])
  const [revealedAll, setRevealedAll] = useState(false)
  const [roundWinner, setRoundWinner] = useState(null)
  const [teams, setTeams] = useState(createTeams)
  const [activeTeam, setActiveTeam] = useState(0)
  const [phase, setPhase] = useState('IDLE')
  const [resumePhase, setResumePhase] = useState('IDLE')
  const [spinResult, setSpinResult] = useState(null)
  const [rotation, setRotation] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TURN_SECONDS)
  const [solver, setSolver] = useState(null)
  const [failedSolvers, setFailedSolvers] = useState([])
  const [banner, setBanner] = useState(null)
  const [muted, setMutedState] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const stageRef = useRef(null)
  const bannerSeq = useRef(0)

  const question = QUESTIONS[questionIndex]
  const letters = useMemo(() => [...normalizeLetters(question.answer)].filter((c) => c !== ' '), [question])
  const words = question.answer.split(' ')
  const roundOver = revealedAll || letters.every((c) => guessed.includes(c))
  const isLastQuestion = questionIndex === QUESTIONS.length - 1
  const busy = phase === 'SPINNING' || phase === 'RESULT' || phase === 'SOLVING' || phase === 'STEAL'
  const canAct = (phase === 'IDLE' || phase === 'GUESSING') && !roundOver

  const ranking = useMemo(
    () => teams.map((team, index) => ({ ...team, index })).sort((a, b) => b.score - a.score),
    [teams],
  )
  const topScore = ranking[0].score
  const leaders = ranking.filter((team) => team.score === topScore)

  const pushBanner = useCallback((next) => {
    bannerSeq.current += 1
    setBanner({ id: bannerSeq.current, duration: 1600, ...next })
  }, [])

  const passTurn = useCallback((from) => {
    setActiveTeam(nextTeamIndex(from))
    setSpinResult(null)
    setPhase('IDLE')
  }, [])

  const finishRound = useCallback((winnerIndex, points) => {
    setTeams((prev) =>
      prev.map((team, index) =>
        index === winnerIndex ? { ...team, score: team.score + points, roundScore: 0 } : { ...team, roundScore: 0 },
      ),
    )
    setRoundWinner({ teamIndex: winnerIndex, points })
    setRevealedAll(true)
    setSpinResult(null)
    setSolver(null)
    setFailedSolvers([])
    setPhase('IDLE')
    sfx.solve()
  }, [])

  const handleSpin = () => {
    if (phase !== 'IDLE' || roundOver) return
    const index = Math.floor(Math.random() * WHEEL_SEGMENTS.length)
    const offset = Math.floor(Math.random() * 20) - 10
    const landing = (((-index * 36 + offset) % 360) + 360) % 360
    const fullTurns = rotation - (((rotation % 360) + 360) % 360)
    setRotation(fullTurns + 360 * 5 + landing)
    setSpinResult(WHEEL_SEGMENTS[index])
    setPhase('SPINNING')
  }

  const handleSpinEnd = () => {
    if (phase !== 'SPINNING' || !spinResult) return
    const team = teams[activeTeam]
    const upNext = TEAMS[nextTeamIndex(activeTeam)].name

    if (spinResult.type === 'lose_turn') {
      sfx.loseTurn()
      pushBanner({ kind: 'lose_turn', title: 'Mất lượt', detail: `Đến lượt ${upNext}`, duration: RESULT_MS })
    } else if (spinResult.type === 'bankrupt') {
      const kept = Math.floor(team.score / 2)
      const lost = team.roundScore + team.score - kept
      setTeams((prev) => prev.map((t, i) => (i === activeTeam ? { ...t, score: kept, roundScore: 0 } : t)))
      sfx.bankrupt()
      pushBanner({
        kind: 'bankrupt',
        title: 'Phá sản',
        detail: lost > 0 ? `${team.name} mất ${formatScore(lost)} điểm` : `${team.name} chưa có điểm để mất`,
        duration: RESULT_MS,
      })
    } else {
      sfx.land()
      const isMultiply = spinResult.type === 'multiply'
      pushBanner({
        kind: isMultiply ? 'multiply' : 'score',
        title: spinResult.label,
        detail: isMultiply ? 'Đoán đúng để nhân đôi điểm vòng này' : 'điểm cho mỗi chữ đúng',
        duration: RESULT_MS,
      })
    }
    setPhase('RESULT')
  }

  const handleGuess = useCallback(
    (letter) => {
      if (phase !== 'GUESSING' || roundOver || !spinResult || guessed.includes(letter)) return
      const nextGuessed = [...guessed, letter]
      setGuessed(nextGuessed)
      const count = letters.filter((c) => c === letter).length

      if (count === 0) {
        sfx.wrong()
        pushBanner({ kind: 'wrong', title: `Không có chữ ${letter}`, detail: `Đến lượt ${TEAMS[nextTeamIndex(activeTeam)].name}` })
        passTurn(activeTeam)
        return
      }

      const team = teams[activeTeam]
      const earned = spinResult.type === 'multiply' ? team.roundScore : spinResult.value * count
      const roundScore = team.roundScore + earned

      if (letters.every((c) => nextGuessed.includes(c))) {
        finishRound(activeTeam, roundScore)
        return
      }

      sfx.correct()
      setTeams((prev) => prev.map((t, i) => (i === activeTeam ? { ...t, roundScore } : t)))
      pushBanner({
        kind: 'correct',
        title: `${count} chữ ${letter}`,
        detail: earned > 0 ? `+${formatScore(earned)} điểm vòng này` : 'Điểm vòng này đang là 0',
        duration: 1400,
      })
      setSpinResult(null)
      setPhase('IDLE')
    },
    [phase, roundOver, spinResult, guessed, letters, teams, activeTeam, pushBanner, passTurn, finishRound],
  )

  const handleTimeout = useCallback(() => {
    sfx.timeout()
    pushBanner({ kind: 'wrong', title: 'Hết giờ', detail: `Đến lượt ${TEAMS[nextTeamIndex(activeTeam)].name}` })
    passTurn(activeTeam)
  }, [activeTeam, pushBanner, passTurn])

  const openSolve = () => {
    if (!canAct) return
    setResumePhase(phase)
    setSolver(activeTeam)
    setFailedSolvers([])
    setPhase('SOLVING')
  }

  const endSteal = () => {
    setFailedSolvers([])
    setSolver(null)
    passTurn(activeTeam)
  }

  const cancelSolve = () => {
    setSolver(null)
    setPhase(failedSolvers.length > 0 ? 'STEAL' : resumePhase)
  }

  const confirmSolve = (correct) => {
    if (solver === null) return
    if (correct) {
      finishRound(solver, teams[solver].roundScore + SOLVE_BONUS)
      return
    }
    sfx.wrong()
    const failed = [...failedSolvers, solver]
    setSolver(null)
    if (failed.length >= TEAMS.length) {
      endSteal()
      return
    }
    setFailedSolvers(failed)
    setPhase('STEAL')
  }

  const pickStealer = (index) => {
    setSolver(index)
    setPhase('SOLVING')
  }

  const revealAnswer = () => {
    if (busy || roundOver) return
    setTeams((prev) => prev.map((team) => ({ ...team, roundScore: 0 })))
    setRoundWinner(null)
    setRevealedAll(true)
    setSpinResult(null)
    setPhase('IDLE')
  }

  const goToQuestion = (index) => {
    if (busy || index < 0 || index >= QUESTIONS.length) return
    if (roundWinner) setActiveTeam(nextTeamIndex(roundWinner.teamIndex))
    else if (roundOver) setActiveTeam(nextTeamIndex(activeTeam))
    setQuestionIndex(index)
    setGuessed([])
    setRevealedAll(false)
    setRoundWinner(null)
    setTeams((prev) => prev.map((team) => ({ ...team, roundScore: 0 })))
    setSpinResult(null)
    setSolver(null)
    setFailedSolvers([])
    setBanner(null)
    setPhase('IDLE')
  }

  const openSummary = () => {
    if (busy) return
    setResumePhase(phase)
    setPhase('FINISHED')
    sfx.fanfare()
  }

  const restart = () => {
    setTeams(createTeams())
    setQuestionIndex(0)
    setGuessed([])
    setRevealedAll(false)
    setRoundWinner(null)
    setActiveTeam(0)
    setSpinResult(null)
    setSolver(null)
    setFailedSolvers([])
    setBanner(null)
    setPhase('IDLE')
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else stageRef.current?.requestFullscreen?.()
  }

  useEffect(() => {
    if (phase !== 'RESULT' || !spinResult) return
    const id = setTimeout(() => {
      if (spinResult.type === 'lose_turn' || spinResult.type === 'bankrupt') {
        passTurn(activeTeam)
      } else {
        setTimeLeft(TURN_SECONDS)
        setPhase('GUESSING')
      }
    }, RESULT_MS)
    return () => clearTimeout(id)
  }, [phase, spinResult, activeTeam, passTurn])

  useEffect(() => {
    if (phase !== 'GUESSING') return
    const id = setTimeout(() => {
      if (timeLeft <= 1) {
        setTimeLeft(0)
        handleTimeout()
        return
      }
      if (timeLeft - 1 <= 5) sfx.countdown()
      setTimeLeft(timeLeft - 1)
    }, 1000)
    return () => clearTimeout(id)
  }, [phase, timeLeft, handleTimeout])

  useEffect(() => {
    if (!banner) return
    const id = setTimeout(() => setBanner(null), banner.duration)
    return () => clearTimeout(id)
  }, [banner])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      const key = event.key.toUpperCase()
      if (KEY_SET.has(key)) handleGuess(key)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleGuess])

  useEffect(() => {
    setMuted(muted)
  }, [muted])

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === stageRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  let status
  if (roundOver) status = 'Vòng này đã kết thúc'
  else if (phase === 'SPINNING') status = 'Đang quay…'
  else if (phase === 'GUESSING' && spinResult)
    status =
      spinResult.type === 'multiply'
        ? 'Nhân đôi: đoán đúng để nhân đôi điểm vòng này'
        : `${spinResult.label} điểm cho mỗi chữ đúng · chọn một chữ cái`
  else status = `${TEAMS[activeTeam].name}: bấm QUAY hoặc giải từ khóa`

  let headline = `${leaders[0].name} chiến thắng`
  if (topScore === 0) headline = 'Chưa đội nào ghi điểm'
  else if (leaders.length > 1) headline = `Đồng hạng nhất: ${leaders.map((team) => team.name).join(' & ')}`

  return (
    <div
      ref={stageRef}
      className="relative flex min-h-[calc(100dvh-4.25rem)] flex-col gap-4 bg-stage px-5 py-5 text-cream sm:px-10 lg:min-h-[calc(100dvh-5.25rem)] lg:gap-5 lg:px-14 [&:fullscreen]:min-h-dvh [&:fullscreen]:overflow-y-auto"
      style={{ backgroundImage: 'radial-gradient(ellipse 55% 65% at 22% 62%, rgba(224,176,64,0.13), transparent 70%)' }}
    >
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-cream/15 pb-3">
        <div className="flex items-center gap-4">
          <svg viewBox="0 0 24 24" fill="#E0B040" aria-hidden="true" className="h-7 w-7 shrink-0">
            <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
          </svg>
          <span className="hidden font-mono text-sm tracking-[0.14em] text-cream-muted sm:inline lg:text-base">HCM202</span>
          <h1 className="font-condensed text-3xl leading-[1.06] font-extrabold uppercase lg:text-[42px]">Chiếc nón đại đoàn kết</h1>
        </div>
        <div className="flex items-center gap-5 lg:gap-8">
          <span className="font-mono text-base tracking-[0.1em] text-cream-muted lg:text-lg">
            CÂU <span className="text-gold">{pad(questionIndex + 1)}</span> / {QUESTIONS.length}
          </span>
          <TimerRing seconds={timeLeft} active={phase === 'GUESSING'} />
          <button
            type="button"
            onClick={() => setMutedState((value) => !value)}
            aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className="inline-flex h-11 w-11 items-center justify-center border border-cream/15 text-cream/80 transition-colors hover:border-cream/40 hover:text-cream"
          >
            <Icon name={muted ? 'muted' : 'sound'} />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
            className="inline-flex h-11 w-11 items-center justify-center border border-cream/15 text-cream/80 transition-colors hover:border-cream/40 hover:text-cream"
          >
            <Icon name={isFullscreen ? 'shrink' : 'expand'} />
          </button>
        </div>
      </header>

      <section aria-label="Bảng điểm" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        {teams.map((team, index) => {
          const isActive = index === activeTeam && !roundOver
          const isWinner = roundWinner?.teamIndex === index
          const highlighted = isActive || isWinner
          const sideWidth = highlighted ? 2 : 1
          const sideColor = highlighted ? team.color : 'rgba(239,232,216,0.1)'
          return (
            <div
              key={team.name}
              className="flex flex-col gap-1 bg-stage-raised px-5 py-3 transition-[border-color,box-shadow] duration-300 lg:px-6"
              style={{
                borderStyle: 'solid',
                borderTopWidth: 6,
                borderRightWidth: sideWidth,
                borderBottomWidth: sideWidth,
                borderLeftWidth: sideWidth,
                borderTopColor: team.color,
                borderRightColor: sideColor,
                borderBottomColor: sideColor,
                borderLeftColor: sideColor,
                boxShadow: highlighted ? `0 24px 60px -24px ${team.color}` : 'none',
              }}
            >
              <div className="flex min-h-7 items-center justify-between gap-2">
                <span className="text-lg font-semibold lg:text-xl">{team.name}</span>
                {(isActive || isWinner) && (
                  <span
                    className="px-2.5 py-1 font-mono text-[11px] font-medium tracking-[0.1em] text-stage lg:text-[13px]"
                    style={{ backgroundColor: team.color }}
                  >
                    {isWinner ? 'GIẢI ĐÚNG' : 'ĐANG CHƠI'}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="font-condensed text-5xl leading-none font-extrabold tabular-nums lg:text-[60px]">
                  <AnimatedNumber value={team.score} />
                </span>
                <span className="text-sm lg:text-base" style={{ color: team.roundScore > 0 ? team.tint : '#A39C8C' }}>
                  Vòng này: {team.roundScore > 0 ? `+${formatScore(team.roundScore)}` : 0}
                </span>
              </div>
            </div>
          )
        })}
      </section>

      <div className="grid flex-1 grid-cols-1 items-start gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-14">
        <div className="flex flex-col items-center gap-4">
          <Wheel
            rotation={rotation}
            spinning={phase === 'SPINNING'}
            canSpin={phase === 'IDLE' && !roundOver}
            onSpin={handleSpin}
            onSpinEnd={handleSpinEnd}
            onTick={sfx.tick}
          />
          <p aria-live="polite" className="max-w-[28em] text-center text-base text-cream-muted lg:text-lg">
            {status}
          </p>
        </div>

        <div className="relative flex min-w-0 flex-col gap-6 self-stretch">
          <AnimatePresence>
            {banner && (
              <MotionDiv
                key={banner.id}
                role="status"
                aria-live="assertive"
                initial={{ opacity: 0, y: -14, scale: 0.97 }}
                animate={
                  banner.kind === 'bankrupt'
                    ? { opacity: 1, y: 0, scale: 1, x: [0, -16, 16, -12, 12, -5, 0] }
                    : { opacity: 1, y: 0, scale: 1 }
                }
                exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
                transition={{ duration: banner.kind === 'bankrupt' ? 0.6 : 0.35, ease: EASE_OUT }}
                className={`absolute inset-x-0 top-0 z-20 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-7 py-6 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] lg:px-9 ${BANNER_STYLES[banner.kind]}`}
              >
                <span className="font-condensed text-5xl leading-none font-extrabold uppercase lg:text-7xl">{banner.title}</span>
                <span className="text-lg font-semibold lg:text-2xl">{banner.detail}</span>
              </MotionDiv>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-2 border-b border-cream/15 pb-5">
            <span className="font-mono text-sm tracking-[0.14em] text-gold lg:text-[15px]">GỢI Ý</span>
            <p className="text-2xl leading-snug font-semibold lg:text-[34px]">{question.hint}</p>
          </div>

          <div
            key={questionIndex}
            aria-label={roundOver ? `Đáp án: ${question.answer}` : 'Ô chữ'}
            className="flex flex-wrap gap-x-7 gap-y-3.5"
          >
            {words.map((word, wordIndex) => (
              <div key={`${word}-${wordIndex}`} className="flex gap-2">
                {[...word].map((char, charIndex) => (
                  <Tile
                    key={charIndex}
                    char={char}
                    revealed={revealedAll || guessed.includes(normalizeLetters(char))}
                    delay={revealedAll ? (wordIndex * 4 + charIndex) * 0.04 : 0}
                  />
                ))}
              </div>
            ))}
          </div>

          {roundOver ? (
            <MotionDiv
              key={`round-${questionIndex}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.35 }}
              className="flex flex-col gap-4 border border-gold/30 bg-stage-raised p-6 lg:p-8"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                {roundWinner ? (
                  <p className="text-xl font-semibold lg:text-[26px]">
                    <span style={{ color: TEAMS[roundWinner.teamIndex].tint }}>{TEAMS[roundWinner.teamIndex].name}</span> giải đúng{' '}
                    <span className="text-gold">+{formatScore(roundWinner.points)}</span>
                  </p>
                ) : (
                  <p className="text-xl font-semibold lg:text-[26px]">Đáp án: {question.answer}</p>
                )}
                <span className="font-mono text-sm tracking-[0.12em] text-gold lg:text-base">PHẦN {pad(question.part)}</span>
              </div>
              <p className="font-mono text-xs tracking-[0.1em] text-cream-muted uppercase lg:text-sm">{PART_TITLES[question.part]}</p>
              <p className="text-lg leading-relaxed lg:text-2xl">{question.explanation}</p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={isLastQuestion ? openSummary : () => goToQuestion(questionIndex + 1)}
                  className="inline-flex items-center gap-3 bg-gold px-7 py-4 text-lg font-bold tracking-[0.06em] text-stage uppercase transition hover:brightness-110 active:scale-[0.98] lg:text-xl"
                >
                  {isLastQuestion ? 'Xem tổng kết' : 'Câu tiếp'}
                  <Icon name={isLastQuestion ? 'trophy' : 'next'} className="h-6 w-6" />
                </button>
              </div>
            </MotionDiv>
          ) : (
            <div aria-label="Bàn phím chữ cái" className="flex flex-col gap-2.5">
              {KEYBOARD_ROWS.map((row) => (
                <div key={row.join('')} className="flex flex-wrap gap-2.5">
                  {row.map((letter) => {
                    const used = guessed.includes(letter)
                    const wrong = used && !letters.includes(letter)
                    let tone = 'border-cream/15 bg-[#24221E] text-cream hover:border-gold hover:text-gold active:scale-95'
                    if (wrong) tone = 'border-dashed border-danger text-danger line-through'
                    else if (used) tone = 'border-cream/10 text-cream/30'
                    else if (phase !== 'GUESSING') tone = 'border-cream/10 bg-[#24221E] text-cream/45'
                    return (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => handleGuess(letter)}
                        disabled={used || phase !== 'GUESSING'}
                        aria-label={`Chữ ${letter}`}
                        className={`h-[clamp(44px,3.4vw,66px)] w-[clamp(40px,3.7vw,72px)] border text-[clamp(18px,1.4vw,26px)] font-semibold transition duration-150 disabled:cursor-not-allowed ${tone}`}
                      >
                        {letter}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-cream/10 pt-5">
            <button
              type="button"
              onClick={openSolve}
              disabled={!canAct}
              className="bg-gold px-7 py-4 text-lg font-bold tracking-[0.06em] text-stage uppercase transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 lg:px-9 lg:py-5 lg:text-xl"
            >
              Giải từ khóa
            </button>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <QuietButton icon="prev" onClick={() => goToQuestion(questionIndex - 1)} disabled={busy || questionIndex === 0}>
                Câu trước
              </QuietButton>
              <QuietButton icon="eye" onClick={revealAnswer} disabled={busy || roundOver}>
                Hiện đáp án
              </QuietButton>
              <QuietButton iconAfter="next" onClick={() => goToQuestion(questionIndex + 1)} disabled={busy || isLastQuestion}>
                Câu tiếp
              </QuietButton>
              <QuietButton icon="trophy" onClick={openSummary} disabled={busy}>
                Tổng kết
              </QuietButton>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {phase === 'SOLVING' && solver !== null && (
          <Overlay key="solve" labelledBy="solve-title">
            <span className="font-mono text-sm tracking-[0.14em] text-gold lg:text-base">
              {failedSolvers.length > 0 ? 'GIÀNH QUYỀN GIẢI' : 'GIẢI TỪ KHÓA'}
            </span>
            <h2
              id="solve-title"
              className="mt-3 font-condensed text-5xl leading-[1.05] font-extrabold uppercase lg:text-7xl"
              style={{ color: TEAMS[solver].tint }}
            >
              {TEAMS[solver].name} trả lời
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-cream-muted lg:text-2xl">
              MC lắng nghe câu trả lời rồi xác nhận. Trả lời đúng được cộng {formatScore(SOLVE_BONUS)} điểm cùng điểm vòng này
              của đội.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => confirmSolve(true)}
                className="bg-[#3AA396] py-5 text-xl font-bold tracking-[0.06em] text-stage uppercase transition hover:brightness-110 active:scale-[0.98] lg:text-2xl"
              >
                Chính xác
              </button>
              <button
                type="button"
                onClick={() => confirmSolve(false)}
                className="bg-danger py-5 text-xl font-bold tracking-[0.06em] text-stage uppercase transition hover:brightness-110 active:scale-[0.98] lg:text-2xl"
              >
                Sai
              </button>
            </div>
            <button
              type="button"
              onClick={cancelSolve}
              className="mt-6 text-base text-cream-muted underline underline-offset-4 transition-colors hover:text-cream lg:text-lg"
            >
              Hủy, quay lại
            </button>
          </Overlay>
        )}

        {phase === 'STEAL' && failedSolvers.length > 0 && (
          <Overlay key="steal" labelledBy="steal-title">
            <span className="font-mono text-sm tracking-[0.14em] text-danger lg:text-base">GIẢI SAI</span>
            <h2 id="steal-title" className="mt-3 font-condensed text-5xl leading-[1.05] font-extrabold uppercase lg:text-7xl">
              {TEAMS[failedSolvers[failedSolvers.length - 1]].name} trả lời chưa đúng
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-cream-muted lg:text-2xl">
              Đội nào giơ tay trước sẽ giành quyền giải. MC chọn đội:
            </p>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {TEAMS.map((team, index) =>
                failedSolvers.includes(index) ? null : (
                  <button
                    key={team.name}
                    type="button"
                    onClick={() => pickStealer(index)}
                    className="border-2 bg-stage py-5 text-xl font-semibold transition hover:bg-cream/5 active:scale-[0.98] lg:text-2xl"
                    style={{ borderColor: team.color, color: team.tint }}
                  >
                    {team.name}
                  </button>
                ),
              )}
            </div>
            <button
              type="button"
              onClick={endSteal}
              className="mt-6 text-base text-cream-muted underline underline-offset-4 transition-colors hover:text-cream lg:text-lg"
            >
              Không đội nào giành, chuyển lượt
            </button>
          </Overlay>
        )}

        {phase === 'FINISHED' && (
          <MotionDiv
            key="summary"
            role="dialog"
            aria-modal="true"
            aria-labelledby="summary-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-stage px-6 py-10 text-cream"
            style={{ backgroundImage: 'radial-gradient(ellipse 60% 55% at 50% 35%, rgba(224,176,64,0.14), transparent 70%)' }}
          >
            {topScore > 0 && (
              <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
                {CONFETTI.map((piece) => (
                  <span
                    key={`${piece.left}-${piece.delay}`}
                    className="animate-confetti absolute top-0 block"
                    style={{
                      left: `${piece.left}%`,
                      width: piece.size,
                      height: piece.size * 1.6,
                      backgroundColor: piece.color,
                      animationDelay: `${piece.delay}s`,
                      animationDuration: `${piece.duration}s`,
                    }}
                  />
                ))}
              </div>
            )}
            <div className="relative mx-auto flex min-h-full w-full max-w-4xl flex-col justify-center gap-8">
              <div>
                <span className="font-mono text-sm tracking-[0.14em] text-gold lg:text-base">TỔNG KẾT</span>
                <h2 id="summary-title" className="mt-3 font-condensed text-6xl leading-[1.02] font-extrabold uppercase lg:text-[104px]">
                  {headline}
                </h2>
              </div>
              <ol className="flex flex-col border-t border-cream/15">
                {ranking.map((team, rank) => (
                  <li
                    key={team.name}
                    className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-4 border-b border-cream/15 py-4 lg:grid-cols-[4rem_minmax(0,1fr)_auto] lg:py-5"
                  >
                    <span className="font-condensed text-4xl font-extrabold text-cream-muted lg:text-5xl">{rank + 1}</span>
                    <div className="flex flex-col gap-2">
                      <span className="text-xl font-semibold lg:text-3xl" style={{ color: team.tint }}>
                        {team.name}
                      </span>
                      <span className="h-2 bg-cream/10">
                        <span
                          className="block h-full"
                          style={{
                            width: `${topScore > 0 ? Math.max(4, (team.score / topScore) * 100) : 4}%`,
                            backgroundColor: team.color,
                          }}
                        />
                      </span>
                    </div>
                    <span className="font-condensed text-5xl font-extrabold tabular-nums lg:text-7xl">{formatScore(team.score)}</span>
                  </li>
                ))}
              </ol>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => setPhase(resumePhase)}
                  className="border border-cream/30 px-7 py-4 text-lg font-semibold transition-colors hover:border-cream lg:text-xl"
                >
                  Quay lại trò chơi
                </button>
                <button
                  type="button"
                  onClick={restart}
                  className="bg-gold px-7 py-4 text-lg font-bold tracking-[0.06em] text-stage uppercase transition hover:brightness-110 active:scale-[0.98] lg:text-xl"
                >
                  Chơi lại từ đầu
                </button>
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  )
}
