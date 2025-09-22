import { User } from '@/interfaces/MessageInterface'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type Store = {
    token: string | null
    setToken: (token: string | null) => void
    user: User | null
    setUser: (user: User | null) => void
    isHydrated: boolean
}

// Usa persist middleware para auto-hidratación
const useStore = create<Store>()(
  persist(
    (set, get) => ({
      token: null,
      setToken: (token) => set({ token }),
      user: null,
      setUser: (user) => set({ user }),
      isHydrated: false, // Bandera para saber cuando se hidrató
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true
        }
      },
    }
  )
)

export { useStore }