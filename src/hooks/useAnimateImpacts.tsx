import { useRef, useCallback, useEffect } from 'react'
import { useSnapshot } from 'valtio'
import { phenomenonState } from '@/state/phenomenon'
import GSAP from 'gsap'

export const useAnimateImpacts = (materialRef: any) => {
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef(0)
  const intervalRef = useRef(3000)

  const { activePhenomenon } = useSnapshot(phenomenonState)

  const animateImpacts = useCallback(() => {
    phenomenonState.phenomenonImpacts[activePhenomenon].forEach(
      (impact, index) => {
        GSAP.set(impact, {
          impactRatio: 0,
        })

        GSAP.to(impact, {
          delay: index * 0.14,
          duration: 1.5,
          impactRatio: 1,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (materialRef.current) {
              materialRef.current.uniforms.impacts.value =
                phenomenonState.phenomenonImpacts[activePhenomenon]
              materialRef.current.needsUpdate = true
            }
          },
          onComplete: () => {},
        })
      },
    )
  }, [activePhenomenon])

  const animate = useCallback(
    (time: number) => {
      if (time - lastTimeRef.current >= intervalRef.current) {
        animateImpacts()
        lastTimeRef.current = time
      }
      rafRef.current = requestAnimationFrame(animate)
    },
    [animateImpacts],
  )

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      GSAP.killTweensOf(phenomenonState.phenomenonImpacts[activePhenomenon])
    }
  }, [animate, activePhenomenon])

  return null
}
