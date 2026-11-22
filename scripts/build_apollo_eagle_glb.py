#!/usr/bin/env python3
"""Build a high-craft, realistic 3D glTF 2.0 binary (.glb) model of NASA's
Apollo 11 Lunar Module «Eagle» (LM-5, 1969) for CyberPenguin 2.0 (`assets/models/apollo-eagle.glb`).

Hierarchy (`EagleRoot`):
  - `DescentStage`: Octagonal gold-Kapton MLI insulated descent stage, parabolic titanium
    descent engine bell, dark thermal radiator panels, forward egress porch + 9-rung ladder.
  - `LandingGear`: 4 articulated landing legs (0, 90, 180, 270 deg) with gold saucer footpads
    resting flush at y = 0.000 and contact probes.
  - `AscentStage`: Asymmetric Grumman pressurized cabin in aerospace silver-white aluminum,
    dark aft equipment bay, EVA hatch, 2 canted triangular glossy dark cockpit windows,
    4 quad-nozzle RCS thruster clusters, and top docking collar.
  - `RadarDish`: Steerable white concave S-band high-gain dish antenna with feed tripod,
    rendezvous radar dish, and slender VHF antennas.

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
    "apollo-eagle.glb",
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


def v_add(a, b):
    return (a[0] + b[0], a[1] + b[1], a[2] + b[2])


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


def build_eagle_atlas_png(width=512, height=512):
    """512x512 RGBA PNG texture atlas:
      - Top half (v in [0.0, 0.5]): Crinkled 24K Gold / Amber Kapton MLI foil + seam strips
      - Bottom half (v in [0.5, 1.0]): Brushed aerospace silver-white aluminum hull plates
    """
    buf = bytearray(width * height * 4)
    c_gold_mid = hex_srgb("#f59e0b")
    c_gold_hi = hex_srgb("#fef08a")
    c_gold_deep = hex_srgb("#92400e")
    c_gold_dark = hex_srgb("#451a03")

    c_alu_light = hex_srgb("#f1f5f9")
    c_alu_mid = hex_srgb("#cbd5e1")
    c_alu_seam = hex_srgb("#64748b")

    half_h = height // 2

    for py in range(half_h):
        v = py / float(max(1, half_h - 1))
        for px in range(width):
            u = px / float(max(1, width - 1))
            # Multi-frequency crinkled foil creases
            c1 = math.sin((u * 13.0 + v * 7.0 + 0.4 * math.cos(u * 23.0 - v * 19.0)) * math.pi)
            c2 = math.cos((u * 29.0 - v * 17.0 + 0.3 * math.sin(v * 31.0)) * math.pi)
            c3 = math.sin((u * 47.0 + v * 41.0) * math.pi)
            crinkle = 0.5 + 0.25 * c1 + 0.16 * c2 + 0.09 * c3
            col = mix_col(c_gold_deep, c_gold_mid, clamp(crinkle * 1.1, 0.0, 1.0))
            if crinkle > 0.62:
                col = mix_col(col, c_gold_hi, clamp((crinkle - 0.62) / 0.38, 0.0, 0.85))
            # Quilted Kapton tape panel seams
            su = abs(math.sin(u * math.pi * 8.0))
            sv = abs(math.sin(v * math.pi * 4.0))
            seam = (1.0 - smoothstep(0.0, 0.08, su)) * 0.5 + (1.0 - smoothstep(0.0, 0.10, sv)) * 0.45
            col = mix_col(col, c_gold_dark, clamp(seam, 0.0, 0.65))

            idx = (py * width + px) * 4
            buf[idx] = int(round(clamp(col[0], 0.0, 1.0) * 255))
            buf[idx + 1] = int(round(clamp(col[1], 0.0, 1.0) * 255))
            buf[idx + 2] = int(round(clamp(col[2], 0.0, 1.0) * 255))
            buf[idx + 3] = 255

    for py in range(half_h, height):
        v = (py - half_h) / float(max(1, height - half_h - 1))
        for px in range(width):
            u = px / float(max(1, width - 1))
            brush = 0.5 + 0.25 * math.sin(u * 18.0 + v * 6.0) + 0.15 * math.cos(v * 95.0)
            col = mix_col(c_alu_mid, c_alu_light, clamp(brush, 0.0, 1.0))
            gu = abs(math.sin(u * math.pi * 6.0))
            gv = abs(math.sin(v * math.pi * 4.0))
            if gu < 0.045 or gv < 0.05:
                col = mix_col(col, c_alu_seam, 0.55)

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
                if len(res) == 2:
                    p, uv = res
                else:
                    p = res
                    uv = (c / float(cols), v)
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
        self.add_surface(pos_list, fixed_tris, uv_list=uv_list, custom_normals=norms, interior_ref=None)

    def add_squircle_box(self, cx, cy, cz, sx, sy, sz, power=3.6, rows=14, cols=28, uv_fn=None):
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
                return pt, uv_fn(u, v, dx, dy, dz)
            return pt, (u, v)

        self.add_grid_surface(rows, cols, eval_fn, wrap_u=True, close_poles=True, interior_ref=(cx, cy, cz))

    def add_prism_y(self, cx, y0, y1, r_fn, n_sides=8, height_segs=2, uv_fn=None, cap_bottom=True, cap_top=True):
        mid = (cx, (y0 + y1) * 0.5, 0.0)
        self_cy = (y0 + y1) * 0.5

        def eval_side(u, v):
            ang = u * math.pi * 2.0
            y = y0 + (y1 - y0) * v
            rx, rz = r_fn(ang, v)
            pt = (cx + rx, y, rz)
            uv = uv_fn(u, v) if uv_fn else (u, v)
            return pt, uv

        # Note: pass flat-faceted or smooth normals depending on sides
        if n_sides <= 12:
            # Explicit crisp chamfered faces
            pos_list = []
            tris = []
            uv_list = []
            for i in range(n_sides):
                a0 = (i / float(n_sides)) * math.pi * 2.0
                a1 = ((i + 1) / float(n_sides)) * math.pi * 2.0
                x0b, z0b = r_fn(a0, 0.0)
                x1b, z1b = r_fn(a1, 0.0)
                x0t, z0t = r_fn(a0, 1.0)
                x1t, z1t = r_fn(a1, 1.0)
                idx = len(pos_list)
                pos_list.extend([
                    (cx + x0b, y0, z0b),
                    (cx + x1b, y0, z1b),
                    (cx + x1t, y1, z1t),
                    (cx + x0t, y1, z0t),
                ])
                if uv_fn:
                    uv_list.extend([
                        uv_fn(i / n_sides, 0.0),
                        uv_fn((i + 1) / n_sides, 0.0),
                        uv_fn((i + 1) / n_sides, 1.0),
                        uv_fn(i / n_sides, 1.0),
                    ])
                else:
                    uv_list.extend([(0, 0), (1, 0), (1, 1), (0, 1)])
                tris.extend([(idx, idx + 1, idx + 2), (idx, idx + 2, idx + 3)])
            self.add_surface(pos_list, tris, uv_list=uv_list, interior_ref=(cx, self_cy, 0.0))
        else:
            self.add_grid_surface(height_segs, n_sides, eval_side, wrap_u=True, close_poles=False, interior_ref=(cx, self_cy, 0.0))

        for is_top, flag in ((False, cap_bottom), (True, cap_top)):
            if not flag:
                continue
            y = y1 if is_top else y0
            v = 1.0 if is_top else 0.0
            norm = (0.0, 1.0 if is_top else -1.0, 0.0)
            pos = [(cx, y, 0.0)]
            norms = [norm]
            uvs = [uv_fn(0.5, v) if uv_fn else (0.5, 0.5)]
            for i in range(n_sides):
                ang = (i / float(n_sides)) * math.pi * 2.0
                rx, rz = r_fn(ang, v)
                pos.append((cx + rx, y, rz))
                norms.append(norm)
                uvs.append(uv_fn(i / n_sides, v) if uv_fn else (0.5 + 0.4 * math.cos(ang), 0.5 + 0.4 * math.sin(ang)))
            tris = [(0, 1 + i, 1 + (i + 1) % n_sides) for i in range(n_sides)]
            self.add_surface(pos, tris, uv_list=uvs, custom_normals=norms, interior_ref=(cx, self_cy, 0.0))

    def add_cylinder(self, p0, p1, r0, r1, radial_segs=16, height_segs=1, cap_start=True, cap_end=True, uv_v=0.25):
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
            pt = (
                p0[0] + axis[0] * v + (t1[0] * ca + t2[0] * sa) * r,
                p0[1] + axis[1] * v + (t1[1] * ca + t2[1] * sa) * r,
                p0[2] + axis[2] * v + (t1[2] * ca + t2[2] * sa) * r,
            )
            return pt, (u, uv_v)

        def cyl_interior(tri_pts):
            c_pt = (
                (tri_pts[0][0] + tri_pts[1][0] + tri_pts[2][0]) / 3.0,
                (tri_pts[0][1] + tri_pts[1][1] + tri_pts[2][1]) / 3.0,
                (tri_pts[0][2] + tri_pts[1][2] + tri_pts[2][2]) / 3.0,
            )
            t = clamp(v_dot(v_sub(c_pt, p0), axis) / max(1e-9, v_dot(axis, axis)), 0.0, 1.0)
            return (p0[0] + axis[0] * t, p0[1] + axis[1] * t, p0[2] + axis[2] * t)

        self.add_grid_surface(height_segs, radial_segs, eval_side, wrap_u=True, close_poles=False, interior_ref=cyl_interior)

        for pt_cap, r_cap, n_dir, do_cap in ((p0, r0, (-ax[0], -ax[1], -ax[2]), cap_start), (p1, r1, ax, cap_end)):
            if not do_cap or r_cap <= 1e-6:
                continue
            pos = [pt_cap]
            norms = [n_dir]
            uvs = [(0.5, uv_v)]
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


# Materials
MAT_GOLD_KAPTON = 0     # Gold Kapton MLI texture (top half atlas)
MAT_ALU_SKIN = 1        # Brushed white/silver aerospace hull (bottom half atlas)
MAT_ALU_BRIGHT = 2      # Struts, ladder, plaque
MAT_DARK_TITANIUM = 3   # Engine bell, RCS quads, aft equipment bay, EVA hatch
MAT_COCKPIT_GLASS = 4   # Dark reflective LM triangular cockpit windows
MAT_DISH_WHITE = 5      # Parabolic radar dish interior

def new_mbs():
    return {i: MeshBuilder() for i in range(6)}


def kapton_uv(u, v):
    return (clamp(u, 0.02, 0.98), clamp(0.03 + v * 0.44, 0.02, 0.48))


def alu_uv(u, v):
    return (clamp(u, 0.02, 0.98), clamp(0.53 + v * 0.44, 0.52, 0.98))


def build_descent_stage():
    mbs = new_mbs()
    # Main octagonal Kapton descent body: y = 0.56 .. 1.14, outer radius 0.78 rotated by 22.5 deg so flat faces face +X, -X, +Z, -Z
    def oct_r(ang, v):
        r = 0.78
        a = ang + math.pi / 8.0
        return r * math.cos(a), r * math.sin(a)

    mbs[MAT_GOLD_KAPTON].add_prism_y(0.0, 0.56, 1.14, oct_r, n_sides=8, uv_fn=kapton_uv)
    # Recessed black/dark radiator panels on 4 cardinal flat faces
    for k in range(4):
        ang = k * math.pi * 0.5
        nx, nz = math.sin(ang), math.cos(ang)
        if k == 0:
            # +Z front face thermal cutouts
            mbs[MAT_DARK_TITANIUM].add_squircle_box(-0.32, 0.86, 0.70, 0.18, 0.34, 0.06, power=4.5, rows=6, cols=10)
            mbs[MAT_DARK_TITANIUM].add_squircle_box(0.32, 0.86, 0.70, 0.18, 0.34, 0.06, power=4.5, rows=6, cols=10)
        elif k != 2:
            mbs[MAT_DARK_TITANIUM].add_squircle_box(nx * 0.70, 0.85, nz * 0.70, 0.06 if abs(nx) > 0.5 else 0.38, 0.36, 0.38 if abs(nx) > 0.5 else 0.06, power=4.5, rows=6, cols=10)

    # Top deck ring adapter & descent engine nozzle bell underneath
    mbs[MAT_DARK_TITANIUM].add_cylinder((0.0, 0.58, 0.0), (0.0, 0.22, 0.0), 0.14, 0.35, radial_segs=24, height_segs=4, cap_start=True, cap_end=False)
    mbs[MAT_ALU_BRIGHT].add_cylinder((0.0, 0.23, 0.0), (0.0, 0.21, 0.0), 0.36, 0.34, radial_segs=24, height_segs=1, cap_start=False, cap_end=False)

    # Forward Egress Porch (+Z deck at y = 1.12) and porch handrails
    mbs[MAT_ALU_BRIGHT].add_squircle_box(0.0, 1.13, 0.86, 0.42, 0.04, 0.28, power=4.5, rows=6, cols=12)
    mbs[MAT_ALU_BRIGHT].add_cylinder((-0.20, 1.13, 0.98), (-0.20, 1.38, 0.98), 0.012, 0.012, radial_segs=8)
    mbs[MAT_ALU_BRIGHT].add_cylinder((0.20, 1.13, 0.98), (0.20, 1.38, 0.98), 0.012, 0.012, radial_segs=8)
    mbs[MAT_ALU_BRIGHT].add_cylinder((-0.20, 1.38, 0.98), (-0.20, 1.38, 0.70), 0.012, 0.012, radial_segs=8)
    mbs[MAT_ALU_BRIGHT].add_cylinder((0.20, 1.38, 0.98), (0.20, 1.38, 0.70), 0.012, 0.012, radial_segs=8)

    # Apollo 11 commemorative plaque on front (+Z) leg mount area
    mbs[MAT_ALU_BRIGHT].add_squircle_box(0.0, 0.82, 0.76, 0.22, 0.14, 0.03, power=5.0, rows=4, cols=8)
    return mbs


def build_landing_gear():
    mbs = new_mbs()
    # 4 legs at +Z (0°), +X (90°), -Z (180°), -X (270°)
    for idx in range(4):
        ang = idx * (math.pi * 0.5)
        dx, dz = math.sin(ang), math.cos(ang)
        px, pz = -dz, dx  # tangent in XZ

        top_out = (dx * 0.73, 1.07, dz * 0.73)
        pad_top = (dx * 1.24, 0.055, dz * 1.24)
        mid_brace = (dx * 1.00, 0.52, dz * 1.00)

        # Primary telescopic strut (gold upper sheath + brushed silver lower piston)
        mid_piston = (
            top_out[0] + (pad_top[0] - top_out[0]) * 0.52,
            top_out[1] + (pad_top[1] - top_out[1]) * 0.52,
            top_out[2] + (pad_top[2] - top_out[2]) * 0.52,
        )
        mbs[MAT_GOLD_KAPTON].add_cylinder(top_out, mid_piston, 0.044, 0.042, radial_segs=14, uv_v=0.25)
        mbs[MAT_ALU_BRIGHT].add_cylinder(mid_piston, pad_top, 0.030, 0.028, radial_segs=14)

        # Upper & lower A-frame diagonal structural trusses
        mbs[MAT_GOLD_KAPTON].add_cylinder((dx * 0.68 + px * 0.26, 0.65, dz * 0.68 + pz * 0.26), mid_brace, 0.022, 0.020, radial_segs=10, uv_v=0.25)
        mbs[MAT_GOLD_KAPTON].add_cylinder((dx * 0.68 - px * 0.26, 0.65, dz * 0.68 - pz * 0.26), mid_brace, 0.022, 0.020, radial_segs=10, uv_v=0.25)
        mbs[MAT_ALU_BRIGHT].add_cylinder((dx * 0.68 + px * 0.26, 1.06, dz * 0.68 + pz * 0.26), top_out, 0.020, 0.020, radial_segs=10)
        mbs[MAT_ALU_BRIGHT].add_cylinder((dx * 0.68 - px * 0.26, 1.06, dz * 0.68 - pz * 0.26), top_out, 0.020, 0.020, radial_segs=10)

        # Wide saucer footpad resting cleanly on y = 0.000
        pad_c = (dx * 1.24, 0.0, dz * 1.24)
        pad_rim = (dx * 1.24, 0.062, dz * 1.24)
        mbs[MAT_GOLD_KAPTON].add_cylinder(pad_c, pad_rim, 0.225, 0.245, radial_segs=24, height_segs=2, uv_v=0.25)
        # Joint ball cap at footpad center
        mbs[MAT_ALU_BRIGHT].add_squircle_box(dx * 1.24, 0.065, dz * 1.24, 0.11, 0.07, 0.11, power=2.2, rows=8, cols=12)

        # Slender lunar contact probe rod attached near footpad edge
        mbs[MAT_ALU_BRIGHT].add_cylinder(
            (dx * 1.40, 0.000, dz * 1.40),
            (dx * 1.32, 0.30, dz * 1.32),
            0.008,
            0.008,
            radial_segs=8,
        )

        # Front 9-rung crew boarding ladder on leg 0 (+Z)
        if idx == 0:
            ladder_bot = (dx * 1.15, 0.25, dz * 1.15)
            ladder_top = (dx * 0.84, 1.04, dz * 0.84)
            for s in (-0.11, 0.11):
                mbs[MAT_ALU_BRIGHT].add_cylinder(
                    (ladder_bot[0] + px * s, ladder_bot[1], ladder_bot[2] + pz * s),
                    (ladder_top[0] + px * s, ladder_top[1], ladder_top[2] + pz * s),
                    0.012,
                    0.012,
                    radial_segs=8,
                )
            for r_i in range(9):
                t = r_i / 8.0
                ry = ladder_bot[1] + (ladder_top[1] - ladder_bot[1]) * t
                rz = ladder_bot[2] + (ladder_top[2] - ladder_bot[2]) * t
                rx = ladder_bot[0] + (ladder_top[0] - ladder_bot[0]) * t
                mbs[MAT_ALU_BRIGHT].add_cylinder(
                    (rx - px * 0.11, ry, rz - pz * 0.11),
                    (rx + px * 0.11, ry, rz + pz * 0.11),
                    0.009,
                    0.009,
                    radial_segs=8,
                )
    return mbs


def build_ascent_stage():
    mbs = new_mbs()
    # Grumman asymmetric pressurized crew cabin in aerospace silver-white aluminum
    # Forward cabin barrel aligned along Z (horizontal cylinder look on +Z)
    mbs[MAT_ALU_SKIN].add_squircle_box(0.0, 1.50, 0.18, 0.84, 0.70, 0.78, power=2.8, rows=16, cols=32, uv_fn=lambda u, v, *_: alu_uv(u, v))
    # Upper faceted cockpit visor brow
    mbs[MAT_ALU_SKIN].add_squircle_box(0.0, 1.72, 0.24, 0.72, 0.34, 0.62, power=3.4, rows=12, cols=24, uv_fn=lambda u, v, *_: alu_uv(u, v))
    # Aft equipment bay (-Z) in dark thermal slate/titanium + gold Kapton underside skirt
    mbs[MAT_DARK_TITANIUM].add_squircle_box(0.0, 1.54, -0.34, 0.76, 0.60, 0.50, power=3.6, rows=12, cols=24)
    mbs[MAT_GOLD_KAPTON].add_squircle_box(0.0, 1.20, 0.0, 0.88, 0.16, 0.92, power=3.8, rows=8, cols=20, uv_fn=lambda u, v, *_: kapton_uv(u, v))

    # Left & Right spherical propellant tank cheek blisters
    mbs[MAT_ALU_SKIN].add_squircle_box(-0.48, 1.46, 0.04, 0.40, 0.48, 0.56, power=2.4, rows=12, cols=24, uv_fn=lambda u, v, *_: alu_uv(u, v))
    mbs[MAT_ALU_SKIN].add_squircle_box(0.48, 1.46, 0.04, 0.40, 0.48, 0.56, power=2.4, rows=12, cols=24, uv_fn=lambda u, v, *_: alu_uv(u, v))

    # Forward square EVA egress hatch on +Z cabin chest (y = 1.32, z = 0.58)
    mbs[MAT_DARK_TITANIUM].add_squircle_box(0.0, 1.33, 0.58, 0.26, 0.26, 0.06, power=5.0, rows=6, cols=12)
    mbs[MAT_ALU_BRIGHT].add_squircle_box(0.0, 1.33, 0.61, 0.18, 0.18, 0.02, power=5.0, rows=4, cols=8)

    # 2 Iconic Grumman canted triangular cockpit windows in dark glossy quartz glass
    for sx in (-1.0, 1.0):
        # Triangle vertices facing forward-outward (+Z, ±X)
        w_pos = [
            (sx * 0.07, 1.66, 0.59),
            (sx * 0.27, 1.55, 0.55),
            (sx * 0.28, 1.73, 0.48),
            # Slightly proud frame thickness
            (sx * 0.07, 1.66, 0.57),
            (sx * 0.27, 1.55, 0.53),
            (sx * 0.28, 1.73, 0.46),
        ]
        w_tris = [(0, 2, 1) if sx < 0 else (0, 1, 2)]
        w_norms = [(sx * 0.25, 0.12, 0.96)] * 3 + [(sx * 0.25, 0.12, 0.96)] * 3
        mbs[MAT_COCKPIT_GLASS].add_surface(w_pos[:3], w_tris, custom_normals=w_norms[:3])

    # Top docking tunnel & EVA top hatch collar
    mbs[MAT_ALU_BRIGHT].add_cylinder((0.0, 1.84, 0.04), (0.0, 1.95, 0.04), 0.22, 0.20, radial_segs=24)
    mbs[MAT_DARK_TITANIUM].add_cylinder((0.0, 1.95, 0.04), (0.0, 1.97, 0.04), 0.17, 0.17, radial_segs=20)

    # 4 Quad-nozzle RCS thruster clusters mounted on outrigger booms at corners
    for sx in (-1.0, 1.0):
        for sz, zc in ((1.0, 0.42), (-1.0, -0.32)):
            qx = sx * 0.58
            qy = 1.66
            mbs[MAT_ALU_BRIGHT].add_cylinder((sx * 0.36, 1.64, zc), (qx, qy, zc), 0.028, 0.028, radial_segs=10)
            mbs[MAT_DARK_TITANIUM].add_cylinder((qx, qy - 0.045, zc), (qx, qy + 0.045, zc), 0.055, 0.055, radial_segs=14)
            # 4 miniature thruster cones (up, down, outward X, fore/aft Z)
            mbs[MAT_ALU_BRIGHT].add_cylinder((qx, qy + 0.04, zc), (qx, qy + 0.11, zc), 0.015, 0.028, radial_segs=10, cap_end=False)
            mbs[MAT_ALU_BRIGHT].add_cylinder((qx, qy - 0.04, zc), (qx, qy - 0.11, zc), 0.015, 0.028, radial_segs=10, cap_end=False)
            mbs[MAT_ALU_BRIGHT].add_cylinder((qx + sx * 0.04, qy, zc), (qx + sx * 0.11, qy, zc), 0.015, 0.028, radial_segs=10, cap_end=False)
            mbs[MAT_ALU_BRIGHT].add_cylinder((qx, qy, zc + sz * 0.04), (qx, qy, zc + sz * 0.11), 0.015, 0.028, radial_segs=10, cap_end=False)

    return mbs


def add_parabolic_dish(mbs, cx, cy, cz, radius, depth, tilt_x=0.35, tilt_y=-0.25):
    # Orient dish facing toward +Z tilted up (+Y)
    ax = v_norm((math.sin(tilt_y), math.sin(tilt_x), math.cos(tilt_x) * math.cos(tilt_y)))
    ref = (0.0, 1.0, 0.0) if abs(ax[1]) < 0.9 else (1.0, 0.0, 0.0)
    t1 = v_norm(v_cross(ax, ref))
    t2 = v_norm(v_cross(ax, t1))

    # Concave front dish (DISH_WHITE) + convex aluminum backing shell (ALU_BRIGHT)
    def make_dish_half(is_front):
        def eval_fn(u, v):
            ang = u * math.pi * 2.0
            rr = radius * v
            d_parab = depth * (v * v) + (0.0 if is_front else -0.018 * (1.0 - 0.35 * v * v))
            ca, sa = math.cos(ang), math.sin(ang)
            pt = (
                cx + ax[0] * d_parab + (t1[0] * ca + t2[0] * sa) * rr,
                cy + ax[1] * d_parab + (t1[1] * ca + t2[1] * sa) * rr,
                cz + ax[2] * d_parab + (t1[2] * ca + t2[2] * sa) * rr,
            )
            return pt, (u, v)

        # Interior ref sits behind front face (-ax) for concave front or in front (+ax) for back shell
        offset_dir = -1.5 if is_front else 0.8
        ref_pt = (cx + ax[0] * offset_dir, cy + ax[1] * offset_dir, cz + ax[2] * offset_dir)
        mbs[MAT_DISH_WHITE if is_front else MAT_ALU_BRIGHT].add_grid_surface(
            8, 28, eval_fn, wrap_u=True, close_poles=True, interior_ref=ref_pt
        )

    make_dish_half(True)
    make_dish_half(False)

    # Central feed horn tip on slender tripod
    feed = (cx + ax[0] * (radius * 0.56), cy + ax[1] * (radius * 0.56), cz + ax[2] * (radius * 0.56))
    for k in range(3):
        ang = k * (math.pi * 2.0 / 3.0)
        rim_p = (
            cx + ax[0] * depth * 0.78 + (t1[0] * math.cos(ang) + t2[0] * math.sin(ang)) * radius * 0.78,
            cy + ax[1] * depth * 0.78 + (t1[1] * math.cos(ang) + t2[1] * math.sin(ang)) * radius * 0.78,
            cz + ax[2] * depth * 0.78 + (t1[2] * math.cos(ang) + t2[2] * math.sin(ang)) * radius * 0.78,
        )
        mbs[MAT_DARK_TITANIUM].add_cylinder(rim_p, feed, 0.008, 0.007, radial_segs=8)
    mbs[MAT_GOLD_KAPTON].add_squircle_box(feed[0], feed[1], feed[2], 0.055, 0.055, 0.055, power=2.4, rows=6, cols=10, uv_fn=lambda *_: (0.25, 0.25))


def build_radar_dish():
    mbs = new_mbs()
    # S-band steerable high-gain parabolic dish above forward roof
    mbs[MAT_ALU_BRIGHT].add_cylinder((0.18, 1.84, 0.22), (0.22, 2.08, 0.28), 0.022, 0.018, radial_segs=10)
    add_parabolic_dish(mbs, 0.22, 2.10, 0.29, radius=0.25, depth=0.075, tilt_x=0.45, tilt_y=0.35)

    # Rendezvous radar dish on left roof shoulder
    mbs[MAT_ALU_BRIGHT].add_cylinder((-0.24, 1.84, 0.34), (-0.26, 2.02, 0.38), 0.018, 0.016, radial_segs=10)
    add_parabolic_dish(mbs, -0.26, 2.04, 0.39, radius=0.14, depth=0.042, tilt_x=0.70, tilt_y=-0.20)

    # Two VHF omnidirectional antennas
    mbs[MAT_ALU_BRIGHT].add_cylinder((-0.28, 1.84, -0.08), (-0.34, 2.22, -0.10), 0.009, 0.005, radial_segs=8)
    mbs[MAT_ALU_BRIGHT].add_cylinder((0.30, 1.84, -0.06), (0.36, 2.18, -0.08), 0.009, 0.005, radial_segs=8)
    return mbs


def pack_glb():
    atlas_png = build_eagle_atlas_png(512, 512)
    node_builders = [
        ("DescentStage", build_descent_stage()),
        ("LandingGear", build_landing_gear()),
        ("AscentStage", build_ascent_stage()),
        ("RadarDish", build_radar_dish()),
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
    nodes = [{"name": "EagleRoot", "children": [1, 2, 3, 4], "translation": [0.0, 0.0, 0.0]}]
    for idx_m, (node_name, mbs) in enumerate(node_builders):
        prims = []
        for mat_idx, mb in sorted(mbs.items(), key=lambda x: x[0]):
            if mb.indices:
                prims.append(append_prim(mb, mat_idx, include_uv=(mat_idx in (MAT_GOLD_KAPTON, MAT_ALU_SKIN))))
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
        # 0: MAT_GOLD_KAPTON (textured with crinkled 24K gold Kapton atlas + subtle warm self-glow so shadows read rich)
        {
            "name": "EagleGoldKaptonMLI",
            "doubleSided": False,
            "pbrMetallicRoughness": {
                "baseColorFactor": [1.0, 0.96, 0.78, 1.0],
                "baseColorTexture": {"index": 0},
                "roughnessFactor": 0.28,
                "metallicFactor": 0.18,
            },
            "emissiveFactor": [0.09, 0.06, 0.01],
        },
        # 1: MAT_ALU_SKIN (textured aerospace satin aluminum hull plates)
        {
            "name": "EagleAscentAluminumSkin",
            "doubleSided": False,
            "pbrMetallicRoughness": {
                "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
                "baseColorTexture": {"index": 0},
                "roughnessFactor": 0.34,
                "metallicFactor": 0.16,
            },
        },
        # 2: MAT_ALU_BRIGHT
        make_pbr("EagleMachinedAluminum", "#e2e8f0", rough=0.30, metal=0.16),
        # 3: MAT_DARK_TITANIUM
        make_pbr("EagleDarkTitaniumBay", "#334155", rough=0.48, metal=0.14),
        # 4: MAT_COCKPIT_GLASS
        make_pbr("EagleCockpitQuartzGlass", "#0b1628", rough=0.08, metal=0.12, emissive="#071226"),
        # 5: MAT_DISH_WHITE
        make_pbr("EagleRadarDishWhite", "#f8fafc", rough=0.38, metal=0.06),
    ]

    gltf = {
        "asset": {"version": "2.0", "generator": "CyberPenguin 2.0 Apollo 11 Eagle Builder"},
        "scene": 0,
        "scenes": [{"name": "ApolloEagleScene", "nodes": [0]}],
        "nodes": nodes,
        "meshes": meshes,
        "textures": [{"sampler": 0, "source": 0}],
        "images": [{"bufferView": bv_png, "mimeType": "image/png", "name": "ApolloEagleFoilAndSkinAtlas"}],
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
