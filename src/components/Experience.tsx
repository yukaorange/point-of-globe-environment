import { OrbitControls, Loader } from '@react-three/drei'
import * as THREE from 'three'
import { useControls } from 'leva'

import { useRef, Suspense, useEffect } from 'react'
import { useFrame, Canvas } from '@react-three/fiber'
import { Perf } from 'r3f-perf'

import vertexshader from '@/shaders/vertex.glsl'
import fragmentShader from '@/shaders/fragment.glsl'
import { Globe } from '@/components/Globe'

import { phenomenonState, Impact } from '@/state/phenomenon'

import GSAP from 'gsap'

// const generateImpact = (phenomenon: 'earthquake' | 'volcano' | 'hurricane') => {
//   const impact: Impact = {
//     impactPosition: new THREE.Vector3(),
//     impactMaxRadius: 0,
//     impactRatio: 0,
//   }

//   impact.impactPosition.setFromSphericalCoords(
//     5,
//     Math.PI * Math.random(),
//     Math.PI * 2 * Math.random(),
//   )
//   impact.impactMaxRadius = 5 * THREE.MathUtils.randFloat(0.5, 0.75)

//   phenomenonState.phenomenonImpacts[phenomenon].push(impact)

//   GSAP.to(impact, {
//     impactRatio: 1,
//     duration: THREE.MathUtils.randInt(2.5, 5),
//     ease: 'power2.out',
//     onComplete: () => {
//       const index =
//         phenomenonState.phenomenonImpacts[phenomenon].indexOf(impact)
//       if (index > -1) {
//         phenomenonState.phenomenonImpacts[phenomenon].splice(index, 1)
//       }
//     },
//   })
// }

export const Experience = (): JSX.Element => {
  // useEffect(() => {
  //   const interval = setInterval(
  //     () => generateImpact(phenomenonState.activePhenomenon),
  //     2000,
  //   )
  //   return () => clearInterval(interval)
  // }, [])

  // const switchPhenomenon = (
  //   phenomenon: 'earthquake' | 'volcano' | 'hurricane',
  // ) => {
  //   phenomenonState.activePhenomenon = phenomenon
  // }

  return (
    <>
      <Canvas
        camera={{
          position: [0, 0, 15],
          fov: 45,
        }}
      >
        {/* <Perf position="top-left" /> */}
        <color attach="background" args={[196 / 255, 197 / 255, 199 / 255]} />
        <Suspense fallback={<Loader />}>
          <OrbitControls />
          {/* <ambientLight intensity={0.5} /> */}
          {/* <pointLight position={[10, 10, 10]} /> */}
          <Globe />
        </Suspense>
      </Canvas>
      {/* <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
        <button onClick={() => switchPhenomenon('earthquake')}>
          Earthquake
        </button>
        <button onClick={() => switchPhenomenon('volcano')}>Volcano</button>
        <button onClick={() => switchPhenomenon('hurricane')}>Hurricane</button>
      </div> */}
    </>
  )
}
