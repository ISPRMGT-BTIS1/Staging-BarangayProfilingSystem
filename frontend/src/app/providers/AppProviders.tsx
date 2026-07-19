import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './AuthProvider'
import { QueryProvider } from './QueryProvider'

/**
 * Composes all global application providers in the correct order.
 *
 * Provider order (outermost → innermost):
 *   BrowserRouter  — routing context (must wrap everything that uses navigation)
 *   AuthProvider   — authentication state
 *   QueryProvider  — TanStack Query client (can use auth state in query functions)
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryProvider>{children}</QueryProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
