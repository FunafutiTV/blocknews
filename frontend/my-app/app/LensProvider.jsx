'use client'
import { LensConfig, development } from '@lens-protocol/react-web'
import { bindings as wagmiBindings } from '@lens-protocol/wagmi'
import { LensProvider as Provider } from '@lens-protocol/react-web'

const lensConfig = {
  bindings: wagmiBindings(),
  environment: development,
}

export function LensProvider({ children }) {
  return (
    <Provider config={lensConfig}>
      { children }
    </Provider>
  )
}