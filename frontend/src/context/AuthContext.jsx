import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('darukaa_user')
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    if(user) localStorage.setItem('darukaa_user', JSON.stringify(user))
    else localStorage.removeItem('darukaa_user')
  }, [user])

  const login = async (username, password) => {
    const resp = await api.post('/auth/login/', { username, password })
    const { access, refresh } = resp.data
    localStorage.setItem('darukaa_access', access)
    localStorage.setItem('darukaa_refresh', refresh)
    setUser({ username })
    return resp
  }

  const register = async (username, email, password) => {
    return api.post('/auth/register/', { username, email, password })
  }

  const logout = () => {
    localStorage.removeItem('darukaa_access')
    localStorage.removeItem('darukaa_refresh')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{user, login, logout, register}}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){ return useContext(AuthContext) }
