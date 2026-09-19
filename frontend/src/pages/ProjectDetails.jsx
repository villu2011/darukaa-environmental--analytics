import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'

export default function ProjectDetails(){
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [sites, setSites] = useState([])

  useEffect(()=>{
    const load = async ()=>{
      try{
        const p = await api.get(`/projects/${id}/`)
        setProject(p.data)
        const s = await api.get(`/sites/?project=${id}`)
        setSites(s.data)
      }catch(err){ console.error(err) }
    }
    load()
  },[id])

  if(!project) return <div className="container">Loading...</div>

  return (
    <div className="container">
      <h2>{project.name}</h2>
      <div className="muted">{project.description}</div>
      <div className="card">
        <h4>Sites ({sites.length})</h4>
        {sites.map(s=> (
          <div key={s.id} className="card" style={{marginBottom:8}}>
            <strong>{s.name}</strong>
            <div className="muted">Area: {s.area} | Carbon: {s.carbon_score}</div>
            <div><Link to={`/sites/${s.id}`}>View</Link></div>
          </div>
        ))}
      </div>
    </div>
  )
}
