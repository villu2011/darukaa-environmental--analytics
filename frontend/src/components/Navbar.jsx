import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar(){
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const doLogout = () => { logout(); nav('/login') }
  return (
    <header className="navbar">
      <div className="nav-inner">
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:36,height:36,borderRadius:6,background:'#fff',color:'#0f1724',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>D</div>
          <strong>Darukaa</strong>
        </div>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/map">Map</Link>
          {user ? (
            <>
              <span style={{marginLeft:12,color:'#fff'}}> Hi, {user.username}</span>
              <button onClick={doLogout} style={{marginLeft:12}} className="btn btn-primary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
