import { useContext } from 'react'
import AuthContext from '@/app/providers/AuthProvider'

/**
 * Typed hook to consume the AuthContext.
 * Import this in any component or feature hook instead of calling
 * useContext(AuthContext) directly.
 *
 * @throws {Error} If used outside of <AuthProvider>
 */
export { useAuth } from '@/app/providers/AuthProvider'
