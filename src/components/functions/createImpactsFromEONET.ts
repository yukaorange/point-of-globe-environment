import { Impact } from '@/state/phenomenon'
import * as THREE from 'three'

import {
  EONETEvent,
  EventCategory,
} from '@/components/functions/fetchEONETEvent'

export const createImpactsFromEONET = (
  events: EONETEvent,
  activePhenomenon: EventCategory,
): Impact[] => {
  const EONETEvents = events.events

  const impacts = EONETEvents.map((event) => {
    const coordinates = event.geometry[0].coordinates as number[]
    const title = event.title

    //longitudeが経度、latitudeが緯度
    const [longitude, latitude] = coordinates

    // console.log(title, longitude, latitude)

    //経度をラジアンに変換
    const theta = THREE.MathUtils.degToRad(longitude)
    //緯度をラジアンに変換
    const phi = THREE.MathUtils.degToRad(90 - latitude)

    const earthRadius = 5

    const x = earthRadius * Math.sin(phi) * Math.cos(theta)
    const y = earthRadius * Math.cos(phi)
    const z = earthRadius * Math.sin(phi) * Math.sin(theta)

    let impact: Impact

    impact = {
      impactPosition: new THREE.Vector3(x, y, z),
      impactMaxRadius: 0,
      impactRatio: 0,
    }

    console.log(activePhenomenon)

    switch (activePhenomenon) {
      case 'earthquakes':
        impact.impactMaxRadius = 5
        break
      case 'volcanoes':
        impact.impactMaxRadius = 2
        break
      case 'floods':
        impact.impactMaxRadius = 3
        break
      case 'wildfires':
        impact.impactMaxRadius = 3.5
        break
    }

    return impact
  })

  return impacts
}
