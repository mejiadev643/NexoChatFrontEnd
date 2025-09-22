import { useEffect, useState } from 'react'
import { useStore } from '@/hooks/store'
import { initializeEcho } from '@/lib/echo'

export const useEcho = () => {
  const [echo, setEcho] = useState<any>(null)
  const { token, user } = useStore()

  useEffect(() => {
    if (typeof window === 'undefined' || !token || !user) {
      console.log('⏳ useEcho: Esperando token o usuario')
      return
    }

    console.log('🔄 useEcho: Inicializando Echo...')
    const echoInstance = initializeEcho(token)
    
    if (echoInstance) {
      console.log('✅ useEcho: Echo inicializado correctamente')
      setEcho(echoInstance)
    } else {
      console.error('❌ useEcho: Error al inicializar Echo')
    }

    return () => {
      // No desconectar para mantener la conexión
    }
  }, [token, user])

  return echo
}