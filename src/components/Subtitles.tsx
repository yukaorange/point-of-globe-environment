import { phenomenonState } from '@/state/phenomenon'
import { useSnapshot } from 'valtio'
import { ShuffleText } from '@/components/ShuffleText'
import React from 'react'

export const Subtitles = () => {
  const { titles, activePhenomenon } = useSnapshot(phenomenonState)

  const eventsList = titles[activePhenomenon]

  const eventsObject = Object.entries(eventsList).map(([key, value]) => {
    return {
      title: (value as { title: string }).title,
      date: (value as { closed: string }).closed,
    }
  })

  return (
    <>
      {eventsObject.map((event, index) => {
        return (
          <React.Fragment key={index}>
            <div className="subtitles _en">
              <div className="subtitles__date">
                <ShuffleText text={event.date} />
              </div>
              <div className="subtitles__title">
                <ShuffleText text={event.title} />
              </div>
            </div>
          </React.Fragment>
        )
      })}
    </>
  )
}
