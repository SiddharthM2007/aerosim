import numpy as np
from .geometry import naca4_coords, close_polygon, build_panels

def _biot_savart(px, py, qx, qy, gamma, eps2=1e-10):
    """
    Velocity at points P=(px,py) induced by point vortices at Q=(qx,qy)
    with circulations 'gamma'. Returns u, v arrays at P.
    """
    rx = px[:, None] - qx[None, :]
    ry = py[:, None] - qy[None, :]
    r2 = rx*rx + ry*ry + eps2
    coef = gamma[None, :] / (2*np.pi*r2)
    u = -np.sum(coef * ry, axis=1)
    v =  np.sum(coef * rx, axis=1)
    return u, v

def solve_airfoil_vortex_panels(naca="0012", alpha_deg=5.0, Vinf=1.0, rho=1.225, npts=300):
    """
    Discrete vortex panel method (point vortices at panel midpoints).
    No-through-flow at control points + Kutta condition (gamma_1 == gamma_N).
    Returns Cp at control points, Cl, circulation, and geometry.
    """
    x, y = naca4_coords(naca, n=npts)
    x, y = close_polygon(x, y)
    P = build_panels(x, y)

    N = len(P["s"])  # number of panels
    xc, yc = P["xc"], P["yc"]
    nx, ny = P["nx"], P["ny"]
    tx, ty = P["tx"], P["ty"]

    alpha = np.deg2rad(alpha_deg)
    U_inf = np.array([Vinf*np.cos(alpha), Vinf*np.sin(alpha)])

    # Influence matrix for normal velocity at control points
    # Unknowns are circulations (point vortices) placed at panel midpoints.
    qx, qy = xc.copy(), yc.copy()

    A = np.zeros((N+1, N))
    b = np.zeros(N+1)

    # Normal components
    # For each control point i, velocity due to unit-circulation at j
    # We'll compute via biot-savart with unit gammas (basis vectors)
    for j in range(N):
        unit_gamma = np.zeros(N); unit_gamma[j] = 1.0
        u, v = _biot_savart(xc, yc, qx, qy, unit_gamma)
        vn = u*nx + v*ny
        A[:N, j] = vn

    # RHS: cancel freestream normal component
    b[:N] = - (U_inf[0]*nx + U_inf[1]*ny)

    # Kutta condition: gamma_0 - gamma_{N-1} = 0  (no singularity at TE)
    A[N, 0] = 1.0
    A[N, -1] = -1.0
    b[N] = 0.0

    gamma = np.linalg.lstsq(A, b, rcond=None)[0]     # (N,)

    # Tangential velocity on surface (normal is zero by BC)
    u, v = _biot_savart(xc, yc, qx, qy, gamma)
    vt = u*tx + v*ty + (U_inf[0]*tx + U_inf[1]*ty)
    Cp = 1.0 - (vt / Vinf)**2

    # Total circulation and lift (per unit span)
    Gamma = np.sum(gamma)
    Lp = rho * Vinf * Gamma
    q_inf = 0.5 * rho * Vinf**2
    # Approximated chord = x extent
    chord = float(np.max(x) - np.min(x))
    Cl = Lp / (q_inf * chord)

    return {
        "cp": Cp,
        "xc": xc,
        "yc": yc,
        "tx": tx,
        "ty": ty,
        "nx": nx,
        "ny": ny,
        "gamma": gamma,
        "Gamma": Gamma,
        "Cl": Cl,
        "chord": chord
    }

