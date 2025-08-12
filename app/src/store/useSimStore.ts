import { create } from "zustand";
import { SimParams, SimResponse, postSimulate2D } from "../lib/api";
export type Status = "idle"|"loading"|"ready"|"error";
type SimState = { params:SimParams; data:SimResponse|null; status:Status; error:string|null; setParams:(p:Partial<SimParams>)=>void; simulate:()=>Promise<void>; };
const defaults: SimParams = { shape:"naca0012", velocity:10, rho:1.225, aoa_deg:5, npts:300 };
export const useSimStore = create<SimState>((set,get)=>({
  params: defaults, data:null, status:"idle", error:null,
  setParams:(p)=>set({ params:{ ...get().params, ...p } }),
  simulate: async () => {
    const { params } = get(); set({ status:"loading", error:null });
    try { const data = await postSimulate2D(params); set({ data, status:"ready" }); }
    catch(e:any){ set({ status:"error", error:e?.message??String(e) }); }
  }
}));
