#!/usr/bin/env python3
"""Build a high-craft, realistic yet endearing 3D glTF 2.0 binary (.glb) model of
NASA's Mars Pathfinder Sojourner Rover (Microrover Flight Experiment - MFEX, 1997)
for CyberPenguin 2.0 (`assets/models/sojourner.glb`).

Authentic NASA/JPL Engineering Features & Geometry:
  1. Warm Electronics Box (WEB): Gold Kapton thermal blanket enclosure with G2-rounded
     squircle chamfers, thermal quilting seams, and brushed aluminum structural frame.
  2. Flat GaAs (Gallium Arsenide) Top Solar Array Panel: Embedded 512x512 PNG texture
     atlas with 3 photovoltaic cell strings (13x18 sub-cell blocks), silver interconnect
     busbars, and gold/cobalt trim over a beveled composite deck.
  3. Articulated Rocker-Bogie 6-Wheel Suspension: Differential pivot, tubular titanium
     rocker and bogie links, cross-chassis differential bar, and 4 corner C-channel
     steering yokes.
  4. 6 Machined Aluminum Wheels (`WheelFL`, `WheelML`, `WheelRL`, `WheelFR`, `WheelMR`,
     `WheelRR`): Each with 14 raised 3D stainless-steel traction cleats (grousers),
     recessed dark-anodized hub, and cobalt-blue drive cap. Bottom of all 6 wheels
     rests accurately at y = 0.000.
  5. Front Stereo CCD Cameras & 5 Red Laser Stripe Hazard Projectors (+Z front face):
     Twin optical barrels with coated cyan lenses and 5 ruby-red laser projectors.
  6. Rear Deployed APXS (Alpha Proton X-Ray Spectrometer - "nariz robótica", -Z rear):
     Articulated parallel deployment linkage and cylindrical gold/copper sensor head
     with contact ring (`APXSArm` node).
  7. Rear UHF Monopole Whip Antenna (`Antenna` node) with spring base and amber beacon tip.

Coordinate Convention (matching `cyberpenguin.glb`):
  - +Z : Rover Front (stereo cameras & 5 laser projectors)
  - -Z : Rover Rear (deployed APXS spectrometer & UHF antenna)
  - +Y : Up (wheel treads rest on y = 0.000)
  - ±X : Left (+X) / Right (-X) Rocker-Bogie suspension & wheels

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
    "sojourner.glb",
)


def clamp(v, lo, hi):
    return lo if v < lo else hi if v > hi else v


def smoothstep_g2(edge0, edge1, x):
    """Quintic C^2 / G^2 smoothstep: 6t^5 - 15t^4 + 10t^3."""
    if edge1 == edge0:
        return 0.0
    t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0)


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


def v_scale(a, s):
    return (a[0] * s, a[1] * s, a[2] * s)


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


def build_sojourner_atlas_png(width=512, height=512):
    """Build a 512x512 RGBA PNG texture atlas for Sojourner's GaAs solar panel deck
    (top 75% of atlas, v in [0.0, 0.75]) and gold Kapton quilted WEB blanket
    (bottom 25% of atlas, v in [0.75, 1.0]).
    """
    buf = bytearray(width * height * 4)

    c_frame_alu = hex_srgb("#cbd5e1")
    c_substrate = hex_srgb("#0d1527")
    c_cell_deep = hex_srgb("#0f2557")
    c_cell_mid = hex_srgb("#1d4ed8")
    c_cell_bright = hex_srgb("#2563eb")
    c_cell_glint = hex_srgb("#60a5fa")
    c_busbar_silver = hex_srgb("#e2e8f0")
    c_busbar_gold = hex_srgb("#f59e0b")

    c_kapton_base = hex_srgb("#eab308")
    c_kapton_hi = hex_srgb("#fde047")
    c_kapton_shadow = hex_srgb("#b45309")

    solar_h = int(height * 0.75)

    for py in range(solar_h):
        v = py / float(max(1, solar_h - 1))
        for px in range(width):
            u = px / float(max(1, width - 1))

            # Outer aluminum bezel around solar deck
            margin_u = 0.045
            margin_v = 0.050
            if u < margin_u or u > 1.0 - margin_u or v < margin_v or v > 1.0 - margin_v:
                bevel = 1.0 - 0.15 * math.sin((u + v) * math.pi * 2.0)
                col = (
                    clamp(c_frame_alu[0] * bevel, 0.0, 1.0),
                    clamp(c_frame_alu[1] * bevel, 0.0, 1.0),
                    clamp(c_frame_alu[2] * bevel, 0.0, 1.0),
                )
            else:
                su = (u - margin_u) / (1.0 - 2.0 * margin_u)
                sv = (v - margin_v) / (1.0 - 2.0 * margin_v)

                # Gold perimeter busbar trace
                if su < 0.018 or su > 0.982 or sv < 0.018 or sv > 0.982:
                    col = c_busbar_gold
                else:
                    # 3 main longitudinal cell strings across width (X), 16 cell rows along length (Z)
                    cu = (su - 0.018) / 0.964
                    cv = (sv - 0.018) / 0.964

                    # Inter-string gaps at cu = 1/3 and 2/3
                    d_str1 = abs(cu - 0.3333)
                    d_str2 = abs(cu - 0.6667)
                    if d_str1 < 0.010 or d_str2 < 0.010:
                        col = c_busbar_gold if (d_str1 < 0.0045 or d_str2 < 0.0045) else c_substrate
                    else:
                        # 12 columns of GaAs cells across X, 16 rows along Z
                        col_f = cu * 12.0
                        row_f = cv * 16.0
                        fx = col_f - math.floor(col_f)
                        fy = row_f - math.floor(row_f)

                        if fx < 0.075 or fx > 0.925 or fy < 0.085 or fy > 0.915:
                            # Silver interconnect grid between cells
                            col = c_busbar_silver
                        else:
                            # Inside an individual GaAs photovoltaic cell
                            diag = 0.5 + 0.5 * math.sin((cu * 1.4 + cv * 1.1) * math.pi)
                            cell_col = mix_col(c_cell_deep, c_cell_mid, 0.35 + 0.55 * diag)
                            glint = max(0.0, math.sin((cu * 2.5 - cv * 1.8) * math.pi)) ** 3
                            cell_col = mix_col(cell_col, c_cell_bright, glint * 0.55)
                            cell_col = mix_col(cell_col, c_cell_glint, (glint ** 2) * 0.25)

                            # Fine internal micro-grid fingers inside cell
                            if abs(fx - 0.5) < 0.018:
                                cell_col = mix_col(cell_col, c_busbar_silver, 0.65)
                            col = cell_col

            idx = (py * width + px) * 4
            buf[idx] = int(round(clamp(col[0], 0.0, 1.0) * 255))
            buf[idx + 1] = int(round(clamp(col[1], 0.0, 1.0) * 255))
            buf[idx + 2] = int(round(clamp(col[2], 0.0, 1.0) * 255))
            buf[idx + 3] = 255

    # Bottom 25%: Gold Kapton foil crinkle/quilting texture for the Warm Electronics Box (WEB)
    for py in range(solar_h, height):
        v = (py - solar_h) / float(max(1, height - solar_h - 1))
        for px in range(width):
            u = px / float(max(1, width - 1))
            quilt_u = abs(math.sin(u * math.pi * 12.0))
            quilt_v = abs(math.sin(v * math.pi * 4.0))
            crinkle = 0.5 + 0.3 * math.sin((u * 19.0 + v * 7.0) * math.pi * 2.0) + 0.2 * math.cos((u * 29.0 - v * 11.0) * math.pi * 2.0)
            seam = (1.0 - smoothstep_g2(0.0, 0.14, quilt_u)) * 0.45 + (1.0 - smoothstep_g2(0.0, 0.16, quilt_v)) * 0.35
            col = mix_col(c_kapton_base, c_kapton_hi, clamp(crinkle * 0.55, 0.0, 1.0))
            col = mix_col(col, c_kapton_shadow, clamp(seam, 0.0, 0.75))

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

    def add_squircle_box(self, cx, cy, cz, sx, sy, sz, power=3.2, col=(1.0, 1.0, 1.0), rows=18, cols=36, uv_fn=None):
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
MAT_SOLAR_DECK = 0     # GaAs solar array & gold Kapton texture atlas (512x512 PNG)
MAT_GOLD_KAPTON = 1    # Metallic gold Kapton thermal blanket (#eab308)
MAT_ALU_BRIGHT = 2     # Machined aluminum struts, cleats, yokes & rims (#e2e8f0)
MAT_ALU_BRUSHED = 3    # Brushed titanium/aluminum wheel drums & chassis frame (#94a3b8)
MAT_DARK_TITANIUM = 4  # Dark anodized hubs, camera housing, actuators (#1e293b)
MAT_COBALT_NASA = 5    # Anodized cobalt blue hub caps & accents (#2563eb)
MAT_COPPER_APXS = 6    # Copper-bronze APXS spectrometer sensor head (#d97706)
MAT_CYAN_LENS = 7      # Emissive/glossy cyan stereo camera lenses (#38bdf8)
MAT_RED_LASER = 8      # Emissive ruby-red laser hazard projectors (#ef4444)
MAT_AMBER_BEACON = 9   # Emissive amber UHF antenna tip (#f59e0b)

C_WHITE = (1.0, 1.0, 1.0)

# Wheel center coordinates: radius = 0.068 m (13.6 cm diameter), so center at y = 0.068 rests on y = 0.000
WHEEL_RADIUS = 0.068
WHEEL_WIDTH = 0.076
WHEEL_X = 0.214
WHEEL_Z_FRONT = 0.228
WHEEL_Z_MID = -0.008
WHEEL_Z_REAR = -0.224


def build_chassis_primitives():
    """Node 1 (`Chassis`): Warm Electronics Box (WEB), GaAs Solar Panel Deck,
    Rocker-Bogie suspension struts, 4 C-channel steering yokes, and Front Stereo
    Cameras + 5 Laser Stripe Projectors.
    """
    mbs = {
        MAT_SOLAR_DECK: MeshBuilder(),
        MAT_GOLD_KAPTON: MeshBuilder(),
        MAT_ALU_BRIGHT: MeshBuilder(),
        MAT_ALU_BRUSHED: MeshBuilder(),
        MAT_DARK_TITANIUM: MeshBuilder(),
        MAT_COBALT_NASA: MeshBuilder(),
        MAT_CYAN_LENS: MeshBuilder(),
        MAT_RED_LASER: MeshBuilder(),
    }

    # 1. Warm Electronics Box (WEB) - Gold Kapton thermal enclosure
    # Mapped to the bottom 25% of the texture atlas (v in [0.76, 0.99]) plus metallic gold Kapton trim
    def web_uv(u, v, dx, dy, dz):
        return (u, 0.76 + clamp((dy + 1.0) * 0.5, 0.02, 0.98) * 0.22)

    mbs[MAT_GOLD_KAPTON].add_squircle_box(
        0.0,
        0.192,
        0.006,
        0.278,
        0.146,
        0.415,
        power=3.5,
        col=C_WHITE,
        rows=20,
        cols=40,
        uv_fn=web_uv,
    )

    # Vertical gold-foil thermal seam ribs along the WEB side walls
    for z_rib in (-0.125, -0.040, 0.045, 0.130):
        mbs[MAT_ALU_BRUSHED].add_squircle_box(
            0.0,
            0.192,
            z_rib,
            0.283,
            0.138,
            0.010,
            power=2.8,
            col=C_WHITE,
            rows=8,
            cols=18,
        )

    # Dark titanium lower chassis skid/base plate
    mbs[MAT_DARK_TITANIUM].add_squircle_box(
        0.0,
        0.120,
        0.006,
        0.256,
        0.022,
        0.395,
        power=3.2,
        col=C_WHITE,
        rows=10,
        cols=24,
    )

    # Upper structural aluminum support frame under the solar deck
    mbs[MAT_ALU_BRIGHT].add_squircle_box(
        0.0,
        0.268,
        0.006,
        0.312,
        0.020,
        0.486,
        power=3.6,
        col=C_WHITE,
        rows=12,
        cols=28,
    )

    # 2. Flat GaAs (Gallium Arsenide) Top Solar Array Panel
    # Top face mapped to the solar cell grid in the PNG texture atlas (v in [0.02, 0.73])
    solar_cx, solar_cy, solar_cz = 0.0, 0.284, 0.008
    solar_sx, solar_sy, solar_sz = 0.344, 0.020, 0.536

    def eval_solar_deck(u, v):
        theta = (u - 0.5) * math.pi * 2.0
        phi = v * math.pi
        sp = math.sin(phi)
        cp = -math.cos(phi)
        st = math.sin(theta)
        ct = math.cos(theta)
        exp_xz = 2.0 / 3.8
        exp_y = 2.0 / 4.5
        sp_e = math.copysign(abs(sp) ** exp_y, sp)
        dy = math.copysign(abs(cp) ** exp_y, cp)
        dx = sp_e * math.copysign(abs(st) ** exp_xz, st)
        dz = sp_e * math.copysign(abs(ct) ** exp_xz, ct)

        # Gentle hexagonal taper at the front and rear corners of the solar deck
        corner_taper = 1.0 - 0.10 * smoothstep_g2(0.65, 1.0, abs(dz))
        px = solar_cx + dx * (solar_sx * 0.5 * corner_taper)
        py = solar_cy + dy * (solar_sy * 0.5)
        pz = solar_cz + dz * (solar_sz * 0.5)

        u_tex = clamp(0.5 + dx * 0.48, 0.01, 0.99)
        v_tex = clamp(0.5 - dz * 0.48, 0.01, 0.99) * 0.74
        return (px, py, pz), C_WHITE, (u_tex, v_tex)

    mbs[MAT_SOLAR_DECK].add_grid_surface(
        22,
        44,
        eval_solar_deck,
        wrap_u=True,
        close_poles=True,
        interior_ref=(solar_cx, solar_cy, solar_cz),
    )

    # 3. Front Stereo CCD Camera Housing & 5 Red Laser Hazard Projectors (+Z front face)
    cam_y = 0.228
    cam_z = 0.218
    mbs[MAT_ALU_BRIGHT].add_squircle_box(
        0.0,
        cam_y,
        cam_z,
        0.168,
        0.056,
        0.042,
        power=3.0,
        col=C_WHITE,
        rows=12,
        cols=24,
    )
    mbs[MAT_DARK_TITANIUM].add_squircle_box(
        0.0,
        cam_y + 0.004,
        cam_z + 0.014,
        0.146,
        0.040,
        0.024,
        power=2.8,
        col=C_WHITE,
        rows=10,
        cols=20,
    )

    # Twin Stereo CCD Camera Barrels & Glowing Cyan Lenses
    for side in (-1.0, 1.0):
        lx = side * 0.042
        ly = cam_y + 0.005
        mbs[MAT_ALU_BRIGHT].add_cylinder(
            (lx, ly, cam_z + 0.018),
            (lx, ly, cam_z + 0.036),
            0.015,
            0.014,
            C_WHITE,
            radial_segs=18,
            height_segs=1,
        )
        mbs[MAT_DARK_TITANIUM].add_cylinder(
            (lx, ly, cam_z + 0.022),
            (lx, ly, cam_z + 0.038),
            0.0115,
            0.0110,
            C_WHITE,
            radial_segs=16,
            height_segs=1,
        )
        mbs[MAT_CYAN_LENS].add_cylinder(
            (lx, ly, cam_z + 0.033),
            (lx, ly, cam_z + 0.040),
            0.0085,
            0.0075,
            C_WHITE,
            radial_segs=16,
            height_segs=1,
        )

    # 5 Red Laser Stripe Projectors arrayed across the lower front brow
    for idx_l, lx in enumerate((-0.056, -0.028, 0.0, 0.028, 0.056)):
        ly = cam_y - 0.016
        mbs[MAT_DARK_TITANIUM].add_cylinder(
            (lx, ly, cam_z + 0.016),
            (lx, ly, cam_z + 0.029),
            0.0065,
            0.0060,
            C_WHITE,
            radial_segs=12,
            height_segs=1,
        )
        mbs[MAT_RED_LASER].add_cylinder(
            (lx, ly, cam_z + 0.025),
            (lx, ly, cam_z + 0.032),
            0.0044,
            0.0038,
            C_WHITE,
            radial_segs=12,
            height_segs=1,
        )

    # 4. Articulated Rocker-Bogie Suspension System (Left +X and Right -X)
    # Cross-chassis differential pivot axle
    mbs[MAT_ALU_BRUSHED].add_cylinder(
        (-0.172, 0.184, 0.018),
        (0.172, 0.184, 0.018),
        0.014,
        0.014,
        C_WHITE,
        radial_segs=16,
        height_segs=2,
    )

    for side in (-1.0, 1.0):
        sx = side * 0.176
        wx = side * WHEEL_X

        # Main differential rocker bearing housing on side of WEB
        mbs[MAT_DARK_TITANIUM].add_cylinder(
            (side * 0.138, 0.184, 0.018),
            (side * 0.188, 0.184, 0.018),
            0.022,
            0.019,
            C_WHITE,
            radial_segs=18,
            height_segs=1,
        )
        mbs[MAT_COBALT_NASA].add_cylinder(
            (side * 0.182, 0.184, 0.018),
            (side * 0.193, 0.184, 0.018),
            0.013,
            0.012,
            C_WHITE,
            radial_segs=14,
            height_segs=1,
        )

        # Front Rocker Arm: Main pivot -> Front elbow -> Front wheel steering kingpin
        p_main_piv = (sx, 0.184, 0.018)
        p_front_elbow = (side * 0.192, 0.162, 0.150)
        p_front_kingpin = (wx, 0.148, WHEEL_Z_FRONT)

        mbs[MAT_ALU_BRIGHT].add_cylinder(p_main_piv, p_front_elbow, 0.0115, 0.0110, C_WHITE, radial_segs=14, height_segs=2)
        mbs[MAT_ALU_BRIGHT].add_cylinder(p_front_elbow, p_front_kingpin, 0.0110, 0.0105, C_WHITE, radial_segs=14, height_segs=2)
        mbs[MAT_DARK_TITANIUM].add_squircle_box(
            p_front_elbow[0], p_front_elbow[1], p_front_elbow[2], 0.026, 0.026, 0.026, power=2.5, col=C_WHITE, rows=8, cols=14
        )

        # Rear Rocker link -> Bogie Pivot Joint
        p_bogie_piv = (side * 0.188, 0.146, -0.112)
        mbs[MAT_ALU_BRIGHT].add_cylinder(p_main_piv, p_bogie_piv, 0.0115, 0.0110, C_WHITE, radial_segs=14, height_segs=2)
        mbs[MAT_DARK_TITANIUM].add_cylinder(
            (side * 0.174, 0.146, -0.112),
            (side * 0.204, 0.146, -0.112),
            0.016,
            0.015,
            C_WHITE,
            radial_segs=16,
            height_segs=1,
        )

        # Bogie Front Strut -> Middle Wheel Hub
        p_mid_top = (wx, 0.125, WHEEL_Z_MID)
        p_mid_hub = (wx, WHEEL_RADIUS, WHEEL_Z_MID)
        mbs[MAT_ALU_BRIGHT].add_cylinder(p_bogie_piv, p_mid_top, 0.0105, 0.0100, C_WHITE, radial_segs=14, height_segs=2)
        mbs[MAT_ALU_BRIGHT].add_cylinder(p_mid_top, p_mid_hub, 0.0100, 0.0095, C_WHITE, radial_segs=14, height_segs=1)

        # Bogie Rear Strut -> Rear Wheel Steering Kingpin
        p_rear_elbow = (side * 0.196, 0.152, -0.188)
        p_rear_kingpin = (wx, 0.148, WHEEL_Z_REAR)
        mbs[MAT_ALU_BRIGHT].add_cylinder(p_bogie_piv, p_rear_elbow, 0.0105, 0.0100, C_WHITE, radial_segs=14, height_segs=2)
        mbs[MAT_ALU_BRIGHT].add_cylinder(p_rear_elbow, p_rear_kingpin, 0.0100, 0.0095, C_WHITE, radial_segs=14, height_segs=1)

        # Corner Steering Yokes & Drive Struts on Front and Rear Wheels
        for z_Steer in (WHEEL_Z_FRONT, WHEEL_Z_REAR):
            # Vertical steering actuator housing at kingpin
            mbs[MAT_DARK_TITANIUM].add_cylinder(
                (wx, 0.136, z_Steer),
                (wx, 0.160, z_Steer),
                0.0135,
                0.0125,
                C_WHITE,
                radial_segs=14,
                height_segs=1,
            )
            # C-shaped steering fork wrapping over the wheel to the outer/inner axle
            p_yoke_top = (wx, 0.138, z_Steer)
            p_yoke_shoulder = (side * (WHEEL_X - 0.044), 0.122, z_Steer)
            p_yoke_axle = (side * (WHEEL_X - 0.036), WHEEL_RADIUS, z_Steer)
            mbs[MAT_ALU_BRIGHT].add_cylinder(p_yoke_top, p_yoke_shoulder, 0.0095, 0.0090, C_WHITE, radial_segs=12, height_segs=1)
            mbs[MAT_ALU_BRIGHT].add_cylinder(p_yoke_shoulder, p_yoke_axle, 0.0090, 0.0090, C_WHITE, radial_segs=12, height_segs=1)

    return mbs


def build_wheel_primitives(is_left=True):
    """Build one of Sojourner's 6 machined aluminum wheels (origin at wheel center (0, 0, 0),
    radius = WHEEL_RADIUS = 0.068 m, width = WHEEL_WIDTH = 0.076 m) with 14 raised 3D
    stainless-steel traction cleats (grousers), dark anodized hub, and cobalt center cap.
    """
    mbs = {
        MAT_ALU_BRUSHED: MeshBuilder(),
        MAT_ALU_BRIGHT: MeshBuilder(),
        MAT_DARK_TITANIUM: MeshBuilder(),
        MAT_COBALT_NASA: MeshBuilder(),
    }
    out_sign = 1.0 if is_left else -1.0
    hw = WHEEL_WIDTH * 0.5

    # 1. Main Machined Aluminum Tire Drum along X axis (-hw to +hw)
    mbs[MAT_ALU_BRUSHED].add_cylinder(
        (-hw, 0.0, 0.0),
        (hw, 0.0, 0.0),
        WHEEL_RADIUS * 0.965,
        WHEEL_RADIUS * 0.965,
        C_WHITE,
        radial_segs=28,
        height_segs=2,
    )

    # Bright aluminum outer & inner rim flanges
    for side_x in (-1.0, 1.0):
        mbs[MAT_ALU_BRIGHT].add_cylinder(
            (side_x * (hw - 0.007), 0.0, 0.0),
            (side_x * (hw + 0.001), 0.0, 0.0),
            WHEEL_RADIUS * 0.985,
            WHEEL_RADIUS * 0.985,
            C_WHITE,
            radial_segs=28,
            height_segs=1,
        )

    # 2. 14 Raised 3D Stainless-Steel Traction Cleats (Grousers) around the wheel tread
    num_cleats = 14
    r_cleat = WHEEL_RADIUS * 0.978
    for i in range(num_cleats):
        ang = (i / float(num_cleats)) * math.pi * 2.0
        cy = r_cleat * math.sin(ang)
        cz = r_cleat * math.cos(ang)
        mbs[MAT_ALU_BRIGHT].add_cylinder(
            (-hw * 0.92, cy, cz),
            (hw * 0.92, cy, cz),
            0.0042,
            0.0042,
            C_WHITE,
            radial_segs=8,
            height_segs=1,
        )

    # 3. Dark Anodized Hub Disc & Cobalt-Blue NASA Planetary Gear Cap on outer face
    mbs[MAT_DARK_TITANIUM].add_cylinder(
        (-hw - 0.002, 0.0, 0.0),
        (hw + 0.002, 0.0, 0.0),
        WHEEL_RADIUS * 0.62,
        WHEEL_RADIUS * 0.62,
        C_WHITE,
        radial_segs=24,
        height_segs=1,
    )
    mbs[MAT_COBALT_NASA].add_cylinder(
        (out_sign * (hw - 0.002), 0.0, 0.0),
        (out_sign * (hw + 0.006), 0.0, 0.0),
        WHEEL_RADIUS * 0.34,
        WHEEL_RADIUS * 0.30,
        C_WHITE,
        radial_segs=18,
        height_segs=1,
    )
    mbs[MAT_ALU_BRIGHT].add_cylinder(
        (out_sign * (hw + 0.004), 0.0, 0.0),
        (out_sign * (hw + 0.009), 0.0, 0.0),
        WHEEL_RADIUS * 0.14,
        WHEEL_RADIUS * 0.12,
        C_WHITE,
        radial_segs=14,
        height_segs=1,
    )

    return mbs


def build_apxs_primitives():
    """Node 8 (`APXSArm`): Rear deployed Alpha Proton X-Ray Spectrometer ("la nariz robótica"),
    origin at rear mount pivot (0.0, 0.195, -0.205).
    """
    mbs = {
        MAT_ALU_BRIGHT: MeshBuilder(),
        MAT_DARK_TITANIUM: MeshBuilder(),
        MAT_COPPER_APXS: MeshBuilder(),
        MAT_GOLD_KAPTON: MeshBuilder(),
        MAT_CYAN_LENS: MeshBuilder(),
    }

    # Rear mounting bracket on WEB (-Z)
    mbs[MAT_DARK_TITANIUM].add_squircle_box(
        0.0, 0.0, -0.015, 0.082, 0.048, 0.036, power=2.8, col=C_WHITE, rows=10, cols=18
    )

    # Parallel 4-bar deployment linkage struts extending backward & downward
    for side in (-1.0, 1.0):
        lx = side * 0.024
        mbs[MAT_ALU_BRIGHT].add_cylinder(
            (lx, 0.010, -0.022),
            (lx, -0.068, -0.108),
            0.0065,
            0.0060,
            C_WHITE,
            radial_segs=12,
            height_segs=1,
        )
        mbs[MAT_ALU_BRIGHT].add_cylinder(
            (lx, -0.012, -0.024),
            (lx, -0.090, -0.104),
            0.0055,
            0.0055,
            C_WHITE,
            radial_segs=12,
            height_segs=1,
        )

    # Wrist gimbal & APXS cylindrical copper-gold spectrometer head poised above the ground
    mbs[MAT_DARK_TITANIUM].add_squircle_box(
        0.0, -0.076, -0.112, 0.068, 0.030, 0.034, power=2.6, col=C_WHITE, rows=8, cols=16
    )

    # Main APXS Cylindrical Sensor Canister angled toward the Martian regolith/rock
    p_apxs_top = (0.0, -0.062, -0.118)
    p_apxs_bot = (0.0, -0.138, -0.146)
    p_apxs_tip = (0.0, -0.150, -0.150)

    mbs[MAT_COPPER_APXS].add_cylinder(
        p_apxs_top, p_apxs_bot, 0.032, 0.030, C_WHITE, radial_segs=22, height_segs=2
    )
    mbs[MAT_GOLD_KAPTON].add_cylinder(
        (0.0, -0.075, -0.123),
        (0.0, -0.122, -0.140),
        0.0335,
        0.0325,
        C_WHITE,
        radial_segs=22,
        height_segs=1,
    )
    # Bright aluminum sample contact ring & cyan sensor aperture at the bottom tip
    mbs[MAT_ALU_BRIGHT].add_cylinder(
        p_apxs_bot, p_apxs_tip, 0.033, 0.035, C_WHITE, radial_segs=22, height_segs=1
    )
    mbs[MAT_CYAN_LENS].add_cylinder(
        (0.0, -0.146, -0.149),
        (0.0, -0.153, -0.152),
        0.015,
        0.014,
        C_WHITE,
        radial_segs=16,
        height_segs=1,
    )

    return mbs


def build_antenna_primitives():
    """Node 9 (`Antenna`): Rear UHF monopole whip antenna, origin at (-0.128, 0.292, -0.215)."""
    mbs = {
        MAT_ALU_BRIGHT: MeshBuilder(),
        MAT_DARK_TITANIUM: MeshBuilder(),
        MAT_AMBER_BEACON: MeshBuilder(),
    }

    # Spring base insulator & coil on the rear-left corner of the solar deck
    mbs[MAT_DARK_TITANIUM].add_cylinder(
        (0.0, 0.0, 0.0),
        (0.0, 0.026, -0.002),
        0.012,
        0.010,
        C_WHITE,
        radial_segs=14,
        height_segs=1,
    )
    mbs[MAT_ALU_BRIGHT].add_cylinder(
        (0.0, 0.024, -0.002),
        (-0.004, 0.062, -0.006),
        0.0075,
        0.0055,
        C_WHITE,
        radial_segs=14,
        height_segs=2,
    )
    # Tall slender UHF whip mast
    mbs[MAT_ALU_BRIGHT].add_cylinder(
        (-0.004, 0.060, -0.006),
        (-0.018, 0.285, -0.026),
        0.0042,
        0.0024,
        C_WHITE,
        radial_segs=12,
        height_segs=3,
    )
    # Glowing amber telemetry tip ball
    mbs[MAT_AMBER_BEACON].add_squircle_box(
        -0.018, 0.292, -0.027, 0.018, 0.018, 0.018, power=2.2, col=C_WHITE, rows=10, cols=16
    )

    return mbs


def pack_glb():
    atlas_png_bytes = build_sojourner_atlas_png(512, 512)

    chassis_mbs = build_chassis_primitives()
    wheel_l_mbs = build_wheel_primitives(is_left=True)
    wheel_r_mbs = build_wheel_primitives(is_left=False)
    apxs_mbs = build_apxs_primitives()
    antenna_mbs = build_antenna_primitives()

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
            prims.append(append_primitive(mb, mat_idx, include_uv=(mat_idx in (MAT_SOLAR_DECK, MAT_GOLD_KAPTON))))
        return prims

    chassis_prims = build_multi_primitive_mesh(chassis_mbs)
    wheel_l_prims = build_multi_primitive_mesh(wheel_l_mbs)
    wheel_r_prims = build_multi_primitive_mesh(wheel_r_mbs)
    apxs_prims = build_multi_primitive_mesh(apxs_mbs)
    antenna_prims = build_multi_primitive_mesh(antenna_mbs)

    def make_pbr_mat(name, hex_color, roughness=0.38, metalness=0.1, emissive_hex=None):
        r, g, b = hex_lin(hex_color)
        m = {
            "name": name,
            "doubleSided": False,
            "pbrMetallicRoughness": {
                "baseColorFactor": [round(r, 5), round(g, 5), round(b, 5), 1.0],
                "roughnessFactor": roughness,
                "metalnessFactor": metalness,
            },
        }
        if emissive_hex:
            er, eg, eb = hex_lin(emissive_hex)
            m["emissiveFactor"] = [round(er, 5), round(eg, 5), round(eb, 5)]
        return m

    materials = [
        # 0: MAT_SOLAR_DECK (512x512 embedded PNG texture of GaAs photovoltaic array)
        {
            "name": "SojournerGaAsSolarArray",
            "doubleSided": False,
            "pbrMetallicRoughness": {
                "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
                "baseColorTexture": {"index": 0},
                "roughnessFactor": 0.16,
                "metalnessFactor": 0.35,
            },
        },
        # 1: MAT_GOLD_KAPTON (24K Gold Kapton thermal blanket on WEB)
        {
            "name": "SojournerGoldKaptonFoil",
            "doubleSided": False,
            "pbrMetallicRoughness": {
                "baseColorFactor": [1.0, 0.92, 0.55, 1.0],
                "baseColorTexture": {"index": 0},
                "roughnessFactor": 0.24,
                "metalnessFactor": 0.86,
            },
        },
        # 2: MAT_ALU_BRIGHT
        make_pbr_mat("MachinedAluminumStruts", "#e2e8f0", roughness=0.25, metalness=0.82),
        # 3: MAT_ALU_BRUSHED
        make_pbr_mat("BrushedAluminumWheels", "#94a3b8", roughness=0.34, metalness=0.78),
        # 4: MAT_DARK_TITANIUM
        make_pbr_mat("DarkAnodizedTitanium", "#1e293b", roughness=0.42, metalness=0.62),
        # 5: MAT_COBALT_NASA
        make_pbr_mat("NasaCobaltHubCap", "#2563eb", roughness=0.28, metalness=0.58),
        # 6: MAT_COPPER_APXS
        make_pbr_mat("ApxsCopperSpectrometer", "#d97706", roughness=0.26, metalness=0.80),
        # 7: MAT_CYAN_LENS
        make_pbr_mat("StereoCameraCyanLens", "#38bdf8", roughness=0.10, metalness=0.15, emissive_hex="#0ea5e9"),
        # 8: MAT_RED_LASER
        make_pbr_mat("LaserStripeProjectorRed", "#ef4444", roughness=0.12, metalness=0.10, emissive_hex="#dc2626"),
        # 9: MAT_AMBER_BEACON
        make_pbr_mat("UhfAntennaAmberBeacon", "#f59e0b", roughness=0.15, metalness=0.10, emissive_hex="#d97706"),
    ]

    gltf = {
        "asset": {
            "version": "2.0",
            "generator": "CyberPenguin 2.0 Sojourner Rover MFEX Builder",
        },
        "scene": 0,
        "scenes": [{"name": "SojournerScene", "nodes": [0]}],
        "nodes": [
            {
                "name": "SojournerRoot",
                "children": [1, 2, 3, 4, 5, 6, 7],
                "translation": [0.0, 0.0, 0.0],
            },
            {
                "name": "Chassis",
                "mesh": 0,
                "children": [8, 9],
                "translation": [0.0, 0.0, 0.0],
            },
            {
                "name": "WheelFL",
                "mesh": 1,
                "translation": [WHEEL_X, WHEEL_RADIUS, WHEEL_Z_FRONT],
            },
            {
                "name": "WheelML",
                "mesh": 1,
                "translation": [WHEEL_X, WHEEL_RADIUS, WHEEL_Z_MID],
            },
            {
                "name": "WheelRL",
                "mesh": 1,
                "translation": [WHEEL_X, WHEEL_RADIUS, WHEEL_Z_REAR],
            },
            {
                "name": "WheelFR",
                "mesh": 2,
                "translation": [-WHEEL_X, WHEEL_RADIUS, WHEEL_Z_FRONT],
            },
            {
                "name": "WheelMR",
                "mesh": 2,
                "translation": [-WHEEL_X, WHEEL_RADIUS, WHEEL_Z_MID],
            },
            {
                "name": "WheelRR",
                "mesh": 2,
                "translation": [-WHEEL_X, WHEEL_RADIUS, WHEEL_Z_REAR],
            },
            {
                "name": "APXSArm",
                "mesh": 3,
                "translation": [0.0, 0.195, -0.205],
            },
            {
                "name": "Antenna",
                "mesh": 4,
                "translation": [-0.128, 0.292, -0.215],
            },
        ],
        "meshes": [
            {"name": "ChassisMesh", "primitives": chassis_prims},
            {"name": "WheelLeftMesh", "primitives": wheel_l_prims},
            {"name": "WheelRightMesh", "primitives": wheel_r_prims},
            {"name": "APXSArmMesh", "primitives": apxs_prims},
            {"name": "AntennaMesh", "primitives": antenna_prims},
        ],
        "textures": [{"sampler": 0, "source": 0}],
        "images": [{"bufferView": bv_png, "mimeType": "image/png", "name": "SojournerSolarAndKaptonAtlas"}],
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
