import { useCallback, useState, useEffect } from 'react'

const SHUFFLE_DURATION = 1500

export const useShuffleText = (originalText: string) => {
  const [displayText, setDisplayText] = useState<string>(originalText)
  const [isShuffling, setIsShuffling] = useState(false)

  const getRandomChar = useCallback(() => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    return chars[Math.floor(Math.random() * chars.length)]
  }, [])

  const shuffleText = useCallback(() => {
    setIsShuffling(true)

    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime

      const progress = Math.min(elapsedTime / SHUFFLE_DURATION, 1)

      const targetLength = Math.floor(originalText.length * progress)

      setDisplayText((prev: string) => {
        const newText = prev
          .padEnd(targetLength, ' ')
          .split('')
          .map((char, index) => {
            if (index >= targetLength) return ' '
            if (char === ' ' || Math.random() < 0.5) return getRandomChar()

            return originalText[index]
          })
          .join('')
        return newText
      })

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayText(originalText)
        setIsShuffling(false)
      }
    }

    requestAnimationFrame(animate)
  }, [originalText, getRandomChar])

  useEffect(() => {
    shuffleText()
  }, [originalText, shuffleText])

  return { displayText, isShuffling }
}
