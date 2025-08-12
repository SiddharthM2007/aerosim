from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from server.physics.panel2d.solver import solve_airfoil_vortex_panels

app = FastAPI(title="AeroSim API", version="0.2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Sim2DReq(BaseModel):
    shape: str = Field("naca0012", description="'naca####' for now")
    velocity: float = 10.0
    rho: float = 1.225
    mu: float | None = None
    aoa_deg: float = 5.0
    npts: int = 300

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/simulate2d")
async def simulate2d(req: Sim2DReq):
    shape = req.shape.lower()
    if not (shape.startswith("naca") and len(shape) == 8 and shape[4:].isdigit()):
        return {"error": "Only NACA 4-digit like 'naca0012' supported for now."}

    result = solve_airfoil_vortex_panels(
        naca=shape[-4:], alpha_deg=req.aoa_deg, Vinf=req.velocity, rho=req.rho, npts=req.npts
    )
    # Pack only the fields the UI needs now
    return {
        "cp": result["cp"].tolist(),
        "xc": result["xc"].tolist(),
        "yc": result["yc"].tolist(),
        "Cl": float(result["Cl"]),
        "Gamma": float(result["Gamma"]),
        "chord": float(result["chord"])
    }

@app.post("/import3d")
async def import3d(file: UploadFile):
    # TODO: implement STL/OBJ/GLB parsing (Phase 4)
    return {"name": file.filename}
