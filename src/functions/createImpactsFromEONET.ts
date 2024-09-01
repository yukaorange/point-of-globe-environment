import { Impact } from '@/state/phenomenon'
import * as THREE from 'three'

import { EONETEvent, EventCategory } from '@/functions/fetchEONETEvent'

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

    //経度をラジアンに変換（方位角）
    const phi = THREE.MathUtils.degToRad(110+longitude)
    //緯度をラジアンに変換(仰角)
    const theta = THREE.MathUtils.degToRad(90 - latitude)

    const earthRadius = 5

    const x = earthRadius * Math.sin(theta) * Math.cos(phi)
    const y = earthRadius * Math.cos(theta)
    const z = earthRadius * Math.sin(theta) * Math.sin(phi)

    let impact: Impact

    impact = {
      impactPosition: new THREE.Vector3(x, y, z),
      impactMaxRadius: 0,
      impactRatio: 0,
    }

    // console.log(activePhenomenon)

    switch (activePhenomenon) {
      case 'earthquakes':
        impact.impactMaxRadius = 4
        break
      case 'volcanoes':
        impact.impactMaxRadius = 3.5
        break
      case 'floods':
        impact.impactMaxRadius = 3
        break
      case 'wildfires':
        impact.impactMaxRadius = 2
        break
    }

    return impact
  })

  return impacts
}
