import { useState, useEffect } from "react";
import { useSimStore } from "../store/useSimStore";
function useDebounced<T>(value:T, delay=250){ const [v,setV]=useState(value); useEffect(()=>{ const id=setTimeout(()=>setV(value),delay); return ()=>clearTimeout(id);},[value,delay]); return v; }
export default function Controls(){
  const { params, setParams, simulate, status } = useSimStore();
  const [aoa,setAoA]=useState(params.aoa_deg); const [vel,setVel]=useState(params.velocity);
  const [rho,setRho]=useState(params.rho); const [npts,setNpts]=useState(params.npts);
  const dAoA=useDebounced(aoa), dVel=useDebounced(vel), dRho=useDebounced(rho), dNpts=useDebounced(npts);
  useEffect(()=>{ setParams({ aoa_deg:dAoA, velocity:dVel, rho:dRho, npts:dNpts }); if(status!=="loading") simulate(); },[dAoA,dVel,dRho,dNpts]);
  return (<div className="controls">
    <div className="section"><label>Airfoil</label>
      <select value={params.shape} onChange={e=>setParams({shape:e.target.value})}>
        <option value="naca0012">NACA 0012</option><option value="naca2412">NACA 2412</option><option value="naca4412">NACA 4412</option>
      </select>
    </div>
    <div className="section"><label>Angle of attack (°)</label>
      <input type="range" min={-10} max={15} step={0.5} value={aoa} onChange={e=>setAoA(parseFloat(e.target.value))}/>
      <div className="value">{aoa.toFixed(1)}°</div>
    </div>
    <div className="grid2">
      <div className="section"><label>Velocity (m/s)</label>
        <input type="number" value={vel} min={0.1} step={0.5} onChange={e=>setVel(parseFloat(e.target.value))}/></div>
      <div className="section"><label>Density ρ (kg/m³)</label>
        <input type="number" value={rho} step={0.01} onChange={e=>setRho(parseFloat(e.target.value))}/></div>
    </div>
    <div className="section"><label>Resolution (points)</label>
      <input type="range" min={120} max={600} step={20} value={npts} onChange={e=>setNpts(parseInt(e.target.value))}/>
      <div className="value">{npts}</div>
    </div>
    <button className="primary" onClick={()=>simulate()}>Run</button>
  </div>);
}
