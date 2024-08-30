import { useThree, useFrame } from '@react-three/fiber'
import { useRef, useEffect, useState } from 'react'

import * as THREE from 'three'

export const ResponsiveCamera = () => {
  const { viewport, camera } = useThree()

  const cameraRef = useRef(camera as THREE.PerspectiveCamera)
  const accumulatedDeltaRef = useRef(0)

  const [mouseX, setMouseX] = useState(0)
  const [baseRadius, setBaseRadius] = useState(0)
  const [baseY, setBaseY] = useState(0)
  const [targetY, setTargetY] = useState(0)

  const handleMouse = (event: MouseEvent) => {
    setMouseX((event.clientX / window.innerWidth) * 2 - 1)
  }

  useEffect(() => {
    const updateCameraPosition = () => {
      const aspect = viewport.width / viewport.height
      let radius, y, lookAtY, fov

      if (aspect > 1) {
        // 横長の画面
        radius = 20
        y = 6.0
        lookAtY = -2
        fov = 45
      } else {
        // 縦長の画面
        radius = 30
        y = 6.0
        lookAtY = -4
        fov = 45
      }

      setBaseRadius(radius)

      setBaseY(y)

      setTargetY(lookAtY)

      cameraRef.current.position.set(radius, y, radius)

      cameraRef.current.fov = fov

      cameraRef.current.updateProjectionMatrix()
    }

    updateCameraPosition()

    window.addEventListener('mousemove', handleMouse)

    return () => {
      window.removeEventListener('mousemove', handleMouse)
    }
  }, [window.innerWidth])

  useFrame((state, delta) => {
    accumulatedDeltaRef.current += delta * 0.1

    // const limitedMouseX = THREE.MathUtils.clamp(mouseX, -0.05, 0.05)
    // const angle = limitedMouseX * Math.PI
    const tiltAngle = (Math.PI * 23.4) / 180
    // const newX = Math.sin(angle) * baseRadius
    // const newZ = Math.cos(angle) * baseRadius
    // cameraRef.current.position.x = THREE.MathUtils.lerp(
    //   cameraRef.current.position.x,
    //   newX,
    //   0.01,
    // )
    // cameraRef.current.position.y = THREE.MathUtils.lerp(
    //   cameraRef.current.position.y,
    //   baseY,
    //   0.01,
    // )
    // cameraRef.current.position.z = THREE.MathUtils.lerp(
    //   cameraRef.current.position.z,
    //   newZ,
    //   0.01,
    // )
    const x = baseRadius * Math.cos(accumulatedDeltaRef.current)
    const z = baseRadius * Math.sin(accumulatedDeltaRef.current)

    cameraRef.current.position.set(x, baseY, z)
    cameraRef.current.lookAt(0, targetY, 0)
    cameraRef.current.rotation.z += tiltAngle
    cameraRef.current.updateProjectionMatrix()
  })

  return null
}
