import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'

/**
 * Encapsulates login logic for the LoginPage.
 * Returns a submit handler ready to pass to React Hook Form's handleSubmit().
 */
export function useLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = (username: string, password: string) => {
    const result = login(username, password)
    if (result.success) {
      navigate('/dashboard', { replace: true })
    }
    return result
  }

  return { handleLogin }
}
