import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function Dashboard(){
  const [projects, setProjects] = useState([])
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    const load = async ()=>{
      setLoading(true)
      setError(null)
      try{
        const [p,s] = await Promise.all([api.get('/projects/'), api.get('/sites/')])
        setProjects(p.data)
        setSites(s.data)
      }catch(err){ console.error(err); setError(err.response ? err.response.data : err.message) }
      setLoading(false)
    }
    load()
  },[])

  const totalProjects = projects.length
  const totalSites = sites.length
  const totalArea = sites.reduce((acc,s)=> acc + (s.area || 0), 0)
  const avgCarbon = sites.length ? (sites.reduce((a,b)=>a + (b.carbon_score || 0),0)/sites.length).toFixed(2) : '0.00'
  const avgBio = sites.length ? (sites.reduce((a,b)=>a + (b.biodiversity_score || 0),0)/sites.length).toFixed(2) : '0.00'

  const barData = {
    labels: sites.map(s=>s.name),
    datasets: [
      { label: 'Carbon Score', data: sites.map(s=>s.carbon_score || 0), backgroundColor: 'rgba(75,192,192,0.6)' },
      { label: 'Biodiversity Score', data: sites.map(s=>s.biodiversity_score || 0), backgroundColor: 'rgba(153,102,255,0.6)' }
    ]
  }

  return (
    <div className="container">
      <h2>Dashboard</h2>
      {error && <div className="alert alert-error">{typeof error === 'string' ? error : JSON.stringify(error)}</div>}
      <div className="grid">
        <div className="card"><h4>Total Projects</h4><div style={{fontSize:24}}>{loading ? '...' : totalProjects}</div></div>
        <div className="card"><h4>Total Sites</h4><div style={{fontSize:24}}>{loading ? '...' : totalSites}</div></div>
        <div className="card"><h4>Total Mapped Area (m²)</h4><div style={{fontSize:18}}>{loading ? '...' : totalArea.toFixed(2)}</div></div>
        <div className="card"><h4>Avg Carbon Score</h4><div style={{fontSize:24}}>{loading ? '...' : avgCarbon}</div></div>
        <div className="card"><h4>Avg Biodiversity</h4><div style={{fontSize:24}}>{loading ? '...' : avgBio}</div></div>
      </div>

      <div className="card">
        <h3>Site Scores</h3>
        {loading ? <div>Loading chart...</div> : (
          sites.length ? <Bar data={barData} /> : <div>No sites to display.</div>
        )}
      </div>

      <div className="card">
        <h3>Recent Sites</h3>
        {loading ? <div>Loading...</div> : (
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr><th style={{textAlign:'left'}}>Name</th><th>Project</th><th>Area (m²)</th><th>Carbon</th><th>Biodiversity</th></tr></thead>
            <tbody>
              {sites.slice(0,10).map(s=> (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.project_name || (projects.find(p=>p.id===s.project)?.name) || s.project}</td>
                  <td>{(s.area || 0).toFixed(2)}</td>
                  <td>{s.carbon_score ?? '-'}</td>
                  <td>{s.biodiversity_score ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
