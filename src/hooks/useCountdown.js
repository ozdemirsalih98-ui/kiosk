import { useState, useEffect, useRef, useCallback } from 'react'

export function useCountdown(duration, onTimeout) {
  const [remaining, setRemaining] = useState(duration)
  const [isRunning, setIsRunning] = useState(false)

  const remainingRef = useRef(duration)
  const durationRef = useRef(duration)
  const onTimeoutRef = useRef(onTimeout)
  const isRunningRef = useRef(false)

  useEffect(() => { onTimeoutRef.current = onTimeout }, [onTimeout])
  useEffect(() => { durationRef.current = duration }, [duration])

  useEffect(() => {
    isRunningRef.current = isRunning
    if (!isRunning) return

    const interval = setInterval(() => {
      if (!isRunningRef.current) return
      remainingRef.current -= 1
      if (remainingRef.current <= 0) {
        remainingRef.current = durationRef.current
        setRemaining(durationRef.current)
        onTimeoutRef.current()
      } else {
        setRemaining(remainingRef.current)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  // Toggle: pause keeps remaining, resume from same position
  const toggle = useCallback(() => setIsRunning(r => !r), [])

  // Pause: stop without resetting remaining
  const pause = useCallback(() => setIsRunning(false), [])

  // Start from current remaining
  const start = useCallback(() => setIsRunning(true), [])

  // Reset to N and stop
  const reset = useCallback(() => {
    remainingRef.current = durationRef.current
    setRemaining(durationRef.current)
    setIsRunning(false)
  }, [])

  // Reset to N and start immediately
  const startFull = useCallback(() => {
    remainingRef.current = durationRef.current
    setRemaining(durationRef.current)
    setIsRunning(true)
  }, [])

  return { remaining, isRunning, toggle, start, pause, reset, startFull }
}
