import { useEffect, useState } from "react";

type SimResponse = {
  cp: number[]; xc: number[]; yc: number[]; Cl: number; Gamma: number; chord: number;
};

export default function App() {
  const [data, setData] = useState<SimResponse | null>(null);
  const [status, setStatus] = useState<"idle"|"loading"|"ready"|"error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const go = async () => {
      setStatus("loading"); setError(null);

      const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:8000";
      const url = `${API_BASE}/simulate2d`;
      console.log("POST", url);

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shape: "naca0012",
            velocity: 10,
            rho: 1.225,
            aoa_deg: 5,
            npts: 200
          })
        });

        console.log("status", res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        const json = await res.json();
        console.log("simulate2d OK", json);
        setData(json);
        setStatus("ready");
      } catch (e: any) {
        console.error("simulate2d FAIL", e);
        setError(e?.message ?? String(e));
        setStatus("error");
      }
    };
    go();
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" }}>
      <h1>AeroSim — Minimal Probe</h1>
      <div>Status: <b>{status}</b></div>
      <div>API: <code>{(import.meta as any).env?.VITE_API_BASE ?? "http://localhost:8000"}</code></div>
      {error && <pre style={{ color: "#c00", whiteSpace: "pre-wrap" }}>{error}</pre>}
      {data && (
        <>
          <div>Cl: <b>{data.Cl.toFixed(3)}</b> &nbsp; | &nbsp; Gamma: <b>{data.Gamma.toFixed(4)}</b></div>
          <pre style={{ background:"#111", color:"#eee", padding:12, borderRadius:8, overflowX:"auto", maxHeight: 300 }}>
{JSON.stringify({ cp: data.cp.slice(0, 10), xc: data.xc.slice(0, 10), yc: data.yc.slice(0, 10) }, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}




