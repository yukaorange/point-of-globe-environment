import { phenomenonState } from '@/state/phenomenon'
import { useState } from 'react'
import { useSnapshot } from 'valtio'
import { EventCategory } from '@/state/phenomenon'
import { ShuffleText } from '@/components/ShuffleText'

interface Switcher {
  switchFunction: (targetPhenomenon: EventCategory) => void
  categories: EventCategory[]
}

export const Switcher: React.FC<Switcher> = ({
  switchFunction,
  categories,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { activePhenomenon } = useSnapshot(phenomenonState)

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => {
      const index = prevIndex == 0 ? categories.length - 1 : prevIndex - 1
      switchFunction(categories[index])
      return index
    })
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const index = prevIndex == categories.length - 1 ? 0 : prevIndex + 1
      switchFunction(categories[index])
      return index
    })
  }

  return (
    <div className="switcher">
      <button
        className="switcher__button switcher__button--left"
        onClick={handlePrevious}
      >
        <LeftArrow />
      </button>
      <div className="switcher__title _en">
        <ShuffleText text={activePhenomenon as string} />
      </div>
      <button
        className="switcher__button switcher__button--right"
        onClick={handleNext}
      >
        <RightArrow />
      </button>
    </div>
  )
}

const LeftArrow = () => {
  return (
    <svg
      fill="#000000"
      height="800px"
      width="800px"
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-38.63 -38.63 463.52 463.52"
      stroke="#000000"
      strokeWidth="0.00386258"
      transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0" />
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#CCCCCC"
        strokeWidth="0.772516"
      />
      <g id="SVGRepo_iconCarrier">
        {' '}
        <polygon points="96.879,193.129 289.379,386.258 289.379,0 " />{' '}
      </g>
    </svg>
  )
}

const RightArrow = () => {
  return (
    <svg
      fill="#000000"
      height="800px"
      width="800px"
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 386.258 386.258"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0" />

      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <g id="SVGRepo_iconCarrier">
        <polygon points="289.379,193.129 96.879,386.258 96.879,0" />
      </g>
    </svg>
  )
}
