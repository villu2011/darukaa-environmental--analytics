import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import api from '../services/api'
import * as turf from '@turf/turf'
import { useNavigate } from 'react-router-dom'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

export default function MapPage(){
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const drawRef = useRef(null)
  const drawCreateHandlerRef = useRef(null)
  const [sites, setSites] = useState([])
  const [projects, setProjects] = useState([])
  const [drawing, setDrawing] = useState(false)
  const [feature, setFeature] = useState(null)
  const [form, setForm] = useState({ name:'', description:'', project:'', carbon_score:0, biodiversity_score:0 })
  const [message, setMessage] = useState(null)
  const nav = useNavigate()

  useEffect(()=>{
    if(!mapboxgl.accessToken){
      return
    }
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [77.5946, 12.9716],
      zoom: 10
    })

    mapRef.current = map

    const draw = new MapboxDraw({ displayControlsDefault: false, controls: { polygon: true, trash: true } })
    drawRef.current = draw
    map.addControl(draw)
    // attach draw.create handler to the map (use map not draw.map)
    const onCreate = (e)=>{
      const feat = e.features && e.features[0]
      if(!feat) return
      setFeature(feat)
      setForm(f=>({ ...f, carbon_score:0, biodiversity_score:0 }))
      setMessage(null)
      setDrawing(false)
    }
    drawCreateHandlerRef.current = onCreate
    map.on('draw.create', onCreate)
    map.addControl(new mapboxgl.NavigationControl())

    map.on('load', ()=>{ fetchSites(); fetchProjects(); })

    // click on features to show popup
    map.on('click', e => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['sites-fill'] })
      if(features && features.length){
        const f = features[0]
        const props = f.properties
        const id = props.site_id
        const html = `<strong>${props.name}</strong><div>Carbon: ${props.carbon}</div><div>Biodiversity: ${props.biodiversity}</div><button id=\"view-${id}\">View Details</button>`
        const popup = new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(map)

        // attach event after popup added
        setTimeout(()=>{
          const btn = document.getElementById(`view-${id}`)
          if(btn) btn.addEventListener('click', ()=>{ nav(`/sites/${id}`) })
        }, 100)
      }
    })

    return ()=>{
      if(map && drawCreateHandlerRef.current) map.off('draw.create', drawCreateHandlerRef.current)
      map.remove()
    }
  },[])

  const fetchSites = async ()=>{
    try{
      const resp = await api.get('/sites/')
      setSites(resp.data)
      renderSitesOnMap(resp.data)
    }catch(err){ console.error(err) }
  }

  const fetchProjects = async ()=>{
    try{ const r = await api.get('/projects/'); setProjects(r.data) }catch(err){ console.error(err) }
  }

  const renderSitesOnMap = (sitesList)=>{
    const map = mapRef.current
    if(!map) return
    // remove existing layer/source if present
    if(map.getLayer('sites-fill')){ map.removeLayer('sites-fill') }
    if(map.getSource('sites')){ map.removeSource('sites') }

    const features = sitesList.filter(s=>s.geojson && s.geojson.type && s.geojson.type === 'Polygon' || (s.geojson && s.geojson.type === 'Feature' && s.geojson.geometry && s.geojson.geometry.type==='Polygon')).map(s=>{
      const geom = s.geojson.type === 'Feature' ? s.geojson.geometry : s.geojson
      return {
        type: 'Feature',
        geometry: geom,
        properties: { name: s.name, carbon: s.carbon_score, biodiversity: s.biodiversity_score, site_id: s.id }
      }
    })

    if(features.length === 0) return

    map.addSource('sites', { type: 'geojson', data: { type:'FeatureCollection', features } })
    map.addLayer({ id: 'sites-fill', type: 'fill', source: 'sites', paint: { 'fill-color': '#088', 'fill-opacity': 0.4 } })
    map.addLayer({ id: 'sites-outline', type: 'line', source: 'sites', paint: { 'line-color': '#004' } })
  }

  const startDrawing = ()=>{
    const draw = drawRef.current
    if(!draw) return alert('Draw controls not ready')
    // enter polygon mode
    draw.changeMode('draw_polygon')
    setDrawing(true)
  }

  const clearDraw = ()=>{ const draw = drawRef.current; if(draw) draw.deleteAll(); setFeature(null); setDrawing(false) }

  const saveSite = async ()=>{
    setMessage(null)
    if(!feature){ setMessage({ type:'error', text:'Please draw a valid polygon.' }); return }
    const geom = feature.geometry
    if(!geom || geom.type !== 'Polygon' || !geom.coordinates || geom.coordinates.length === 0){ setMessage({ type:'error', text:'Please draw a valid polygon.' }); return }
    if(!form.name || form.name.trim() === ''){ setMessage({ type:'error', text:'Site name is required.' }); return }
    if(!form.project){ setMessage({ type:'error', text:'Project selection is required.' }); return }

    const carbon = parseFloat(form.carbon_score)
    const biod = parseFloat(form.biodiversity_score)
    if(!Number.isFinite(carbon) || carbon < 0 || carbon > 100){ setMessage({ type:'error', text:'Carbon score must be a number between 0 and 100.' }); return }
    if(!Number.isFinite(biod) || biod < 0 || biod > 100){ setMessage({ type:'error', text:'Biodiversity score must be a number between 0 and 100.' }); return }

    // calculate area in square meters using turf
    let areaVal = 0
    try{
      // turf.area accepts a Feature or Geometry
      areaVal = turf.area(feature)
    }catch(e){ areaVal = 0 }

    const payload = {
      project: parseInt(form.project),
      name: form.name,
      description: form.description,
      geojson: geom,
      area: areaVal,
      carbon_score: carbon,
      biodiversity_score: biod
    }

    try{
      const resp = await api.post('/sites/', payload)
      setMessage({ type:'success', text:'Site saved successfully.' })
      // refresh saved sites layer, but keep the drawn polygon visible
      fetchSites()
    }catch(err){
      console.error(err)
      let text = 'Save failed.'
      if(err.response && err.response.data){
        try{ text = JSON.stringify(err.response.data) }catch(e){ text = String(err.response.data) }
      }else if(err.message) text = err.message
      setMessage({ type:'error', text })
    }
  }

  if(!import.meta.env.VITE_MAPBOX_TOKEN){
    return <div className="container"><div className="card">Mapbox token is not configured.</div></div>
  }

  return (
    <div className="container">
      <h2>Map</h2>
      <div style={{display:'flex',gap:12}}>
        <div style={{flex:1}}>
          <div ref={mapContainer} style={{height:500}} />
        </div>
        <div style={{width:360}}>
          <div className="card" style={{display:'flex',gap:8,alignItems:'center'}}>
            <button className="btn btn-primary" onClick={startDrawing}>Draw Site</button>
            <button className="btn btn-secondary" onClick={clearDraw}>Clear</button>
          </div>

          {feature && (
            <div className="card">
              <h3>Save Site</h3>
                {message && (
                  <div className={message.type === 'success' ? 'alert alert-success' : 'alert alert-error'}>{message.text}</div>
                )}
                <div className="form-row"><label>Site Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
              <div className="form-row"><label>Project</label>
                <select value={form.project} onChange={e=>setForm({...form,project:e.target.value})}>
                  <option value="">Select project</option>
                  {projects.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-row"><label>Description</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
              <div className="form-row"><label>Carbon Score</label><input type="number" value={form.carbon_score} onChange={e=>setForm({...form,carbon_score:e.target.value})} /></div>
              <div className="form-row"><label>Biodiversity Score</label><input type="number" value={form.biodiversity_score} onChange={e=>setForm({...form,biodiversity_score:e.target.value})} /></div>
              <div style={{marginTop:8}}>
                <button className="btn btn-primary" onClick={saveSite}>Save Site</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
