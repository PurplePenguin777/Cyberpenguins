#!/usr/bin/env python3
"""Build a high-craft, G2-continuous 3D glTF 2.0 binary (.glb) model of
Cyberpenguin's Ranger VTOL Planetary Scout Lander (`assets/models/nave-pinguino.glb`).

Aerospace Engineering & Design Basis:
  - Inspired by the *Interstellar* Ranger VTOL Lifting-Body Lander + NASA HL-20 / X-38
    lifting-body entry vehicle, configured as the surface ascent/descent shuttle that
    docks in orbit with an interplanetary nuclear cruiser (*Space Reactor-1 Freedom*).
  - Low center of gravity (wide chined delta lifting-body fuselage + 4 wide-stance
    hydraulic landing legs with articulated footpads) capable of landing stably on
    18-20 deg rocky slopes in Ares Vallis, the Moon, or Asteroid Eros.
  - Upper hull in white NASA thermal composite panels (`MAT_HULL_ATLAS`) with cobalt-blue
    mission stripes and dark radiator louvers; lower belly, nose cap, and chine leading
    edges armored in dark hexagonal silica ceramic heat-shield tiles (TPS).
  - Forward sloped panoramic multi-pane cockpit canopy (`CanopyGlass` node) giving direct
    downward visibility of landing terrain.
  - Dorsal NASA IDSS (International Docking System Standard) orbital docking collar with
    alignment petals for coupling to the orbital *Space Reactor-1* propulsion module.
  - Twin canted rear aerodynamic stabilizer fins / winglets + aft flap elevons.
  - Aft propulsion cluster: 2 main gimbaled Methalox/Bimodal bell nozzles + central
    thruster + RCS attitude pods.
  - Forward-ventral pressurized EVA airlock with a ground-level deployable boarding ramp
    (`HatchRamp` node) and glowing cyan step guide rails.

Coordinate Convention (matching `cyberpenguin.glb` and `sojourner.glb`):
  - +Z : Ranger Nose / Forward Boarding Ramp & Panoramic Cockpit
  - -Z : Ranger Aft Engine Cluster & Canted Tail Fins
  - +Y : Up (landing footpads & ramp tip rest at y = 0.000)
  - ±X : Port (+X) / Starboard (-X) Chined Lifting-Body Wings & Landing Gear

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
        dark thermal radiator louvers.
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

            # Base white/silver aerospace composite
            panel_grid_u = abs(math.sin(dx * math.pi * 6.0))
            panel_grid_v = abs(math.sin(v * math.pi * 8.0))
            col = mix_col(c_hull_white, c_hull_panel, 0.35 * dx + 0.15 * (1.0 - v))

            # Crisp panel seam lines
            if panel_grid_u < 0.045 or panel_grid_v < 0.045:
                col = mix_col(col, c_hull_seam, 0.55)

            # Outer chine black ceramic TPS border & nose cap thermal wrap
            nose_tps = smoothstep_g2(0.84, 0.92, v)
            chine_tps = smoothstep_g2(0.76, 0.86, dx)
            tps_mask = clamp(max(nose_tps, chine_tps), 0.0, 1.0)

            # NASA Cobalt Blue delta mission stripe running along the mid-chine
            stripe_center = 0.54 - 0.18 * v
            d_stripe = abs(dx - stripe_center)
            if 0.12 < v < 0.80 and d_stripe < 0.055:
                stripe_t = 1.0 - smoothstep_g2(0.038, 0.055, d_stripe)
                col = mix_col(col, c_cobalt, stripe_t * 0.92)
                if abs(d_stripe - 0.042) < 0.008:
                    col = mix_col(col, c_cyan_accent, 0.75)

            # Mid-dorsal dark radiator louver panels (for rejecting heat in space)
            if 0.20 < v < 0.44 and 0.18 < dx < 0.38:
                col = c_radiator
                louver = abs(math.sin(v * math.pi * 48.0))
                if louver < 0.22:
                    col = mix_col(c_radiator, c_cyan_accent, 0.38)

            if tps_mask > 0.01:
                tile_col = mix_col(c_tps_dark, c_tps_mid, 0.5 + 0.5 * math.sin((u * 28.0 + v * 22.0) * math.pi))
                col = mix_col(col, tile_col, tps_mask)

            idx = (py * width + px) * 4
            buf[idx] = int(round(clamp(col[0], 0.0, 1.0) * 255))
            buf[idx + 1] = int(round(clamp(col[1], 0.0, 1.0) * 255))
            buf[idx + 2] = int(round(clamp(col[2], 0.0, 1.0) * 255))
            buf[idx + 3] = 255

    # Bottom 42%: Staggered hexagonal silica ceramic heat-shield tiles (TPS)
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

    def add_squircle_box(self, cx, cy, cz, sx, sy, sz, power=3.2, col=(1.0, 1.0, 1.0), rows=16, cols=32, uv_fn=None):
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
MAT_DARK_TITANIUM = 3   # Dark titanium nozzles, window mullions & actuators (#334155)
MAT_COBALT_NASA = 4     # NASA anodized cobalt blue accents (#2563eb)
MAT_CANOPY_GLASS = 5    # Panoramic cockpit tinted quartz glass (#38bdf8)
MAT_CYAN_GLOW = 6       # Emissive cyan airlock & ramp guide rails (#38bdf8)
MAT_ENGINE_GLOW = 7     # Subtle standby methalox-fusion nozzle throat glow (#60a5fa)
MAT_GOLD_FOIL = 8       # Gold thermal docking & sensor accents (#eab308)

C_WHITE = (1.0, 1.0, 1.0)


def ranger_hull_section(t_z):
    """Evaluate longitudinal lifting-body cross-section parameters at t_z in [0, 1]
    (t_z = 0 is aft engine bulkhead z = -1.16; t_z = 1 is forward nose tip z = +1.18).
    """
    z = -1.16 + t_z * 2.34

    # Half-width (wide delta aft & mid-body tapering smoothly to an aerodynamic lifting-body nose)
    if t_z < 0.08:
        s_aft = math.sin((t_z / 0.08) * math.pi * 0.5) ** 0.45
    elif t_z > 0.92:
        s_aft = math.sin(((1.0 - t_z) / 0.08) * math.pi * 0.5) ** 0.58
    else:
        s_aft = 1.0

    half_w = bezier_quintic(t_z, 0.78, 0.95, 0.92, 0.72, 0.46, 0.14) * s_aft

    # Belly height y_bot (flat lifting-body heat shield bottom, curving gently up at nose & aft)
    y_bot = bezier_quintic(t_z, 0.30, 0.24, 0.23, 0.24, 0.27, 0.36)

    # Dorsal spine height y_top (tall panoramic cabin canopy at t_z ~ 0.55..0.72, sloping down to nose)
    y_top = bezier_quintic(t_z, 0.84, 0.98, 1.08, 1.04, 0.68, 0.40)

    # Chine height y_chine (sharp aerodynamic side edge where upper composite meets lower TPS heat shield)
    y_chine = y_bot + (y_top - y_bot) * bezier_quintic(t_z, 0.32, 0.28, 0.25, 0.26, 0.32, 0.45)

    return z, half_w, y_bot, y_top, y_chine


def eval_ranger_hull_point(u, v):
    """Evaluate a 3D point and UV on the G2 Lifting-Body Ranger fuselage.
    u in [0, 1] wraps around the cross-section:
      - u = 0.5 is top dorsal spine (+Y)
      - u = 0.25 is port chine (+X), u = 0.75 is starboard chine (-X)
      - u = 0.0 / 1.0 is bottom belly centerline (-Y)
    v in [0, 1] runs from aft bulkhead (v=0, z=-1.16) to forward nose pole (v=1, z=+1.18).
    """
    theta = (u - 0.5) * math.pi * 2.0  # 0 at top dorsal, +-pi/2 at chines, +-pi at belly
    z, half_w, y_bot, y_top, y_chine = ranger_hull_section(v)

    if v <= 0.001 or v >= 0.999:
        y_pole = 0.56 if v <= 0.001 else 0.38
        return (0.0, y_pole, z), C_WHITE, (0.5, v * 0.56)

    st = math.sin(theta)
    ct = math.cos(theta)  # +1 at top dorsal, 0 at chines, -1 at bottom belly

    # Horizontal x coordinate with sharp aerodynamic chine definition
    x = half_w * math.copysign(abs(st) ** 0.76, st)

    if ct >= 0.0:
        # Upper hull: flat-topped cabin & swept chine wing shoulders (Interstellar Ranger silhouette)
        arch = ct ** 0.68
        # Slight cabin ridge plateau near the middle
        ridge = 1.0 - 0.14 * (abs(st) ** 1.6) * smoothstep_g2(0.18, 0.78, v)
        y = y_chine + (y_top - y_chine) * arch * ridge
        u_tex = clamp(0.5 + (x / max(0.12, half_w)) * 0.48, 0.01, 0.99)
        v_tex = clamp(v, 0.01, 0.99) * 0.56
    else:
        # Lower hull: flat lifting-body TPS ceramic belly
        belly_flat = abs(ct) ** 1.65
        y = y_chine - (y_chine - y_bot) * belly_flat
        u_tex = clamp(0.5 + (x / max(0.12, half_w)) * 0.48, 0.01, 0.99)
        v_tex = 0.60 + clamp(v, 0.01, 0.99) * 0.38

    return (x, y, z), C_WHITE, (u_tex, v_tex)


def build_hull_primitives():
    """Node 1 (`Hull`): Main G2 Lifting-Body Fuselage, Canted Twin Rear Stabilizer Fins,
    Dorsal NASA IDSS Orbital Docking Collar (for Space Reactor-1 cruiser), Aft Gimbaled
    Nozzles + Aerospike, Cockpit Window Mullion Frame, and Forward EVA Airlock Alcove.
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

    # 1. Main G2 Lifting-Body Fuselage
    mbs[MAT_HULL_ATLAS].add_grid_surface(
        56,
        64,
        eval_ranger_hull_point,
        wrap_u=True,
        close_poles=True,
        interior_ref=lambda pts: (0.0, 0.52, (pts[0][2] + pts[1][2] + pts[2][2]) / 3.0),
    )

    # 2. Twin Canted Rear Aerodynamic Stabilizer Fins / Winglets (Signature Ranger V-tail winglets)
    for side in (-1.0, 1.0):
        def make_fin_eval(s_dir):
            def eval_fin(u, v):
                theta = (u - 0.5) * math.pi * 2.0
                sx, cz = squircle_cs(theta, power=2.4)
                cap = math.sin(v * math.pi) ** 0.25 if 0.0 < v < 1.0 else 0.0
                # Root at outer aft hull chine (x = +-0.76, y = 0.54, z = -0.78), canted outward & upward
                root_x, root_y, root_z = s_dir * 0.72, 0.52, -0.76
                span_y = v * 0.44
                cant_x = s_dir * v * 0.19
                sweep_z = -v * 0.24
                chord = (0.36 - v * 0.16) * cap
                thick = (0.028 - v * 0.014) * cap
                px = root_x + cant_x + sx * thick
                py = root_y + span_y
                pz = root_z + sweep_z + cz * chord * 0.5
                return (px, py, pz), C_WHITE

            return eval_fin

        mbs[MAT_TPS_CERAMIC].add_grid_surface(
            18,
            28,
            make_fin_eval(side),
            wrap_u=True,
            close_poles=True,
            interior_ref=(side * 0.81, 0.74, -0.88),
        )

        # Cobalt blue mission fin flash on outer face of each stabilizer fin
        mbs[MAT_COBALT_NASA].add_cylinder(
            (side * 0.77, 0.58, -0.78),
            (side * 0.88, 0.86, -0.94),
            0.019,
            0.011,
            C_WHITE,
            radial_segs=14,
            height_segs=2,
        )

        # Forward aerodynamic trim canards along the nose chine
        mbs[MAT_TPS_CERAMIC].add_squircle_box(
            side * 0.44,
            0.40,
            0.62,
            0.22,
            0.026,
            0.28,
            power=3.0,
            col=C_WHITE,
            rows=10,
            cols=20,
        )

    # 3. Dorsal NASA IDSS Orbital Docking Collar (for docking with Space Reactor-1 Freedom in orbit)
    dock_y = 0.94
    dock_z = -0.34
    mbs[MAT_ALU_STRUT].add_cylinder(
        (0.0, dock_y - 0.08, dock_z),
        (0.0, dock_y + 0.04, dock_z),
        0.24,
        0.21,
        C_WHITE,
        radial_segs=32,
        height_segs=2,
    )
    mbs[MAT_DARK_TITANIUM].add_cylinder(
        (0.0, dock_y + 0.04, dock_z),
        (0.0, dock_y + 0.075, dock_z),
        0.195,
        0.185,
        C_WHITE,
        radial_segs=32,
        height_segs=1,
    )
    mbs[MAT_GOLD_FOIL].add_cylinder(
        (0.0, dock_y + 0.05, dock_z),
        (0.0, dock_y + 0.082, dock_z),
        0.145,
        0.140,
        C_WHITE,
        radial_segs=24,
        height_segs=1,
    )
    # 3 IDSS Docking Alignment Guide Petals & Cyan Docking Target Sensor
    for k in range(3):
        ang = (k / 3.0) * math.pi * 2.0
        px = 0.19 * math.sin(ang)
        pz = dock_z + 0.19 * math.cos(ang)
        mbs[MAT_ALU_STRUT].add_squircle_box(
            px, dock_y + 0.085, pz, 0.045, 0.028, 0.045, power=2.5, col=C_WHITE, rows=8, cols=14
        )
    mbs[MAT_CYAN_GLOW].add_cylinder(
        (0.0, dock_y + 0.078, dock_z),
        (0.0, dock_y + 0.088, dock_z),
        0.036,
        0.032,
        C_WHITE,
        radial_segs=16,
        height_segs=1,
    )

    # 4. Panoramic Cockpit Window Frame Mullions (framing the sloped forward canopy)
    mbs[MAT_DARK_TITANIUM].add_squircle_box(
        0.0, 0.78, 0.34, 0.62, 0.18, 0.56, power=3.2, col=C_WHITE, rows=16, cols=32
    )
    for x_mullion in (-0.22, -0.08, 0.08, 0.22):
        mbs[MAT_ALU_STRUT].add_cylinder(
            (x_mullion, 0.87, 0.12),
            (x_mullion * 0.78, 0.66, 0.62),
            0.012,
            0.010,
            C_WHITE,
            radial_segs=12,
            height_segs=2,
        )

    # 5. Aft Propulsion Cluster (-Z bulkhead): 2 Main Bimodal/Methalox Nozzles + Central Aerospike
    mbs[MAT_DARK_TITANIUM].add_squircle_box(
        0.0, 0.54, -1.12, 0.86, 0.32, 0.16, power=3.2, col=C_WHITE, rows=14, cols=28
    )
    for side in (-1.0, 1.0):
        nx = side * 0.24
        ny = 0.54
        mbs[MAT_DARK_TITANIUM].add_cylinder(
            (nx, ny, -1.14),
            (nx, ny, -1.36),
            0.105,
            0.165,
            C_WHITE,
            radial_segs=28,
            height_segs=3,
        )
        mbs[MAT_ALU_STRUT].add_cylinder(
            (nx, ny, -1.24),
            (nx, ny, -1.28),
            0.138,
            0.146,
            C_WHITE,
            radial_segs=28,
            height_segs=1,
        )
        mbs[MAT_ENGINE_GLOW].add_cylinder(
            (nx, ny, -1.31),
            (nx, ny, -1.355),
            0.125,
            0.142,
            C_WHITE,
            radial_segs=24,
            height_segs=1,
        )

    # Central orbital maneuvering nozzle
    mbs[MAT_DARK_TITANIUM].add_cylinder(
        (0.0, 0.56, -1.14),
        (0.0, 0.56, -1.32),
        0.075,
        0.118,
        C_WHITE,
        radial_segs=24,
        height_segs=2,
    )
    mbs[MAT_ENGINE_GLOW].add_cylinder(
        (0.0, 0.56, -1.28),
        (0.0, 0.56, -1.315),
        0.088,
        0.102,
        C_WHITE,
        radial_segs=20,
        height_segs=1,
    )

    # 6. Pressurized Forward-Ventral EVA Airlock Portal Frame (+Z nose/belly below cockpit)
    mbs[MAT_ALU_STRUT].add_squircle_box(
        0.0, 0.42, 0.76, 0.38, 0.24, 0.22, power=3.2, col=C_WHITE, rows=12, cols=24
    )
    mbs[MAT_DARK_TITANIUM].add_squircle_box(
        0.0, 0.42, 0.80, 0.31, 0.19, 0.18, power=3.0, col=C_WHITE, rows=10, cols=20
    )
    mbs[MAT_CYAN_GLOW].add_squircle_box(
        0.0, 0.51, 0.86, 0.22, 0.022, 0.04, power=2.6, col=C_WHITE, rows=8, cols=16
    )

    return mbs


def build_canopy_glass_mesh():
    """Node 2 (`CanopyGlass`): Sloped multi-pane panoramic cockpit windows."""
    mb = MeshBuilder()

    def eval_canopy(u, v):
        theta = (u - 0.5) * math.pi * 2.0
        sx, cz = squircle_cs(theta, power=3.0)
        phi = v * math.pi
        sp = math.sin(phi)
        cp = -math.cos(phi)
        # Sloped forward along the Ranger nose profile
        z_local = cz * 0.27 * sp
        x = sx * 0.295 * sp
        y = 0.80 + cp * 0.085 - z_local * 0.34
        z = 0.36 + z_local
        return (x, y, z), C_WHITE

    mb.add_grid_surface(18, 36, eval_canopy, wrap_u=True, close_poles=True, interior_ref=(0.0, 0.78, 0.36))
    return mb


def build_landing_gear_primitives():
    """Node 3 (`LandingGear`): 4 wide-stance telescopic hydraulic landing legs with
    A-frame support struts and self-leveling circular footpads resting at y = 0.000.
    """
    mbs = {
        MAT_ALU_STRUT: MeshBuilder(),
        MAT_DARK_TITANIUM: MeshBuilder(),
        MAT_COBALT_NASA: MeshBuilder(),
        MAT_GOLD_FOIL: MeshBuilder(),
    }

    # 4 corner landing gear positions (wide, low-CG footprint)
    legs = [
        # (hull_x, hull_y, hull_z, pad_x, pad_z)
        (0.50, 0.30, 0.44, 0.76, 0.56),    # Front-Left (+X, +Z)
        (-0.50, 0.30, 0.44, -0.76, 0.56),  # Front-Right (-X, +Z)
        (0.62, 0.32, -0.62, 0.90, -0.74),  # Rear-Left (+X, -Z)
        (-0.62, 0.32, -0.62, -0.90, -0.74),# Rear-Right (-X, -Z)
    ]

    for hx, hy, hz, px, pz in legs:
        p_hull_main = (hx, hy + 0.06, hz)
        p_knee = ((hx + px) * 0.52, 0.16, (hz + pz) * 0.52)
        p_ankle = (px, 0.032, pz)

        # Upper hydraulic shock cylinder (dark titanium + gold Kapton dust boot)
        mbs[MAT_DARK_TITANIUM].add_cylinder(
            p_hull_main, p_knee, 0.034, 0.030, C_WHITE, radial_segs=16, height_segs=2
        )
        mbs[MAT_GOLD_FOIL].add_cylinder(
            p_hull_main,
            ((p_hull_main[0] + p_knee[0]) * 0.5, (p_hull_main[1] + p_knee[1]) * 0.5, (p_hull_main[2] + p_knee[2]) * 0.5),
            0.036,
            0.033,
            C_WHITE,
            radial_segs=16,
            height_segs=1,
        )

        # Lower telescopic chrome piston rod
        mbs[MAT_ALU_STRUT].add_cylinder(
            p_knee, p_ankle, 0.023, 0.021, C_WHITE, radial_segs=16, height_segs=2
        )

        # Secondary A-frame drag brace strut from inner belly to ankle
        mbs[MAT_ALU_STRUT].add_cylinder(
            (hx * 0.78, hy - 0.03, hz - 0.10),
            (px * 0.94, 0.055, pz),
            0.016,
            0.014,
            C_WHITE,
            radial_segs=12,
            height_segs=1,
        )

        # Articulated wide circular footpad resting flat on y = 0.000
        mbs[MAT_DARK_TITANIUM].add_cylinder(
            (px, 0.000, pz),
            (px, 0.024, pz),
            0.135,
            0.110,
            C_WHITE,
            radial_segs=24,
            height_segs=1,
        )
        mbs[MAT_ALU_STRUT].add_cylinder(
            (px, 0.022, pz),
            (px, 0.038, pz),
            0.072,
            0.042,
            C_WHITE,
            radial_segs=18,
            height_segs=1,
        )
        mbs[MAT_COBALT_NASA].add_cylinder(
            (px, 0.012, pz),
            (px, 0.026, pz),
            0.118,
            0.106,
            C_WHITE,
            radial_segs=24,
            height_segs=1,
        )

    return mbs


def build_hatch_ramp_primitives():
    """Node 4 (`HatchRamp`): Ground-level deployable EVA boarding ramp extending from
    the forward airlock threshold (y = 0.30, z = 0.80) down to the ground (y = 0.005, z = 1.28)
    with non-slip cleats and glowing cyan guide rails.
    """
    mbs = {
        MAT_ALU_STRUT: MeshBuilder(),
        MAT_DARK_TITANIUM: MeshBuilder(),
        MAT_CYAN_GLOW: MeshBuilder(),
    }

    # Sloped boarding ramp deck (6 steps from airlock threshold to ground)
    steps = 7
    p_top = (0.0, 0.30, 0.80)
    p_bot = (0.0, 0.012, 1.28)

    # Main side stringer beams
    for side in (-1.0, 1.0):
        rx = side * 0.145
        mbs[MAT_ALU_STRUT].add_cylinder(
            (rx, p_top[1], p_top[2]),
            (rx, p_bot[1], p_bot[2]),
            0.018,
            0.015,
            C_WHITE,
            radial_segs=14,
            height_segs=2,
        )
        # Glowing cyan safety strip along each ramp rail
        mbs[MAT_CYAN_GLOW].add_cylinder(
            (side * 0.152, p_top[1] + 0.012, p_top[2]),
            (side * 0.152, p_bot[1] + 0.012, p_bot[2]),
            0.006,
            0.006,
            C_WHITE,
            radial_segs=10,
            height_segs=1,
        )

    # Horizontal non-slip boarding treads along the ramp
    for i in range(steps):
        t = i / float(steps - 1)
        sy = p_top[1] + (p_bot[1] - p_top[1]) * t
        sz = p_top[2] + (p_bot[2] - p_top[2]) * t
        mbs[MAT_DARK_TITANIUM].add_squircle_box(
            0.0, sy, sz, 0.27, 0.018, 0.058, power=2.6, col=C_WHITE, rows=6, cols=14
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
            "generator": "CyberPenguin 2.0 Ranger VTOL Scout Lander Builder",
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
