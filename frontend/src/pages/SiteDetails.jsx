import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

export default function SiteDetails(){
  const { id } = useParams()
  const [site, setSite] = useState(null)

  useEffect(()=>{
    const load = async ()=>{
      try{ const r = await api.get(`/sites/${id}/`); setSite(r.data) }catch(err){ console.error(err) }
    }
    load()
  },[id])

  if(!site) return <div className="container">Loading...</div>

  return (
    <div className="container">
      <h2>{site.name}</h2>
      <div className="muted">Project ID: {site.project}</div>
      <div className="card">
        <p>{site.description}</p>
        <p>Area: {site.area}</p>
        <p>Carbon Score: {site.carbon_score}</p>
        <p>Biodiversity Score: {site.biodiversity_score}</p>
      </div>
    </div>
  )
}
