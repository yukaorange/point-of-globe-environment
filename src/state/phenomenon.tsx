import { proxy } from 'valtio'
import * as THREE from 'three'

import { createInitialImpacts } from '@/components/functions/createInitialImpacts'

export interface Impact {
  impactPosition: THREE.Vector3
  impactMaxRadius: number
  impactRatio: number
}

export interface PhenomenonState {
  activePhenomenon: 'earthquakes' | 'volcanoes' | 'floods' | 'wildfires'
  phenomenonImpacts: {
    earthquakes: Impact[]
    volcanoes: Impact[]
    floods: Impact[]
    wildfires: Impact[]
  }
}

const initialImpactsCount = 10

export const phenomenonState = proxy<PhenomenonState>({
  activePhenomenon: 'earthquakes',
  phenomenonImpacts: {
    earthquakes: createInitialImpacts(initialImpactsCount),
    volcanoes: createInitialImpacts(initialImpactsCount),
    floods: createInitialImpacts(initialImpactsCount),
    wildfires: createInitialImpacts(initialImpactsCount),
  },
})
