"use client"

import { useEffect, useState } from "react"
import LoginPage from "@/components/login-page"
import ChatDashboard from "@/components/chat-dashboard"
import { useStore } from "@/hooks/store"
import { login, ping, getUser } from "@/services/login"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const { token, setToken, setUser, user, isHydrated } = useStore()

  useEffect(() => {
    if (!isHydrated) return // Esperar a que el store se hidrate

    const initializeAuth = async () => {
      try {
        if (token) {
          // Verificar si el token es válido
          await ping()
          
          // Si no tenemos user data pero sí token, obtener el usuario
          if (!user) {
            const userResponse = await getUser()
            if (userResponse.status === 200 && userResponse.data) {
              setUser(userResponse.data)
            } else {
              throw new Error('Invalid user data')
            }
          }
        }
      } catch (error) {
        console.error('Auth validation failed:', error)
        setToken(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [token, user, setToken, setUser, isHydrated])

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await login(email, password)
      if (response.status === 200 && response.data.access_token) {
        setToken(response.data.access_token)
        setUser(response.data.user)
      } else {
        alert("Login failed: Invalid response from server")
      }
    } catch (error: any) {
      alert("Login failed: " + error.message)
    }
  }

  const handleLogout = () => {
    setToken(null)
    setUser(null)
  }

  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const isLoggedIn = !!token && !!user

  return (
    <main className="min-h-screen">
      {isLoggedIn ? <ChatDashboard onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />}
    </main>
  )
}