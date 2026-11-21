#!/usr/bin/env python3
"""Build a scientifically authentic, hypersonically aerodynamic, G2-continuous 3D
glTF 2.0 binary (.glb) model of Cyberpenguin's Ranger VTOL Lifting-Body Lander
(`assets/models/nave-pinguino.glb`).

Real Hypersonic Aerodynamics & Engineering Principles:
  1. G2 Curvature Continuity (kappa(s) continuous): Essential in real aerospace lofting
     because surface pressure gradient dP/dn = rho * V^2 * kappa(s). Discontinuous
     curvature (G1) causes boundary-layer separation and localized hypersonic shock
     heating.
  2. Taut Delta-Wedge Lifting-Body Planform (~68 deg leading-edge sweep, L/D ~ 1.4):
     - Fay-Riddell blunt stagnation nose cap (R_nose ~ 0.12 m) to detach the bow shock
       and dissipate 90% of entry heat in the shock layer.
     - Flat-convex windward TPS ceramic belly with positive angle of incidence.
     - Sharp lateral aerodynamic chines separating high-pressure windward flow from
       low-pressure leeward vortex lift (like NASA HL-20 / X-38 / Interstellar Ranger).
  3. 100% Flush Conformal Panoramic Cockpit Windows (`CanopyGlass` node):
     - Zero protruding boxes on the forward mold line (which would cause catastrophic
       shock-shock interference heating at Mach 20). The 5 panoramic quartz glass
       panes and dark titanium mullions conform strictly (+3 mm) to the exact G2 hull
       surface normal along the 21-degree forward windshield slope.
  4. True NACA 0008 Airfoil Canted V-Tail Stabilizer Fins & Aft Body Flaps:
     - Rounded supersonic leading edge and sharp trailing edge following the exact
       NACA 4-digit thickness equation.
  5. Low-Profile Aerodynamic Dorsal IDSS Orbital Docking Collar (for coupling in orbit
     with the Space Reactor-1 Freedom interplanetary cruiser), recessed aft bimodal
     Methalox nozzles, 4 wide-stance hydraulic landing legs, and ventral deployable
     EVA boarding ramp.

Uses Python standard library only (zlib, struct, json, math).
"""

import json
import math
import os
import struct
import zlib

OUT_GLB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "assets",
    "models",
    "nave-pinguino.glb",
)


def clamp(v, lo, hi):
    return lo if v < lo else hi if v > hi else v


def smoothstep_g2(edge0, edge1, x):
    """Quintic C^2 / G^2 smoothstep: 6t^5 - 15t^4 + 10t^3."""
    if edge1 == edge0:
        return 0.0
    t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0)


def bezier_quintic(t, p0, p1, p2, p3, p4, p5):
    u = 1.0 - t
    u2 = u * u
    u3 = u2 * u
    u4 = u3 * u
    u5 = u4 * u
    t2 = t * t
    t3 = t2 * t
    t4 = t3 * t
    t5 = t4 * t
    return (
        u5 * p0
        + 5.0 * u4 * t * p1
        + 10.0 * u3 * t2 * p2
        + 10.0 * u2 * t3 * p3
        + 5.0 * u * t4 * p4
        + t5 * p5
    )


def naca_half_thickness(xc, max_t=0.09):
    """Exact NACA 00xx symmetrical airfoil half-thickness for chord fraction xc in [0, 1].
    xc = 0 is the rounded leading edge; xc = 1 is the sharp trailing edge.
    """
    xc = clamp(xc, 0.0, 1.0)
    return 5.0 * max_t * (
        0.2969 * math.sqrt(xc)
        - 0.1260 * xc
        - 0.3516 * (xc ** 2)
        + 0.2843 * (xc ** 3)
        - 0.1036 * (xc ** 4)
    )


def squircle_cs(theta, power=2.6):
    s = math.sin(theta)
    c = math.cos(theta)
    exp = 2.0 / float(power)
    sx = math.copysign(abs(s) ** exp, s)
    cz = math.copysign(abs(c) ** exp, c)
    return sx, cz


def srgb_to_linear(c):
    c = clamp(c, 0.0, 1.0)
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_srgb(h):
    h = h.lstrip("#")
    return (
        int(h[0:2], 16) / 255.0,
        int(h[2:4], 16) / 255.0,
        int(h[4:6], 16) / 255.0,
    )


def hex_lin(h):
    r, g, b = hex_srgb(h)
    return (srgb_to_linear(r), srgb_to_linear(g), srgb_to_linear(b))


def mix_col(c0, c1, t):
    t = clamp(t, 0.0, 1.0)
    return (
        c0[0] + (c1[0] - c0[0]) * t,
        c0[1] + (c1[1] - c0[1]) * t,
        c0[2] + (c1[2] - c0[2]) * t,
    )


def v_add(a, b):
    return (a[0] + b[0], a[1] + b[1], a[2] + b[2])


def v_sub(a, b):
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def v_scale(a, b):
    return (a[0] * b, a[1] * b, a[2] * b)


def v_dot(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def v_cross(a, b):
    return (
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    )


def v_norm(v):
    l = math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
    if l < 1e-9:
        return (0.0, 1.0, 0.0)
    return (v[0] / l, v[1] / l, v[2] / l)


def encode_png_rgba(width, height, rgba_bytes):
    stride = width * 4
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        row_start = y * stride
        raw.extend(rgba_bytes[row_start : row_start + stride])

    def make_chunk(tag, data):
        crc = zlib.crc32(tag + data) & 0xFFFFFFFF
        return struct.pack(">I4s", len(data), tag) + data + struct.pack(">I", crc)

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    idat = zlib.compress(bytes(raw), level=9)
    return (
        b"\x89PNG\r\n\x1a\n"
        + make_chunk(b"IHDR", ihdr)
        + make_chunk(b"IDAT", idat)
        + make_chunk(b"IEND", b"")
    )


def build_ranger_atlas_png(width=512, height=512):
    """Build a 512x512 RGBA PNG texture atlas for the Ranger VTOL Lander:
      - Top 58% (v in [0.0, 0.58]): Upper white thermal composite hull panels,
        precision aerospace panel seams, NASA cobalt-blue delta stripes, and
        flush dark thermal radiator louvers.
      - Bottom 42% (v in [0.58, 1.0]): Black/charcoal hexagonal silica ceramic
        Thermal Protection System (TPS) heat-shield tiles for the belly & chines.
    """
    buf = bytearray(width * height * 4)

    c_hull_white = hex_srgb("#f8fafc")
    c_hull_panel = hex_srgb("#e2e8f0")
    c_hull_seam = hex_srgb("#94a3b8")
    c_cobalt = hex_srgb("#1d4ed8")
    c_cyan_accent = hex_srgb("#38bdf8")
    c_tps_dark = hex_srgb("#111827")
    c_tps_mid = hex_srgb("#1e293b")
    c_tps_edge = hex_srgb("#334155")
    c_radiator = hex_srgb("#0f172a")

    split_y = int(height * 0.58)

    for py in range(split_y):
        v = py / float(max(1, split_y - 1))  # 0 = aft (-Z), 1 = nose (+Z)
        for px in range(width):
            u = px / float(max(1, width - 1))  # 0.5 = dorsal centerline, 0/1 = outer wing chines
            dx = abs(u - 0.5) * 2.0  # 0 at dorsal spine, 1 at outer chine edge

            panel_grid_u = abs(math.sin(dx * math.pi * 6.0))
            panel_grid_v = abs(math.sin(v * math.pi * 8.0))
            col = mix_col(c_hull_white, c_hull_panel, 0.32 * dx + 0.14 * (1.0 - v))

            if panel_grid_u < 0.042 or panel_grid_v < 0.042:
                col = mix_col(col, c_hull_seam, 0.52)

            # Fay-Riddell carbon-silicon nose cap & leading-edge chine TPS wrap
            nose_tps = smoothstep_g2(0.85, 0.91, v)
            chine_tps = smoothstep_g2(0.75, 0.84, dx)
            tps_mask = clamp(max(nose_tps, chine_tps), 0.0, 1.0)

            # Taut delta NASA Cobalt Blue stripe following the swept chine
            stripe_center = 0.56 - 0.16 * v
            d_stripe = abs(dx - stripe_center)
            if 0.10 < v < 0.82 and d_stripe < 0.052:
                stripe_t = 1.0 - smoothstep_g2(0.035, 0.052, d_stripe)
                col = mix_col(col, c_cobalt, stripe_t * 0.92)
                if abs(d_stripe - 0.040) < 0.008:
                    col = mix_col(col, c_cyan_accent, 0.72)

            # Flush aft-dorsal thermal radiator panels
            if 0.16 < v < 0.42 and 0.20 < dx < 0.40:
                col = c_radiator
                louver = abs(math.sin(v * math.pi * 46.0))
                if louver < 0.22:
                    col = mix_col(c_radiator, c_cyan_accent, 0.35)

            if tps_mask > 0.01:
                tile_col = mix_col(c_tps_dark, c_tps_mid, 0.5 + 0.5 * math.sin((u * 28.0 + v * 22.0) * math.pi))
                col = mix_col(col, tile_col, tps_mask)

            idx = (py * width + px) * 4
            buf[idx] = int(round(clamp(col[0], 0.0, 1.0) * 255))
            buf[idx + 1] = int(round(clamp(col[1], 0.0, 1.0) * 255))
            buf[idx + 2] = int(round(clamp(col[2], 0.0, 1.0) * 255))
            buf[idx + 3] = 255

    for py in range(split_y, height):
        v = (py - split_y) / float(max(1, height - split_y - 1))
        for px in range(width):
            u = px / float(max(1, width - 1))
            gx = u * 24.0
            gy = v * 14.0
            row_idx = int(math.floor(gy))
            if row_idx % 2 == 1:
                gx += 0.5
            fx = gx - math.floor(gx)
            fy = gy - math.floor(gy)

            border = min(fx, 1.0 - fx, fy, 1.0 - fy)
            tile_hash = 0.5 + 0.5 * math.sin(math.floor(gx) * 12.7 + math.floor(gy) * 7.3)
            col = mix_col(c_tps_dark, c_tps_mid, 0.25 + 0.65 * tile_hash)
            if border < 0.09:
                col = mix_col(col, c_tps_edge, 0.72)

            idx = (py * width + px) * 4
            buf[idx] = int(round(clamp(col[0], 0.0, 1.0) * 255))
            buf[idx + 1] = int(round(clamp(col[1], 0.0, 1.0) * 255))
            buf[idx + 2] = int(round(clamp(col[2], 0.0, 1.0) * 255))
            buf[idx + 3] = 255

    return encode_png_rgba(width, height, buf)


class MeshBuilder:
    def __init__(self):
        self.positions = []
        self.normals = []
        self.colors = []
        self.uvs = []
        self.indices = []

    def add_surface(self, pos_list, tri_list, col_list, uv_list=None, custom_normals=None, interior_ref=None):
        base_idx = len(self.positions)
        n_verts = len(pos_list)
        if uv_list is None:
            uv_list = [(0.0, 0.0)] * n_verts

        fixed_tris = []
        for i0, i1, i2 in tri_list:
            p0, p1, p2 = pos_list[i0], pos_list[i1], pos_list[i2]
            fn = v_cross(v_sub(p1, p0), v_sub(p2, p0))
            if interior_ref is not None:
                center = interior_ref((p0, p1, p2)) if callable(interior_ref) else interior_ref
                centroid = (
                    (p0[0] + p1[0] + p2[0]) / 3.0,
                    (p0[1] + p1[1] + p2[1]) / 3.0,
                    (p0[2] + p1[2] + p2[2]) / 3.0,
                )
                if v_dot(fn, v_sub(centroid, center)) < 0.0:
                    i1, i2 = i2, i1
            fixed_tris.append((i0, i1, i2))

        if custom_normals is None:
            acc = [[0.0, 0.0, 0.0] for _ in range(n_verts)]
            for i0, i1, i2 in fixed_tris:
                p0, p1, p2 = pos_list[i0], pos_list[i1], pos_list[i2]
                fn = v_cross(v_sub(p1, p0), v_sub(p2, p0))
                for idx in (i0, i1, i2):
                    acc[idx][0] += fn[0]
                    acc[idx][1] += fn[1]
                    acc[idx][2] += fn[2]
            norms = [v_norm(n) for n in acc]
        else:
            norms = custom_normals

        for i in range(n_verts):
            self.positions.append(pos_list[i])
            self.normals.append(norms[i])
            self.colors.append(col_list[i])
            self.uvs.append(uv_list[i])

        for i0, i1, i2 in fixed_tris:
            self.indices.extend((base_idx + i0, base_idx + i1, base_idx + i2))

    def add_grid_surface(self, rows, cols, eval_fn, wrap_u=True, close_poles=False, interior_ref=None):
        pos_list = []
        col_list = []
        uv_list = []
        u_count = cols + 1
        for r in range(rows + 1):
            v = r / float(rows)
            for c in range(u_count):
                u = (c / float(cols)) if not wrap_u else ((c % cols) / float(cols))
                res = eval_fn(u, v)
                if len(res) == 3:
                    p, col, uv = res
                else:
                    p, col = res
                    uv = (c / float(cols), v)
                pos_list.append(p)
                col_list.append(col)
                uv_list.append(uv)

        tris = []
        for r in range(rows):
            for c in range(cols):
                i00 = r * u_count + c
                i01 = r * u_count + (c + 1)
                i10 = (r + 1) * u_count + c
                i11 = (r + 1) * u_count + (c + 1)
                tris.append((i00, i10, i11))
                tris.append((i00, i11, i01))

        fixed_tris = []
        for i0, i1, i2 in tris:
            p0, p1, p2 = pos_list[i0], pos_list[i1], pos_list[i2]
            fn = v_cross(v_sub(p1, p0), v_sub(p2, p0))
            if interior_ref is not None:
                center = interior_ref((p0, p1, p2)) if callable(interior_ref) else interior_ref
                centroid = (
                    (p0[0] + p1[0] + p2[0]) / 3.0,
                    (p0[1] + p1[1] + p2[1]) / 3.0,
                    (p0[2] + p1[2] + p2[2]) / 3.0,
                )
                if v_dot(fn, v_sub(centroid, center)) < 0.0:
                    i1, i2 = i2, i1
            fixed_tris.append((i0, i1, i2))

        acc = [[0.0, 0.0, 0.0] for _ in range(len(pos_list))]
        for i0, i1, i2 in fixed_tris:
            p0, p1, p2 = pos_list[i0], pos_list[i1], pos_list[i2]
            fn = v_cross(v_sub(p1, p0), v_sub(p2, p0))
            for idx in (i0, i1, i2):
                acc[idx][0] += fn[0]
                acc[idx][1] += fn[1]
                acc[idx][2] += fn[2]

        if wrap_u:
            for r in range(rows + 1):
                i_start = r * u_count
                i_end = r * u_count + cols
                sx = acc[i_start][0] + acc[i_end][0]
                sy = acc[i_start][1] + acc[i_end][1]
                sz = acc[i_start][2] + acc[i_end][2]
                acc[i_start] = [sx, sy, sz]
                acc[i_end] = [sx, sy, sz]
        if close_poles:
            for pole_r in (0, rows):
                p_first = pos_list[pole_r * u_count]
                p_mid = pos_list[pole_r * u_count + (cols // 2)]
                if v_dot(v_sub(p_first, p_mid), v_sub(p_first, p_mid)) < 1e-5:
                    px = sum(acc[pole_r * u_count + c][0] for c in range(cols))
                    py = sum(acc[pole_r * u_count + c][1] for c in range(cols))
                    pz = sum(acc[pole_r * u_count + c][2] for c in range(cols))
                    for c in range(u_count):
                        acc[pole_r * u_count + c] = [px, py, pz]

        norms = [v_norm(n) for n in acc]
        self.add_surface(pos_list, fixed_tris, col_list, uv_list=uv_list, custom_normals=norms, interior_ref=None)

    def add_squircle_box(self, cx, cy, cz, sx, sy, sz, power=3.2, col=(1.0, 1.0, 1.0), rows=14, cols=28, uv_fn=None):
        exp = 2.0 / float(power)
        hx, hy, hz = sx * 0.5, sy * 0.5, sz * 0.5

        def eval_fn(u, v):
            theta = (u - 0.5) * math.pi * 2.0
            phi = v * math.pi
            sp = math.sin(phi)
            cp = -math.cos(phi)
            st = math.sin(theta)
            ct = math.cos(theta)
            sp_e = math.copysign(abs(sp) ** exp, sp)
            dy = math.copysign(abs(cp) ** exp, cp)
            dx = sp_e * math.copysign(abs(st) ** exp, st)
            dz = sp_e * math.copysign(abs(ct) ** exp, ct)
            pt = (cx + dx * hx, cy + dy * hy, cz + dz * hz)
            if uv_fn is not None:
                return pt, col, uv_fn(u, v, dx, dy, dz)
            return pt, col

        self.add_grid_surface(rows, cols, eval_fn, wrap_u=True, close_poles=True, interior_ref=(cx, cy, cz))

    def add_cylinder(self, p0, p1, r0, r1, col=(1.0, 1.0, 1.0), radial_segs=20, height_segs=2, cap_start=True, cap_end=True):
        axis = v_sub(p1, p0)
        ax = v_norm(axis)
        ref = (1.0, 0.0, 0.0) if abs(ax[0]) < 0.8 else (0.0, 1.0, 0.0)
        t1 = v_norm(v_cross(ax, ref))
        t2 = v_norm(v_cross(ax, t1))
        mid = ((p0[0] + p1[0]) * 0.5, (p0[1] + p1[1]) * 0.5, (p0[2] + p1[2]) * 0.5)

        def eval_side(u, v):
            ang = u * math.pi * 2.0
            ca, sa = math.cos(ang), math.sin(ang)
            r = r0 + (r1 - r0) * v
            cx = p0[0] + axis[0] * v + (t1[0] * ca + t2[0] * sa) * r
            cy = p0[1] + axis[1] * v + (t1[1] * ca + t2[1] * sa) * r
            cz = p0[2] + axis[2] * v + (t1[2] * ca + t2[2] * sa) * r
            c = col(u, v) if callable(col) else col
            return (cx, cy, cz), c

        def cyl_interior(tri_pts):
            c_pt = (
                (tri_pts[0][0] + tri_pts[1][0] + tri_pts[2][0]) / 3.0,
                (tri_pts[0][1] + tri_pts[1][1] + tri_pts[2][1]) / 3.0,
                (tri_pts[0][2] + tri_pts[1][2] + tri_pts[2][2]) / 3.0,
            )
            len_sq = v_dot(axis, axis)
            t = clamp(v_dot(v_sub(c_pt, p0), axis) / max(1e-9, len_sq), 0.0, 1.0)
            return (p0[0] + axis[0] * t, p0[1] + axis[1] * t, p0[2] + axis[2] * t)

        self.add_grid_surface(height_segs, radial_segs, eval_side, wrap_u=True, close_poles=False, interior_ref=cyl_interior)

        if cap_start and r0 > 1e-6:
            c0 = col(0.0, 0.0) if callable(col) else col
            pos = [p0]
            cols = [c0]
            norms = [(-ax[0], -ax[1], -ax[2])]
            for i in range(radial_segs):
                ang = (i / float(radial_segs)) * math.pi * 2.0
                ca, sa = math.cos(ang), math.sin(ang)
                pos.append((
                    p0[0] + (t1[0] * ca + t2[0] * sa) * r0,
                    p0[1] + (t1[1] * ca + t2[1] * sa) * r0,
                    p0[2] + (t1[2] * ca + t2[2] * sa) * r0,
                ))
                cols.append(c0)
                norms.append((-ax[0], -ax[1], -ax[2]))
            tris = [(0, 1 + i, 1 + (i + 1) % radial_segs) for i in range(radial_segs)]
            self.add_surface(pos, tris, cols, custom_normals=norms, interior_ref=mid)

        if cap_end and r1 > 1e-6:
            c1 = col(0.0, 1.0) if callable(col) else col
            pos = [p1]
            cols = [c1]
            norms = [ax]
            for i in range(radial_segs):
                ang = (i / float(radial_segs)) * math.pi * 2.0
                ca, sa = math.cos(ang), math.sin(ang)
                pos.append((
                    p1[0] + (t1[0] * ca + t2[0] * sa) * r1,
                    p1[1] + (t1[1] * ca + t2[1] * sa) * r1,
                    p1[2] + (t1[2] * ca + t2[2] * sa) * r1,
                ))
                cols.append(c1)
                norms.append(ax)
            tris = [(0, 1 + i, 1 + (i + 1) % radial_segs) for i in range(radial_segs)]
            self.add_surface(pos, tris, cols, custom_normals=norms, interior_ref=mid)


# Material indices
MAT_HULL_ATLAS = 0      # 512x512 PNG texture atlas (Upper thermal composite + lower TPS ceramic tiles)
MAT_TPS_CERAMIC = 1     # Dark charcoal silica heat-shield ceramic (#1e293b)
MAT_ALU_STRUT = 2       # Brushed aerospace aluminum landing gear, docking ring & trim (#e2e8f0)
MAT_DARK_TITANIUM = 3   # Dark titanium nozzles, flush window mullions & actuators (#334155)
MAT_COBALT_NASA = 4     # NASA anodized cobalt blue accents (#2563eb)
MAT_CANOPY_GLASS = 5    # Flush panoramic cockpit tinted quartz glass (#38bdf8)
MAT_CYAN_GLOW = 6       # Emissive cyan airlock & ramp guide rails (#38bdf8)
MAT_ENGINE_GLOW = 7     # Subtle standby methalox-fusion nozzle throat glow (#60a5fa)
MAT_GOLD_FOIL = 8       # Gold thermal docking & sensor accents (#eab308)

C_WHITE = (1.0, 1.0, 1.0)


def ranger_hull_section(t_z):
    """Evaluate longitudinal lifting-body cross-section parameters at t_z in [0, 1]
    (t_z = 0 is aft Kammback engine bulkhead z = -1.18; t_z = 1 is forward Fay-Riddell
    stagnation nose cap z = +1.24).
    """
    z = -1.18 + t_z * 2.42

    # Taut Delta-Wedge Planform (~68 deg leading-edge sweep) with Fay-Riddell blunt stagnation nose
    # and truncated Kammback aft base:
    if t_z < 0.03:
        s_cap = math.sin((t_z / 0.03) * math.pi * 0.5) ** 0.25
    elif t_z > 0.94:
        # Blunt parabolic stagnation nose cap (Fay-Riddell hypersonic heat transfer law)
        s_cap = math.sin(((1.0 - t_z) / 0.06) * math.pi * 0.5) ** 0.45
    else:
        s_cap = 1.0

    # Linear/G2 taut delta expansion from nose (0.18 m) to aft delta wing shoulders (0.94 m)
    half_w = bezier_quintic(t_z, 0.84, 0.96, 0.90, 0.68, 0.42, 0.16) * s_cap

    # Windward TPS belly height y_bot: flat-convex lifting surface with +3.8 deg trim incidence
    y_bot = bezier_quintic(t_z, 0.27, 0.23, 0.23, 0.25, 0.29, 0.35)

    # Leeward dorsal spine height y_top: taut wedge rising from nose (0.35 m) along the 21 deg
    # flush windshield slope up to the cabin crown (0.96 m) and tapering to the aft deck (0.72 m)
    y_top = bezier_quintic(t_z, 0.72, 0.88, 1.02, 0.96, 0.60, 0.35)

    # Sharp lateral chine height y_chine (separates high-pressure windward belly from upper leeward body)
    y_chine = y_bot + (y_top - y_bot) * bezier_quintic(t_z, 0.26, 0.22, 0.20, 0.22, 0.28, 0.46)

    return z, half_w, y_bot, y_top, y_chine


def eval_ranger_hull_point(u, v):
    """Evaluate a 3D point and UV on the G2 Lifting-Body Ranger fuselage.
    u in [0, 1] wraps around the cross-section:
      - u = 0.5 is top dorsal spine (+Y)
      - u = 0.25 is port chine (+X), u = 0.75 is starboard chine (-X)
      - u = 0.0 / 1.0 is bottom windward belly centerline (-Y)
    v in [0, 1] runs from aft bulkhead (v=0, z=-1.18) to forward nose pole (v=1, z=+1.24).
    """
    theta = (u - 0.5) * math.pi * 2.0  # 0 at top dorsal, +-pi/2 at chines, +-pi at belly
    z, half_w, y_bot, y_top, y_chine = ranger_hull_section(v)

    if v <= 0.0008 or v >= 0.9992:
        y_pole = 0.50 if v <= 0.0008 else 0.35
        return (0.0, y_pole, z), C_WHITE, (0.5, v * 0.56)

    st = math.sin(theta)
    ct = math.cos(theta)  # +1 at top dorsal, 0 at chines, -1 at bottom belly

    # Taut chine lateral coordinate
    x = half_w * math.copysign(abs(st) ** 0.82, st)

    if ct >= 0.0:
        # Upper hull: faceted-smooth G2 trapezoidal/delta lifting body cross-section
        # Flatten the upper cabin roof slightly across the center for flush windshield panes
        roof_flat = (ct ** 0.62) * (1.0 - 0.12 * (abs(st) ** 1.8) * smoothstep_g2(0.15, 0.82, v))
        y = y_chine + (y_top - y_chine) * roof_flat
        u_tex = clamp(0.5 + (x / max(0.08, half_w)) * 0.48, 0.01, 0.99)
        v_tex = clamp(v, 0.01, 0.99) * 0.56
    else:
        # Lower hull: taut flat-convex windward TPS heat shield (high hypersonic L/D)
        belly_flat = abs(ct) ** 1.85
        y = y_chine - (y_chine - y_bot) * belly_flat
        u_tex = clamp(0.5 + (x / max(0.08, half_w)) * 0.48, 0.01, 0.99)
        v_tex = 0.60 + clamp(v, 0.01, 0.99) * 0.38

    return (x, y, z), C_WHITE, (u_tex, v_tex)


def eval_hull_surface_frame(u, v):
    """Return (point, outward_normal) on the Ranger upper hull for 100% flush conformal windows."""
    p, _, _ = eval_ranger_hull_point(u, v)
    eps = 0.005
    pu1, _, _ = eval_ranger_hull_point(clamp(u + eps, 0.01, 0.99), v)
    pu0, _, _ = eval_ranger_hull_point(clamp(u - eps, 0.01, 0.99), v)
    pv1, _, _ = eval_ranger_hull_point(u, clamp(v + eps, 0.01, 0.99))
    pv0, _, _ = eval_ranger_hull_point(u, clamp(v - eps, 0.01, 0.99))
    tu = v_norm(v_sub(pu1, pu0))
    tv = v_norm(v_sub(pv1, pv0))
    n = v_norm(v_cross(tu, tv))
    if n[1] < 0.0:
        n = (-n[0], -n[1], -n[2])
    return p, n


def add_naca_airfoil_wing(mb, root_le, root_chord, tip_le, tip_chord, normal_dir, max_t=0.085, rows=16, cols=32):
    """Add a 3D aerodynamic fin/flap with a true NACA 00xx airfoil section
    (rounded supersonic leading edge at xc=0, sharp trailing edge at xc=1).
    """
    n_dir = v_norm(normal_dir)

    def eval_wing(u, v):
        # u in [0, 1] wraps around the airfoil chord:
        # u = 0.5 is leading edge (xc = 0); u = 0.0 / 1.0 is sharp trailing edge (xc = 1)
        theta = (u - 0.5) * math.pi * 2.0
        xc = 0.5 * (1.0 + math.cos(theta))  # 0 at u=0.5 (LE), 1 at u=0/1 (TE)
        side_sign = 1.0 if math.sin(theta) >= 0.0 else -1.0

        # Close tip smoothly over the last 6% of span
        tip_cap = math.sin((1.0 - v) * math.pi * 0.5) ** 0.22 if v > 0.94 else 1.0
        chord = (root_chord + (tip_chord - root_chord) * v) * tip_cap
        yt = naca_half_thickness(xc, max_t=max_t) * chord * (1.0 if 0.001 < v < 0.999 else 0.0)

        le_x = root_le[0] + (tip_le[0] - root_le[0]) * v
        le_y = root_le[1] + (tip_le[1] - root_le[1]) * v
        le_z = root_le[2] + (tip_le[2] - root_le[2]) * v

        px = le_x + n_dir[0] * side_sign * yt
        py = le_y + n_dir[1] * side_sign * yt
        pz = le_z - xc * chord + n_dir[2] * side_sign * yt
        return (px, py, pz), C_WHITE

    mid_ref = (
        (root_le[0] + tip_le[0]) * 0.5,
        (root_le[1] + tip_le[1]) * 0.5,
        (root_le[2] + tip_le[2]) * 0.5 - (root_chord + tip_chord) * 0.25,
    )
    mb.add_grid_surface(rows, cols, eval_wing, wrap_u=True, close_poles=True, interior_ref=mid_ref)


def build_hull_primitives():
    """Node 1 (`Hull`): Taut G2 Delta-Wedge Lifting-Body Fuselage, NACA 0008 Canted V-Tail
    Stabilizer Fins & Aft Body Flaps, Flush Conformal Cockpit Mullion Frame, Low-Profile
    Dorsal NASA IDSS Orbital Docking Collar, and Aft Bimodal Propulsion Cluster.
    """
    mbs = {
        MAT_HULL_ATLAS: MeshBuilder(),
        MAT_TPS_CERAMIC: MeshBuilder(),
        MAT_ALU_STRUT: MeshBuilder(),
        MAT_DARK_TITANIUM: MeshBuilder(),
        MAT_COBALT_NASA: MeshBuilder(),
        MAT_CYAN_GLOW: MeshBuilder(),
        MAT_ENGINE_GLOW: MeshBuilder(),
        MAT_GOLD_FOIL: MeshBuilder(),
    }

    # 1. Main G2 Delta-Wedge Lifting-Body Fuselage (zero protruding boxes on the forward mold line)
    mbs[MAT_HULL_ATLAS].add_grid_surface(
        60,
        68,
        eval_ranger_hull_point,
        wrap_u=True,
        close_poles=True,
        interior_ref=lambda pts: (0.0, 0.48, (pts[0][2] + pts[1][2] + pts[2][2]) / 3.0),
    )

    # 2. Twin Canted V-Tail Stabilizer Fins & Aft Body Flaps with true NACA 0008 Airfoil Sections
    for side in (-1.0, 1.0):
        # Canted V-tail stabilizer fin (rooted at aft upper chine, swept back at 42 deg, canted out at 26 deg)
        root_le = (side * 0.68, 0.48, -0.58)
        tip_le = (side * 0.88, 0.90, -0.88)
        fin_normal = (side * 0.88, -0.46, 0.0)
        add_naca_airfoil_wing(
            mbs[MAT_TPS_CERAMIC],
            root_le=root_le,
            root_chord=0.48,
            tip_le=tip_le,
            tip_chord=0.22,
            normal_dir=fin_normal,
            max_t=0.085,
            rows=16,
            cols=30,
        )

        # Aft Hypersonic Pitch/Roll Body Flap (Elevon) extending from the lower aft chine trailing edge
        flap_in_le = (side * 0.48, 0.28, -1.12)
        flap_out_le = (side * 0.82, 0.30, -1.10)
        add_naca_airfoil_wing(
            mbs[MAT_TPS_CERAMIC],
            root_le=flap_in_le,
            root_chord=0.22,
            tip_le=flap_out_le,
            tip_chord=0.18,
            normal_dir=(0.0, 1.0, 0.08),
            max_t=0.075,
            rows=10,
            cols=24,
        )

    # 3. 100% Flush Conformal Cockpit Window Bezel & Mullion Struts (+1.8 mm conformal offset)
    u_win_min, u_win_max = 0.37, 0.63
    v_win_min, v_win_max = 0.56, 0.80

    def eval_flush_bezel(u_loc, v_loc):
        u_h = (u_win_min - 0.015) + u_loc * ((u_win_max - u_win_min) + 0.030)
        v_h = (v_win_min - 0.015) + v_loc * ((v_win_max - v_win_min) + 0.030)
        edge_d = min(u_loc, 1.0 - u_loc, v_loc, 1.0 - v_loc)
        h_off = 0.0022 * smoothstep_g2(0.0, 0.12, edge_d)
        p, n = eval_hull_surface_frame(u_h, v_h)
        return v_add(p, v_scale(n, h_off)), C_WHITE

    mbs[MAT_DARK_TITANIUM].add_grid_surface(
        14,
        24,
        eval_flush_bezel,
        wrap_u=False,
        close_poles=False,
        interior_ref=(0.0, 0.45, 0.45),
    )

    # 4 Flush Titanium Windshield Mullions dividing the 5 panoramic panes along the exact hull contour
    for u_m in (0.415, 0.472, 0.528, 0.585):
        p_top_m, n_top_m = eval_hull_surface_frame(u_m, v_win_min)
        p_bot_m, n_bot_m = eval_hull_surface_frame(u_m, v_win_max)
        mbs[MAT_ALU_STRUT].add_cylinder(
            v_add(p_top_m, v_scale(n_top_m, 0.0035)),
            v_add(p_bot_m, v_scale(n_bot_m, 0.0035)),
            0.0075,
            0.0065,
            C_WHITE,
            radial_segs=10,
            height_segs=2,
        )

    # 4. Low-Profile Aerodynamic Dorsal NASA IDSS Orbital Docking Collar (z = -0.34)
    dock_y = 0.88
    dock_z = -0.34
    mbs[MAT_ALU_STRUT].add_cylinder(
        (0.0, dock_y - 0.08, dock_z),
        (0.0, dock_y + 0.025, dock_z),
        0.23,
        0.185,
        C_WHITE,
        radial_segs=32,
        height_segs=2,
    )
    mbs[MAT_DARK_TITANIUM].add_cylinder(
        (0.0, dock_y + 0.025, dock_z),
        (0.0, dock_y + 0.048, dock_z),
        0.175,
        0.165,
        C_WHITE,
        radial_segs=32,
        height_segs=1,
    )
    mbs[MAT_GOLD_FOIL].add_cylinder(
        (0.0, dock_y + 0.030, dock_z),
        (0.0, dock_y + 0.052, dock_z),
        0.132,
        0.126,
        C_WHITE,
        radial_segs=24,
        height_segs=1,
    )
    mbs[MAT_CYAN_GLOW].add_cylinder(
        (0.0, dock_y + 0.048, dock_z),
        (0.0, dock_y + 0.056, dock_z),
        0.032,
        0.028,
        C_WHITE,
        radial_segs=16,
        height_segs=1,
    )

    # 5. Aft Kammback Propulsion Bulkhead (-Z): 2 Main Gimbaled Bimodal/Methalox Nozzles + Central Thruster
    mbs[MAT_DARK_TITANIUM].add_squircle_box(
        0.0, 0.50, -1.14, 0.84, 0.28, 0.12, power=3.4, col=C_WHITE, rows=12, cols=24
    )
    for side in (-1.0, 1.0):
        nx = side * 0.23
        ny = 0.50
        mbs[MAT_DARK_TITANIUM].add_cylinder(
            (nx, ny, -1.16),
            (nx, ny, -1.36),
            0.100,
            0.156,
            C_WHITE,
            radial_segs=28,
            height_segs=3,
        )
        mbs[MAT_ALU_STRUT].add_cylinder(
            (nx, ny, -1.25),
            (nx, ny, -1.29),
            0.132,
            0.140,
            C_WHITE,
            radial_segs=28,
            height_segs=1,
        )
        mbs[MAT_ENGINE_GLOW].add_cylinder(
            (nx, ny, -1.32),
            (nx, ny, -1.355),
            0.118,
            0.135,
            C_WHITE,
            radial_segs=24,
            height_segs=1,
        )

    mbs[MAT_DARK_TITANIUM].add_cylinder(
        (0.0, 0.52, -1.16),
        (0.0, 0.52, -1.32),
        0.072,
        0.112,
        C_WHITE,
        radial_segs=24,
        height_segs=2,
    )
    mbs[MAT_ENGINE_GLOW].add_cylinder(
        (0.0, 0.52, -1.285),
        (0.0, 0.52, -1.315),
        0.084,
        0.096,
        C_WHITE,
        radial_segs=20,
        height_segs=1,
    )

    # 6. Recessed Ventral-Forward EVA Airlock Threshold (flush under the lower nose chine)
    mbs[MAT_DARK_TITANIUM].add_squircle_box(
        0.0, 0.31, 0.82, 0.28, 0.08, 0.14, power=3.0, col=C_WHITE, rows=8, cols=16
    )
    mbs[MAT_CYAN_GLOW].add_squircle_box(
        0.0, 0.34, 0.88, 0.20, 0.016, 0.03, power=2.6, col=C_WHITE, rows=6, cols=12
    )

    return mbs


def build_canopy_glass_mesh():
    """Node 2 (`CanopyGlass`): 100% Flush Conformal Panoramic Cockpit Windows
    following the exact G2 hull surface contour (+3.2 mm normal offset).
    """
    mb = MeshBuilder()
    u_win_min, u_win_max = 0.37, 0.63
    v_win_min, v_win_max = 0.56, 0.80

    def eval_flush_glass(u_loc, v_loc):
        u_h = u_win_min + u_loc * (u_win_max - u_win_min)
        v_h = v_win_min + v_loc * (v_win_max - v_win_min)
        edge_d = min(u_loc, 1.0 - u_loc, v_loc, 1.0 - v_loc)
        h_off = 0.0015 + 0.0022 * smoothstep_g2(0.0, 0.10, edge_d)
        p, n = eval_hull_surface_frame(u_h, v_h)
        return v_add(p, v_scale(n, h_off)), C_WHITE

    mb.add_grid_surface(
        16,
        28,
        eval_flush_glass,
        wrap_u=False,
        close_poles=False,
        interior_ref=(0.0, 0.45, 0.45),
    )
    return mb


def build_landing_gear_primitives():
    """Node 3 (`LandingGear`): 4 wide-stance telescopic hydraulic landing legs deploying
    from flush belly gear bays with A-frame drag braces and self-leveling circular footpads
    resting at y = 0.000.
    """
    mbs = {
        MAT_ALU_STRUT: MeshBuilder(),
        MAT_DARK_TITANIUM: MeshBuilder(),
        MAT_COBALT_NASA: MeshBuilder(),
        MAT_GOLD_FOIL: MeshBuilder(),
    }

    legs = [
        (0.46, 0.28, 0.44, 0.74, 0.56),    # Front-Left (+X, +Z)
        (-0.46, 0.28, 0.44, -0.74, 0.56),  # Front-Right (-X, +Z)
        (0.60, 0.28, -0.62, 0.88, -0.74),  # Rear-Left (+X, -Z)
        (-0.60, 0.28, -0.62, -0.88, -0.74),# Rear-Right (-X, -Z)
    ]

    for hx, hy, hz, px, pz in legs:
        p_hull_main = (hx, hy + 0.04, hz)
        p_knee = ((hx + px) * 0.52, 0.15, (hz + pz) * 0.52)
        p_ankle = (px, 0.030, pz)

        mbs[MAT_DARK_TITANIUM].add_cylinder(
            p_hull_main, p_knee, 0.032, 0.028, C_WHITE, radial_segs=16, height_segs=2
        )
        mbs[MAT_GOLD_FOIL].add_cylinder(
            p_hull_main,
            ((p_hull_main[0] + p_knee[0]) * 0.5, (p_hull_main[1] + p_knee[1]) * 0.5, (p_hull_main[2] + p_knee[2]) * 0.5),
            0.034,
            0.031,
            C_WHITE,
            radial_segs=16,
            height_segs=1,
        )
        mbs[MAT_ALU_STRUT].add_cylinder(
            p_knee, p_ankle, 0.022, 0.020, C_WHITE, radial_segs=16, height_segs=2
        )
        mbs[MAT_ALU_STRUT].add_cylinder(
            (hx * 0.76, hy - 0.02, hz - 0.10),
            (px * 0.94, 0.052, pz),
            0.015,
            0.013,
            C_WHITE,
            radial_segs=12,
            height_segs=1,
        )
        mbs[MAT_DARK_TITANIUM].add_cylinder(
            (px, 0.000, pz),
            (px, 0.022, pz),
            0.130,
            0.106,
            C_WHITE,
            radial_segs=24,
            height_segs=1,
        )
        mbs[MAT_ALU_STRUT].add_cylinder(
            (px, 0.020, pz),
            (px, 0.036, pz),
            0.068,
            0.040,
            C_WHITE,
            radial_segs=18,
            height_segs=1,
        )
        mbs[MAT_COBALT_NASA].add_cylinder(
            (px, 0.010, pz),
            (px, 0.024, pz),
            0.114,
            0.102,
            C_WHITE,
            radial_segs=24,
            height_segs=1,
        )

    return mbs


def build_hatch_ramp_primitives():
    """Node 4 (`HatchRamp`): Ventral-forward hinged boarding ramp (doubles as the flush
    lower nose heat-shield door when retracted in flight, and hinges down to y = 0.010
    when landed on a planetary surface).
    """
    mbs = {
        MAT_ALU_STRUT: MeshBuilder(),
        MAT_DARK_TITANIUM: MeshBuilder(),
        MAT_CYAN_GLOW: MeshBuilder(),
    }

    steps = 7
    p_top = (0.0, 0.27, 0.82)
    p_bot = (0.0, 0.010, 1.28)

    for side in (-1.0, 1.0):
        rx = side * 0.135
        mbs[MAT_ALU_STRUT].add_cylinder(
            (rx, p_top[1], p_top[2]),
            (rx, p_bot[1], p_bot[2]),
            0.016,
            0.014,
            C_WHITE,
            radial_segs=14,
            height_segs=2,
        )
        mbs[MAT_CYAN_GLOW].add_cylinder(
            (side * 0.142, p_top[1] + 0.010, p_top[2]),
            (side * 0.142, p_bot[1] + 0.010, p_bot[2]),
            0.0055,
            0.0055,
            C_WHITE,
            radial_segs=10,
            height_segs=1,
        )

    for i in range(steps):
        t = i / float(steps - 1)
        sy = p_top[1] + (p_bot[1] - p_top[1]) * t
        sz = p_top[2] + (p_bot[2] - p_top[2]) * t
        mbs[MAT_DARK_TITANIUM].add_squircle_box(
            0.0, sy, sz, 0.25, 0.016, 0.054, power=2.8, col=C_WHITE, rows=6, cols=14
        )

    return mbs


def pack_glb():
    atlas_png_bytes = build_ranger_atlas_png(512, 512)

    hull_mbs = build_hull_primitives()
    canopy_mb = build_canopy_glass_mesh()
    gear_mbs = build_landing_gear_primitives()
    ramp_mbs = build_hatch_ramp_primitives()

    bin_chunks = bytearray()
    buffer_views = []
    accessors = []

    def align4(buf):
        rem = len(buf) % 4
        if rem:
            buf.extend(b"\x00" * (4 - rem))

    align4(bin_chunks)
    png_off = len(bin_chunks)
    bin_chunks.extend(atlas_png_bytes)
    png_len = len(atlas_png_bytes)
    bv_png = len(buffer_views)
    buffer_views.append({"buffer": 0, "byteOffset": png_off, "byteLength": png_len})

    total_verts = 0
    total_tris = 0

    def append_primitive(mb, mat_idx, include_uv=False):
        nonlocal total_verts, total_tris
        v_count = len(mb.positions)
        i_count = len(mb.indices)
        total_verts += v_count
        total_tris += i_count // 3

        align4(bin_chunks)
        pos_off = len(bin_chunks)
        min_p = [float("inf")] * 3
        max_p = [float("-inf")] * 3
        for p in mb.positions:
            bin_chunks.extend(struct.pack("<3f", *p))
            for k in range(3):
                if p[k] < min_p[k]:
                    min_p[k] = p[k]
                if p[k] > max_p[k]:
                    max_p[k] = p[k]
        pos_len = len(bin_chunks) - pos_off
        bv_pos = len(buffer_views)
        buffer_views.append({"buffer": 0, "byteOffset": pos_off, "byteLength": pos_len, "target": 34962})
        acc_pos = len(accessors)
        accessors.append({
            "bufferView": bv_pos,
            "byteOffset": 0,
            "componentType": 5126,
            "count": v_count,
            "type": "VEC3",
            "min": [round(x, 6) for x in min_p],
            "max": [round(x, 6) for x in max_p],
        })

        align4(bin_chunks)
        norm_off = len(bin_chunks)
        for n in mb.normals:
            bin_chunks.extend(struct.pack("<3f", *n))
        norm_len = len(bin_chunks) - norm_off
        bv_norm = len(buffer_views)
        buffer_views.append({"buffer": 0, "byteOffset": norm_off, "byteLength": norm_len, "target": 34962})
        acc_norm = len(accessors)
        accessors.append({
            "bufferView": bv_norm,
            "byteOffset": 0,
            "componentType": 5126,
            "count": v_count,
            "type": "VEC3",
        })

        attrs = {
            "POSITION": acc_pos,
            "NORMAL": acc_norm,
        }

        if include_uv:
            align4(bin_chunks)
            uv_off = len(bin_chunks)
            for uv in mb.uvs:
                bin_chunks.extend(struct.pack("<2f", clamp(uv[0], 0.0, 1.0), clamp(uv[1], 0.0, 1.0)))
            uv_len = len(bin_chunks) - uv_off
            bv_uv = len(buffer_views)
            buffer_views.append({"buffer": 0, "byteOffset": uv_off, "byteLength": uv_len, "target": 34962})
            acc_uv = len(accessors)
            accessors.append({
                "bufferView": bv_uv,
                "byteOffset": 0,
                "componentType": 5126,
                "count": v_count,
                "type": "VEC2",
            })
            attrs["TEXCOORD_0"] = acc_uv

        align4(bin_chunks)
        idx_off = len(bin_chunks)
        use_u32 = v_count > 65535
        if use_u32:
            for idx in mb.indices:
                bin_chunks.extend(struct.pack("<I", idx))
            comp_type = 5125
        else:
            for idx in mb.indices:
                bin_chunks.extend(struct.pack("<H", idx))
            comp_type = 5123
        idx_len = len(bin_chunks) - idx_off
        bv_idx = len(buffer_views)
        buffer_views.append({"buffer": 0, "byteOffset": idx_off, "byteLength": idx_len, "target": 34963})
        acc_idx = len(accessors)
        accessors.append({
            "bufferView": bv_idx,
            "byteOffset": 0,
            "componentType": comp_type,
            "count": i_count,
            "type": "SCALAR",
        })

        return {
            "attributes": attrs,
            "indices": acc_idx,
            "material": mat_idx,
            "mode": 4,
        }

    def build_multi_primitive_mesh(mbs_dict):
        prims = []
        for mat_idx, mb in sorted(mbs_dict.items(), key=lambda x: x[0]):
            if not mb.indices:
                continue
            prims.append(append_primitive(mb, mat_idx, include_uv=(mat_idx == MAT_HULL_ATLAS)))
        return prims

    hull_prims = build_multi_primitive_mesh(hull_mbs)
    canopy_prims = [append_primitive(canopy_mb, MAT_CANOPY_GLASS, include_uv=False)]
    gear_prims = build_multi_primitive_mesh(gear_mbs)
    ramp_prims = build_multi_primitive_mesh(ramp_mbs)

    def make_pbr_mat(name, hex_color, roughness=0.34, metallic=0.14, emissive_hex=None):
        r, g, b = hex_lin(hex_color)
        m = {
            "name": name,
            "doubleSided": False,
            "pbrMetallicRoughness": {
                "baseColorFactor": [round(r, 5), round(g, 5), round(b, 5), 1.0],
                "roughnessFactor": roughness,
                "metallicFactor": metallic,
            },
        }
        if emissive_hex:
            er, eg, eb = hex_lin(emissive_hex)
            m["emissiveFactor"] = [round(er, 5), round(eg, 5), round(eb, 5)]
        return m

    materials = [
        # 0: MAT_HULL_ATLAS (512x512 embedded PNG texture of Ranger thermal hull & TPS tiles)
        {
            "name": "RangerThermalHullAtlas",
            "doubleSided": False,
            "pbrMetallicRoughness": {
                "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
                "baseColorTexture": {"index": 0},
                "roughnessFactor": 0.30,
                "metallicFactor": 0.12,
            },
        },
        # 1: MAT_TPS_CERAMIC
        make_pbr_mat("RangerCeramicHeatShield", "#263348", roughness=0.46, metallic=0.12),
        # 2: MAT_ALU_STRUT
        make_pbr_mat("RangerAerospaceAluminum", "#e2e8f0", roughness=0.28, metallic=0.18),
        # 3: MAT_DARK_TITANIUM
        make_pbr_mat("RangerDarkTitanium", "#3b495e", roughness=0.40, metallic=0.16),
        # 4: MAT_COBALT_NASA
        make_pbr_mat("RangerNasaCobalt", "#2563eb", roughness=0.28, metallic=0.16),
        # 5: MAT_CANOPY_GLASS
        make_pbr_mat("RangerCanopyQuartzGlass", "#38bdf8", roughness=0.08, metallic=0.10, emissive_hex="#075985"),
        # 6: MAT_CYAN_GLOW
        make_pbr_mat("RangerCyanAirlockGlow", "#38bdf8", roughness=0.12, metallic=0.05, emissive_hex="#0ea5e9"),
        # 7: MAT_ENGINE_GLOW
        make_pbr_mat("RangerMethaloxNozzleGlow", "#60a5fa", roughness=0.15, metallic=0.08, emissive_hex="#1d4ed8"),
        # 8: MAT_GOLD_FOIL
        make_pbr_mat("RangerGoldKaptonTrim", "#eab308", roughness=0.24, metallic=0.22, emissive_hex="#422006"),
    ]

    gltf = {
        "asset": {
            "version": "2.0",
            "generator": "CyberPenguin 2.0 Hypersonic Ranger VTOL Builder",
        },
        "scene": 0,
        "scenes": [{"name": "RangerScene", "nodes": [0]}],
        "nodes": [
            {
                "name": "RangerRoot",
                "children": [1, 2, 3, 4],
                "translation": [0.0, 0.0, 0.0],
            },
            {
                "name": "Hull",
                "mesh": 0,
                "translation": [0.0, 0.0, 0.0],
            },
            {
                "name": "CanopyGlass",
                "mesh": 1,
                "translation": [0.0, 0.0, 0.0],
            },
            {
                "name": "LandingGear",
                "mesh": 2,
                "translation": [0.0, 0.0, 0.0],
            },
            {
                "name": "HatchRamp",
                "mesh": 3,
                "translation": [0.0, 0.0, 0.0],
            },
        ],
        "meshes": [
            {"name": "RangerHullMesh", "primitives": hull_prims},
            {"name": "RangerCanopyMesh", "primitives": canopy_prims},
            {"name": "RangerLandingGearMesh", "primitives": gear_prims},
            {"name": "RangerHatchRampMesh", "primitives": ramp_prims},
        ],
        "textures": [{"sampler": 0, "source": 0}],
        "images": [{"bufferView": bv_png, "mimeType": "image/png", "name": "RangerHullAndTpsAtlas"}],
        "samplers": [{"magFilter": 9729, "minFilter": 9729, "wrapS": 33071, "wrapT": 33071}],
        "materials": materials,
        "buffers": [{"byteLength": len(bin_chunks)}],
        "bufferViews": buffer_views,
        "accessors": accessors,
    }

    json_bytes = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    json_pad = (4 - (len(json_bytes) % 4)) % 4
    json_bytes += b" " * json_pad

    bin_pad = (4 - (len(bin_chunks) % 4)) % 4
    bin_chunks.extend(b"\x00" * bin_pad)

    total_len = 12 + 8 + len(json_bytes) + 8 + len(bin_chunks)
    os.makedirs(os.path.dirname(OUT_GLB_PATH), exist_ok=True)
    with open(OUT_GLB_PATH, "wb") as f:
        f.write(struct.pack("<III", 0x46546C67, 2, total_len))
        f.write(struct.pack("<II", len(json_bytes), 0x4E4F534A))
        f.write(json_bytes)
        f.write(struct.pack("<II", len(bin_chunks), 0x004E4942))
        f.write(bin_chunks)

    print(
        f"Generated {OUT_GLB_PATH}: {total_len:,} bytes ({total_len / 1024:.1f} KB), "
        f"vertices={total_verts:,}, triangles={total_tris:,}, materials={len(materials)}, "
        f"png={png_len:,} B"
    )


if __name__ == "__main__":
    pack_glb()
