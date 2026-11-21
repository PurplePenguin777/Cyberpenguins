#!/usr/bin/env python3
"""Build a realistic, high-subdivision, smooth-shaded 3D glTF 2.0 binary (.glb)
model of Cyberpenguin (Baby Emperor Penguin *Aptenodytes forsteri* chick inside
a realistic NASA Apollo A7L / EMU spacesuit) with:
  - Guaranteed outward CCW triangle winding & outward normals (verified per-triangle)
  - Embedded 512x512 PNG baseColorTexture atlas + dedicated PBR materials so EVERY
    3D viewer (Three.js, macOS Finder Quick Look / Preview, Blender) renders all
    colors, plumage, gold visor, cobalt neck ring, red/blue valves, and dark boot soles
  - Solid thick-walled raised LEVA gold sun visor & white protective shroud connected
    directly to the side temple hinge pods (no floating parts or hollow back-faces)
  - Opaque head cranium that completely occludes the eyes from the back (nuca)

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
    "cyberpenguin.glb",
)


def clamp(v, lo, hi):
    return lo if v < lo else hi if v > hi else v


def smoothstep(edge0, edge1, x):
    if edge1 == edge0:
        return 0.0
    t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0)
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
    """Encode an RGBA byte buffer into a valid PNG image using Python stdlib only."""
    stride = width * 4
    raw = bytearray()
    for y in range(height):
        raw.append(0)  # Filter type 0 (None)
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


def evaluate_chick_head_srgb(u, v):
    """Evaluate the authentic *Aptenodytes forsteri* (Baby Emperor Penguin) head plumage color in sRGB
    at spherical coordinates u in [0, 1] (theta = u * 2*pi, 0 = +Z front face, 0.5 = -Z back of head/nuca)
    and v in [0, 1] (phi = v * pi, 0 = neck bottom, 1 = top crown).
    """
    theta = u * math.pi * 2.0
    phi = v * math.pi
    s = math.sin(phi)
    y_norm = -math.cos(phi)  # -1 at neck bottom, +1 at crown top
    nx = s * math.sin(theta)
    ny = y_norm
    nz = s * math.cos(theta)  # +1 on front face (+Z), -1 on back of head/nuca (-Z)

    # Baby emperor penguin characteristic white heart/binocular cheek & eye mask on front face (+Z)
    d_left = math.sqrt(((nx - 0.34) / 0.43) ** 2 + ((ny - 0.03) / 0.50) ** 2)
    d_right = math.sqrt(((nx + 0.34) / 0.43) ** 2 + ((ny - 0.03) / 0.50) ** 2)
    d_cheek = math.sqrt((nx / 0.66) ** 2 + ((ny + 0.22) / 0.36) ** 2)
    mask_dist = min(d_left, d_right, d_cheek)

    # Dark chin/throat bib right under the beak center (authentic emperor chick feature)
    d_bib = math.sqrt((nx / 0.27) ** 2 + ((ny + 0.27) / 0.24) ** 2)
    bib_cut = 1.0 - smoothstep(0.62, 1.04, d_bib)

    # Strictly front hemisphere only (nz > 0.18), so back of head/nuca is 100% dark hood + silver neck down
    face_front = smoothstep(0.18, 0.50, nz)
    white_mask = (1.0 - smoothstep(0.74, 1.02, mask_dist)) * face_front * (1.0 - 0.90 * bib_cut)

    # Fluffy silvery ash-grey chick down around lower neck collar
    neck_down = 1.0 - smoothstep(-0.64, -0.28, ny)

    # Fine downy feather micro-texture
    down_tex = 0.5 + 0.5 * math.sin(nx * 42.0 + ny * 36.0) * math.cos(nz * 38.0)

    c_hood = mix_col(hex_srgb("#12151e"), hex_srgb("#242a38"), down_tex * 0.25)
    c_mask = mix_col(hex_srgb("#e2e8f0"), hex_srgb("#ffffff"), 0.70 + 0.30 * down_tex)
    c_down = mix_col(hex_srgb("#8d97a8"), hex_srgb("#d2d9e4"), 0.45 + 0.45 * down_tex)

    col = mix_col(c_hood, c_mask, white_mask)
    col = mix_col(col, c_down, neck_down)
    return col


def build_head_texture_png(width=256, height=256):
    """Bake a 256x256 PNG texture for the Baby Emperor Penguin head plumage."""
    buf = bytearray(width * height * 4)
    for y in range(height):
        # glTF UV origin (0,0) is top-left of PNG image -> v = y / (height - 1)
        v = y / float(height - 1)
        for x in range(width):
            u = x / float(width - 1)
            r, g, b = evaluate_chick_head_srgb(u, v)
            idx = (y * width + x) * 4
            buf[idx] = int(round(clamp(r, 0.0, 1.0) * 255))
            buf[idx + 1] = int(round(clamp(g, 0.0, 1.0) * 255))
            buf[idx + 2] = int(round(clamp(b, 0.0, 1.0) * 255))
            buf[idx + 3] = 255
    return encode_png_rgba(width, height, buf)


class MeshBuilder:
    """Collects smooth-shaded sub-surfaces with guaranteed outward CCW winding,
    averaged outward vertex normals, UVs, and vertex colors.
    """

    def __init__(self):
        self.positions = []
        self.normals = []
        self.uvs = []
        self.colors = []
        self.indices = []

    def add_surface(self, pos_list, tri_list, col_list, uv_list=None, custom_normals=None, interior_ref=None):
        base = len(self.positions)
        if uv_list is None:
            uv_list = [(0.5, 0.5)] * len(pos_list)

        # Ensure every triangle is wound CCW outward with respect to `interior_ref` (if provided)
        fixed_tris = []
        for i0, i1, i2 in tri_list:
            p0, p1, p2 = pos_list[i0], pos_list[i1], pos_list[i2]
            fn = v_cross(v_sub(p1, p0), v_sub(p2, p0))
            if interior_ref is not None:
                center = interior_ref((p0, p1, p2)) if callable(interior_ref) else interior_ref
                centroid = ((p0[0] + p1[0] + p2[0]) / 3.0, (p0[1] + p1[1] + p2[1]) / 3.0, (p0[2] + p1[2] + p2[2]) / 3.0)
                out_dir = v_sub(centroid, center)
                if v_dot(fn, out_dir) < 0.0:
                    i1, i2 = i2, i1
            fixed_tris.append((i0, i1, i2))

        if custom_normals is not None:
            norms = custom_normals
        else:
            acc = [[0.0, 0.0, 0.0] for _ in range(len(pos_list))]
            for i0, i1, i2 in fixed_tris:
                p0, p1, p2 = pos_list[i0], pos_list[i1], pos_list[i2]
                fn = v_cross(v_sub(p1, p0), v_sub(p2, p0))
                for idx in (i0, i1, i2):
                    acc[idx][0] += fn[0]
                    acc[idx][1] += fn[1]
                    acc[idx][2] += fn[2]
            norms = [v_norm(n) for n in acc]

        for p, n, uv, c in zip(pos_list, norms, uv_list, col_list):
            self.positions.append(p)
            self.normals.append(n)
            self.uvs.append(uv)
            self.colors.append(c)
        for i0, i1, i2 in fixed_tris:
            self.indices.extend((base + i0, base + i1, base + i2))

    def add_grid_surface(self, rows, cols, eval_fn, wrap_u=False, close_poles=False, interior_ref=(0.0, 0.0, 0.0)):
        """Build a smooth parametric grid (r in 0..rows, c in 0..cols).
        Note: Using cols+1 vertices even for closed loops guarantees seamless UV wrapping at u=0..1!
        Welds normals across the u=0 / u=1 seam when wrap_u=True.
        """
        u_count = cols + 1
        pos_list = []
        col_list = []
        uv_list = []
        for r in range(rows + 1):
            v = r / float(rows)
            for c in range(u_count):
                u = (c % cols) / float(cols) if (wrap_u and c == cols) else (c / float(cols))
                uv_u = c / float(cols)
                res = eval_fn(u, v)
                if len(res) == 3:
                    p, col, uv = res
                else:
                    p, col = res
                    uv = (uv_u, v)
                pos_list.append(p)
                col_list.append(col)
                uv_list.append(uv)

        tri_list = []
        for r in range(rows):
            for c in range(cols):
                c1 = c + 1
                i00 = r * u_count + c
                i01 = r * u_count + c1
                i10 = (r + 1) * u_count + c
                i11 = (r + 1) * u_count + c1
                if close_poles and r == 0:
                    tri_list.append((i00, i11, i10))
                elif close_poles and r == rows - 1:
                    tri_list.append((i00, i01, i10))
                else:
                    tri_list.append((i00, i01, i11))
                    tri_list.append((i00, i11, i10))

        # Verify / orient triangles outward against interior_ref and compute seam-welded smooth normals
        fixed_tris = []
        for i0, i1, i2 in tri_list:
            p0, p1, p2 = pos_list[i0], pos_list[i1], pos_list[i2]
            fn = v_cross(v_sub(p1, p0), v_sub(p2, p0))
            if interior_ref is not None:
                center = interior_ref((p0, p1, p2)) if callable(interior_ref) else interior_ref
                centroid = ((p0[0] + p1[0] + p2[0]) / 3.0, (p0[1] + p1[1] + p2[1]) / 3.0, (p0[2] + p1[2] + p2[2]) / 3.0)
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

        # Weld seam normals (c == 0 and c == cols) and pole normals
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
                px = sum(acc[pole_r * u_count + c][0] for c in range(cols))
                py = sum(acc[pole_r * u_count + c][1] for c in range(cols))
                pz = sum(acc[pole_r * u_count + c][2] for c in range(cols))
                for c in range(u_count):
                    acc[pole_r * u_count + c] = [px, py, pz]

        norms = [v_norm(n) for n in acc]
        self.add_surface(pos_list, fixed_tris, col_list, uv_list=uv_list, custom_normals=norms, interior_ref=None)

    def add_rounded_box(self, cx, cy, cz, sx, sy, sz, radius, col, segs=5):
        n_u = segs * 4
        n_v = segs * 2

        def clamp_box(x, y, z):
            hx = max(1e-5, sx * 0.5 - radius)
            hy = max(1e-5, sy * 0.5 - radius)
            hz = max(1e-5, sz * 0.5 - radius)
            bx = clamp(x, -hx, hx)
            by = clamp(y, -hy, hy)
            bz = clamp(z, -hz, hz)
            dx, dy, dz = x - bx, y - by, z - bz
            d = math.sqrt(dx * dx + dy * dy + dz * dz)
            if d > 1e-8:
                px = bx + (dx / d) * radius
                py = by + (dy / d) * radius
                pz = bz + (dz / d) * radius
            else:
                px, py, pz = bx, by, bz
            return (cx + px, cy + py, cz + pz)

        def eval_fn(u, v):
            theta = u * math.pi * 2.0
            phi = v * math.pi
            dx = math.sin(phi) * math.sin(theta)
            dy = -math.cos(phi)
            dz = math.sin(phi) * math.cos(theta)
            tx = math.copysign(abs(dx) ** 0.55, dx) * (sx * 0.5)
            ty = math.copysign(abs(dy) ** 0.55, dy) * (sy * 0.5)
            tz = math.copysign(abs(dz) ** 0.55, dz) * (sz * 0.5)
            p = clamp_box(tx, ty, tz)
            c = col(p[0] - cx, p[1] - cy, p[2] - cz) if callable(col) else col
            return p, c

        self.add_grid_surface(n_v, n_u, eval_fn, wrap_u=True, close_poles=True, interior_ref=(cx, cy, cz))

    def add_cylinder(self, p0, p1, r0, r1, col, radial_segs=20, height_segs=3, cap_start=True, cap_end=True):
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
            # Project centroid onto cylinder axis segment
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

    def add_thick_spherical_shell(self, cx, cy, cz, r_inner, r_outer, az_min_deg, az_max_deg, el_min_deg, el_max_deg, rows, cols, col):
        """Build a solid, closed 3D spherical shell with outer wall, inner wall, and 4 stitched rim walls
        so it is 100% solid from every camera angle with zero hollow back-faces.
        """
        center = (cx, cy, cz)
        u_cnt = cols + 1
        v_cnt = rows + 1

        def sphere_pt(r, u, v):
            az = math.radians(az_min_deg + u * (az_max_deg - az_min_deg))
            el = math.radians(el_min_deg + v * (el_max_deg - el_min_deg))
            x = cx + r * math.cos(el) * math.sin(az)
            y = cy + r * math.sin(el)
            z = cz + r * math.cos(el) * math.cos(az)
            return (x, y, z)

        # 1. Outer surface (outward normals away from `center`)
        self.add_grid_surface(
            rows,
            cols,
            lambda u, v: (sphere_pt(r_outer, u, v), col),
            wrap_u=False,
            close_poles=False,
            interior_ref=center,
        )

        # 2. Inner surface (normals pointing INWARD toward `center`, so interior_ref is beyond r_outer)
        def inner_interior_ref(tri_pts):
            c_pt = (
                (tri_pts[0][0] + tri_pts[1][0] + tri_pts[2][0]) / 3.0,
                (tri_pts[0][1] + tri_pts[1][1] + tri_pts[2][1]) / 3.0,
                (tri_pts[0][2] + tri_pts[1][2] + tri_pts[2][2]) / 3.0,
            )
            d = v_norm(v_sub(c_pt, center))
            return (cx + d[0] * (r_outer + 0.5), cy + d[1] * (r_outer + 0.5), cz + d[2] * (r_outer + 0.5))

        self.add_grid_surface(
            rows,
            cols,
            lambda u, v: (sphere_pt(r_inner, u, v), col),
            wrap_u=False,
            close_poles=False,
            interior_ref=inner_interior_ref,
        )

        # 3. Stitch the 4 perimeter edges (bottom brow v=0, top edge v=1, left edge u=0, right edge u=1)
        mid_shell = sphere_pt((r_inner + r_outer) * 0.5, 0.5, 0.5)
        for fixed_v in (0.0, 1.0):
            pos, cols_l, tris = [], [], []
            for c in range(u_cnt):
                u = c / float(cols)
                pos.append(sphere_pt(r_inner, u, fixed_v))
                pos.append(sphere_pt(r_outer, u, fixed_v))
                cols_l.extend((col, col))
            for c in range(cols):
                b = c * 2
                tris.append((b, b + 1, b + 3))
                tris.append((b, b + 3, b + 2))
            self.add_surface(pos, tris, cols_l, interior_ref=mid_shell)

        for fixed_u in (0.0, 1.0):
            pos, cols_l, tris = [], [], []
            for r in range(v_cnt):
                v = r / float(rows)
                pos.append(sphere_pt(r_inner, fixed_u, v))
                pos.append(sphere_pt(r_outer, fixed_u, v))
                cols_l.extend((col, col))
            for r in range(rows):
                b = r * 2
                tris.append((b, b + 1, b + 3))
                tris.append((b, b + 3, b + 2))
            self.add_surface(pos, tris, cols_l, interior_ref=mid_shell)


# Material indices (every material has its own true baseColorFactor / baseColorTexture!)
MAT_HEAD_PLUMAGE = 0   # Uses 256x256 embedded PNG texture of Baby Emperor Penguin plumage
MAT_SUIT_WHITE = 1     # NASA Beta-cloth warm ivory white (#f2f0ea)
MAT_SUIT_SHADE = 2     # Soft grey-white pressure fold / O2 tank (#d5dce6)
MAT_COBALT_NASA = 3    # Anodized NASA cobalt blue (#1d4ed8)
MAT_METAL_ALU = 4      # Brushed aluminum neck ring & latches (#94a3b8)
MAT_METAL_DARK = 5     # Dark titanium soles, flipper tips, belt & controls (#283242)
MAT_GOLD_VISOR = 6     # 24K gold solar visor (#eab308)
MAT_VALVE_RED = 7      # Anodized red oxygen valve (#dc2626)
MAT_VALVE_BLUE = 8     # Anodized blue coolant valve (#2563eb)
MAT_BEAK_DARK = 9      # Dark slate chick bill (#1e222d)
MAT_BEAK_CORAL = 10    # Warm coral-salmon lower mandible (#e07a5f)
MAT_EYE_OBSIDIAN = 11  # Deep glossy dark eye (#070a12)
MAT_PURE_WHITE = 12    # Bright white catchlights & patch insignia (#ffffff)
MAT_CYAN_LED = 13      # Emissive cyan telemetry & EVA lamps (#38bdf8)
MAT_AMBER_LED = 14     # Emissive amber status indicator (#f59e0b)
MAT_HELMET_GLASS = 15  # Transparent polycarbonate bubble helmet dome

C_WHITE = (1.0, 1.0, 1.0)


def build_torso_primitives():
    """Node 1 (`Torso`), origin at hip pivot (0, 0.20, 0).
    Returns dict of {mat_idx: MeshBuilder}.
    """
    mbs = {
        MAT_SUIT_WHITE: MeshBuilder(),
        MAT_SUIT_SHADE: MeshBuilder(),
        MAT_COBALT_NASA: MeshBuilder(),
        MAT_METAL_ALU: MeshBuilder(),
        MAT_METAL_DARK: MeshBuilder(),
        MAT_VALVE_RED: MeshBuilder(),
        MAT_VALVE_BLUE: MeshBuilder(),
        MAT_PURE_WHITE: MeshBuilder(),
        MAT_CYAN_LED: MeshBuilder(),
        MAT_AMBER_LED: MeshBuilder(),
    }

    # 1. Pear-shaped plump baby-penguin pressure suit torso (Beta-cloth white)
    # Extends up to y = 0.375 so it seats solidly into the neck ring with zero gap
    def eval_suit(u, v):
        theta = u * math.pi * 2.0
        phi = v * math.pi
        y = -0.05 + (1.0 - math.cos(phi)) * 0.5 * 0.425
        t = (y + 0.05) / 0.425
        s = math.sin(phi)
        belly_bulge = 1.0 + 0.24 * math.exp(-((t - 0.35) / 0.28) ** 2)
        rx = 0.215 * s * belly_bulge
        rz = 0.195 * s * belly_bulge
        z_offset = 0.020 * math.sin(t * math.pi)
        rib = math.sin(t * math.pi * 12.0)
        rib_indent = 0.0032 * max(0.0, -rib) * smoothstep(0.12, 0.25, t) * (1.0 - smoothstep(0.75, 0.90, t))
        x = (rx - rib_indent) * math.sin(theta)
        z = (rz - rib_indent) * math.cos(theta) + z_offset
        return (x, y, z), C_WHITE

    mbs[MAT_SUIT_WHITE].add_grid_surface(44, 56, eval_suit, wrap_u=True, close_poles=True, interior_ref=(0.0, 0.16, 0.01))

    # 2. Technical Waist Belt Ring (MAT_METAL_DARK) + Front Buckle
    def eval_belt(u, v):
        theta = u * math.pi * 2.0
        y = 0.068 + (v - 0.5) * 0.030
        rx = 0.228
        rz = 0.207
        return (rx * math.sin(theta), y, rz * math.cos(theta) + 0.018), C_WHITE

    mbs[MAT_METAL_DARK].add_grid_surface(6, 48, eval_belt, wrap_u=True, close_poles=False, interior_ref=(0.0, 0.068, 0.018))
    mbs[MAT_METAL_ALU].add_rounded_box(0.0, 0.068, 0.222, 0.054, 0.040, 0.018, 0.005, C_WHITE, segs=3)
    mbs[MAT_CYAN_LED].add_rounded_box(0.0, 0.068, 0.228, 0.024, 0.016, 0.010, 0.003, C_WHITE, segs=2)

    # 3. Circular NASA Blue Mission Patch on upper-left chest (+Z)
    mbs[MAT_COBALT_NASA].add_cylinder(
        (-0.082, 0.238, 0.162),
        (-0.082, 0.238, 0.184),
        0.032,
        0.030,
        C_WHITE,
        radial_segs=20,
        height_segs=1,
    )
    mbs[MAT_PURE_WHITE].add_cylinder(
        (-0.082, 0.238, 0.166),
        (-0.082, 0.238, 0.186),
        0.014,
        0.012,
        C_WHITE,
        radial_segs=14,
        height_segs=1,
    )

    # 4. Anodized Cobalt-Blue & Brushed Aluminum Neck Disconnect Ring (y = 0.34 .. 0.385)
    def eval_neck_ring(u, v):
        theta = u * math.pi * 2.0
        ang_v = v * math.pi * 2.0
        r_major = 0.166
        r_minor_x = 0.026
        r_minor_y = 0.024
        r = r_major + r_minor_x * math.cos(ang_v)
        y = 0.360 + r_minor_y * math.sin(ang_v) - 0.010 * math.cos(theta)
        x = r * math.sin(theta)
        z = r * 0.96 * math.cos(theta) + 0.010
        return (x, y, z), C_WHITE

    def neck_ring_interior(tri_pts):
        c_pt = (
            (tri_pts[0][0] + tri_pts[1][0] + tri_pts[2][0]) / 3.0,
            (tri_pts[0][1] + tri_pts[1][1] + tri_pts[2][1]) / 3.0,
            (tri_pts[0][2] + tri_pts[1][2] + tri_pts[2][2]) / 3.0,
        )
        ang = math.atan2(c_pt[0], (c_pt[2] - 0.010) / 0.96)
        return (0.166 * math.sin(ang), 0.360 - 0.010 * math.cos(ang), 0.166 * 0.96 * math.cos(ang) + 0.010)

    mbs[MAT_COBALT_NASA].add_grid_surface(16, 44, eval_neck_ring, wrap_u=True, close_poles=False, interior_ref=neck_ring_interior)

    # Upper brushed aluminum bayonet collar seated directly atop the cobalt ring
    def eval_alu_collar(u, v):
        theta = u * math.pi * 2.0
        ang_v = v * math.pi * 2.0
        r_major = 0.164
        r = r_major + 0.018 * math.cos(ang_v)
        y = 0.376 + 0.014 * math.sin(ang_v) - 0.010 * math.cos(theta)
        return (r * math.sin(theta), y, r * 0.96 * math.cos(theta) + 0.010), C_WHITE

    def alu_collar_interior(tri_pts):
        c_pt = (
            (tri_pts[0][0] + tri_pts[1][0] + tri_pts[2][0]) / 3.0,
            (tri_pts[0][1] + tri_pts[1][1] + tri_pts[2][1]) / 3.0,
            (tri_pts[0][2] + tri_pts[1][2] + tri_pts[2][2]) / 3.0,
        )
        ang = math.atan2(c_pt[0], (c_pt[2] - 0.010) / 0.96)
        return (0.164 * math.sin(ang), 0.376 - 0.010 * math.cos(ang), 0.164 * 0.96 * math.cos(ang) + 0.010)

    mbs[MAT_METAL_ALU].add_grid_surface(14, 44, eval_alu_collar, wrap_u=True, close_poles=False, interior_ref=alu_collar_interior)

    # 5. Chest Display & Control Module (DCM / RCU) on front torso (+Z)
    mbs[MAT_SUIT_SHADE].add_rounded_box(0.0, 0.195, 0.205, 0.116, 0.088, 0.048, 0.012, C_WHITE, segs=4)
    mbs[MAT_METAL_DARK].add_rounded_box(0.0, 0.214, 0.224, 0.086, 0.022, 0.016, 0.004, C_WHITE, segs=2)
    mbs[MAT_CYAN_LED].add_rounded_box(-0.020, 0.214, 0.228, 0.028, 0.010, 0.012, 0.003, C_WHITE, segs=2)
    mbs[MAT_AMBER_LED].add_cylinder((0.022, 0.214, 0.224), (0.022, 0.214, 0.235), 0.006, 0.006, C_WHITE, radial_segs=12, height_segs=1)
    mbs[MAT_METAL_DARK].add_cylinder((-0.022, 0.176, 0.220), (-0.022, 0.176, 0.236), 0.015, 0.014, C_WHITE, radial_segs=16, height_segs=1)
    mbs[MAT_COBALT_NASA].add_rounded_box(0.022, 0.176, 0.224, 0.032, 0.018, 0.016, 0.004, C_WHITE, segs=2)

    # 6. Iconic Red & Blue NASA Anodized Umbilical Connector Valves on lower chest
    mbs[MAT_VALVE_BLUE].add_cylinder((0.055, 0.118, 0.185), (0.055, 0.118, 0.224), 0.019, 0.016, C_WHITE, radial_segs=18, height_segs=2)
    mbs[MAT_VALVE_RED].add_cylinder((-0.055, 0.118, 0.185), (-0.055, 0.118, 0.224), 0.019, 0.016, C_WHITE, radial_segs=18, height_segs=2)

    # 7. NASA PLSS Life-Support Backpack (-Z rear)
    mbs[MAT_SUIT_WHITE].add_rounded_box(0.0, 0.185, -0.172, 0.258, 0.312, 0.132, 0.026, C_WHITE, segs=5)
    # Cobalt technical side housings on PLSS
    for side in (-1.0, 1.0):
        mbs[MAT_COBALT_NASA].add_rounded_box(side * 0.112, 0.185, -0.170, 0.044, 0.275, 0.115, 0.012, C_WHITE, segs=3)
        # Twin rear O2 cylindrical tanks
        mbs[MAT_SUIT_SHADE].add_cylinder(
            (side * 0.064, 0.055, -0.222),
            (side * 0.064, 0.305, -0.222),
            0.038,
            0.038,
            C_WHITE,
            radial_segs=18,
            height_segs=3,
        )
    # Upper thermal radiator grille on back of PLSS
    mbs[MAT_METAL_DARK].add_rounded_box(0.0, 0.285, -0.224, 0.145, 0.045, 0.032, 0.008, C_WHITE, segs=3)
    # UHF whip antenna rising from top-right of PLSS
    mbs[MAT_METAL_DARK].add_cylinder((0.092, 0.335, -0.192), (0.092, 0.515, -0.202), 0.008, 0.0045, C_WHITE, radial_segs=12, height_segs=3)
    mbs[MAT_AMBER_LED].add_cylinder((0.092, 0.515, -0.202), (0.092, 0.538, -0.204), 0.010, 0.008, C_WHITE, radial_segs=12, height_segs=2)

    return mbs


def build_flipper_primitives(is_left=True):
    """Nodes 2 & 3 (`FlipperL`, `FlipperR`), origin at shoulder pivot (±0.215, 0.28, 0.02)."""
    mbs = {
        MAT_SUIT_WHITE: MeshBuilder(),
        MAT_COBALT_NASA: MeshBuilder(),
        MAT_METAL_DARK: MeshBuilder(),
    }
    sign = 1.0 if is_left else -1.0

    def flipper_pt(u, v, scale_r=1.0):
        theta = u * math.pi * 2.0
        phi = v * math.pi
        t = (1.0 - math.cos(phi)) * 0.5
        L = 0.255
        y = 0.025 - t * L
        s = math.sin(phi)
        thick_x = 0.038 * s * (1.0 - 0.38 * t) * scale_r
        width_z = 0.072 * s * (1.0 + 0.15 * math.sin(t * math.pi) - 0.28 * (t ** 2)) * scale_r
        rib = math.sin(t * math.pi * 10.0)
        bellows_mask = smoothstep(0.06, 0.14, t) * (1.0 - smoothstep(0.32, 0.42, t))
        thick_x += 0.004 * rib * bellows_mask
        width_z += 0.004 * rib * bellows_mask
        curve_x = sign * (0.015 + 0.042 * math.sin(t * math.pi * 0.85))
        curve_z = 0.010 - 0.028 * (t ** 1.4)
        return (curve_x + thick_x * math.sin(theta), y, curve_z + width_z * math.cos(theta)), (curve_x, y, curve_z)

    def flipper_interior(tri_pts):
        cy = (tri_pts[0][1] + tri_pts[1][1] + tri_pts[2][1]) / 3.0
        t = clamp((0.025 - cy) / 0.255, 0.0, 1.0)
        cx = sign * (0.015 + 0.042 * math.sin(t * math.pi * 0.85))
        cz = 0.010 - 0.028 * (t ** 1.4)
        return (cx, cy, cz)

    # Main Beta-cloth white EVA flipper sleeve
    mbs[MAT_SUIT_WHITE].add_grid_surface(
        28, 32, lambda u, v: (flipper_pt(u, v, 1.0)[0], C_WHITE), wrap_u=True, close_poles=True, interior_ref=flipper_interior
    )

    # Cobalt mission band around mid-flipper (v in 0.43..0.52)
    mbs[MAT_COBALT_NASA].add_grid_surface(
        6,
        32,
        lambda u, v: (flipper_pt(u, 0.43 + v * 0.09, 1.03)[0], C_WHITE),
        wrap_u=True,
        close_poles=False,
        interior_ref=flipper_interior,
    )

    # Dark thermal grip tip at lower flipper (v in 0.68..1.0)
    mbs[MAT_METAL_DARK].add_grid_surface(
        12,
        32,
        lambda u, v: (flipper_pt(u, 0.68 + v * 0.32, 1.025)[0], C_WHITE),
        wrap_u=True,
        close_poles=True,
        interior_ref=flipper_interior,
    )

    return mbs


def build_foot_primitives(is_left=True):
    """Nodes 4 & 5 (`FootL`, `FootR`), origin at hip pivot (±0.095, 0.18, 0.01)."""
    mbs = {
        MAT_SUIT_WHITE: MeshBuilder(),
        MAT_SUIT_SHADE: MeshBuilder(),
        MAT_COBALT_NASA: MeshBuilder(),
        MAT_METAL_DARK: MeshBuilder(),
    }
    sign = 1.0 if is_left else -1.0

    # 1. Short stout penguin leg with accordion pressure bellows
    def eval_leg(u, v):
        theta = u * math.pi * 2.0
        y = 0.02 - v * 0.135
        rib = math.sin(v * math.pi * 6.0)
        rx = 0.056 + 0.004 * rib
        rz = 0.060 + 0.004 * rib
        return (rx * math.sin(theta), y, rz * math.cos(theta)), C_WHITE

    mbs[MAT_SUIT_WHITE].add_grid_surface(
        14, 24, eval_leg, wrap_u=True, close_poles=False, interior_ref=lambda pts: (0.0, (pts[0][1] + pts[1][1] + pts[2][1]) / 3.0, 0.0)
    )

    # 2. Wide webbed-penguin Apollo/Artemis lunar overboot upper shell
    def boot_pt(u, v, scale_r=1.0):
        theta = u * math.pi * 2.0
        phi = v * math.pi
        t = (1.0 - math.cos(phi)) * 0.5
        s = math.sin(phi)
        raw_y = -0.098 - t * 0.088
        y = max(-0.180, raw_y)
        forward = max(0.0, math.cos(theta))
        rx = (0.064 + 0.018 * forward * math.sin(t * math.pi)) * (s ** 0.72) * scale_r
        rz_front = 0.118 * (s ** 0.70) * scale_r
        rz_back = 0.065 * (s ** 0.75) * scale_r
        rz = rz_front if math.cos(theta) >= 0 else rz_back
        x = rx * math.sin(theta) + sign * 0.004 * forward
        z = rz * math.cos(theta) + 0.028 * math.sin(t * math.pi * 0.75)
        return (x, y, z)

    mbs[MAT_SUIT_SHADE].add_grid_surface(
        22, 32, lambda u, v: (boot_pt(u, v, 1.0), C_WHITE), wrap_u=True, close_poles=True, interior_ref=(0.0, -0.145, 0.02)
    )

    # 3. Cobalt toe cap & ankle reinforcement strap
    mbs[MAT_COBALT_NASA].add_grid_surface(
        8,
        20,
        lambda u, v: (boot_pt((u - 0.5) * 0.52, 0.34 + v * 0.28, 1.025), C_WHITE),
        wrap_u=False,
        close_poles=False,
        interior_ref=(0.0, -0.145, 0.02),
    )

    # 4. Dark ribbed lunar tread sole at bottom of boot (v in 0.65..1.0)
    mbs[MAT_METAL_DARK].add_grid_surface(
        10,
        32,
        lambda u, v: (boot_pt(u, 0.65 + v * 0.35, 1.03), C_WHITE),
        wrap_u=True,
        close_poles=True,
        interior_ref=(0.0, -0.145, 0.02),
    )

    return mbs


def build_head_primitives():
    """Node 6 (`Head`), origin at neck pivot (0, 0.37, 0.01) relative to Torso.
    Builds:
      - Opaque Baby Emperor Penguin cranium with 256x256 embedded PNG texture (`MAT_HEAD_PLUMAGE`)
      - Short chick beak (`MAT_BEAK_DARK` + `MAT_BEAK_CORAL`)
      - Glossy obsidian eyes (`MAT_EYE_OBSIDIAN`) & 3D catchlights (`MAT_PURE_WHITE`)
      - Solid thick-walled raised 24K Gold LEVA sun visor (`MAT_GOLD_VISOR`) & white protective
        shroud (`MAT_SUIT_WHITE`) extending down to connect solidly into the side temple hinge pods
        (`MAT_METAL_ALU` + `MAT_CYAN_LED`), plus solid base collar (`MAT_METAL_ALU`).
    """
    mbs = {
        MAT_HEAD_PLUMAGE: MeshBuilder(),
        MAT_BEAK_DARK: MeshBuilder(),
        MAT_BEAK_CORAL: MeshBuilder(),
        MAT_EYE_OBSIDIAN: MeshBuilder(),
        MAT_PURE_WHITE: MeshBuilder(),
        MAT_GOLD_VISOR: MeshBuilder(),
        MAT_SUIT_WHITE: MeshBuilder(),
        MAT_COBALT_NASA: MeshBuilder(),
        MAT_METAL_ALU: MeshBuilder(),
        MAT_CYAN_LED: MeshBuilder(),
    }

    head_cy = 0.145
    head_cz = 0.005
    head_center = (0.0, head_cy, head_cz)

    # 1. Opaque Baby Emperor Penguin Head & Fluffy Down Plumage (mapped to 256x256 PNG texture!)
    def eval_chick_head(u, v):
        theta = u * math.pi * 2.0
        phi = v * math.pi
        s = math.sin(phi)
        y_norm = -math.cos(phi)  # -1 at neck base, +1 at top crown

        cheek_l = 1.0 + 0.10 * math.exp(-((y_norm + 0.18) / 0.38) ** 2) * max(0.0, math.cos(theta - 0.55))
        cheek_r = 1.0 + 0.10 * math.exp(-((y_norm + 0.18) / 0.38) ** 2) * max(0.0, math.cos(theta + 0.55))
        puff = max(cheek_l, cheek_r)

        rx = 0.142 * s * puff
        ry = 0.148
        rz = 0.140 * s * (1.0 + 0.04 * max(0.0, math.cos(theta)))
        x = rx * math.sin(theta)
        y = head_cy + ry * y_norm
        z = head_cz + rz * math.cos(theta)

        # Also store linear vertex color alongside UV (u, v)
        sr, sg, sb = evaluate_chick_head_srgb(u, v)
        lin_col = (srgb_to_linear(sr), srgb_to_linear(sg), srgb_to_linear(sb))
        return (x, y, z), lin_col, (u, v)

    mbs[MAT_HEAD_PLUMAGE].add_grid_surface(48, 60, eval_chick_head, wrap_u=True, close_poles=True, interior_ref=head_center)

    # 2. Short Conical Baby Emperor Penguin Chick Beak (+Z front)
    # Upper dark slate bill + warm coral-salmon lower mandible base
    def eval_upper_beak(u, v):
        theta = u * math.pi * 2.0
        t = v
        profile = (1.0 - t) ** 0.76
        rx = 0.029 * profile
        ry = 0.022 * profile
        droop_y = -0.006 * (t ** 1.8)
        x = rx * math.sin(theta)
        y = (head_cy - 0.015) + droop_y + ry * math.cos(theta)
        z = head_cz + 0.120 + t * 0.080
        return (x, y, z), C_WHITE

    mbs[MAT_BEAK_DARK].add_grid_surface(
        16, 26, eval_upper_beak, wrap_u=True, close_poles=True, interior_ref=(0.0, head_cy - 0.016, head_cz + 0.145)
    )

    # Coral-salmon lower mandible plate at base of chick beak
    def eval_lower_mandible(u, v):
        theta = math.pi * (0.55 + u * 0.90)  # Bottom half arc
        t = v * 0.72
        profile = (1.0 - t) ** 0.76
        rx = 0.0305 * profile
        ry = 0.0235 * profile
        x = rx * math.sin(theta)
        y = (head_cy - 0.015) - 0.005 * (t ** 1.8) + ry * math.cos(theta)
        z = head_cz + 0.120 + t * 0.080
        return (x, y, z), C_WHITE

    mbs[MAT_BEAK_CORAL].add_grid_surface(
        10, 16, eval_lower_mandible, wrap_u=False, close_poles=False, interior_ref=(0.0, head_cy - 0.010, head_cz + 0.145)
    )

    # 3. Expressive Glossy 3D Eyes & Specular Catchlights (strictly on +Z front face, CCW outward)
    for side in (-1.0, 1.0):
        ex = side * 0.056
        ey = head_cy + 0.018
        ez = head_cz + 0.125
        eye_center = (ex, ey, ez)

        def make_eye_eval(cx, cy, cz):
            def eval_eye(u, v):
                theta = u * math.pi * 2.0
                phi = v * math.pi
                sn = math.sin(phi)
                dx = sn * math.sin(theta)
                dy = -math.cos(phi)
                dz = sn * math.cos(theta)
                return (cx + dx * 0.024, cy + dy * 0.026, cz + dz * 0.018 - abs(dx) * 0.003), C_WHITE
            return eval_eye

        mbs[MAT_EYE_OBSIDIAN].add_grid_surface(18, 24, make_eye_eval(ex, ey, ez), wrap_u=True, close_poles=True, interior_ref=eye_center)

        for (ox, oy, oz, rad) in [(-0.006 * side, 0.008, 0.017, 0.0054), (0.006 * side, -0.006, 0.016, 0.0028)]:
            sc = (ex + ox, ey + oy, ez + oz)

            def make_spark_eval(sx, sy, sz, sr):
                def eval_spark(u, v):
                    theta = u * math.pi * 2.0
                    phi = v * math.pi
                    sn = math.sin(phi)
                    return (
                        sx + sr * sn * math.sin(theta),
                        sy - sr * math.cos(phi),
                        sz + sr * sn * math.cos(theta),
                    ), C_WHITE
                return eval_spark

            mbs[MAT_PURE_WHITE].add_grid_surface(8, 12, make_spark_eval(sc[0], sc[1], sc[2], rad), wrap_u=True, close_poles=True, interior_ref=sc)

    # 4. Solid Thick-Walled Raised 24K Gold LEVA Solar Visor & White Protective Outer Shroud
    # Notice: az spans -96 deg to +96 deg, and side wings wrap all the way down to el = 2 deg
    # where the temple hinge pods sit, so the visor and shroud connect SOLIDLY into the side pods!
    mbs[MAT_GOLD_VISOR].add_thick_spherical_shell(
        0.0,
        head_cy,
        head_cz,
        r_inner=0.188,
        r_outer=0.195,
        az_min_deg=-94.0,
        az_max_deg=94.0,
        el_min_deg=19.0,
        el_max_deg=110.0,
        rows=14,
        cols=32,
        col=C_WHITE,
    )

    mbs[MAT_SUIT_WHITE].add_thick_spherical_shell(
        0.0,
        head_cy,
        head_cz,
        r_inner=0.195,
        r_outer=0.205,
        az_min_deg=-98.0,
        az_max_deg=98.0,
        el_min_deg=27.0,
        el_max_deg=126.0,
        rows=14,
        cols=32,
        col=C_WHITE,
    )

    # Cobalt telemetry brow accent band on the front rim of the white LEVA shroud
    mbs[MAT_COBALT_NASA].add_thick_spherical_shell(
        0.0,
        head_cy,
        head_cz,
        r_inner=0.203,
        r_outer=0.207,
        az_min_deg=-48.0,
        az_max_deg=48.0,
        el_min_deg=27.5,
        el_max_deg=34.5,
        rows=4,
        cols=18,
        col=C_WHITE,
    )

    # Solid Side Yoke Arms connecting the raised LEVA shroud down to the temple hinge pivots (el = 2..30 deg)
    for side in (-1.0, 1.0):
        az_start = side * 80.0
        az_end = side * 98.0
        if az_start > az_end:
            az_start, az_end = az_end, az_start
        mbs[MAT_SUIT_WHITE].add_thick_spherical_shell(
            0.0,
            head_cy,
            head_cz,
            r_inner=0.186,
            r_outer=0.204,
            az_min_deg=az_start,
            az_max_deg=az_end,
            el_min_deg=-2.0,
            el_max_deg=30.0,
            rows=8,
            cols=8,
            col=C_WHITE,
        )
        # Temple hinge pivot housing anchored directly into the side yoke arm (not floating!)
        mbs[MAT_METAL_ALU].add_cylinder(
            (side * 0.175, head_cy + 0.008, head_cz - 0.004),
            (side * 0.212, head_cy + 0.008, head_cz - 0.004),
            0.030,
            0.025,
            C_WHITE,
            radial_segs=18,
            height_segs=2,
        )
        mbs[MAT_CYAN_LED].add_cylinder(
            (side * 0.198, head_cy + 0.008, head_cz - 0.004),
            (side * 0.198, head_cy + 0.008, head_cz + 0.034),
            0.011,
            0.013,
            C_WHITE,
            radial_segs=14,
            height_segs=2,
        )

    return mbs


def build_helmet_glass_mesh():
    """Node 7 (`HelmetGlass`), origin at neck pivot (0, 0.37, 0.01) relative to Torso.
    High-resolution smooth polycarbonate pressure bubble dome with guaranteed outward CCW normals.
    """
    mb = MeshBuilder()
    head_cy = 0.145
    head_cz = 0.005
    r_dome = 0.184
    phi_min = 0.14 * math.pi

    def eval_dome(u, v):
        theta = u * math.pi * 2.0
        phi = phi_min + v * (math.pi - phi_min)
        sn = math.sin(phi)
        cs = -math.cos(phi)
        px = r_dome * sn * math.sin(theta)
        py = head_cy + r_dome * 1.03 * cs
        pz = head_cz + r_dome * 0.99 * sn * math.cos(theta)
        return (px, py, pz), C_WHITE

    mb.add_grid_surface(28, 44, eval_dome, wrap_u=True, close_poles=False, interior_ref=(0.0, head_cy, head_cz))
    return mb


def pack_glb():
    head_png_bytes = build_head_texture_png(256, 256)

    torso_mbs = build_torso_primitives()
    flip_l_mbs = build_flipper_primitives(is_left=True)
    flip_r_mbs = build_flipper_primitives(is_left=False)
    foot_l_mbs = build_foot_primitives(is_left=True)
    foot_r_mbs = build_foot_primitives(is_left=False)
    head_mbs = build_head_primitives()
    glass_mb = build_helmet_glass_mesh()

    bin_chunks = bytearray()
    buffer_views = []
    accessors = []

    def align4(buf):
        rem = len(buf) % 4
        if rem:
            buf.extend(b"\x00" * (4 - rem))

    # Embed 256x256 PNG texture in bufferView 0
    align4(bin_chunks)
    png_off = len(bin_chunks)
    bin_chunks.extend(head_png_bytes)
    png_len = len(head_png_bytes)
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

        # Positions
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

        # Normals
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
                bin_chunks.extend(struct.pack("<2f", *uv))
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

        # Indices
        align4(bin_chunks)
        idx_off = len(bin_chunks)
        for idx in mb.indices:
            bin_chunks.extend(struct.pack("<H", idx))
        idx_len = len(bin_chunks) - idx_off
        bv_idx = len(buffer_views)
        buffer_views.append({"buffer": 0, "byteOffset": idx_off, "byteLength": idx_len, "target": 34963})
        acc_idx = len(accessors)
        accessors.append({
            "bufferView": bv_idx,
            "byteOffset": 0,
            "componentType": 5123,
            "count": i_count,
            "type": "SCALAR",
            "min": [0],
            "max": [v_count - 1],
        })

        return {
            "attributes": attrs,
            "indices": acc_idx,
            "material": mat_idx,
            "mode": 4,
        }

    def build_primitives_from_dict(mbs_dict):
        prims = []
        for mat_idx, mb in mbs_dict.items():
            if len(mb.positions) > 0:
                prims.append(append_primitive(mb, mat_idx, include_uv=(mat_idx == MAT_HEAD_PLUMAGE)))
        return prims

    meshes = [
        {"name": "TorsoMesh", "primitives": build_primitives_from_dict(torso_mbs)},
        {"name": "FlipperLMesh", "primitives": build_primitives_from_dict(flip_l_mbs)},
        {"name": "FlipperRMesh", "primitives": build_primitives_from_dict(flip_r_mbs)},
        {"name": "FootLMesh", "primitives": build_primitives_from_dict(foot_l_mbs)},
        {"name": "FootRMesh", "primitives": build_primitives_from_dict(foot_r_mbs)},
        {"name": "HeadMesh", "primitives": build_primitives_from_dict(head_mbs)},
        {"name": "HelmetGlassMesh", "primitives": [append_primitive(glass_mb, MAT_HELMET_GLASS)]},
    ]

    nodes = [
        {"name": "PenguinRoot", "children": [1, 4, 5]},
        {"name": "Torso", "mesh": 0, "translation": [0.0, 0.20, 0.0], "children": [2, 3, 6, 7]},
        {"name": "FlipperL", "mesh": 1, "translation": [0.215, 0.28, 0.02]},
        {"name": "FlipperR", "mesh": 2, "translation": [-0.215, 0.28, 0.02]},
        {"name": "FootL", "mesh": 3, "translation": [0.095, 0.18, 0.01]},
        {"name": "FootR", "mesh": 4, "translation": [-0.095, 0.18, 0.01]},
        {"name": "Head", "mesh": 5, "translation": [0.0, 0.37, 0.01]},
        {"name": "HelmetGlass", "mesh": 6, "translation": [0.0, 0.37, 0.01]},
    ]

    def rgba_lin(hex_str, alpha=1.0):
        r, g, b = hex_lin(hex_str)
        return [round(r, 5), round(g, 5), round(b, 5), alpha]

    materials = [
        {
            "name": "ChickHeadPlumage",
            "pbrMetallicRoughness": {
                "baseColorTexture": {"index": 0},
                "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
                "metallicFactor": 0.02,
                "roughnessFactor": 0.85,
            },
            "doubleSided": False,
        },
        {
            "name": "NasaSuitBetaCloth",
            "pbrMetallicRoughness": {
                "baseColorFactor": rgba_lin("#f2f0ea"),
                "metallicFactor": 0.04,
                "roughnessFactor": 0.74,
            },
            "doubleSided": False,
        },
        {
            "name": "NasaSuitShade",
            "pbrMetallicRoughness": {
                "baseColorFactor": rgba_lin("#cfd6e0"),
                "metallicFactor": 0.08,
                "roughnessFactor": 0.68,
            },
            "doubleSided": False,
        },
        {
            "name": "NasaAnodizedCobalt",
            "pbrMetallicRoughness": {
                "baseColorFactor": rgba_lin("#1d4ed8"),
                "metallicFactor": 0.52,
                "roughnessFactor": 0.30,
            },
            "doubleSided": False,
        },
        {
            "name": "NasaBrushedAluminum",
            "pbrMetallicRoughness": {
                "baseColorFactor": rgba_lin("#9ca3af"),
                "metallicFactor": 0.78,
                "roughnessFactor": 0.26,
            },
            "doubleSided": False,
        },
        {
            "name": "NasaDarkTitanium",
            "pbrMetallicRoughness": {
                "baseColorFactor": rgba_lin("#283242"),
                "metallicFactor": 0.35,
                "roughnessFactor": 0.50,
            },
            "doubleSided": False,
        },
        {
            "name": "NasaGoldSolarVisor",
            "pbrMetallicRoughness": {
                "baseColorFactor": rgba_lin("#eab308"),
                "metallicFactor": 0.88,
                "roughnessFactor": 0.16,
            },
            "doubleSided": False,
        },
        {
            "name": "NasaRedValve",
            "pbrMetallicRoughness": {
                "baseColorFactor": rgba_lin("#dc2626"),
                "metallicFactor": 0.62,
                "roughnessFactor": 0.26,
            },
            "doubleSided": False,
        },
        {
            "name": "NasaBlueValve",
            "pbrMetallicRoughness": {
                "baseColorFactor": rgba_lin("#2563eb"),
                "metallicFactor": 0.62,
                "roughnessFactor": 0.26,
            },
            "doubleSided": False,
        },
        {
            "name": "ChickBeakDark",
            "pbrMetallicRoughness": {
                "baseColorFactor": rgba_lin("#1c202b"),
                "metallicFactor": 0.08,
                "roughnessFactor": 0.42,
            },
            "doubleSided": False,
        },
        {
            "name": "ChickBeakCoral",
            "pbrMetallicRoughness": {
                "baseColorFactor": rgba_lin("#e07a5f"),
                "metallicFactor": 0.05,
                "roughnessFactor": 0.48,
            },
            "doubleSided": False,
        },
        {
            "name": "ChickEyeObsidian",
            "pbrMetallicRoughness": {
                "baseColorFactor": rgba_lin("#070a12"),
                "metallicFactor": 0.12,
                "roughnessFactor": 0.06,
            },
            "doubleSided": False,
        },
        {
            "name": "PureWhiteHighlight",
            "pbrMetallicRoughness": {
                "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
                "metallicFactor": 0.05,
                "roughnessFactor": 0.10,
            },
            "doubleSided": False,
        },
        {
            "name": "CyanTelemetryLed",
            "pbrMetallicRoughness": {
                "baseColorFactor": rgba_lin("#38bdf8"),
                "metallicFactor": 0.10,
                "roughnessFactor": 0.15,
            },
            "emissiveFactor": [0.15, 0.65, 0.95],
            "doubleSided": False,
        },
        {
            "name": "AmberBeaconLed",
            "pbrMetallicRoughness": {
                "baseColorFactor": rgba_lin("#f59e0b"),
                "metallicFactor": 0.10,
                "roughnessFactor": 0.18,
            },
            "emissiveFactor": [0.85, 0.50, 0.05],
            "doubleSided": False,
        },
        {
            "name": "HelmetPolycarbonateDome",
            "pbrMetallicRoughness": {
                "baseColorFactor": [0.82, 0.94, 1.0, 0.22],
                "metallicFactor": 0.08,
                "roughnessFactor": 0.06,
            },
            "alphaMode": "BLEND",
            "doubleSided": False,
        },
    ]

    align4(bin_chunks)
    gltf = {
        "asset": {
            "version": "2.0",
            "generator": "Cyberpenguins 3D Character Builder v2 (CCW + Embedded PNG + PBR Materials)",
        },
        "scene": 0,
        "scenes": [{"name": "CyberpenguinScene", "nodes": [0]}],
        "nodes": nodes,
        "meshes": meshes,
        "materials": materials,
        "textures": [{"sampler": 0, "source": 0}],
        "images": [{"bufferView": bv_png, "mimeType": "image/png", "name": "ChickHeadPlumageTex"}],
        "samplers": [{"magFilter": 9729, "minFilter": 9729, "wrapS": 10497, "wrapT": 33071}],
        "accessors": accessors,
        "bufferViews": buffer_views,
        "buffers": [{"byteLength": len(bin_chunks)}],
    }

    json_bytes = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    json_pad = (4 - (len(json_bytes) % 4)) % 4
    if json_pad:
        json_bytes += b" " * json_pad

    total_len = 12 + 8 + len(json_bytes) + 8 + len(bin_chunks)
    os.makedirs(os.path.dirname(OUT_GLB_PATH), exist_ok=True)
    with open(OUT_GLB_PATH, "wb") as f:
        f.write(struct.pack("<4sII", b"glTF", 2, total_len))
        f.write(struct.pack("<I4s", len(json_bytes), b"JSON"))
        f.write(json_bytes)
        f.write(struct.pack("<I4s", len(bin_chunks), b"BIN\x00"))
        f.write(bin_chunks)

    print(
        f"Generated {OUT_GLB_PATH}: {total_len:,} bytes ({total_len/1024:.1f} KB), "
        f"vertices={total_verts:,}, triangles={total_tris:,}, materials={len(materials)}, png={png_len:,} B"
    )


if __name__ == "__main__":
    pack_glb()
