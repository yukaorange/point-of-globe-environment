import { proxy } from 'valtio'

export interface Impact {
  impactPosition: THREE.Vector3
  impactMaxRadius: number
  impactRatio: number
}

export interface PhenomenonState {
  activePhenomenon: 'earthquake' | 'volcano' | 'hurricane'
  phenomenonImpacts: {
    earthquake: Impact[]
    volcano: Impact[]
    hurricane: Impact[]
  }
}

export const phenomenonState = proxy<PhenomenonState>({
  activePhenomenon: 'earthquake',
  phenomenonImpacts: {
    earthquake: [],
    volcano: [],
    hurricane: [],
  },
})
