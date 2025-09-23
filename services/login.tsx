import { useStore } from "@/hooks/store"
import api from "./network"
export async function login(email: string, password: string) {
    try {
        //no mandar cookies, solo el body
        const response = await api.post(
            `/api/login`,
            { email, password }
        )
        return response
    } catch (error) {

        console.error('Login failed:', error)
        throw new Error('Invalid credentials')

    }
}

export async function ping() {
    try {
        const response = await api.get(`/api/ping`,{
            headers: {
                Authorization: `Bearer ${useStore.getState().token}`,
            },  
        })
        return response
    } catch (error) {
        console.error('Ping failed:', error)
        throw new Error('Ping failed')
    }
}

export async function getUser() {
    try {
        const response = await api.get(`/api/profile`,{
            headers: {
                Authorization: `Bearer ${   useStore.getState().token}`,
            },  
        })
        return response
    } catch (error) {
        console.error('Get user failed:', error)
        throw new Error('Get user failed')
    }
}