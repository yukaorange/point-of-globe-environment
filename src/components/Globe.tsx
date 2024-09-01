import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'

import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

import { useSnapshot, subscribe } from 'valtio'
import { phenomenonState, Impact } from '@/state/phenomenon'

import { useAnimateImpacts } from '@/hooks/useAnimateImpacts'

import globeVertexShader from '@/shaders/globe-vertex.glsl'
import globeFragmentShader from '@/shaders/globe-fragment.glsl'

import GSAP from 'gsap'

import { createInitialImpacts } from '@/functions/createInitialImpacts'

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

const createMaterial = () => {
  const impactCount = 10

  const material = new THREE.ShaderMaterial({
    uniforms: {
      impacts: { value: createInitialImpacts(impactCount) },
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

export const Globe = () => {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  //animate impacts
  useAnimateImpacts(materialRef)

  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)

  const { activePhenomenon, phenomenonImpacts } = useSnapshot(phenomenonState)

  const material = useMemo(() => {
    return createMaterial()
  }, [])

  useEffect(() => {
    // create image geometry
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

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const globeGeometry = generateGlobePoints(imageData, sizes)

        setGeometry(globeGeometry)
      }
    }
    img.src = 'textures/map.jpg'
  }, [])

  useFrame((state, delta) => {
    if (materialRef.current) {
      //color select
      switch (activePhenomenon) {
        case 'earthquakes':
          materialRef.current.uniforms.phenomenonColor.value.setRGB(
            56 / 255,
            67 / 255,
            74 / 255,
          )
          break
        case 'volcanoes':
          materialRef.current.uniforms.phenomenonColor.value.setRGB(
            255 / 255,
            90 / 255,
            6 / 255,
          )
          break
        case 'floods':
          materialRef.current.uniforms.phenomenonColor.value.setRGB(
            31 / 255,
            44 / 255,
            255 / 255,
          )
          break
        case 'wildfires':
          materialRef.current.uniforms.phenomenonColor.value.setRGB(
            250 / 255,
            110 / 255,
            0 / 255,
          )
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
