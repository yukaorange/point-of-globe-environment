import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

import { useSnapshot } from 'valtio'
import { phenomenonState, Impact } from '@/state/phenomenon'

import globeVertexShader from '@/shaders/globe-vertex.glsl'
import globeFragmentShader from '@/shaders/globe-fragment.glsl'

import GSAP from 'gsap'

const generateGlobePoints = (
  imageData: ImageData,
  sizes: { width: number; height: number },
) => {
  const geoms: THREE.BufferGeometry[] = []
  const dummyObject = new THREE.Object3D()
  const p = new THREE.Vector3()

  for (let y = 0; y < sizes.height; y++) {
    for (let x = 0; x < sizes.width; x++) {
      const idx = (sizes.width * y + x) * 4 + 2

      const d = imageData.data[idx]

      p.setFromSphericalCoords(
        5,
        THREE.MathUtils.degToRad(y),
        THREE.MathUtils.degToRad(x),
      )

      dummyObject.lookAt(p)
      dummyObject.updateMatrix()

      const maxSize = 0.04
      const minSize = 0.015
      const gSize = d > 128 ? minSize : maxSize

      const g = new THREE.PlaneGeometry(gSize, gSize)
      g.applyMatrix4(dummyObject.matrix)
      g.translate(p.x, p.y, p.z)

      const centers = new Float32Array([
        p.x,
        p.y,
        p.z,
        p.x,
        p.y,
        p.z,
        p.x,
        p.y,
        p.z,
        p.x,
        p.y,
        p.z,
      ])

      g.setAttribute('center', new THREE.BufferAttribute(centers, 3))

      const scale = d > 128 ? maxSize / minSize : 1

      const scales = new Float32Array([scale, scale, scale, scale])

      g.setAttribute('scale', new THREE.BufferAttribute(scales, 1))

      geoms.push(g)
    }
  }
  const margedGeometry = BufferGeometryUtils.mergeGeometries(geoms)

  return margedGeometry
}

const createInitialImpactUniform = (): Impact => {
  return {
    impactPosition: new THREE.Vector3(),
    impactMaxRadius: 0,
    impactRatio: 0,
  }
}

const createInitialImpactUniforms = (count: number): Impact[] => {
  return Array.from({ length: count }, () => createInitialImpactUniform())
}

const createMaterial = () => {
  const impactCount = 10

  const material = new THREE.ShaderMaterial({
    uniforms: {
      impacts: { value: createInitialImpactUniforms(impactCount) },
      phenomenonColor: { value: new THREE.Color(0.8, 0.1, 0.1) },
      diffuse: { value: new THREE.Color(20 / 255, 23 / 255, 32 / 255) },
    },
    vertexShader: globeVertexShader,
    fragmentShader: globeFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
  })

  return material
}

const generateImpact = (
  phenomenon: 'earthquake' | 'volcano' | 'hurricane',
): Impact => {
  const impact: Impact = {
    impactPosition: new THREE.Vector3(),
    impactMaxRadius: 0,
    impactRatio: 0,
  }

  impact.impactPosition.setFromSphericalCoords(
    5,
    Math.PI * Math.random(),
    Math.PI * 2 * Math.random(),
  )

  impact.impactMaxRadius = 5 * THREE.MathUtils.randFloat(0.5, 1)

  return impact
}

export const Globe = () => {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)

  const { activePhenomenon } = useSnapshot(phenomenonState)

  useEffect(() => {
    const img = new Image()

    img.onload = () => {
      const canvas = document.createElement('canvas')

      canvas.width = 360
      canvas.height = 181
      const sizes = {
        width: canvas.width,
        height: canvas.height,
      }

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, 14)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const globeGeometry = generateGlobePoints(imageData, sizes)

        setGeometry(globeGeometry)
      }
    }

    img.src = 'textures/map.jpg'
  }, [])

  const material = useMemo(() => {
    return createMaterial()
  }, [])

  useEffect(() => {
    const maxImpacts = 10
    let impacts = createInitialImpactUniforms(maxImpacts)

    const createManagedImpact = () => {
      const newImpact = generateImpact(activePhenomenon)

      const emptySlotIndex = impacts.findIndex(
        (impact) => impact.impactRatio === 0,
      )

      if (emptySlotIndex !== -1) {
        impacts[emptySlotIndex] = newImpact
      } else {
        impacts = [...impacts.slice(1), newImpact]
      }

      if (materialRef.current) {
        materialRef.current.uniforms.impacts.value = impacts
      }

      GSAP.to(newImpact, {
        impactRatio: 1,
        duration: THREE.MathUtils.randFloat(1.5, 2.5),
        ease: 'power2.inOut',
        onUpdate: () => {
          if (materialRef.current) {
            materialRef.current.uniforms.impacts.value = impacts
          }
        },
        onComplete: () => {
          const index = impacts.indexOf(newImpact)
          if (index > -1) {
            impacts[index] = createInitialImpactUniform()
          }
          if (materialRef.current) {
            materialRef.current.uniforms.impacts.value = impacts
          }
        },
      })
    }

    const interval = setInterval(createManagedImpact, 2000)

    return () => {
      clearInterval(interval)
      impacts = []
    }
  }, [activePhenomenon])

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1
    }

    if (materialRef.current) {
      switch (activePhenomenon) {
        case 'earthquake':
          materialRef.current.uniforms.phenomenonColor.value.setRGB(
            0.8,
            0.1,
            0.1,
          )
          break
        case 'volcano':
          materialRef.current.uniforms.phenomenonColor.value.setRGB(1.0, 0.5, 0)
          break
        case 'hurricane':
          materialRef.current.uniforms.phenomenonColor.value.setRGB(0, 0.5, 0.8)
          break
      }
    }
  })

  if (!geometry) return null

  return (
    <>
      <mesh ref={meshRef} rotation={[0, Math.PI, 0]}>
        <primitive object={geometry} attach="geometry" />
        <primitive object={material} ref={materialRef} attach="material" />
      </mesh>
    </>
  )
}
