export const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";
export type SimParams = { shape:string; velocity:number; rho:number; aoa_deg:number; npts:number; };
export type SimResponse = { cp:number[]; xc:number[]; yc:number[]; Cl:number; Gamma:number; chord:number; };
export async function postSimulate2D(params: SimParams): Promise<SimResponse> {
  const res = await fetch(`${API_BASE}/simulate2d`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(params) });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}
