import { Line, Points, Point, PointMaterial } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

interface GlobeGrid {
  radius?: number
  pointCount?: number
  nodeCount?: number
  orbitCount?: number
  pointColor?: THREE.Color
  pointOpacity?: number
  nodeColor?: THREE.Color
  nodeOpacity?: number
  orbitColor?: THREE.Color
  orbitOpacity?: number
  size?: number
  lineWidth?: number
}

export const GlobeGrid = ({
  radius = 5.5,
  pointCount = 64,
  nodeCount = 64,
  orbitCount = 3,
  nodeColor = new THREE.Color(0.3, 0.3, 0.3),
  nodeOpacity = 0.8,
  pointColor = new THREE.Color(0.3, 0.3, 0.3),
  pointOpacity = 0.8,
  orbitColor = new THREE.Color(0, 0, 1),
  orbitOpacity = 1,
  size = 0.25,
  lineWidth = 0.25,
}: GlobeGrid) => {
  const orbitRefs = useRef<THREE.Line[]>([])

  const { points, connections, nodes, orbits } = useMemo(() => {
    const connections: THREE.Vector3[][] = []
    const points: THREE.Vector3[] = []
    const nodes: THREE.Vector3[] = []
    const orbits: THREE.Vector3[][] = []
    for (let i = 0; i < pointCount; i++) {
      const phi = Math.random() * Math.PI * 2
      const theta = Math.random() * Math.PI * 2

      points.push(
        new THREE.Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi),
        ),
      )
    }

    for (let i = 0; i < nodeCount; i++) {
      const phi = 2 * Math.acos(-1 + Math.random() * 2) //方位角 0 ～ 2π
      const theta = Math.random() * Math.PI //仰角 0 ～ π
      nodes.push(
        new THREE.Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi),
        ),
      )
    }

    const maxConnectionDistance = radius * 0.5

    for (let i = 0; i < points.length; i++) {
      const nearPoints = points.filter((point, index) => {
        if (index === i) return false

        const distance = points[i].distanceTo(point)
        const angle = points[i].angleTo(point)

        return distance < maxConnectionDistance && angle < Math.PI / 3
      })

      //point can only connect to 3 other points
      nearPoints.slice(0, 3).forEach((point) => {
        connections.push([points[i], point])
      })
    }

    for (let i = 0; i < orbitCount; i++) {
      const orbitRadius = radius + 0.5 + Math.random() * 0.5
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
    return { points, connections, nodes, orbits }
  }, [pointCount, nodeCount, orbitCount, radius])

  useFrame((state) => {
    const { clock } = state

    orbits.forEach((orbit, index) => {
      const orbitLine = orbitRefs.current[index]
      if (!orbitLine) return

      // if (index === 0) {
      //   console.log('Before update:', orbit[0])
      // }

      const time = clock.getElapsedTime()

      const position =
        Math.sin(time * 0.5 + (index * Math.PI) / orbitCount) * 0.5
      const scale = Math.cos(Math.asin(position))

      orbit.forEach((point, pointIndex) => {
        const theta = (pointIndex / orbit.length) * Math.PI * 2
        point.x = Math.cos(theta) * scale * radius
        point.y = position * radius
        point.z = Math.sin(theta) * scale * radius
      })

      // if (index === 0) {
      //   console.log('After update, before setFromPoints:', orbit[0])
      // }

      orbitLine.geometry.setFromPoints(orbit)

      // if (index === 0) {
      //   console.log(
      //     'After setFromPoints:',
      //     orbitLine.geometry.attributes.position,
      //   )
      // }

      orbitLine.geometry.computeBoundingSphere()
    })
  })

  return (
    <group>
      <Points>
        <PointMaterial
          transparent={true}
          color={pointColor}
          size={size}
          opacity={pointOpacity}
        />
        {points.map((point, index) => {
          return <Point key={index} position={point} />
        })}
      </Points>

      {connections.map((connection, index) => {
        return (
          <Line
            key={index}
            points={connection}
            color={nodeColor}
            lineWidth={lineWidth}
            opacity={nodeOpacity}
          />
        )
      })}

      {orbits.map((orbit, index) => (
        <Line
          key={index}
          points={orbit}
          color={orbitColor}
          lineWidth={lineWidth}
          opacity={orbitOpacity}
          ref={(el) => {
            if (el) {
              orbitRefs.current[index] = el as unknown as THREE.Line
            }
          }}
        />
      ))}
    </group>
  )
}
