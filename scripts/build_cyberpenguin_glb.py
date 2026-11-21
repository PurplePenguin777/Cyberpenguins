#!/usr/bin/env python3
"""Build an irresistibly adorable, Kawaii/Pixar-inspired 3D glTF 2.0 binary (.glb)
model of Cyberpenguin (Baby Emperor Penguin *Aptenodytes forsteri* chick in a NASA
Apollo A7L / EMU spacesuit) featuring:
  - Surface-normal-conforming 3D Kawaii Eyes: the entire glossy black cornea dome sits
    proudly in front of the curved chubby cheek surface (100% visible, zero submersion!),
    and the white anime starlight catchlights + sapphire lower iris crescent are
    parameterized in the exact same eye-dome coordinates (r < 0.72 of the eye radius)
    so the white and black parts of the eyes match with 100% mathematical precision!
  - Adorable 3D baby penguin crown feather tuft (copetito) inside the helmet
  - Chibi/Kawaii baby proportions (big expressive head, chubby mochi cheeks with rosy blush,
    tiny smiling button beak, sealed overhead torso collar, G2 quintic Bézier & squircle forms)

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


def smoothstep_g2(edge0, edge1, x):
    """Quintic C^2 / G^2 smoothstep: 6t^5 - 15t^4 + 10t^3."""
    if edge1 == edge0:
        return 0.0
    t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0)


def bezier_quintic(t, p0, p1, p2, p3, p4, p5):
    """Evaluate a 5th-degree (G2-continuous) Bézier curve at t in [0, 1]."""
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


def squircle_cs(theta, power=2.35):
    """Evaluate a G2-smooth squircle unit contour (sin_s, cos_s) for angle theta."""
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


# Shared head geometry constants so 3D eyes conform to the exact head surface!
HEAD_CY = 0.134
HEAD_CZ = 0.004
EYE_THETA_RAD = 0.375  # ±21.5 deg horizontal angle on face
EYE_Y_NORM = -0.02     # Slightly low baby placement aligned with cute button beak
EYE_RX_RAD = 0.255     # Generous Kawaii horizontal angular radius (~0.041 m)
EYE_RY_YNORM = 0.305   # Generous Kawaii vertical normalized radius (~0.045 m)


def chick_head_surface_point(theta, y_norm):
    """Evaluate the exact 3D point on the chubby "mochi" baby penguin head for any
    azimuth angle theta in [-pi, pi] (0 = +Z front) and vertical y_norm in [-1, 1].
    """
    y_norm = clamp(y_norm, -0.9999, 0.9999)
    phi = math.acos(-y_norm)
    sx, cz = squircle_cs(theta, power=2.15)
    t_h = (y_norm + 1.0) * 0.5

    base_r = bezier_quintic(t_h, 0.136, 0.165, 0.178, 0.157, 0.147, 0.141)
    cheek_front = smoothstep_g2(-0.15, 0.85, math.cos(theta))
    cheek_side = math.sin(theta) ** 2
    mochi_pouch = 1.0 + (0.096 * cheek_front + 0.066 * cheek_side) * math.exp(-((y_norm + 0.18) / 0.38) ** 2)

    v = phi / math.pi
    cap_env = math.sin(phi) ** 0.85 if v > 0.16 else (math.sin(phi) ** 0.52)
    rx = base_r * cap_env * mochi_pouch
    rz = (base_r * 0.93) * cap_env * (1.0 + 0.05 * cheek_front)
    y = HEAD_CY + 0.147 * y_norm
    x = rx * sx
    z = HEAD_CZ + rz * cz
    return (x, y, z)


def chick_head_surface_frame(theta, y_norm):
    """Return (point, outward_normal, tangent_u, tangent_v) on the head surface."""
    p = chick_head_surface_point(theta, y_norm)
    eps = 0.008
    p_u1 = chick_head_surface_point(theta + eps, y_norm)
    p_u0 = chick_head_surface_point(theta - eps, y_norm)
    p_v1 = chick_head_surface_point(theta, clamp(y_norm + eps, -0.999, 0.999))
    p_v0 = chick_head_surface_point(theta, clamp(y_norm - eps, -0.999, 0.999))
    tu = v_norm(v_sub(p_u1, p_u0))
    tv = v_norm(v_sub(p_v1, p_v0))
    n = v_norm(v_cross(tu, tv))
    # Verify n points outward away from head center
    if v_dot(n, v_sub(p, (0.0, HEAD_CY, HEAD_CZ))) < 0.0:
        n = (-n[0], -n[1], -n[2])
    return p, n, tu, tv


def evaluate_chick_head_srgb(u, v):
    """Evaluate the Kawaii Baby Emperor Penguin (*Aptenodytes forsteri* chick) head plumage in sRGB."""
    theta = (u - 0.5) * math.pi * 2.0
    phi = v * math.pi
    s = math.sin(phi)
    y_norm = -math.cos(phi)
    nx = s * math.sin(theta)
    ny = y_norm
    nz = s * math.cos(theta)

    # Wide, adorable heart-shaped snow-white face mask
    d_left_lobe = math.sqrt(((nx - 0.34) / 0.50) ** 2 + ((ny - 0.04) / 0.54) ** 2)
    d_right_lobe = math.sqrt(((nx + 0.34) / 0.50) ** 2 + ((ny - 0.04) / 0.54) ** 2)
    d_lower_face = math.sqrt((nx / 0.80) ** 2 + ((ny + 0.24) / 0.50) ** 2)
    mask_dist = min(d_left_lobe, d_right_lobe, d_lower_face)

    # Cute gentle widow's-peak curve of the dark emperor-chick hood at the top center of the forehead
    peak_dip = 0.16 * math.exp(-((nx / 0.24) ** 2)) * smoothstep_g2(0.06, 0.44, ny)
    mask_dist += peak_dip

    face_front = smoothstep_g2(0.02, 0.40, nz)
    white_mask = (1.0 - smoothstep_g2(0.76, 1.02, mask_dist)) * face_front

    # Warm, prominent Kawaii rosy-pink blush ovals on the chubby cheeks below the big eyes
    blush_l = math.exp(-(((theta - 0.49) / 0.17) ** 2 + ((y_norm + 0.26) / 0.13) ** 2))
    blush_r = math.exp(-(((theta + 0.49) / 0.17) ** 2 + ((y_norm + 0.26) / 0.13) ** 2))
    blush = max(blush_l, blush_r) * white_mask * 0.50

    # Soft dark velvet eye-socket backing at exact eye coordinates so the 3D eye rim blends seamlessly
    eye_d_l = math.sqrt(((theta - EYE_THETA_RAD) / (EYE_RX_RAD * 1.02)) ** 2 + ((y_norm - EYE_Y_NORM) / (EYE_RY_YNORM * 1.02)) ** 2)
    eye_d_r = math.sqrt(((theta + EYE_THETA_RAD) / (EYE_RX_RAD * 1.02)) ** 2 + ((y_norm - EYE_Y_NORM) / (EYE_RY_YNORM * 1.02)) ** 2)
    eye_socket = 1.0 - smoothstep_g2(0.88, 1.04, min(eye_d_l, eye_d_r))

    # Cute subtle arched happy eyebrows above the big Kawaii eyes
    brow_l = math.exp(-(((theta - 0.37) / 0.13) ** 2 + ((y_norm - (0.35 - 0.18 * (theta - 0.34) ** 2)) / 0.032) ** 2))
    brow_r = math.exp(-(((theta + 0.37) / 0.13) ** 2 + ((y_norm - (0.35 - 0.18 * (theta + 0.34) ** 2)) / 0.032) ** 2))
    cute_brow = max(brow_l, brow_r) * white_mask * 0.35

    neck_down = 1.0 - smoothstep_g2(-0.68, -0.32, ny)

    top_light = 0.5 + 0.5 * ny
    c_hood = mix_col(hex_srgb("#181e2c"), hex_srgb("#283147"), top_light * 0.48)
    c_mask = mix_col(hex_srgb("#f8fafc"), hex_srgb("#ffffff"), 0.45 + 0.55 * smoothstep_g2(-0.5, 0.35, ny))
    c_blush = hex_srgb("#ff809a")
    c_down = mix_col(hex_srgb("#d2daea"), hex_srgb("#eef2f8"), 0.45 + 0.55 * face_front)
    c_eye_rim = hex_srgb("#090c15")

    col = mix_col(c_hood, c_mask, white_mask)
    col = mix_col(col, c_blush, blush)
    col = mix_col(col, c_hood, cute_brow)
    col = mix_col(col, c_down, neck_down * (1.0 - white_mask * 0.72))
    col = mix_col(col, c_eye_rim, eye_socket)
    return col


def build_head_texture_png(width=512, height=512):
    buf = bytearray(width * height * 4)
    for y in range(height):
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
                px = sum(acc[pole_r * u_count + c][0] for c in range(cols))
                py = sum(acc[pole_r * u_count + c][1] for c in range(cols))
                pz = sum(acc[pole_r * u_count + c][2] for c in range(cols))
                for c in range(u_count):
                    acc[pole_r * u_count + c] = [px, py, pz]

        norms = [v_norm(n) for n in acc]
        self.add_surface(pos_list, fixed_tris, col_list, uv_list=uv_list, custom_normals=norms, interior_ref=None)

    def add_squircle_box(self, cx, cy, cz, sx, sy, sz, power=2.6, col=(1.0, 1.0, 1.0), rows=20, cols=40):
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
            return (cx + dx * hx, cy + dy * hy, cz + dz * hz), col

        self.add_grid_surface(rows, cols, eval_fn, wrap_u=True, close_poles=True, interior_ref=(cx, cy, cz))

    def add_cylinder(self, p0, p1, r0, r1, col, radial_segs=24, height_segs=3, cap_start=True, cap_end=True):
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

    def add_visor_cap_shell(self, cx, cy, cz, r_inner, r_outer, half_span_x_deg, arc_start_deg, arc_end_deg, rows, cols, col):
        center = (cx, cy, cz)
        u_cnt = cols + 1
        v_cnt = rows + 1

        def visor_pt(r, u, v):
            alpha = math.radians(-half_span_x_deg + u * (2.0 * half_span_x_deg))
            brow_arch = math.cos(alpha * 0.85)
            beta_deg = (arc_start_deg * (0.45 + 0.55 * brow_arch)) + v * (arc_end_deg - arc_start_deg * (0.45 + 0.55 * brow_arch))
            beta = math.radians(beta_deg)
            x = cx + r * math.sin(alpha)
            rc = r * math.cos(alpha)
            y = cy + rc * math.sin(beta)
            z = cz + rc * math.cos(beta)
            return (x, y, z)

        self.add_grid_surface(
            rows,
            cols,
            lambda u, v: (visor_pt(r_outer, u, v), col),
            wrap_u=False,
            close_poles=False,
            interior_ref=center,
        )

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
            lambda u, v: (visor_pt(r_inner, u, v), col),
            wrap_u=False,
            close_poles=False,
            interior_ref=inner_interior_ref,
        )

        mid_shell = visor_pt((r_inner + r_outer) * 0.5, 0.5, 0.5)
        for fixed_v in (0.0, 1.0):
            pos, cols_l, tris = [], [], []
            for c in range(u_cnt):
                u = c / float(cols)
                pos.append(visor_pt(r_inner, u, fixed_v))
                pos.append(visor_pt(r_outer, u, fixed_v))
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
                pos.append(visor_pt(r_inner, fixed_u, v))
                pos.append(visor_pt(r_outer, fixed_u, v))
                cols_l.extend((col, col))
            for r in range(rows):
                b = r * 2
                tris.append((b, b + 1, b + 3))
                tris.append((b, b + 3, b + 2))
            self.add_surface(pos, tris, cols_l, interior_ref=mid_shell)


# Material indices
MAT_HEAD_PLUMAGE = 0   # 512x512 embedded PNG texture of Kawaii Baby Emperor Penguin plumage
MAT_SUIT_WHITE = 1     # NASA Beta-cloth warm ivory white (#f5f3ed)
MAT_SUIT_SHADE = 2     # Soft grey-white pressure fold / O2 tank (#d4dbe5)
MAT_COBALT_NASA = 3    # Anodized NASA cobalt blue (#1d4ed8)
MAT_METAL_ALU = 4      # Brushed aluminum neck ring & latches (#9ca3af)
MAT_METAL_DARK = 5     # Dark titanium soles, flipper tips, belt & controls (#283242)
MAT_GOLD_VISOR = 6     # 24K gold solar visor (#eab308)
MAT_VALVE_RED = 7      # Anodized red oxygen valve (#dc2626)
MAT_VALVE_BLUE = 8     # Anodized blue coolant valve (#2563eb)
MAT_BEAK_DARK = 9      # Dark warm slate chick bill (#252b3b)
MAT_BEAK_CORAL = 10    # Warm coral-salmon lower mandible smile (#ff8a75)
MAT_EYE_OBSIDIAN = 11  # Deep glossy dark eye (#070a12)
MAT_PURE_WHITE = 12    # Bright white catchlights & patch insignia (#ffffff)
MAT_CYAN_LED = 13      # Emissive cyan telemetry & Kawaii lower iris glow (#38bdf8)
MAT_AMBER_LED = 14     # Emissive amber status indicator (#f59e0b)
MAT_HELMET_GLASS = 15  # Transparent polycarbonate bubble helmet dome

C_WHITE = (1.0, 1.0, 1.0)


def torso_profile_at(t_body):
    r_scale = bezier_quintic(t_body, 0.88, 1.12, 1.16, 1.00, 0.83, 0.765)
    rx = 0.218 * r_scale
    rz = 0.200 * r_scale
    z_off = 0.016 * math.sin(t_body * math.pi) + 0.010 * t_body
    return rx, rz, z_off


def build_torso_primitives():
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

    def eval_suit(u, v):
        theta = (u - 0.5) * math.pi * 2.0
        sx, cz = squircle_cs(theta, power=2.25)

        if v < 0.12:
            tc = v / 0.12
            ang = tc * (math.pi * 0.5)
            y = -0.046 + (1.0 - math.cos(ang)) * 0.030
            r_scale = math.sin(ang) * 0.88
            rx = 0.218 * r_scale
            rz = 0.200 * r_scale
            z_off = 0.0
            indent = 0.0
        elif v <= 0.88:
            t_body = (v - 0.12) / 0.76
            y = -0.016 + t_body * 0.376
            rx, rz, z_off = torso_profile_at(t_body)
            rib = math.sin(t_body * math.pi * 10.0)
            rib_mask = smoothstep_g2(0.08, 0.22, t_body) * (1.0 - smoothstep_g2(0.76, 0.92, t_body))
            indent = 0.0022 * max(0.0, -rib) * rib_mask
        else:
            tc = (v - 0.88) / 0.12
            ang = tc * (math.pi * 0.5)
            rx0, rz0, z_off0 = torso_profile_at(1.0)
            rx = rx0 * math.cos(ang)
            rz = rz0 * math.cos(ang)
            y = 0.360 + math.sin(ang) * 0.010
            z_off = z_off0
            indent = 0.0

        return ((rx - indent) * sx, y, (rz - indent) * cz + z_off), C_WHITE

    mbs[MAT_SUIT_WHITE].add_grid_surface(56, 60, eval_suit, wrap_u=True, close_poles=True, interior_ref=(0.0, 0.17, 0.01))

    mbs[MAT_SUIT_SHADE].add_cylinder(
        (0.0, 0.356, 0.010),
        (0.0, 0.374, 0.010),
        0.156,
        0.142,
        C_WHITE,
        radial_segs=36,
        height_segs=2,
    )

    for side in (-1.0, 1.0):
        mbs[MAT_SUIT_SHADE].add_cylinder(
            (side * 0.138, 0.250, 0.014),
            (side * 0.180, 0.242, 0.014),
            0.056,
            0.050,
            C_WHITE,
            radial_segs=24,
            height_segs=3,
        )
        mbs[MAT_COBALT_NASA].add_cylinder(
            (side * 0.156, 0.247, 0.014),
            (side * 0.168, 0.244, 0.014),
            0.055,
            0.053,
            C_WHITE,
            radial_segs=24,
            height_segs=1,
        )

    def eval_belt(u, v):
        theta = (u - 0.5) * math.pi * 2.0
        sx, cz = squircle_cs(theta, power=2.25)
        y = 0.068 + (v - 0.5) * 0.028
        t_b = (y + 0.016) / 0.376
        rx, rz, z_off = torso_profile_at(t_b)
        return ((rx + 0.004) * sx, y, (rz + 0.004) * cz + z_off), C_WHITE

    mbs[MAT_METAL_DARK].add_grid_surface(6, 48, eval_belt, wrap_u=True, close_poles=False, interior_ref=(0.0, 0.068, 0.016))
    mbs[MAT_METAL_ALU].add_squircle_box(0.0, 0.068, 0.244, 0.056, 0.038, 0.020, power=2.6, col=C_WHITE, rows=12, cols=24)
    mbs[MAT_CYAN_LED].add_squircle_box(0.0, 0.068, 0.251, 0.026, 0.016, 0.010, power=2.5, col=C_WHITE, rows=8, cols=16)

    mbs[MAT_COBALT_NASA].add_cylinder(
        (-0.084, 0.246, 0.180),
        (-0.095, 0.253, 0.205),
        0.030,
        0.028,
        C_WHITE,
        radial_segs=24,
        height_segs=1,
    )
    mbs[MAT_PURE_WHITE].add_cylinder(
        (-0.086, 0.248, 0.184),
        (-0.096, 0.254, 0.207),
        0.015,
        0.013,
        C_WHITE,
        radial_segs=18,
        height_segs=1,
    )

    def eval_neck_ring(u, v):
        theta = (u - 0.5) * math.pi * 2.0
        ang_v = v * math.pi * 2.0
        r_major = 0.164
        r = r_major + 0.026 * math.cos(ang_v)
        y = 0.360 + 0.022 * math.sin(ang_v) - 0.005 * math.cos(theta)
        return (r * math.sin(theta), y, r * 0.96 * math.cos(theta) + 0.012), C_WHITE

    def neck_ring_interior(tri_pts):
        c_pt = (
            (tri_pts[0][0] + tri_pts[1][0] + tri_pts[2][0]) / 3.0,
            (tri_pts[0][1] + tri_pts[1][1] + tri_pts[2][1]) / 3.0,
            (tri_pts[0][2] + tri_pts[1][2] + tri_pts[2][2]) / 3.0,
        )
        ang = math.atan2(c_pt[0], (c_pt[2] - 0.012) / 0.96)
        return (0.164 * math.sin(ang), 0.360 - 0.005 * math.cos(ang), 0.164 * 0.96 * math.cos(ang) + 0.012)

    mbs[MAT_COBALT_NASA].add_grid_surface(18, 48, eval_neck_ring, wrap_u=True, close_poles=False, interior_ref=neck_ring_interior)

    def eval_alu_collar(u, v):
        theta = (u - 0.5) * math.pi * 2.0
        ang_v = v * math.pi * 2.0
        r_major = 0.165
        r = r_major + 0.020 * math.cos(ang_v)
        y = 0.376 + 0.015 * math.sin(ang_v) - 0.005 * math.cos(theta)
        return (r * math.sin(theta), y, r * 0.96 * math.cos(theta) + 0.012), C_WHITE

    def alu_collar_interior(tri_pts):
        c_pt = (
            (tri_pts[0][0] + tri_pts[1][0] + tri_pts[2][0]) / 3.0,
            (tri_pts[0][1] + tri_pts[1][1] + tri_pts[2][1]) / 3.0,
            (tri_pts[0][2] + tri_pts[1][2] + tri_pts[2][2]) / 3.0,
        )
        ang = math.atan2(c_pt[0], (c_pt[2] - 0.012) / 0.96)
        return (0.165 * math.sin(ang), 0.376 - 0.005 * math.cos(ang), 0.165 * 0.96 * math.cos(ang) + 0.012)

    mbs[MAT_METAL_ALU].add_grid_surface(16, 48, eval_alu_collar, wrap_u=True, close_poles=False, interior_ref=alu_collar_interior)

    mbs[MAT_SUIT_SHADE].add_squircle_box(0.0, 0.194, 0.222, 0.114, 0.084, 0.044, power=2.65, col=C_WHITE, rows=16, cols=32)
    mbs[MAT_METAL_DARK].add_squircle_box(0.0, 0.211, 0.240, 0.084, 0.022, 0.014, power=2.5, col=C_WHITE, rows=10, cols=20)
    mbs[MAT_CYAN_LED].add_squircle_box(-0.018, 0.211, 0.244, 0.026, 0.010, 0.010, power=2.4, col=C_WHITE, rows=8, cols=16)
    mbs[MAT_AMBER_LED].add_cylinder((0.022, 0.211, 0.240), (0.022, 0.211, 0.249), 0.006, 0.006, C_WHITE, radial_segs=14, height_segs=1)
    mbs[MAT_METAL_DARK].add_cylinder((-0.022, 0.177, 0.236), (-0.022, 0.177, 0.250), 0.015, 0.014, C_WHITE, radial_segs=18, height_segs=1)
    mbs[MAT_COBALT_NASA].add_squircle_box(0.022, 0.177, 0.240, 0.030, 0.017, 0.014, power=2.5, col=C_WHITE, rows=8, cols=16)

    mbs[MAT_VALVE_BLUE].add_cylinder((0.056, 0.120, 0.218), (0.056, 0.120, 0.250), 0.018, 0.015, C_WHITE, radial_segs=20, height_segs=2)
    mbs[MAT_VALVE_RED].add_cylinder((-0.056, 0.120, 0.218), (-0.056, 0.120, 0.250), 0.018, 0.015, C_WHITE, radial_segs=20, height_segs=2)

    mbs[MAT_SUIT_WHITE].add_squircle_box(0.0, 0.185, -0.170, 0.254, 0.308, 0.130, power=2.7, col=C_WHITE, rows=18, cols=36)
    for side in (-1.0, 1.0):
        mbs[MAT_COBALT_NASA].add_squircle_box(side * 0.108, 0.185, -0.168, 0.044, 0.270, 0.114, power=2.6, col=C_WHITE, rows=12, cols=24)
        mbs[MAT_SUIT_SHADE].add_cylinder(
            (side * 0.064, 0.055, -0.220),
            (side * 0.064, 0.305, -0.220),
            0.038,
            0.038,
            C_WHITE,
            radial_segs=20,
            height_segs=3,
        )
    mbs[MAT_METAL_DARK].add_squircle_box(0.0, 0.285, -0.222, 0.142, 0.044, 0.030, power=2.5, col=C_WHITE, rows=10, cols=20)
    mbs[MAT_METAL_DARK].add_cylinder((0.092, 0.335, -0.190), (0.092, 0.515, -0.200), 0.008, 0.0045, C_WHITE, radial_segs=14, height_segs=3)
    mbs[MAT_AMBER_LED].add_cylinder((0.092, 0.515, -0.200), (0.092, 0.538, -0.202), 0.010, 0.008, C_WHITE, radial_segs=14, height_segs=2)

    return mbs


def build_flipper_primitives(is_left=True):
    mbs = {
        MAT_SUIT_WHITE: MeshBuilder(),
        MAT_COBALT_NASA: MeshBuilder(),
        MAT_METAL_DARK: MeshBuilder(),
    }
    sign = 1.0 if is_left else -1.0

    def flipper_pt(u, v, scale_r=1.0):
        theta = (u - 0.5) * math.pi * 2.0
        sx, cz = squircle_cs(theta, power=2.45)
        phi = v * math.pi
        t = (1.0 - math.cos(phi)) * 0.5

        cx = sign * bezier_quintic(t, -0.020, 0.004, 0.036, 0.066, 0.086, 0.080)
        cy = bezier_quintic(t, 0.018, 0.005, -0.042, -0.120, -0.198, -0.238)
        cz_center = bezier_quintic(t, 0.0, 0.004, 0.008, 0.002, -0.010, -0.020)

        s_env = math.sin(phi)
        thick_x = (0.044 * (s_env ** 0.80) * (1.0 - 0.34 * t)) * scale_r
        width_z = (0.070 * (s_env ** 0.76) * (1.0 + 0.14 * math.sin(t * math.pi) - 0.20 * (t ** 2))) * scale_r

        return (cx + thick_x * sx, cy, cz_center + width_z * cz), (cx, cy, cz_center)

    def flipper_interior(tri_pts):
        cy = (tri_pts[0][1] + tri_pts[1][1] + tri_pts[2][1]) / 3.0
        t = clamp((0.018 - cy) / 0.256, 0.0, 1.0)
        cx = sign * bezier_quintic(t, -0.020, 0.004, 0.036, 0.066, 0.086, 0.080)
        cz_c = bezier_quintic(t, 0.0, 0.004, 0.008, 0.002, -0.010, -0.020)
        return (cx, cy, cz_c)

    mbs[MAT_SUIT_WHITE].add_grid_surface(
        32, 36, lambda u, v: (flipper_pt(u, v, 1.0)[0], C_WHITE), wrap_u=True, close_poles=True, interior_ref=flipper_interior
    )

    mbs[MAT_COBALT_NASA].add_grid_surface(
        6,
        36,
        lambda u, v: (flipper_pt(u, 0.45 + v * 0.08, 1.028)[0], C_WHITE),
        wrap_u=True,
        close_poles=False,
        interior_ref=flipper_interior,
    )

    mbs[MAT_METAL_DARK].add_grid_surface(
        12,
        36,
        lambda u, v: (flipper_pt(u, 0.70 + v * 0.30, 1.024)[0], C_WHITE),
        wrap_u=True,
        close_poles=True,
        interior_ref=flipper_interior,
    )

    return mbs


def build_foot_primitives(is_left=True):
    mbs = {
        MAT_SUIT_WHITE: MeshBuilder(),
        MAT_SUIT_SHADE: MeshBuilder(),
        MAT_COBALT_NASA: MeshBuilder(),
        MAT_METAL_DARK: MeshBuilder(),
    }
    sign = 1.0 if is_left else -1.0

    def eval_leg(u, v):
        theta = (u - 0.5) * math.pi * 2.0
        sx, cz = squircle_cs(theta, power=2.2)
        y = 0.02 - v * 0.135
        rib = math.sin(v * math.pi * 6.0)
        rx = 0.058 + 0.0035 * rib
        rz = 0.062 + 0.0035 * rib
        return (rx * sx, y, rz * cz), C_WHITE

    mbs[MAT_SUIT_WHITE].add_grid_surface(
        14, 28, eval_leg, wrap_u=True, close_poles=False, interior_ref=lambda pts: (0.0, (pts[0][1] + pts[1][1] + pts[2][1]) / 3.0, 0.0)
    )

    def boot_pt(u, v, scale_r=1.0):
        theta = (u - 0.5) * math.pi * 2.0
        sx, cz = squircle_cs(theta, power=2.35)
        phi = v * math.pi
        t = (1.0 - math.cos(phi)) * 0.5
        s = math.sin(phi)
        raw_y = -0.098 - t * 0.088
        y = max(-0.180, raw_y)
        forward = max(0.0, cz)
        rx = (0.066 + 0.016 * forward * math.sin(t * math.pi)) * (s ** 0.74) * scale_r
        rz_front = 0.116 * (s ** 0.72) * scale_r
        rz_back = 0.065 * (s ** 0.76) * scale_r
        rz = rz_front if cz >= 0 else rz_back
        x = rx * sx + sign * 0.004 * forward
        z = rz * cz + 0.028 * math.sin(t * math.pi * 0.75)
        return (x, y, z)

    mbs[MAT_SUIT_SHADE].add_grid_surface(
        24, 34, lambda u, v: (boot_pt(u, v, 1.0), C_WHITE), wrap_u=True, close_poles=True, interior_ref=(0.0, -0.145, 0.02)
    )

    mbs[MAT_COBALT_NASA].add_grid_surface(
        8,
        22,
        lambda u, v: (boot_pt(0.24 + u * 0.52, 0.34 + v * 0.28, 1.024), C_WHITE),
        wrap_u=False,
        close_poles=False,
        interior_ref=(0.0, -0.145, 0.02),
    )

    mbs[MAT_METAL_DARK].add_grid_surface(
        10,
        34,
        lambda u, v: (boot_pt(u, 0.65 + v * 0.35, 1.028), C_WHITE),
        wrap_u=True,
        close_poles=True,
        interior_ref=(0.0, -0.145, 0.02),
    )

    return mbs


def build_head_primitives():
    """Node 6 (`Head`), origin at neck pivot (0, 0.365, 0.01) relative to Torso.
    CRITICAL FIX FOR KAWAII EYES:
      Each eye is built by projecting directly onto the exact head surface `chick_head_surface_frame(theta, y_norm)`
      and displacing OUTWARD along the local head surface normal `n_head`!
      - The black cornea dome (`MAT_EYE_OBSIDIAN`) bulges +2.5 mm at its rim to +14.5 mm at its center
        OUTSIDE the cheek surface, so 100% of the big oval black Kawaii eye is visible!
      - The dual white anime catchlights (`MAT_PURE_WHITE`) and sapphire lower iris crescent (`MAT_CYAN_LED`)
        are parameterized in the EXACT same normalized eye coordinates `(dx_e, dy_e)` with `r_e < 0.75`
        and offset +1.2 mm above the black cornea surface, so the white and black parts of the eyes
        are 100% aligned from every viewing angle!
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

    head_center = (0.0, HEAD_CY, HEAD_CZ)

    # 1. Plush Neck Column plugging the head solidly into the sealed torso neck ring
    def eval_plush_neck(u, v):
        theta = (u - 0.5) * math.pi * 2.0
        sx, cz = squircle_cs(theta, power=2.18)
        y = -0.014 + v * 0.068
        r = 0.136 - 0.018 * smoothstep_g2(0.0, 1.0, v)
        x = r * sx
        z = HEAD_CZ + (r * 0.94) * cz
        sr, sg, sb = evaluate_chick_head_srgb(u, 0.08)
        return (x, y, z), (srgb_to_linear(sr), srgb_to_linear(sg), srgb_to_linear(sb)), (u, 0.08)

    mbs[MAT_HEAD_PLUMAGE].add_grid_surface(
        10, 48, eval_plush_neck, wrap_u=True, close_poles=False, interior_ref=(0.0, 0.02, HEAD_CZ)
    )

    # 2. Chubby "Mochi" Kawaii Baby Emperor Penguin Head (`MAT_HEAD_PLUMAGE`)
    def eval_chick_head(u, v):
        theta = (u - 0.5) * math.pi * 2.0
        phi = v * math.pi
        y_norm = -math.cos(phi)
        p = chick_head_surface_point(theta, y_norm)
        sr, sg, sb = evaluate_chick_head_srgb(u, v)
        lin_col = (srgb_to_linear(sr), srgb_to_linear(sg), srgb_to_linear(sb))
        return p, lin_col, (u, v)

    mbs[MAT_HEAD_PLUMAGE].add_grid_surface(52, 64, eval_chick_head, wrap_u=True, close_poles=True, interior_ref=head_center)

    # 2b. Adorable Baby Down Tuft (Copetito de plumón de bebé) at the top crown of the head!
    for (tx, tz, tilt_x, tilt_z, h_tuft, r_tuft) in [
        (0.0, 0.025, -0.008, 0.012, 0.026, 0.014),
        (0.013, 0.018, 0.010, 0.008, 0.021, 0.011),
    ]:
        p_base = (tx, HEAD_CY + 0.140, HEAD_CZ + tz)
        p_tip = (tx + tilt_x, HEAD_CY + 0.140 + h_tuft, HEAD_CZ + tz + tilt_z)
        mbs[MAT_EYE_OBSIDIAN].add_cylinder(p_base, p_tip, r_tuft, 0.003, C_WHITE, radial_segs=14, height_segs=3)

    # 3. Tiny, Adorable, Smiling Kawaii Button Beak (+Z front, seated right between the big eyes)
    p_beak_surf, n_beak_surf, _, _ = chick_head_surface_frame(0.0, -0.14)
    beak_cy = p_beak_surf[1]
    beak_cz = p_beak_surf[2] - 0.004
    beak_len = 0.026  # Cute button bill protruding 2.2 cm from face (stays > 4.6 cm inside the bubble helmet!)

    def eval_cute_beak(u, v):
        theta = (u - 0.5) * math.pi * 2.0
        sx, cy_s = squircle_cs(theta, power=2.25)
        phi = v * (math.pi * 0.5)
        profile = math.cos(phi) ** 0.78
        t = math.sin(phi)
        rx = 0.025 * profile
        ry = 0.0155 * profile
        smile_lift = 0.0035 * (sx ** 2) * (1.0 - t * 0.6)
        x = rx * sx
        y = beak_cy + smile_lift + ry * cy_s
        z = beak_cz + t * beak_len
        return (x, y, z), C_WHITE

    mbs[MAT_BEAK_DARK].add_grid_surface(
        18, 28, eval_cute_beak, wrap_u=True, close_poles=True, interior_ref=(0.0, beak_cy, beak_cz + 0.004)
    )

    def eval_coral_smile(u, v):
        theta = math.pi * (0.56 + u * 0.88)
        phi = v * (math.pi * 0.42)
        profile = math.cos(phi) ** 0.76
        t = math.sin(phi)
        rx = 0.0258 * profile
        ry = 0.0165 * profile
        sx = math.sin(theta)
        x = rx * sx
        y = beak_cy + 0.0035 * (sx ** 2) * (1.0 - t * 0.6) + ry * math.cos(theta)
        z = beak_cz + t * beak_len
        return (x, y, z), C_WHITE

    mbs[MAT_BEAK_CORAL].add_grid_surface(
        8, 18, eval_coral_smile, wrap_u=False, close_poles=False, interior_ref=(0.0, beak_cy + 0.003, beak_cz + 0.004)
    )

    # 4. SURFACE-CONFORMING OVERSIZED KAWAII 3D EYES (100% visible above cheek + 100% aligned catchlights!)
    def eye_dome_point(side, dx_norm, dy_norm, extra_height=0.0):
        """Map normalized eye coordinates (dx_norm, dy_norm) in unit disk r <= 1.0
        directly onto the 3D cheek surface and displace outward along the surface normal!
        """
        r2 = min(1.0, dx_norm * dx_norm + dy_norm * dy_norm)
        dome_h = 0.0022 + 0.0125 * math.sqrt(max(0.0, 1.0 - r2)) + extra_height
        theta = side * EYE_THETA_RAD + dx_norm * EYE_RX_RAD
        y_n = EYE_Y_NORM + dy_norm * EYE_RY_YNORM
        p_surf, n_surf, _, _ = chick_head_surface_frame(theta, y_n)
        return v_add(p_surf, v_scale(n_surf, dome_h))

    for side in (-1.0, 1.0):
        p_eye_center, n_eye_center, _, _ = chick_head_surface_frame(side * EYE_THETA_RAD, EYE_Y_NORM)
        eye_interior = v_add(p_eye_center, v_scale(n_eye_center, -0.020))

        # 4a. Big Glossy Black Kawaii Eye Dome (`MAT_EYE_OBSIDIAN`, r_norm from 1.0 at rim to 0.0 at center)
        def make_black_eye_eval(s_dir):
            def eval_black_eye(u, v):
                ang = (u - 0.5) * math.pi * 2.0
                # v=0 is outer rim anchored slightly inside cheek (-0.002), v=1 is front cornea pole
                if v < 0.15:
                    r_n = 1.0
                    h_off = -0.003 * (1.0 - v / 0.15)
                else:
                    tv = (v - 0.15) / 0.85
                    r_n = math.cos(tv * math.pi * 0.5)
                    h_off = 0.0
                sx, cy_s = squircle_cs(ang, power=2.12)
                return eye_dome_point(s_dir, r_n * sx, r_n * cy_s, extra_height=h_off), C_WHITE
            return eval_black_eye

        mbs[MAT_EYE_OBSIDIAN].add_grid_surface(
            20, 32, make_black_eye_eval(side), wrap_u=True, close_poles=False, interior_ref=eye_interior
        )

        # 4b. Kawaii Sapphire-Blue Lower Iris Crescent (`MAT_CYAN_LED`, strictly inside r_norm in 0.42..0.76!)
        def make_iris_eval(s_dir):
            def eval_iris(u, v):
                # Lower arc of the eye: angle from -142 deg to -38 deg in the lower half of the eye
                ang = math.radians(-142.0 + u * 104.0)
                r_n = 0.44 + v * 0.30
                dx_n = r_n * math.cos(ang)
                dy_n = r_n * math.sin(ang)
                # Arch thickness tapers at ends u=0 and u=1
                lift = 0.0011 * math.sin(u * math.pi) * math.sin(v * math.pi)
                return eye_dome_point(s_dir, dx_n, dy_n, extra_height=0.0008 + lift), C_WHITE
            return eval_iris

        mbs[MAT_CYAN_LED].add_grid_surface(
            8, 18, make_iris_eval(side), wrap_u=False, close_poles=False, interior_ref=eye_interior
        )

        # 4c. Dual Kawaii Starlight Catchlights (`MAT_PURE_WHITE`, strictly inside the black eye at r_norm < 0.72!)
        # Big upper-inner anime highlight + cute lower-outer secondary bead
        for (cx_n, cy_n, rx_n, ry_n) in [
            (-0.26 * side, 0.30, 0.25, 0.27),
            (0.28 * side, -0.24, 0.12, 0.13),
        ]:
            def make_catchlight_eval(s_dir, c_x, c_y, r_x, r_y):
                def eval_catchlight(u, v):
                    ang = (u - 0.5) * math.pi * 2.0
                    r_local = math.cos(v * math.pi * 0.5)
                    dx_n = c_x + r_local * r_x * math.sin(ang)
                    dy_n = c_y + r_local * r_y * math.cos(ang)
                    h_bump = 0.0012 + 0.0010 * math.sin(v * math.pi * 0.5)
                    return eye_dome_point(s_dir, dx_n, dy_n, extra_height=h_bump), C_WHITE
                return eval_catchlight

            mbs[MAT_PURE_WHITE].add_grid_surface(
                10, 18, make_catchlight_eval(side, cx_n, cy_n, rx_n, ry_n), wrap_u=True, close_poles=False, interior_ref=eye_interior
            )

    # 5. Unified NASA Bubble Helmet Collar & Temple-Hinged Raised LEVA Visor
    def eval_helmet_base_ring(u, v):
        theta = (u - 0.5) * math.pi * 2.0
        ang_v = v * math.pi * 2.0
        r_major = 0.168
        r = r_major + 0.015 * math.cos(ang_v)
        y = 0.010 + 0.012 * math.sin(ang_v) - 0.005 * math.cos(theta)
        return (r * math.sin(theta), y, r * 0.96 * math.cos(theta) + 0.004), C_WHITE

    def base_ring_interior(tri_pts):
        c_pt = (
            (tri_pts[0][0] + tri_pts[1][0] + tri_pts[2][0]) / 3.0,
            (tri_pts[0][1] + tri_pts[1][1] + tri_pts[2][1]) / 3.0,
            (tri_pts[0][2] + tri_pts[1][2] + tri_pts[2][2]) / 3.0,
        )
        ang = math.atan2(c_pt[0], (c_pt[2] - 0.004) / 0.96)
        return (0.168 * math.sin(ang), 0.010 - 0.005 * math.cos(ang), 0.168 * 0.96 * math.cos(ang) + 0.004)

    mbs[MAT_METAL_ALU].add_grid_surface(12, 44, eval_helmet_base_ring, wrap_u=True, close_poles=False, interior_ref=base_ring_interior)

    mbs[MAT_GOLD_VISOR].add_visor_cap_shell(
        0.0,
        HEAD_CY,
        HEAD_CZ,
        r_inner=0.212,
        r_outer=0.218,
        half_span_x_deg=76.0,
        arc_start_deg=28.0,
        arc_end_deg=108.0,
        rows=16,
        cols=34,
        col=C_WHITE,
    )

    mbs[MAT_SUIT_WHITE].add_visor_cap_shell(
        0.0,
        HEAD_CY,
        HEAD_CZ,
        r_inner=0.218,
        r_outer=0.226,
        half_span_x_deg=78.0,
        arc_start_deg=36.0,
        arc_end_deg=124.0,
        rows=16,
        cols=34,
        col=C_WHITE,
    )

    mbs[MAT_COBALT_NASA].add_visor_cap_shell(
        0.0,
        HEAD_CY,
        HEAD_CZ,
        r_inner=0.224,
        r_outer=0.228,
        half_span_x_deg=44.0,
        arc_start_deg=36.5,
        arc_end_deg=43.5,
        rows=4,
        cols=20,
        col=C_WHITE,
    )

    for side in (-1.0, 1.0):
        piv_y = HEAD_CY + 0.025
        piv_z = HEAD_CZ + 0.020
        piv_x_in = side * 0.198
        piv_x_out = side * 0.224
        mbs[MAT_METAL_ALU].add_cylinder(
            (piv_x_in, piv_y, piv_z),
            (piv_x_out, piv_y, piv_z),
            0.024,
            0.020,
            C_WHITE,
            radial_segs=18,
            height_segs=2,
        )
        mbs[MAT_COBALT_NASA].add_cylinder(
            (piv_x_out - side * 0.003, piv_y, piv_z),
            (piv_x_out + side * 0.002, piv_y, piv_z),
            0.012,
            0.011,
            C_WHITE,
            radial_segs=14,
            height_segs=1,
        )

    return mbs


def build_helmet_glass_mesh():
    """Node 7 (`HelmetGlass`), origin at neck pivot (0, 0.365, 0.01) relative to Torso."""
    mb = MeshBuilder()
    r_dome = 0.210
    phi_min = 0.19 * math.pi

    def eval_dome(u, v):
        theta = (u - 0.5) * math.pi * 2.0
        phi = phi_min + v * (math.pi - phi_min)
        sn = math.sin(phi)
        cs = -math.cos(phi)
        px = r_dome * sn * math.sin(theta)
        py = HEAD_CY + r_dome * 1.02 * cs
        pz = HEAD_CZ + r_dome * 1.01 * sn * math.cos(theta)
        return (px, py, pz), C_WHITE

    mb.add_grid_surface(32, 48, eval_dome, wrap_u=True, close_poles=True, interior_ref=(0.0, HEAD_CY, HEAD_CZ))
    return mb


def pack_glb():
    head_png_bytes = build_head_texture_png(512, 512)

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

    # Slightly larger Chibi head/helmet scale (1.06x) for adorable baby proportions!
    nodes = [
        {"name": "PenguinRoot", "children": [1, 4, 5]},
        {"name": "Torso", "mesh": 0, "translation": [0.0, 0.20, 0.0], "children": [2, 3, 6, 7]},
        {"name": "FlipperL", "mesh": 1, "translation": [0.158, 0.250, 0.014]},
        {"name": "FlipperR", "mesh": 2, "translation": [-0.158, 0.250, 0.014]},
        {"name": "FootL", "mesh": 3, "translation": [0.095, 0.18, 0.01]},
        {"name": "FootR", "mesh": 4, "translation": [-0.095, 0.18, 0.01]},
        {"name": "Head", "mesh": 5, "translation": [0.0, 0.365, 0.01], "scale": [1.06, 1.06, 1.06]},
        {"name": "HelmetGlass", "mesh": 6, "translation": [0.0, 0.365, 0.01], "scale": [1.06, 1.06, 1.06]},
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
                "metallicFactor": 0.0,
                "roughnessFactor": 0.94,
            },
            "doubleSided": False,
        },
        {
            "name": "NasaSuitBetaCloth",
            "pbrMetallicRoughness": {
                "baseColorFactor": rgba_lin("#f5f3ed"),
                "metallicFactor": 0.02,
                "roughnessFactor": 0.74,
            },
            "doubleSided": False,
        },
        {
            "name": "NasaSuitShade",
            "pbrMetallicRoughness": {
                "baseColorFactor": rgba_lin("#d4dbe5"),
                "metallicFactor": 0.05,
                "roughnessFactor": 0.68,
            },
            "doubleSided": False,
        },
        {
            "name": "NasaAnodizedCobalt",
            "pbrMetallicRoughness": {
                "baseColorFactor": rgba_lin("#1d4ed8"),
                "metallicFactor": 0.50,
                "roughnessFactor": 0.28,
            },
            "doubleSided": False,
        },
        {
            "name": "NasaBrushedAluminum",
            "pbrMetallicRoughness": {
                "baseColorFactor": rgba_lin("#9ca3af"),
                "metallicFactor": 0.78,
                "roughnessFactor": 0.25,
            },
            "doubleSided": False,
        },
        {
            "name": "NasaDarkTitanium",
            "pbrMetallicRoughness": {
                "baseColorFactor": rgba_lin("#283242"),
                "metallicFactor": 0.30,
                "roughnessFactor": 0.48,
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
                "baseColorFactor": rgba_lin("#252b3b"),
                "metallicFactor": 0.05,
                "roughnessFactor": 0.36,
            },
            "doubleSided": False,
        },
        {
            "name": "ChickBeakCoral",
            "pbrMetallicRoughness": {
                "baseColorFactor": rgba_lin("#ff8a75"),
                "metallicFactor": 0.04,
                "roughnessFactor": 0.40,
            },
            "doubleSided": False,
        },
        {
            "name": "ChickEyeObsidian",
            "pbrMetallicRoughness": {
                "baseColorFactor": rgba_lin("#060810"),
                "metallicFactor": 0.10,
                "roughnessFactor": 0.04,
            },
            "doubleSided": False,
        },
        {
            "name": "PureWhiteHighlight",
            "pbrMetallicRoughness": {
                "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
                "metallicFactor": 0.02,
                "roughnessFactor": 0.06,
            },
            "emissiveFactor": [0.35, 0.35, 0.38],
            "doubleSided": False,
        },
        {
            "name": "CyanTelemetryLed",
            "pbrMetallicRoughness": {
                "baseColorFactor": rgba_lin("#38bdf8"),
                "metallicFactor": 0.08,
                "roughnessFactor": 0.14,
            },
            "emissiveFactor": [0.12, 0.58, 0.92],
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
                "baseColorFactor": [0.88, 0.96, 1.0, 0.16],
                "metallicFactor": 0.02,
                "roughnessFactor": 0.14,
            },
            "alphaMode": "BLEND",
            "doubleSided": False,
        },
    ]

    align4(bin_chunks)
    gltf = {
        "asset": {
            "version": "2.0",
            "generator": "Cyberpenguins 3D Character Builder v5 (Surface-Conforming Kawaii Eyes + Crown Tuft)",
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
