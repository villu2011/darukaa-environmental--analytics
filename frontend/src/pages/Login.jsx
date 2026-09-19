import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login(){
  const [username,setUsername]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState(null)
  const { login } = useAuth()
  const nav = useNavigate()

  const submit = async (e) =>{
    e.preventDefault(); setError(null)
    try{
      await login(username,password)
      nav('/dashboard')
    }catch(err){
      setError('Login failed - check credentials')
    }
  }

  return (
    <div className="container">
      <div className="card" style={{maxWidth:400,margin:'0 auto'}}>
        <h3>Login</h3>
        {error && <div className="muted">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-row"><label>Username</label><input value={username} onChange={e=>setUsername(e.target.value)} required /></div>
          <div className="form-row"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
          <button className="btn" type="submit">Login</button>
        </form>
      </div>
    </div>
  )
}
