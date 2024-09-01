import { useCallback, useState, useEffect } from 'react'
import { useShuffleText } from '@/hooks/useShuffleText'

export const ShuffleText: React.FC<{ text: string }> = ({ text }) => {
  const { displayText, isShuffling } = useShuffleText(text)

  return (
    <span
      className={`shuffle-text ${isShuffling ? 'shuffle-text--shuffling' : ''}`}
    >
      {displayText}
    </span>
  )
}
