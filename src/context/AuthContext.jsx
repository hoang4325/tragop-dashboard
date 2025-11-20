import React, { createContext, useContext, useEffect, useState } from 'react'
import { logoutApi } from '../api/identityApi'

const AuthContext = createContext(null)
const STORAGE_KEY = 'installment_admin_auth'

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return { token: null, user: null }
      return JSON.parse(raw)
    } catch {
      return { token: null, user: null }
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
  }, [auth])

  // Nhận token + user từ LoginResponse
  const login = (token, user) => {
    setAuth({ token, user })
  }

  const logout = async () => {
    const currentToken = auth.token
    try {
      if (currentToken) {
        await logoutApi(currentToken)
      }
    } catch (err) {
      console.error('Logout API error (ignored):', err)
    } finally {
      setAuth({ token: null, user: null })
    }
  }

  const value = {
    token: auth.token,
    user: auth.user,
    isAuthenticated: Boolean(auth.token),
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
