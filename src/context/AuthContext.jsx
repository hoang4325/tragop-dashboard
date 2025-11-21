import React, { createContext, useContext, useEffect, useState, useMemo } from "react"
import { logoutApi } from "../api/identityApi"

const AuthContext = createContext(null)
const STORAGE_KEY = "installment_admin_auth"

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ token: null, user: null })
  const [bootstrapped, setBootstrapped] = useState(false)

  // Load storage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setAuth({
          token: parsed?.token ?? null,
          user: parsed?.user ?? null,
        })
      }
    } catch {
      setAuth({ token: null, user: null })
    } finally {
      setBootstrapped(true)
    }
  }, [])

  // Persist whenever changed (after first load)
  useEffect(() => {
    if (!bootstrapped) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
  }, [auth, bootstrapped])

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
      console.error("Logout API error (ignored):", err)
    } finally {
      setAuth({ token: null, user: null })
    }
  }

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      isAuthenticated: Boolean(auth.token),
      bootstrapped,
      login,
      logout,
    }),
    [auth, bootstrapped]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
