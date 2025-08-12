import numpy as np

def naca4_coords(code: str = "0012", n: int = 200, chord: float = 1.0):
    """
    Return a closed airfoil contour for a NACA 4-digit (e.g., '0012').
    Order: upper surface from LE->TE, then lower TE->LE, closed at LE.
    """
    assert len(code) == 4 and code.isdigit()
    m = int(code[0]) / 100.0      # max camber
    p = int(code[1]) / 10.0       # location of max camber
    t = int(code[2:]) / 100.0     # thickness

    # cosine spacing for better LE resolution
    beta = np.linspace(0, np.pi, n//2)
    x = (1 - np.cos(beta)) * (chord / 2)
    x = np.concatenate([x, x[::-1][1:-1]])  # go forth and back (upper then lower)
    x /= chord

    yt = 5 * t * (0.2969*np.sqrt(x) - 0.1260*x - 0.3516*x**2
                  + 0.2843*x**3 - 0.1015*x**4)

    if p == 0:
        yc = np.zeros_like(x)
        dyc = np.zeros_like(x)
    else:
        yc = np.where(x < p,
                      m/p**2*(2*p*x - x**2),
                      m/(1-p)**2 * ((1 - 2*p) + 2*p*x - x**2))
        dyc = np.where(x < p,
                       2*m/p**2*(p - x),
                       2*m/(1-p)**2*(p - x))
    theta = np.arctan(dyc)
    xu = x - yt*np.sin(theta)
    yu = yc + yt*np.cos(theta)
    xl = x + yt*np.sin(theta)
    yl = yc - yt*np.cos(theta)

    # Build closed contour: upper (LE->TE), lower (TE->LE), close at LE
    xs = np.concatenate([xu[:n//2], xl[n//2-1:][:-1]])
    ys = np.concatenate([yu[:n//2], yl[n//2-1:][:-1]])

    # ensure closed by appending the first point
    xs = np.append(xs, xs[0])
    ys = np.append(ys, ys[0])
    return xs, ys

def close_polygon(x, y):
    if x[0] != x[-1] or y[0] != y[-1]:
        x = np.append(x, x[0])
        y = np.append(y, y[0])
    return x, y

def build_panels(x, y):
    """
    Given a closed polygon (x,y), return panel midpoints, tangents, normals, lengths.
    Panels go from i -> i+1. Normal points outward (right-hand rule).
    """
    x = np.asarray(x); y = np.asarray(y)
    assert len(x) == len(y) and len(x) >= 3
    # panels
    x0, y0 = x[:-1], y[:-1]
    x1, y1 = x[1:], y[1:]
    dx, dy = x1 - x0, y1 - y0
    s = np.hypot(dx, dy)
    # unit tangents and outward normals (rotate tangent by -90°)
    tx, ty = dx/s, dy/s
    nx, ny = -ty, tx
    # control points (midpoints)
    xc, yc = (x0 + x1)/2, (y0 + y1)/2
    return dict(x0=x0, y0=y0, x1=x1, y1=y1, dx=dx, dy=dy, s=s,
                tx=tx, ty=ty, nx=nx, ny=ny, xc=xc, yc=yc)
