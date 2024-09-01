import { Canvas } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import { Loader } from '@/components/Loader'

import { Experience } from '@/components/Experience'
import { Sns } from '@/components/Sns'
import { MenuButton } from '@/components/MenuButton'
import { useControls, Leva } from 'leva'
import { Suspense, useRef } from 'react'

import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()

const App = () => {
  return (
    <>
      <Leva collapsed />
      <MenuButton />
      <Sns />
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<Loader />}>
          <Experience />
        </Suspense>
      </QueryClientProvider>
    </>
  )
}

export default App
