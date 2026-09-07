/* oxlint-disable react/only-export-components */
import { createContext, useEffect, useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const UserContext = createContext(null)

export function UserProvider({ children }) {
  const isInit = useRef(false)
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginErrorMsg, setLoginErrorMsg] = useState('')
  const [isLogInError, setIsLoginError] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  async function me() {
    try {
      const result = await fetch(`${API_URL}/api/me`, {
        credentials: 'include',
      })

      if (result.ok) {
        const data = await result.json()
        setUser(data)
        setIsLoggedIn(true)
        return true
      } else {
        setUser(null)
        setIsLoggedIn(false)
        return false
      }
    } catch {
      setUser(null)
      setIsLoggedIn(false)
      return false
    } finally {
      setIsInitializing(false)
    }
  }

  async function login(email, password) {
    setIsLoginError(false)
    setLoginErrorMsg('')

    try {
      const result = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (result.ok) {
        return await me()
      }

      const data = await result.json()
      setUser(null)
      setIsLoggedIn(false)
      setIsLoginError(true)
      setLoginErrorMsg(data.message || 'Login failed')
      return false
    } catch {
      setUser(null)
      setIsLoggedIn(false)
      setIsLoginError(true)
      setLoginErrorMsg('Unable to reach the authentication server')
      return false
    }
  }

  async function logout() {
    try {
      const result = await fetch(`${API_URL}/api/auth/logout`, {
        credentials: 'include',
      })

      if (!result.ok) return false

      setUser(null)
      setIsLoggedIn(false)
      return true
    } catch {
      return false
    }
  }

  useEffect(() => {
    if (isInit.current) return
    isInit.current = true
    me()
  }, [])

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        isLoggedIn,
        isLogInError,
        loginErrorMsg,
        isInitializing,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
