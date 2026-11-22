#!/usr/bin/env python3
"""Build a high-craft, realistic 3D glTF 2.0 binary (.glb) model of NASA's
NEAR Shoemaker Spacecraft (Near Earth Asteroid Rendezvous, 1996-2001) for CyberPenguin 2.0
(`assets/models/near-shoemaker.glb`).

Hierarchy (`NearRoot`):
  - `Bus`: Compact octagonal spacecraft body wrapped in quilted 24K Gold Kapton MLI,
    bipropellant main engine bell underneath, MSI imager camera barrel with coated cyan lens,
    NIS spectrometer aperture, and NLR laser rangefinder optics.
  - `HighGainDish`: 1.5 m fixed white concave parabolic dish antenna on top (+Y) with
    slender titanium feed tripod, feed horn, and top magnetometer boom tip.
  - `SolarWings`: 4 fixed beveled GaAs solar panels arranged symmetrically in a pinwheel
    cross atop the bus with embedded 512x512 GaAs photovoltaic cell texture atlas.

Uses Python standard library only.
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
    "near-shoemaker.glb",
)


def clamp(v, lo, hi):
    return lo if v < lo else hi if v > hi else v


def smoothstep(e0, e1, x):
    if e1 == e0:
        return 0.0
    t = clamp((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


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


def v_sub(a, b):
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


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


def build_near_atlas_png(width=512, height=512):
    """512x512 RGBA PNG texture atlas:
      - Top half (v in [0.0, 0.5]): GaAs deep blue solar cell wing texture with aluminum bezel & gold trace
      - Bottom half (v in [0.5, 1.0]): Quilted 24K Gold Kapton MLI blanket texture
    """
    buf = bytearray(width * height * 4)

    c_alu = hex_srgb("#cbd5e1")
    c_sub = hex_srgb("#0b1324")
    c_cell0 = hex_srgb("#0f2557")
    c_cell1 = hex_srgb("#1d4ed8")
    c_cell_hi = hex_srgb("#60a5fa")
    c_silver = hex_srgb("#e2e8f0")
    c_gold_trim = hex_srgb("#f59e0b")

    c_kap0 = hex_srgb("#92400e")
    c_kap1 = hex_srgb("#f59e0b")
    c_kap2 = hex_srgb("#fef08a")

    half_h = height // 2

    for py in range(half_h):
        v = py / float(max(1, half_h - 1))
        for px in range(width):
            u = px / float(max(1, width - 1))
            m_u, m_v = 0.045, 0.055
            if u < m_u or u > 1.0 - m_u or v < m_v or v > 1.0 - m_v:
                col = c_alu
            else:
                su = (u - m_u) / (1.0 - 2.0 * m_u)
                sv = (v - m_v) / (1.0 - 2.0 * m_v)
                if su < 0.02 or su > 0.98 or sv < 0.025 or sv > 0.975:
                    col = c_gold_trim
                else:
                    cu = (su - 0.02) / 0.96
                    cv = (sv - 0.025) / 0.95
                    fx = (cu * 8.0) % 1.0
                    fy = (cv * 12.0) % 1.0
                    if fx < 0.08 or fx > 0.92 or fy < 0.09 or fy > 0.91:
                        col = c_silver if (abs(cu - 0.5) > 0.015) else c_sub
                    else:
                        diag = 0.5 + 0.5 * math.sin((cu * 1.6 + cv * 1.2) * math.pi)
                        col = mix_col(c_cell0, c_cell1, 0.35 + 0.55 * diag)
                        glint = max(0.0, math.sin((cu * 2.2 - cv * 1.5) * math.pi)) ** 3
                        col = mix_col(col, c_cell_hi, glint * 0.45)

            idx = (py * width + px) * 4
            buf[idx] = int(round(clamp(col[0], 0.0, 1.0) * 255))
            buf[idx + 1] = int(round(clamp(col[1], 0.0, 1.0) * 255))
            buf[idx + 2] = int(round(clamp(col[2], 0.0, 1.0) * 255))
            buf[idx + 3] = 255

    for py in range(half_h, height):
        v = (py - half_h) / float(max(1, height - half_h - 1))
        for px in range(width):
            u = px / float(max(1, width - 1))
            crinkle = 0.5 + 0.28 * math.sin((u * 15.0 + v * 9.0) * math.pi * 2.0) + 0.18 * math.cos((u * 25.0 - v * 13.0) * math.pi * 2.0)
            col = mix_col(c_kap0, c_kap1, clamp(crinkle * 1.15, 0.0, 1.0))
            if crinkle > 0.62:
                col = mix_col(col, c_kap2, (crinkle - 0.62) / 0.38 * 0.75)
            qu = abs(math.sin(u * math.pi * 10.0))
            qv = abs(math.sin(v * math.pi * 4.0))
            seam = (1.0 - smoothstep(0.0, 0.10, qu)) * 0.45 + (1.0 - smoothstep(0.0, 0.12, qv)) * 0.40
            col = mix_col(col, c_kap0, clamp(seam, 0.0, 0.7))

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
        self.uvs = []
        self.indices = []

    def add_surface(self, pos_list, tri_list, uv_list=None, custom_normals=None, interior_ref=None):
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
            self.uvs.append(uv_list[i])

        for i0, i1, i2 in fixed_tris:
            self.indices.extend((base_idx + i0, base_idx + i1, base_idx + i2))

    def add_grid_surface(self, rows, cols, eval_fn, wrap_u=True, close_poles=False, interior_ref=None):
        pos_list = []
        uv_list = []
        u_count = cols + 1
        for r in range(rows + 1):
            v = r / float(rows)
            for c in range(u_count):
                u = (c / float(cols)) if not wrap_u else ((c % cols) / float(cols))
                res = eval_fn(u, v)
                p, uv = res if len(res) == 2 else (res, (c / float(cols), v))
                pos_list.append(p)
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
                s = [acc[i_start][k] + acc[i_end][k] for k in range(3)]
                acc[i_start] = s[:]
                acc[i_end] = s[:]
        if close_poles:
            for pole_r in (0, rows):
                p_first = pos_list[pole_r * u_count]
                p_mid = pos_list[pole_r * u_count + (cols // 2)]
                if v_dot(v_sub(p_first, p_mid), v_sub(p_first, p_mid)) < 1e-5:
                    s = [sum(acc[pole_r * u_count + c][k] for c in range(cols)) for k in range(3)]
                    for c in range(u_count):
                        acc[pole_r * u_count + c] = s[:]

        norms = [v_norm(n) for n in acc]
        self.add_surface(pos_list, fixed_tris, uv_list=uv_list, custom_normals=norms, interior_ref=None)

    def add_squircle_box(self, cx, cy, cz, sx, sy, sz, power=3.8, rows=12, cols=24, uv_fn=None):
        exp = 2.0 / float(power)
        hx, hy, hz = sx * 0.5, sy * 0.5, sz * 0.5

        def eval_fn(u, v):
            theta = (u - 0.5) * math.pi * 2.0
            phi = v * math.pi
            sp = math.sin(phi)
            cp = -math.cos(phi)
            st, ct = math.sin(theta), math.cos(theta)
            sp_e = math.copysign(abs(sp) ** exp, sp)
            dy = math.copysign(abs(cp) ** exp, cp)
            dx = sp_e * math.copysign(abs(st) ** exp, st)
            dz = sp_e * math.copysign(abs(ct) ** exp, ct)
            pt = (cx + dx * hx, cy + dy * hy, cz + dz * hz)
            uv = uv_fn(u, v, dx, dy, dz) if uv_fn else (u, v)
            return pt, uv

        self.add_grid_surface(rows, cols, eval_fn, wrap_u=True, close_poles=True, interior_ref=(cx, cy, cz))

    def add_prism_y(self, y0, y1, rad, n_sides=8, uv_fn=None):
        center = (0.0, (y0 + y1) * 0.5, 0.0)
        pos_list, uv_list, tris = [], [], []
        for i in range(n_sides):
            a0 = ((i + 0.5) / float(n_sides)) * math.pi * 2.0
            a1 = ((i + 1.5) / float(n_sides)) * math.pi * 2.0
            x0, z0 = rad * math.sin(a0), rad * math.cos(a0)
            x1, z1 = rad * math.sin(a1), rad * math.cos(a1)
            idx = len(pos_list)
            pos_list.extend([(x0, y0, z0), (x1, y0, z1), (x1, y1, z1), (x0, y1, z0)])
            u0, u1 = i / float(n_sides), (i + 1) / float(n_sides)
            if uv_fn:
                uv_list.extend([uv_fn(u0, 0.0), uv_fn(u1, 0.0), uv_fn(u1, 1.0), uv_fn(u0, 1.0)])
            else:
                uv_list.extend([(0, 0), (1, 0), (1, 1), (0, 1)])
            tris.extend([(idx, idx + 1, idx + 2), (idx, idx + 2, idx + 3)])
        self.add_surface(pos_list, tris, uv_list=uv_list, interior_ref=center)

        for y, n_y in ((y0, -1.0), (y1, 1.0)):
            pos = [(0.0, y, 0.0)]
            norms = [(0.0, n_y, 0.0)]
            uvs = [uv_fn(0.5, 0.5) if uv_fn else (0.5, 0.5)]
            for i in range(n_sides):
                ang = ((i + 0.5) / float(n_sides)) * math.pi * 2.0
                pos.append((rad * math.sin(ang), y, rad * math.cos(ang)))
                norms.append((0.0, n_y, 0.0))
                uvs.append(uv_fn(0.5, 0.5) if uv_fn else (0.5, 0.5))
            c_tris = [(0, 1 + i, 1 + (i + 1) % n_sides) for i in range(n_sides)]
            self.add_surface(pos, c_tris, uv_list=uvs, custom_normals=norms, interior_ref=center)

    def add_cylinder(self, p0, p1, r0, r1, radial_segs=16, height_segs=1, cap_start=True, cap_end=True, uv_v=0.75):
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
            return (
                p0[0] + axis[0] * v + (t1[0] * ca + t2[0] * sa) * r,
                p0[1] + axis[1] * v + (t1[1] * ca + t2[1] * sa) * r,
                p0[2] + axis[2] * v + (t1[2] * ca + t2[2] * sa) * r,
            ), (u, uv_v)

        def cyl_interior(tri_pts):
            c_pt = tuple(sum(tri_pts[k][j] for k in range(3)) / 3.0 for j in range(3))
            t = clamp(v_dot(v_sub(c_pt, p0), axis) / max(1e-9, v_dot(axis, axis)), 0.0, 1.0)
            return (p0[0] + axis[0] * t, p0[1] + axis[1] * t, p0[2] + axis[2] * t)

        self.add_grid_surface(height_segs, radial_segs, eval_side, wrap_u=True, close_poles=False, interior_ref=cyl_interior)

        for pt_cap, r_cap, n_dir, do_cap in ((p0, r0, (-ax[0], -ax[1], -ax[2]), cap_start), (p1, r1, ax, cap_end)):
            if not do_cap or r_cap <= 1e-6:
                continue
            pos, norms, uvs = [pt_cap], [n_dir], [(0.5, uv_v)]
            for i in range(radial_segs):
                ang = (i / float(radial_segs)) * math.pi * 2.0
                ca, sa = math.cos(ang), math.sin(ang)
                pos.append((
                    pt_cap[0] + (t1[0] * ca + t2[0] * sa) * r_cap,
                    pt_cap[1] + (t1[1] * ca + t2[1] * sa) * r_cap,
                    pt_cap[2] + (t1[2] * ca + t2[2] * sa) * r_cap,
                ))
                norms.append(n_dir)
                uvs.append((0.5, uv_v))
            tris = [(0, 1 + i, 1 + (i + 1) % radial_segs) for i in range(radial_segs)]
            self.add_surface(pos, tris, uv_list=uvs, custom_normals=norms, interior_ref=mid)


# Material indices
MAT_SOLAR_WING = 0      # GaAs solar cells top half of atlas
MAT_GOLD_KAPTON = 1     # Gold Kapton MLI bottom half of atlas
MAT_ALU_BRIGHT = 2      # Aluminum frame, yokes, dish back shell, struts
MAT_DARK_TITANIUM = 3   # Engine bell, optical barrels, adapter deck
MAT_DISH_WHITE = 4      # 1.5 m crisp white parabolic antenna interior
MAT_CYAN_LENS = 5       # Glowing cyan MSI / NLR optical lenses


def new_mbs():
    return {i: MeshBuilder() for i in range(6)}


def kapton_uv(u, v):
    return (clamp(u, 0.02, 0.98), clamp(0.53 + v * 0.44, 0.52, 0.98))


def solar_uv(u, v):
    return (clamp(u, 0.01, 0.99), clamp(0.02 + v * 0.46, 0.02, 0.48))


def build_bus():
    mbs = new_mbs()
    # Octagonal Kapton spacecraft bus: y = -0.28 .. +0.28, radius = 0.34
    mbs[MAT_GOLD_KAPTON].add_prism_y(-0.28, 0.28, 0.34, n_sides=8, uv_fn=kapton_uv)
    # Upper solar-wing adapter collar & dish pedestal
    mbs[MAT_DARK_TITANIUM].add_cylinder((0.0, 0.28, 0.0), (0.0, 0.34, 0.0), 0.32, 0.28, radial_segs=16)
    mbs[MAT_ALU_BRIGHT].add_cylinder((0.0, 0.34, 0.0), (0.0, 0.43, 0.0), 0.11, 0.09, radial_segs=16)

    # Bottom bipropellant LVA engine nozzle bell (-Y)
    mbs[MAT_DARK_TITANIUM].add_cylinder((0.0, -0.28, 0.0), (0.0, -0.46, 0.0), 0.08, 0.18, radial_segs=20, height_segs=3, cap_start=True, cap_end=False)

    # Front Science Instrument Deck (+Z face at z = 0.31..0.41): MSI imager, NIS & NLR laser rangefinder
    mbs[MAT_DARK_TITANIUM].add_cylinder((-0.11, 0.06, 0.28), (-0.11, 0.06, 0.40), 0.072, 0.075, radial_segs=18)
    mbs[MAT_CYAN_LENS].add_cylinder((-0.11, 0.06, 0.39), (-0.11, 0.06, 0.415), 0.052, 0.048, radial_segs=18)

    mbs[MAT_ALU_BRIGHT].add_squircle_box(0.11, 0.08, 0.34, 0.13, 0.14, 0.10, power=4.5, rows=6, cols=12)
    mbs[MAT_DARK_TITANIUM].add_squircle_box(0.11, 0.08, 0.39, 0.09, 0.10, 0.02, power=4.5, rows=4, cols=8)

    # NLR laser rangefinder twin optics below
    mbs[MAT_ALU_BRIGHT].add_cylinder((-0.07, -0.14, 0.29), (-0.07, -0.14, 0.39), 0.036, 0.036, radial_segs=14)
    mbs[MAT_CYAN_LENS].add_cylinder((-0.07, -0.14, 0.385), (-0.07, -0.14, 0.402), 0.024, 0.024, radial_segs=14)
    mbs[MAT_ALU_BRIGHT].add_squircle_box(0.08, -0.14, 0.34, 0.13, 0.09, 0.08, power=4.5, rows=4, cols=8)

    return mbs


def build_high_gain_dish():
    mbs = new_mbs()
    cy_base = 0.43
    radius = 0.43
    depth = 0.12

    # Fixed 1.5m top white parabolic dish facing +Y
    for is_front in (True, False):
        def eval_fn(u, v, front=is_front):
            ang = u * math.pi * 2.0
            rr = radius * v
            dy = depth * (v * v) + (0.0 if front else -0.022 * (1.0 - 0.3 * v * v))
            return (rr * math.cos(ang), cy_base + dy, rr * math.sin(ang)), (u, v)

        ref_y = cy_base + (-1.2 if is_front else 0.8)
        mbs[MAT_DISH_WHITE if is_front else MAT_ALU_BRIGHT].add_grid_surface(
            10, 32, eval_fn, wrap_u=True, close_poles=True, interior_ref=(0.0, ref_y, 0.0)
        )

    # Subreflector tripod + copper/gold feed horn + magnetometer mast tip
    feed_p = (0.0, cy_base + 0.34, 0.0)
    for k in range(3):
        ang = k * (math.pi * 2.0 / 3.0) + 0.4
        rim_p = (math.cos(ang) * radius * 0.78, cy_base + depth * 0.72, math.sin(ang) * radius * 0.78)
        mbs[MAT_DARK_TITANIUM].add_cylinder(rim_p, feed_p, 0.010, 0.008, radial_segs=8)

    mbs[MAT_GOLD_KAPTON].add_cylinder((0.0, cy_base + 0.28, 0.0), (0.0, cy_base + 0.36, 0.0), 0.045, 0.036, radial_segs=16, uv_v=0.75)
    mbs[MAT_ALU_BRIGHT].add_cylinder(feed_p, (0.0, cy_base + 0.56, 0.0), 0.011, 0.008, radial_segs=10)
    mbs[MAT_GOLD_KAPTON].add_squircle_box(0.0, cy_base + 0.57, 0.0, 0.055, 0.055, 0.055, power=2.4, rows=6, cols=10, uv_fn=lambda *_: (0.5, 0.75))
    return mbs


def build_solar_wings():
    mbs = new_mbs()
    # 4 fixed radial GaAs solar panels at azimuths 45°, 135°, 225°, 315° (X-wing symmetry)
    y_mount = 0.25
    r_inner = 0.40
    wing_len = 0.74
    wing_half_w = 0.22
    wing_thick = 0.022

    for k in range(4):
        ang = (k * 0.5 + 0.25) * math.pi
        ax, az = math.sin(ang), math.cos(ang)       # outward radial axis
        px, pz = -az, ax                            # tangent width axis

        # Structural titanium root yoke bridging bus to panel inner edge
        mbs[MAT_DARK_TITANIUM].add_cylinder(
            (ax * 0.31, y_mount, az * 0.31),
            (ax * r_inner, y_mount, az * r_inner),
            0.026,
            0.022,
            radial_segs=10,
        )
        mbs[MAT_DARK_TITANIUM].add_cylinder(
            (ax * (r_inner + 0.02) - px * 0.14, y_mount, az * (r_inner + 0.02) - pz * 0.14),
            (ax * (r_inner + 0.02) + px * 0.14, y_mount, az * (r_inner + 0.02) + pz * 0.14),
            0.016,
            0.016,
            radial_segs=8,
        )

        # Panel box built with explicit rotated vertices so top (+Y) face gets full crisp GaAs cell UV
        def corner(d_rad, w_tan, dy):
            r_tot = r_inner + d_rad * wing_len
            t_tot = w_tan * wing_half_w
            return (ax * r_tot + px * t_tot, y_mount + dy * wing_thick * 0.5, az * r_tot + pz * t_tot)

        cx_mid = ax * (r_inner + 0.5 * wing_len)
        cz_mid = az * (r_inner + 0.5 * wing_len)
        center = (cx_mid, y_mount, cz_mid)

        # Sunward top GaAs photovoltaic face (+Y)
        t_pos = [corner(0, -1, 1), corner(1, -1, 1), corner(1, 1, 1), corner(0, 1, 1)]
        t_uv = [solar_uv(0.0, 0.0), solar_uv(0.0, 1.0), solar_uv(1.0, 1.0), solar_uv(1.0, 0.0)]
        mbs[MAT_SOLAR_WING].add_surface(t_pos, [(0, 1, 2), (0, 2, 3)], uv_list=t_uv, custom_normals=[(0.0, 1.0, 0.0)] * 4, interior_ref=center)

        # Dark composite bottom face (-Y) + 4 beveled aluminum edge sides
        b_pos = [corner(0, -1, -1), corner(1, -1, -1), corner(1, 1, -1), corner(0, 1, -1)]
        mbs[MAT_DARK_TITANIUM].add_surface(b_pos, [(0, 2, 1), (0, 3, 2)], custom_normals=[(0.0, -1.0, 0.0)] * 4, interior_ref=center)

        side_pairs = [(0, 1), (1, 2), (2, 3), (3, 0)]
        s_pos, s_tris = [], []
        for a, b in side_pairs:
            idx = len(s_pos)
            s_pos.extend([b_pos[a], b_pos[b], t_pos[b], t_pos[a]])
            s_tris.extend([(idx, idx + 1, idx + 2), (idx, idx + 2, idx + 3)])
        mbs[MAT_ALU_BRIGHT].add_surface(s_pos, s_tris, interior_ref=center)

    return mbs


def pack_glb():
    atlas_png = build_near_atlas_png(512, 512)
    node_builders = [
        ("Bus", build_bus()),
        ("HighGainDish", build_high_gain_dish()),
        ("SolarWings", build_solar_wings()),
    ]

    bin_chunks = bytearray()
    buffer_views = []
    accessors = []

    def align4(buf):
        rem = len(buf) % 4
        if rem:
            buf.extend(b"\x00" * (4 - rem))

    align4(bin_chunks)
    png_off = len(bin_chunks)
    bin_chunks.extend(atlas_png)
    bv_png = len(buffer_views)
    buffer_views.append({"buffer": 0, "byteOffset": png_off, "byteLength": len(atlas_png)})

    total_verts = 0
    total_tris = 0

    def append_prim(mb, mat_idx, include_uv):
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
        bv_pos = len(buffer_views)
        buffer_views.append({"buffer": 0, "byteOffset": pos_off, "byteLength": len(bin_chunks) - pos_off, "target": 34962})
        acc_pos = len(accessors)
        accessors.append({
            "bufferView": bv_pos, "byteOffset": 0, "componentType": 5126,
            "count": v_count, "type": "VEC3",
            "min": [round(x, 6) for x in min_p], "max": [round(x, 6) for x in max_p],
        })

        align4(bin_chunks)
        norm_off = len(bin_chunks)
        for n in mb.normals:
            bin_chunks.extend(struct.pack("<3f", *n))
        bv_norm = len(buffer_views)
        buffer_views.append({"buffer": 0, "byteOffset": norm_off, "byteLength": len(bin_chunks) - norm_off, "target": 34962})
        acc_norm = len(accessors)
        accessors.append({"bufferView": bv_norm, "byteOffset": 0, "componentType": 5126, "count": v_count, "type": "VEC3"})

        attrs = {"POSITION": acc_pos, "NORMAL": acc_norm}
        if include_uv:
            align4(bin_chunks)
            uv_off = len(bin_chunks)
            for uv in mb.uvs:
                bin_chunks.extend(struct.pack("<2f", clamp(uv[0], 0.0, 1.0), clamp(uv[1], 0.0, 1.0)))
            bv_uv = len(buffer_views)
            buffer_views.append({"buffer": 0, "byteOffset": uv_off, "byteLength": len(bin_chunks) - uv_off, "target": 34962})
            acc_uv = len(accessors)
            accessors.append({"bufferView": bv_uv, "byteOffset": 0, "componentType": 5126, "count": v_count, "type": "VEC2"})
            attrs["TEXCOORD_0"] = acc_uv

        align4(bin_chunks)
        idx_off = len(bin_chunks)
        for idx in mb.indices:
            bin_chunks.extend(struct.pack("<H", idx))
        bv_idx = len(buffer_views)
        buffer_views.append({"buffer": 0, "byteOffset": idx_off, "byteLength": len(bin_chunks) - idx_off, "target": 34963})
        acc_idx = len(accessors)
        accessors.append({"bufferView": bv_idx, "byteOffset": 0, "componentType": 5123, "count": i_count, "type": "SCALAR"})

        return {"attributes": attrs, "indices": acc_idx, "material": mat_idx, "mode": 4}

    meshes = []
    nodes = [{"name": "NearRoot", "children": [1, 2, 3], "translation": [0.0, 0.0, 0.0]}]
    for idx_m, (node_name, mbs) in enumerate(node_builders):
        prims = []
        for mat_idx, mb in sorted(mbs.items(), key=lambda x: x[0]):
            if mb.indices:
                prims.append(append_prim(mb, mat_idx, include_uv=(mat_idx in (MAT_SOLAR_WING, MAT_GOLD_KAPTON))))
        meshes.append({"name": f"{node_name}Mesh", "primitives": prims})
        nodes.append({"name": node_name, "mesh": idx_m})

    def make_pbr(name, hex_c, rough=0.34, metal=0.14, emissive=None):
        r, g, b = hex_lin(hex_c)
        m = {
            "name": name,
            "doubleSided": False,
            "pbrMetallicRoughness": {
                "baseColorFactor": [round(r, 5), round(g, 5), round(b, 5), 1.0],
                "roughnessFactor": rough,
                "metallicFactor": metal,
            },
        }
        if emissive:
            er, eg, eb = hex_lin(emissive)
            m["emissiveFactor"] = [round(er, 5), round(eg, 5), round(eb, 5)]
        return m

    materials = [
        {
            "name": "NearGaAsSolarWings",
            "doubleSided": False,
            "pbrMetallicRoughness": {
                "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
                "baseColorTexture": {"index": 0},
                "roughnessFactor": 0.24,
                "metallicFactor": 0.08,
            },
            "emissiveFactor": [0.04, 0.08, 0.18],
        },
        {
            "name": "NearGoldKaptonBus",
            "doubleSided": False,
            "pbrMetallicRoughness": {
                "baseColorFactor": [1.0, 0.95, 0.72, 1.0],
                "baseColorTexture": {"index": 0},
                "roughnessFactor": 0.28,
                "metallicFactor": 0.18,
            },
            "emissiveFactor": [0.10, 0.07, 0.01],
        },
        make_pbr("NearMachinedAluminum", "#cbd5e1", rough=0.32, metal=0.16),
        make_pbr("NearDarkTitanium", "#334155", rough=0.45, metal=0.14),
        make_pbr("NearHighGainDishWhite", "#f8fafc", rough=0.34, metal=0.06),
        make_pbr("NearInstrumentCyanOptics", "#38bdf8", rough=0.10, metal=0.05, emissive="#0ea5e9"),
    ]

    gltf = {
        "asset": {"version": "2.0", "generator": "CyberPenguin 2.0 NEAR Shoemaker Builder"},
        "scene": 0,
        "scenes": [{"name": "NearShoemakerScene", "nodes": [0]}],
        "nodes": nodes,
        "meshes": meshes,
        "textures": [{"sampler": 0, "source": 0}],
        "images": [{"bufferView": bv_png, "mimeType": "image/png", "name": "NearSolarAndKaptonAtlas"}],
        "samplers": [{"magFilter": 9729, "minFilter": 9729, "wrapS": 33071, "wrapT": 33071}],
        "materials": materials,
        "buffers": [{"byteLength": len(bin_chunks)}],
        "bufferViews": buffer_views,
        "accessors": accessors,
    }

    json_bytes = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    json_bytes += b" " * ((4 - (len(json_bytes) % 4)) % 4)
    bin_chunks.extend(b"\x00" * ((4 - (len(bin_chunks) % 4)) % 4))

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
        f"verts={total_verts:,}, tris={total_tris:,}, nodes={[n['name'] for n in nodes]}"
    )


if __name__ == "__main__":
    pack_glb()
