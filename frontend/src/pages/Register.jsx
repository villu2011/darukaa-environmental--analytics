import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register(){
  const [username,setUsername]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [confirm,setConfirm]=useState('')
  const [error,setError]=useState(null)
  const { register } = useAuth()
  const nav = useNavigate()

  const submit = async (e) =>{
    e.preventDefault(); setError(null)
    if(password !== confirm){ setError('Passwords do not match'); return }
    try{
      await register(username,email,password)
      nav('/login')
    }catch(err){ setError('Registration failed') }
  }

  return (
    <div className="container">
      <div className="card" style={{maxWidth:420,margin:'0 auto'}}>
        <h3>Register</h3>
        {error && <div className="muted">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-row"><label>Username</label><input value={username} onChange={e=>setUsername(e.target.value)} required /></div>
          <div className="form-row"><label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} required type="email" /></div>
          <div className="form-row"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
          <div className="form-row"><label>Confirm Password</label><input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required /></div>
          <button className="btn" type="submit">Register</button>
        </form>
      </div>
    </div>
  )
}
