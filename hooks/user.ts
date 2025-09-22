import { create } from 'zustand'

import {User} from "@/interfaces/MessageInterface";

type Store = {
  user: User | null
  setUser: (user: User | null) => void
}


const useUserStore = create<Store>((set) => ({
  user: null,
  setUser: (user) =>{ 
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
}))

const getUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  }
  return null
}

export{
    useUserStore,
    getUser
}
