import { Impact } from '@/state/phenomenon'
import * as THREE from 'three'

const createInitialImpact = (): Impact => {
  return {
    impactPosition: new THREE.Vector3(),
    impactMaxRadius: 0,
    impactRatio: 0,
  }
}

const createInitialImpacts = (count: number): Impact[] => {
  const InitialImpacts = Array.from(Array(count)).map(() => {
    return createInitialImpact()
  })

  return InitialImpacts
}

export { createInitialImpacts }
