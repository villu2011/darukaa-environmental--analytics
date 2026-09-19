import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'

export default function Projects(){
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const load = async ()=>{
    setLoading(true)
    try{ const resp = await api.get('/projects/'); setProjects(resp.data) }catch(err){ console.error(err) }
    setLoading(false)
  }

  useEffect(()=>{ load() },[])

  const create = async (e)=>{
    e.preventDefault()
    try{ await api.post('/projects/', { name, description }); setName(''); setDescription(''); load() }catch(err){ alert('Failed to create') }
  }

  const del = async (id)=>{ if(!confirm('Delete project?')) return; await api.delete(`/projects/${id}/`); load() }

  return (
    <div className="container">
      <h2>Projects</h2>
      <div className="card">
        <h4>Create Project</h4>
        <form onSubmit={create}>
          <div className="form-row"><input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required /></div>
          <div className="form-row"><textarea placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} /></div>
          <button className="btn" type="submit">Create</button>
        </form>
      </div>

      <div className="card">
        <h4>All Projects</h4>
        {loading ? <div>Loading...</div> : (
          <div>
            {projects.map(p => (
              <div key={p.id} className="card" style={{marginBottom:8}}>
                <strong>{p.name}</strong>
                <div className="muted">{p.description}</div>
                <div style={{marginTop:8}}>
                  <Link to={`/projects/${p.id}`}>View</Link>
                  <button onClick={()=>del(p.id)} style={{marginLeft:8}} className="btn">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
