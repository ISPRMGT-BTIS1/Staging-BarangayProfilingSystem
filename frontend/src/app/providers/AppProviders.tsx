import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './AuthProvider'
import { QueryProvider } from './QueryProvider'
import { DataProvider } from '../../context/DataContext'

/**
 * Composes all global application providers in the correct order.
 *
 * Provider order (outermost → innermost):
 *   BrowserRouter  — routing context (must wrap everything that uses navigation)
 *   AuthProvider   — authentication state
 *   QueryProvider  — TanStack Query client (can use auth state in query functions)
 *   DataProvider   — global legacy context for dashboard/residents/etc
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <QueryProvider>{children}</QueryProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
