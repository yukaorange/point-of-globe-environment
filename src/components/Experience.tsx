import { OrbitControls, Loader } from '@react-three/drei'
import * as THREE from 'three'
import { useControls } from 'leva'
import { useQuery } from 'react-query'
import { useRef, Suspense, useEffect } from 'react'
import { useFrame, Canvas } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import { ResponsiveCamera } from '@/components/ResponsiveCamera'
import { Globe } from '@/components/Globe'
import { GlobeGrid } from '@/components/GlobeGrid'

import { phenomenonState, Impact } from '@/state/phenomenon'
import { useSnapshot } from 'valtio'
import { useState } from 'react'

import { getEONETEventObjects } from '@/functions/getEONETEventObjects'

import { createImpactsFromEONET } from '@/functions/createImpactsFromEONET'
import { Switcher } from '@/components/Switcher'
import { Subtitles } from '@/components/Subtitles'

import { fetchEONETEvent, EONETEvent } from '@/functions/fetchEONETEvent'
import { EventCategory } from '@/state/phenomenon'

export const Experience = (): JSX.Element => {
  // const [EONETEvents, setEONETEvents] = useState<Record<
  //   EventCategory,
  //   EONETEvent
  // > | null>(null)

  const { activePhenomenon } = useSnapshot(phenomenonState)

  const categories: EventCategory[] = [
    'earthquakes',
    'volcanoes',
    'floods',
    'wildfires',
  ]

  const fetchAllCategoriesEvent = async () => {
    const results = await Promise.all(
      categories.map(async (category) => {
        const events = await fetchEONETEvent(category)

        // return events
        return { [category]: events }
      }),
    )

    // const newEONETEvents = categories.reduce((acc, category, index) => {
    //   acc[category] = results[index]
    //   return acc
    // }, {} as Record<EventCategory, EONETEvent>)

    // setEONETEvents(newEONETEvents)

    const newEONETEvents = Object.assign({}, ...results) as Record<
      EventCategory,
      EONETEvent
    >

    return newEONETEvents
  }

  const { data: EONETEvents } = useQuery(
    'EONETEvents',
    fetchAllCategoriesEvent,
    {
      suspense: true,
    },
  )

  const switchPhenomenon = (targetPhenomenon: EventCategory) => {
    phenomenonState.activePhenomenon = targetPhenomenon

    updateImpacts(targetPhenomenon)
  }

  const updateImpacts = (category: EventCategory) => {
    if (!EONETEvents) return

    const impacts = createImpactsFromEONET(
      EONETEvents[category],
      activePhenomenon,
    )

    phenomenonState.phenomenonImpacts[category] = impacts
  }

  useEffect(() => {
    // fetchAllCategoriesEvent()
    if (EONETEvents) {
      updateImpacts(activePhenomenon)
      const eventObjects = getEONETEventObjects(EONETEvents)
      phenomenonState.titles = eventObjects
    }
  }, [EONETEvents])

  useEffect(() => {
    if (EONETEvents) {
      updateImpacts(activePhenomenon)

      const eventObjects = getEONETEventObjects(EONETEvents)

      phenomenonState.titles = eventObjects
    }
  }, [EONETEvents, activePhenomenon])

  return (
    <>
      <Canvas>
        {/* <Perf position="top-left" /> */}
        <color attach="background" args={[204 / 255, 205 / 255, 207 / 255]} />
        <ResponsiveCamera />
        <OrbitControls />
        <Globe />
        <GlobeGrid />
      </Canvas>
      <div className="contents">
        <div className="contents__inner">
          <div className="contents__header">
            <Switcher
              switchFunction={switchPhenomenon}
              categories={categories}
            />
          </div>
          <div className="contents__body">
            <Subtitles />
          </div>
        </div>
      </div>
    </>
  )
}
