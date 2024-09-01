import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Points, Point, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import GSAP from 'gsap'

interface GlobeGrid {
  radius?: number
  pointCount?: number
  orbitCount?: number
  pointColor?: THREE.Color
  pointOpacity?: number
  nodeColor?: THREE.Color
  nodeOpacity?: number
  orbitColor?: THREE.Color
  orbitOpacity?: number
  size?: number
  lineWidth?: number
  speed?: number
}

export const GlobeGrid: React.FC<GlobeGrid> = ({
  radius = 5,
  pointCount = 50,
  orbitCount = 3,
  pointColor = new THREE.Color(0.3, 0.3, 0.3),
  pointOpacity = 0.8,
  nodeColor = new THREE.Color(0.1, 0.1, 0.1),
  nodeOpacity = 0.8,
  orbitColor = new THREE.Color(0.25, 0.25, 0.25),
  orbitOpacity = 1,
  size = 0.25,
  lineWidth = 0.25,
  speed = 0.004,
}) => {
  const UPDATE_INTERVAL = 5

  const pointsRef = useRef<THREE.Points>(null)
  const orbitRefs = useRef<THREE.Group[]>([])
  const [frame, setFrame] = useState(0)
  const [connections, setConnections] = useState<
    [THREE.Vector3, THREE.Vector3][]
  >([])

  const { initialPositions, pointVelocities, orbits } = useMemo(() => {
    const initialPositions: THREE.Vector3[] = []
    const pointVelocities: THREE.Vector3[] = []

    const orbitRadius = radius + 3
    for (let i = 0; i < pointCount; i++) {
      const phi = Math.random() * Math.PI * 2
      const theta = Math.random() * Math.PI * 2

      const position = new THREE.Vector3(
        orbitRadius * Math.cos(phi) * Math.sin(theta),
        orbitRadius * Math.sin(phi) * Math.cos(theta),
        orbitRadius * Math.cos(phi),
      )

      initialPositions.push(position)

      //この段階でのvelocity => 接線方向の単位ベクトル
      const velocity = new THREE.Vector3().crossVectors(
        position,
        new THREE.Vector3(0, 1, 0).normalize(),
      )

      //速度を定義
      velocity.multiplyScalar(speed + Math.random() * speed)

      pointVelocities.push(velocity)
    }

    const orbits: THREE.Vector3[][] = []
    for (let i = 0; i < orbitCount; i++) {
      const orbitRadius = radius + 7
      const segments = 64
      const orbitPoints: THREE.Vector3[] = []

      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2
        const point = new THREE.Vector3(
          orbitRadius * Math.cos(theta),
          0,
          orbitRadius * Math.sin(theta),
        )
        orbitPoints.push(point)
      }

      orbits.push(orbitPoints)
    }

    return { initialPositions, pointVelocities, orbits }
  }, [pointCount, orbitCount, radius])

  const updateConnections = (positions: THREE.Vector3[]) => {
    const maxConnectionDistance = radius * 0.6
    const newConnections: [THREE.Vector3, THREE.Vector3][] = []

    for (let i = 0; i < positions.length; i++) {
      const point = positions[i]
      const potentialConnections: [THREE.Vector3, number][] = []

      for (let j = i + 1; j < positions.length; j++) {
        const otherPoint = positions[j]
        const distance = point.distanceTo(otherPoint)
        const angle = point.angleTo(otherPoint)

        if (distance < maxConnectionDistance && angle < Math.PI / 3) {
          potentialConnections.push([otherPoint, distance])
        }
      }

      potentialConnections.sort((a, b) => a[1] - b[1])

      potentialConnections.slice(0, 3).forEach(([otherPoint]) => {
        newConnections.push([point, otherPoint])
      })
    }

    return newConnections
  }

  useEffect(() => {
    if (pointsRef.current) {
      const initialConnections = updateConnections(initialPositions)
      setConnections(initialConnections)
    }
  }, [])

  useFrame((state) => {
    const { clock } = state
    const time = clock.getElapsedTime()

    if (pointsRef.current) {
      pointsRef.current.children.forEach((child, i) => {
        const point = child as THREE.Mesh

        const velocity = pointVelocities[i]

        const normalizedPosition = point.position.clone().normalize()
        const radialComponent = normalizedPosition.multiplyScalar(
          velocity.dot(normalizedPosition),
        )

        velocity.sub(radialComponent)

        point.position.add(velocity)

        if (Math.random() < 0.01) {
          const randomVelocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
          )

          velocity.add(randomVelocity)
        }

        velocity
          .crossVectors(point.position, velocity.cross(point.position))
          .normalize()

        velocity.multiplyScalar(speed + Math.random() * speed)
      })

      setFrame((prevFrame) => {
        const newFrame = prevFrame + 1
        if (newFrame % UPDATE_INTERVAL === 0) {
          const newPositions = pointsRef.current!.children.map(
            (child) => (child as THREE.Mesh).position,
          )
          const newConnections = updateConnections(newPositions)
          setConnections(newConnections)
        }
        return newFrame
      })
    }

    orbits.forEach((orbit, index) => {
      const orbitGroup = orbitRefs.current[index]
      if (!orbitGroup) return

      let position = time * speed * 10.0 + index * 0.25
      position = GSAP.utils.mapRange(0, 1, -1.0, 1.0, position % 1)

      const scale = Math.cos(Math.asin(position))

      orbitGroup.scale.set(scale, 1, scale)
      orbitGroup.position.y = position * (radius + 2.5)
    })
  })

  return (
    <group>
      <group>
        <Points ref={pointsRef}>
          {initialPositions.map((point, index) => (
            <React.Fragment key={index}>
              <Point position={point} color={pointColor} />
              <PointMaterial
                transparent={true}
                vertexColors={true}
                size={size}
                sizeAttenuation={true}
                opacity={pointOpacity}
              />
            </React.Fragment>
          ))}
        </Points>
      </group>

      {connections.map((connection, index) => (
        <Line
          key={index}
          points={connection}
          color={nodeColor}
          lineWidth={lineWidth}
          transparent={true}
          opacity={nodeOpacity}
        />
      ))}

      {orbits.map((orbit, index) => (
        <group
          key={index}
          ref={(el) => {
            if (el) {
              orbitRefs.current[index] = el
            }
          }}
        >
          <Line
            points={orbit}
            color={orbitColor}
            lineWidth={lineWidth}
            transparent={true}
            opacity={orbitOpacity}
          />
        </group>
      ))}
    </group>
  )
}
