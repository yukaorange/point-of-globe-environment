import { phenomenonState, Impact } from '@/state/phenomenon'
import * as THREE from 'three'

export const generateMultipleImpacts = (
  targetPhenomenon: keyof (typeof phenomenonState)['phenomenonImpacts'],
  count: number,
) => {
  const impacts: Impact[] = []

  for (let i = 0; i < count; i++) {
    impacts.push({
      impactPosition: new THREE.Vector3().setFromSphericalCoords(
        5,
        Math.PI * Math.random(),
        Math.PI * 2 * Math.random(),
      ),
      impactMaxRadius: 5 * THREE.MathUtils.randFloat(0.5, 0.75),
      impactRatio: 0,
    })
  }

  phenomenonState.phenomenonImpacts[targetPhenomenon] = impacts
}
