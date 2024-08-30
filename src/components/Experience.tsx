import { OrbitControls, Loader } from '@react-three/drei'
import * as THREE from 'three'
import { useControls } from 'leva'
import { useRef, Suspense, useEffect } from 'react'
import { useFrame, Canvas } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import { ResponsiveCamera } from '@/components/ResponsiveCamera'
import { Globe } from '@/components/Globe'
import { GlobeGrid } from '@/components/GlobeGrid'
import { generateMultipleImpacts } from '@/components/functions/generateMultipleImpacts'
import { phenomenonState, Impact } from '@/state/phenomenon'
import { useSnapshot } from 'valtio'
import { useState } from 'react'

import { createImpactsFromEONET } from '@/components/functions/createImpactsFromEONET'

import {
  fetchEONETEvent,
  EONETEvent,
  EventCategory,
} from '@/components/functions/fetchEONETEvent'

export const Experience = (): JSX.Element => {
  const [EONETEvents, setEONETEvents] = useState<Record<
    EventCategory,
    EONETEvent
  > | null>(null)

  const { activePhenomenon } = useSnapshot(phenomenonState)

  const fetchAllCategoriesEvent = async () => {
    const categories: EventCategory[] = [
      'earthquakes',
      'volcanoes',
      'floods',
      'wildfires',
    ]

    const results = await Promise.all(
      categories.map(async (category) => {
        const events = await fetchEONETEvent(category)

        return events
      }),
    )

    const newEONETEvents = categories.reduce((acc, category, index) => {
      acc[category] = results[index]
      return acc
    }, {} as Record<EventCategory, EONETEvent>)

    setEONETEvents(newEONETEvents)
  }

  const switchPhenomenon = (
    targetPhenomenon: 'earthquakes' | 'volcanoes' | 'floods' | 'wildfires',
  ) => {
    phenomenonState.activePhenomenon = targetPhenomenon

    generateMultipleImpacts(targetPhenomenon, 10)
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
    fetchAllCategoriesEvent()
  }, [])

  useEffect(() => {
    if (EONETEvents) {
      updateImpacts(activePhenomenon)
    }
  }, [EONETEvents, activePhenomenon])

  return (
    <>
      <Canvas>
        {/* <Perf position="top-left" /> */}
        <color attach="background" args={[196 / 255, 197 / 255, 199 / 255]} />
        <ResponsiveCamera />
        <OrbitControls />
        <Globe />
        <GlobeGrid />
      </Canvas>
      <div className="changer">
        <button onClick={() => switchPhenomenon('earthquakes')}>
          Earthquakes
        </button>
        <button onClick={() => switchPhenomenon('volcanoes')}>Volcanoes</button>
        <button onClick={() => switchPhenomenon('floods')}>Floods</button>
        <button onClick={() => switchPhenomenon('wildfires')}>Wildfires</button>
      </div>
    </>
  )
}
