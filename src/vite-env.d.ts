/// <reference types="vite/client" />

declare module '*.jsx' {
  import * as React from 'react'
  const Component: React.ComponentType<any>
  export default Component
}
