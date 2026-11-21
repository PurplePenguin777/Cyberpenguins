#!/usr/bin/env python3
"""Build an irresistibly adorable, Kawaii 3D glTF 2.0 binary (.glb) model of
Cyberpenguin (Baby Emperor Penguin *Aptenodytes forsteri* chick in a NASA Apollo A7L / EMU
spacesuit) matching the 3 Kawaii reference sheets:
  1. `EyesOpen` (Reference 3): Big soulful Kawaii blue eyes with crisp white sclera rim,
     deep navy pupil, glowing sky-blue lower iris crescent (#29b6f6 -> #7dd3fc), large
     upper-left white highlight, small lower-right white dot, and 4-point star sparkle (✦)!
  2. `EyesHalf` (Reference 1): Half-closed happy squint eyes with upward-curving lower eyelid
     and dual white highlights!
  3. `EyesClosed` (Reference 2): Happy closed arch eyes (^ ^) with rounded ends!
  4. Warm golden-apricot rounded-diamond baby beak (#ffa726 -> #ffb74d) with a sweet
     dark smiling mouth line (◡) across the middle!
  5. Soft slate-blue/grey baby emperor hood (#465775), tall M-arched snow-white face mask,
     pastel-pink horizontal oval cheek blushes (#ff9eb5), and cute double crown feather tuft!
  6. All 3 eye states + beak smile + head plumage are baked into an embedded 512x512 PNG
     texture atlas on surface-normal-conforming 3D cornea domes so the white, blue, and
     black parts of the eyes are 100% aligned from every angle with zero parallax error!

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


# Shared head & eye geometry constants
HEAD_CY = 0.134
HEAD_CZ = 0.004
EYE_THETA_RAD = 0.365  # Horizontal placement of each big Kawaii eye
EYE_Y_NORM = 0.01      # Vertical center of the big Kawaii eyes
EYE_RX_RAD = 0.255     # Angular width of each eye dome
EYE_RY_YNORM = 0.305   # Vertical radius of each eye dome


def chick_head_surface_point(theta, y_norm):
    """Evaluate the exact 3D point on the chubby "mochi" baby penguin head."""
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
    if v_dot(n, v_sub(p, (0.0, HEAD_CY, HEAD_CZ))) < 0.0:
        n = (-n[0], -n[1], -n[2])
    return p, n, tu, tv


def evaluate_head_plumage_srgb(u_local, v_local):
    """Evaluate head plumage color for u_local in [0, 1], v_local in [0, 1].
    Matches the cute plush slate-blue/grey hood & tall M-arched snow-white face mask
    with pastel-pink horizontal oval cheek blushes from the 3 reference images!
    """
    theta = (u_local - 0.5) * math.pi * 2.0
    phi = v_local * math.pi
    s = math.sin(phi)
    y_norm = -math.cos(phi)
    nx = s * math.sin(theta)
    ny = y_norm
    nz = s * math.cos(theta)

    # Tall M-arched white eye-patches joining smoothly across the lower cheeks & chin (Reference 1, 2, 3)
    d_left_lobe = math.sqrt(((nx - 0.34) / 0.46) ** 2 + ((ny - 0.06) / 0.54) ** 2)
    d_right_lobe = math.sqrt(((nx + 0.34) / 0.46) ** 2 + ((ny - 0.06) / 0.54) ** 2)
    d_lower_face = math.sqrt((nx / 0.78) ** 2 + ((ny + 0.25) / 0.44) ** 2)
    mask_dist = min(d_left_lobe, d_right_lobe, d_lower_face)

    # Pronounced cute center M-peak of the slate-blue hood dipping between the eyes toward the top of the beak
    peak_dip = 0.24 * math.exp(-((nx / 0.20) ** 2)) * smoothstep_g2(-0.04, 0.42, ny)
    mask_dist += peak_dip

    face_front = smoothstep_g2(0.02, 0.40, nz)
    white_mask = (1.0 - smoothstep_g2(0.78, 0.98, mask_dist)) * face_front
    outline_band = smoothstep_g2(0.74, 0.88, mask_dist) * (1.0 - smoothstep_g2(0.88, 1.0, mask_dist)) * face_front

    # Crisp pastel-pink horizontal oval cheek blushes right below the outer corners of the eyes (Reference 1, 2, 3)
    d_blush_l = math.sqrt(((theta - 0.50) / 0.145) ** 2 + ((y_norm + 0.28) / 0.075) ** 2)
    d_blush_r = math.sqrt(((theta + 0.50) / 0.145) ** 2 + ((y_norm + 0.28) / 0.075) ** 2)
    blush = (1.0 - smoothstep_g2(0.70, 1.0, min(d_blush_l, d_blush_r))) * white_mask * 0.72

    top_light = 0.5 + 0.5 * ny
    # Plush slate-blue / periwinkle-charcoal baby penguin hood (warm & friendly like Reference 2 & 3)
    c_hood = mix_col(hex_srgb("#334466"), hex_srgb("#52688f"), top_light * 0.65)
    c_hood_outline = hex_srgb("#1d2840")
    c_mask = hex_srgb("#ffffff")
    c_blush = hex_srgb("#ffa3b5")

    col = mix_col(c_hood, c_mask, white_mask)
    col = mix_col(col, c_hood_outline, outline_band * 0.45)
    col = mix_col(col, c_blush, blush)
    return col


def evaluate_kawaii_eye_srgb(dx, dy, mode="open"):
    """Evaluate the exact Kawaii eye artwork at normalized eye coordinates (dx, dy) in [-1.15, +1.15].
    Note: dx > 0 is toward the center of the face (beak), dx < 0 is toward the outer temple,
    OR we pass screen-consistent dx where dx < 0 is upper-left (classic anime catchlight side!)
    and dy > 0 is UP.
    Modes:
      - 'open'   (Reference 3: big blue Kawaii eyes with sky-blue lower crescent, big top-left
                  white highlight, small bottom-right white dot, 4-point star sparkle ✦, and white sclera rim)
      - 'half'   (Reference 1: happy squinted eyes with upward-curving lower cheek eyelid)
      - 'closed' (Reference 2: happy upward-curving closed arch ^ ^ on pure white cheek)
    """
    c_white = hex_srgb("#ffffff")
    c_navy_outline = hex_srgb("#182036")
    c_pupil_dark = hex_srgb("#10172b")
    c_iris_mid = hex_srgb("#1e56a0")
    c_iris_cyan = hex_srgb("#29b6f6")
    c_iris_bright = hex_srgb("#8be0ff")

    if mode == "closed":
        # Reference 2: Smooth thick upward-curving dark-navy arch (^ ^) on snow-white cheek
        # Arch curve: y_arch(x) = 0.16 - 0.95 * (dx^2) for |dx| <= 0.68
        x_clamped = clamp(dx, -0.68, 0.68)
        y_arch = 0.18 - 0.92 * (x_clamped * x_clamped)
        dist_arch = math.sqrt((dx - x_clamped) ** 2 + ((dy - y_arch) / 0.90) ** 2)
        arch_mask = 1.0 - smoothstep_g2(0.11, 0.17, dist_arch)
        return mix_col(c_white, c_navy_outline, arch_mask)

    # Radial squircle distance from eye center
    r_oval = math.sqrt((dx / 0.88) ** 2 + (dy / 0.94) ** 2)

    # Outer dark eyelid contour ring (r in 0.88..0.98) + white sclera margin outside
    outer_dark = 1.0 - smoothstep_g2(0.92, 0.99, r_oval)
    inner_white_ring = smoothstep_g2(0.80, 0.85, r_oval) * (1.0 - smoothstep_g2(0.89, 0.94, r_oval))
    iris_disk = 1.0 - smoothstep_g2(0.80, 0.85, r_oval)

    # Base dark navy pupil/iris
    eye_col = c_pupil_dark

    if mode == "open":
        # Reference 3: Luminous sky-blue lower iris crescent wrapping the bottom half of the iris
        # Crescent sits at r_oval in [0.34, 0.78] and dy < 0.08
        cres_y = dy + 0.14 - 0.22 * (dx * dx)
        cres_band = (
            smoothstep_g2(0.30, 0.44, r_oval)
            * (1.0 - smoothstep_g2(0.73, 0.81, r_oval))
            * (1.0 - smoothstep_g2(-0.08, 0.22, cres_y))
        )
        # Soft mid-blue aura around the crescent
        aura_band = (
            smoothstep_g2(0.22, 0.40, r_oval)
            * (1.0 - smoothstep_g2(0.76, 0.83, r_oval))
            * (1.0 - smoothstep_g2(0.05, 0.42, cres_y))
        )
        eye_col = mix_col(eye_col, c_iris_mid, aura_band * 0.85)
        eye_col = mix_col(eye_col, c_iris_cyan, cres_band * 0.95)
        # Brighter cyan core in the bottom center of the crescent
        core_d = math.sqrt((dx / 0.45) ** 2 + ((dy + 0.48) / 0.20) ** 2)
        eye_col = mix_col(eye_col, c_iris_bright, (1.0 - smoothstep_g2(0.4, 1.0, core_d)) * cres_band * 0.75)

        # Tiny 4-point star sparkle (✦) at middle-right (cx = +0.16, cy = -0.02)
        sx_d = abs(dx - 0.16)
        sy_d = abs(dy + 0.02)
        star_d = (sx_d ** 0.65 + sy_d ** 0.65) ** (1.0 / 0.65)
        star_mask = 1.0 - smoothstep_g2(0.055, 0.105, star_d)
        eye_col = mix_col(eye_col, c_white, star_mask)

    # Big round upper-left white highlight circle (Reference 1 & 3)
    d_hi_big = math.sqrt(((dx + 0.23) / 0.24) ** 2 + ((dy - 0.24) / 0.25) ** 2)
    hi_big = 1.0 - smoothstep_g2(0.84, 1.0, d_hi_big)
    eye_col = mix_col(eye_col, c_white, hi_big)

    # Smaller round lower-right white highlight dot (Reference 1 & 3)
    small_cx, small_cy = (0.26, -0.20) if mode == "open" else (-0.28, -0.14)
    d_hi_small = math.sqrt(((dx - small_cx) / 0.115) ** 2 + ((dy - small_cy) / 0.12) ** 2)
    hi_small = 1.0 - smoothstep_g2(0.80, 1.0, d_hi_small)
    eye_col = mix_col(eye_col, c_white, hi_small)

    # Combine iris disk + white sclera rim + dark outer eyelid outline
    col = mix_col(c_white, c_navy_outline, outer_dark)
    col = mix_col(col, c_white, inner_white_ring * (1.0 - smoothstep_g2(0.15, 0.55, -dy)))
    col = mix_col(col, eye_col, iris_disk)

    if mode == "half":
        # Reference 1: Upward-curving happy lower cheek eyelid cuts across the bottom of the eye!
        # Lower cheek cut curve: y_cut = -0.26 - 0.42 * (dx^2)
        y_cut = -0.24 - 0.45 * (dx * dx)
        cheek_cover = 1.0 - smoothstep_g2(y_cut - 0.04, y_cut + 0.05, dy)
        bottom_lid_line = (
            smoothstep_g2(y_cut - 0.05, y_cut + 0.01, dy)
            * (1.0 - smoothstep_g2(y_cut + 0.03, y_cut + 0.09, dy))
            * outer_dark
        )
        col = mix_col(col, c_white, cheek_cover)
        col = mix_col(col, c_navy_outline, bottom_lid_line)

    return col


def evaluate_beak_srgb(dx, dy):
    """Evaluate the cute golden-apricot diamond baby beak with dark smiling mouth line (◡)
    from Reference Images 1 & 3!
    dx in [-1, 1], dy in [-1, 1].
    """
    c_beak_top = hex_srgb("#ffb74d")
    c_beak_bot = hex_srgb("#fb8c00")
    c_smile = hex_srgb("#2b1e16")

    t_y = clamp((dy + 1.0) * 0.5, 0.0, 1.0)
    base = mix_col(c_beak_bot, c_beak_top, t_y)

    # Sweet upward-curving smile line across the middle of the beak: y_smile = -0.18 + 0.45 * (dx^2)
    x_c = clamp(dx, -0.68, 0.68)
    y_smile = -0.16 + 0.48 * (x_c * x_c)
    d_smile = math.sqrt((dx - x_c) ** 2 + ((dy - y_smile) / 0.85) ** 2)
    smile_mask = 1.0 - smoothstep_g2(0.075, 0.135, d_smile)
    return mix_col(base, c_smile, smile_mask)


def build_atlas_texture_png(width=512, height=512):
    """Bake a single 512x512 PNG texture atlas containing:
      - Top half (v in [0.00, 0.55]): Head plumage (slate-blue hood, M-arch white mask, pink oval cheek blush)
      - Bottom-left quadrant  (u in [0.00, 0.33], v in [0.58, 0.98]): `EyesOpen` (Reference 3 blue Kawaii eye)
      - Bottom-mid quadrant   (u in [0.33, 0.66], v in [0.58, 0.98]): `EyesHalf` (Reference 1 happy squinted eye)
      - Bottom-right quadrant (u in [0.66, 1.00], v in [0.58, 0.98]): `EyesClosed` (Reference 2 happy ^ ^ arch)
      - Beak strip            (u in [0.00, 0.30], v in [0.50, 0.58]): Golden-apricot beak with smile line (◡)
    """
    buf = bytearray(width * height * 4)
    for y in range(height):
        v = y / float(height - 1)
        for x in range(width):
            u = x / float(width - 1)
            if v <= 0.50:
                v_loc = v / 0.50
                r, g, b = evaluate_head_plumage_srgb(u, v_loc)
            elif v <= 0.58:
                dx = (u - 0.5) * 2.0
                dy = (0.54 - v) / 0.04
                r, g, b = evaluate_beak_srgb(dx, dy)
            else:
                v_eye = (v - 0.58) / 0.42  # 0 at top of eye cell, 1 at bottom
                dy = (0.5 - v_eye) * 2.2   # +1.1 at top, -1.1 at bottom
                if u < 0.3333:
                    u_eye = u / 0.3333
                    dx = (u_eye - 0.5) * 2.2
                    r, g, b = evaluate_kawaii_eye_srgb(dx, dy, mode="open")
                elif u < 0.6667:
                    u_eye = (u - 0.3333) / 0.3334
                    dx = (u_eye - 0.5) * 2.2
                    r, g, b = evaluate_kawaii_eye_srgb(dx, dy, mode="half")
                else:
                    u_eye = (u - 0.6667) / 0.3333
                    dx = (u_eye - 0.5) * 2.2
                    r, g, b = evaluate_kawaii_eye_srgb(dx, dy, mode="closed")

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
            uv_list = [(0.5, 0.25)] * len(pos_list)

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
MAT_KAWAII_EYES = 1    # 512x512 embedded PNG texture on glossy 3D cornea domes (Open / Half / Closed)
MAT_SUIT_WHITE = 2     # NASA Beta-cloth warm ivory white (#f5f3ed)
MAT_SUIT_SHADE = 3     # Soft grey-white pressure fold / O2 tank (#d4dbe5)
MAT_COBALT_NASA = 4    # Anodized NASA cobalt blue (#1d4ed8)
MAT_METAL_ALU = 5      # Brushed aluminum neck ring & latches (#9ca3af)
MAT_METAL_DARK = 6     # Dark titanium soles, flipper tips, belt & controls (#283242)
MAT_GOLD_VISOR = 7     # 24K gold solar visor (#eab308)
MAT_VALVE_RED = 8      # Anodized red oxygen valve (#dc2626)
MAT_VALVE_BLUE = 9     # Anodized blue coolant valve (#2563eb)
MAT_PURE_WHITE = 10    # Bright white patch insignia (#ffffff)
MAT_CYAN_LED = 11      # Emissive cyan telemetry (#38bdf8)
MAT_AMBER_LED = 12     # Emissive amber status indicator (#f59e0b)
MAT_HELMET_GLASS = 13  # Transparent polycarbonate bubble helmet dome

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


def build_eye_state_mesh(u_cell_start, u_cell_width):
    """Build a pair of smooth 3D cornea domes conforming to the exact cheek surface normal
    and mapped to the specified eye cell in the 512x512 PNG texture atlas!
    """
    mb = MeshBuilder()

    for side in (-1.0, 1.0):
        p_eye_center, n_eye_center, _, _ = chick_head_surface_frame(side * EYE_THETA_RAD, EYE_Y_NORM)
        eye_interior = v_add(p_eye_center, v_scale(n_eye_center, -0.020))

        def make_cornea_eval(s_dir):
            def eval_cornea(u, v):
                # Polar grid over the eye dome: v=0 is center pole (dx=0, dy=0), v=1 is outer rim (r=1)
                ang = u * math.pi * 2.0
                r_n = v
                dx_n = r_n * math.sin(ang)
                dy_n = r_n * math.cos(ang)

                # Smooth cornea bulge above the exact head surface (+0.8 mm at rim to +6.5 mm at center)
                dome_h = 0.0008 + 0.0058 * math.cos(r_n * math.pi * 0.5)
                theta = s_dir * EYE_THETA_RAD + dx_n * EYE_RX_RAD
                y_n = EYE_Y_NORM + dy_n * EYE_RY_YNORM
                p_surf, n_surf, _, _ = chick_head_surface_frame(theta, y_n)
                pt = v_add(p_surf, v_scale(n_surf, dome_h))

                # Map (dx_n, dy_n) to the atlas cell so BOTH eyes have the big white highlight on the
                # upper-left (+X in character space) and small dot on the lower-right (-X in character space)!
                # In screen view looking at +Z face: left of screen is +X. So screen_dx = -dx_n!
                screen_dx = -dx_n
                u_atlas = u_cell_start + clamp(0.5 + screen_dx / 2.2, 0.01, 0.99) * u_cell_width
                v_atlas = 0.58 + clamp(0.5 - dy_n / 2.2, 0.01, 0.99) * 0.42
                return pt, C_WHITE, (u_atlas, v_atlas)

            return eval_cornea

        mb.add_grid_surface(22, 36, make_cornea_eval(side), wrap_u=True, close_poles=True, interior_ref=eye_interior)

    return mb


def build_head_primitives():
    """Node 6 (`Head`), origin at neck pivot (0, 0.365, 0.01) relative to Torso."""
    mbs = {
        MAT_HEAD_PLUMAGE: MeshBuilder(),
        MAT_GOLD_VISOR: MeshBuilder(),
        MAT_SUIT_WHITE: MeshBuilder(),
        MAT_SUIT_SHADE: MeshBuilder(),
        MAT_COBALT_NASA: MeshBuilder(),
        MAT_METAL_ALU: MeshBuilder(),
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
        return (x, y, z), C_WHITE, (u, 0.04)

    mbs[MAT_HEAD_PLUMAGE].add_grid_surface(
        10, 48, eval_plush_neck, wrap_u=True, close_poles=False, interior_ref=(0.0, 0.02, HEAD_CZ)
    )

    # 2. Chubby "Mochi" Kawaii Baby Emperor Penguin Head (`MAT_HEAD_PLUMAGE`, mapped to top half of atlas v in [0, 0.50])
    def eval_chick_head(u, v):
        theta = (u - 0.5) * math.pi * 2.0
        phi = v * math.pi
        y_norm = -math.cos(phi)
        p = chick_head_surface_point(theta, y_norm)
        return p, C_WHITE, (u, v * 0.50)

    mbs[MAT_HEAD_PLUMAGE].add_grid_surface(52, 64, eval_chick_head, wrap_u=True, close_poles=True, interior_ref=head_center)

    # 2b. Cute Double Baby Feather Tuft on the crown (Reference 2 & 3!)
    for (tx, tz, tilt_x, tilt_z, h_tuft, r_tuft) in [
        (0.0, 0.022, -0.014, 0.010, 0.028, 0.015),
        (-0.012, 0.016, -0.022, 0.006, 0.022, 0.012),
    ]:
        p_base = (tx, HEAD_CY + 0.138, HEAD_CZ + tz)
        p_tip = (tx + tilt_x, HEAD_CY + 0.138 + h_tuft, HEAD_CZ + tz + tilt_z)
        mbs[MAT_HEAD_PLUMAGE].add_cylinder(
            p_base,
            p_tip,
            r_tuft,
            0.003,
            C_WHITE,
            radial_segs=14,
            height_segs=3,
        )

    # 3. Cute Rounded-Diamond Golden-Apricot Baby Beak with Smiling Mouth Line (◡) (mapped to atlas v in [0.50, 0.58])
    p_beak_surf, _, _, _ = chick_head_surface_frame(0.0, -0.13)
    beak_cy = p_beak_surf[1]
    beak_cz = p_beak_surf[2] - 0.004
    beak_len = 0.024

    def eval_cute_beak(u, v):
        theta = (u - 0.5) * math.pi * 2.0
        # Soft rounded-diamond / rhombus squircle contour matching Reference 1 & 3!
        sx, cy_s = squircle_cs(theta, power=1.75)
        phi = v * (math.pi * 0.5)
        profile = math.cos(phi) ** 0.80
        t = math.sin(phi)
        rx = 0.027 * profile
        ry = 0.0185 * profile
        x = rx * sx
        y = beak_cy + ry * cy_s
        z = beak_cz + t * beak_len
        u_beak = clamp(0.5 + (x / 0.028) * 0.45, 0.02, 0.98)
        v_beak = 0.50 + clamp(0.5 - ((y - beak_cy) / 0.019) * 0.45, 0.05, 0.95) * 0.08
        return (x, y, z), C_WHITE, (u_beak, v_beak)

    mbs[MAT_HEAD_PLUMAGE].add_grid_surface(
        20, 32, eval_cute_beak, wrap_u=True, close_poles=True, interior_ref=(0.0, beak_cy, beak_cz + 0.004)
    )

    # 4. Unified NASA Bubble Helmet Collar, Closed Rear EVA Protective Shell (LEVA), & Raised Gold Visor
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

    mbs[MAT_METAL_ALU].add_grid_surface(12, 48, eval_helmet_base_ring, wrap_u=True, close_poles=False, interior_ref=base_ring_interior)

    # 4b. Closed Rear NASA EVA Protective Helmet Shell (Option A):
    # Encloses the entire back (-Z), rear sides, and crown (+Y) down to the aluminum neck ring,
    # while leaving a wide G2-contoured panoramic front window (+Z) so the face, Kawaii eyes,
    # cheek blushes, and crown feather tuft are clearly visible!
    phi_neck = 0.305 * math.pi
    phi_front_brow = 0.708 * math.pi  # ~37.5 deg elevation above HEAD_CY at front center (+Z)

    def eva_shell_phi_rim(theta):
        abs_deg = math.degrees(abs(theta))
        brow_drop = smoothstep_g2(0.0, 50.0, abs_deg) * (0.068 * math.pi)
        pillar_drop = smoothstep_g2(42.0, 82.0, abs_deg) * (phi_front_brow - 0.068 * math.pi - phi_neck)
        return phi_front_brow - brow_drop - pillar_drop

    def eva_shell_pt(r, u, v):
        theta = (u - 0.5) * math.pi * 2.0
        phi_0 = eva_shell_phi_rim(theta)
        phi = phi_0 + v * (math.pi - phi_0)
        sn = math.sin(phi)
        cs = -math.cos(phi)
        r_horiz_dome = r * sn
        y_dome = HEAD_CY + r * 1.02 * cs

        # Smooth G2 blend into the elliptical aluminum helmet base ring at phi == phi_neck
        neck_t = 1.0 - smoothstep_g2(phi_neck, phi_neck + 0.16 * math.pi, phi)
        r_horiz_ring = 0.168 + (r - 0.215)
        y_ring = 0.010 - 0.005 * math.cos(theta)

        rx = r_horiz_dome * (1.0 - neck_t) + r_horiz_ring * neck_t
        rz = (r_horiz_dome * 1.01) * (1.0 - neck_t) + (r_horiz_ring * 0.96) * neck_t
        py = y_dome * (1.0 - neck_t) + y_ring * neck_t
        px = rx * math.sin(theta)
        pz = HEAD_CZ + rz * math.cos(theta)
        return (px, py, pz)

    r_eva_in = 0.212
    r_eva_out = 0.218
    eva_rows = 32
    eva_cols = 64

    # Outer white protective EVA helmet shell
    mbs[MAT_SUIT_WHITE].add_grid_surface(
        eva_rows,
        eva_cols,
        lambda u, v: (eva_shell_pt(r_eva_out, u, v), C_WHITE),
        wrap_u=True,
        close_poles=True,
        interior_ref=head_center,
    )

    # Inner shaded protective liner (so looking inside the helmet through the front glass shows an opaque interior wall)
    def eva_inner_interior_ref(tri_pts):
        c_pt = (
            (tri_pts[0][0] + tri_pts[1][0] + tri_pts[2][0]) / 3.0,
            (tri_pts[0][1] + tri_pts[1][1] + tri_pts[2][1]) / 3.0,
            (tri_pts[0][2] + tri_pts[1][2] + tri_pts[2][2]) / 3.0,
        )
        d = v_norm(v_sub(c_pt, head_center))
        return (head_center[0] + d[0] * (r_eva_out + 0.5), head_center[1] + d[1] * (r_eva_out + 0.5), head_center[2] + d[2] * (r_eva_out + 0.5))

    mbs[MAT_SUIT_SHADE].add_grid_surface(
        eva_rows,
        eva_cols,
        lambda u, v: (eva_shell_pt(r_eva_in, u, v), C_WHITE),
        wrap_u=True,
        close_poles=True,
        interior_ref=eva_inner_interior_ref,
    )

    # Solid panoramic window & base rim strip connecting r_eva_in and r_eva_out at v = 0
    rim_pos, rim_cols, rim_tris = [], [], []
    for c in range(eva_cols + 1):
        u = c / float(eva_cols)
        rim_pos.append(eva_shell_pt(r_eva_in, u, 0.0))
        rim_pos.append(eva_shell_pt(r_eva_out, u, 0.0))
        rim_cols.extend((C_WHITE, C_WHITE))
    for c in range(eva_cols):
        b = c * 2
        rim_tris.append((b, b + 1, b + 3))
        rim_tris.append((b, b + 3, b + 2))

    def eva_rim_interior_ref(tri_pts):
        cx_t = (tri_pts[0][0] + tri_pts[1][0] + tri_pts[2][0]) / 3.0
        cz_t = (tri_pts[0][2] + tri_pts[1][2] + tri_pts[2][2]) / 3.0 - HEAD_CZ
        theta_t = math.atan2(cx_t, cz_t)
        u_t = clamp(0.5 + theta_t / (math.pi * 2.0), 0.0, 1.0)
        return eva_shell_pt((r_eva_in + r_eva_out) * 0.5, u_t, 0.06)

    mbs[MAT_SUIT_WHITE].add_surface(rim_pos, rim_tris, rim_cols, interior_ref=eva_rim_interior_ref)

    # 4c. Raised 24K Gold Solar Visor & Outer Sunshield Hood seated snugly over the closed EVA shell forehead
    mbs[MAT_GOLD_VISOR].add_visor_cap_shell(
        0.0,
        HEAD_CY,
        HEAD_CZ,
        r_inner=0.2182,
        r_outer=0.2225,
        half_span_x_deg=75.0,
        arc_start_deg=27.5,
        arc_end_deg=96.0,
        rows=16,
        cols=34,
        col=C_WHITE,
    )

    mbs[MAT_SUIT_WHITE].add_visor_cap_shell(
        0.0,
        HEAD_CY,
        HEAD_CZ,
        r_inner=0.2225,
        r_outer=0.2285,
        half_span_x_deg=77.5,
        arc_start_deg=35.5,
        arc_end_deg=114.0,
        rows=16,
        cols=34,
        col=C_WHITE,
    )

    mbs[MAT_COBALT_NASA].add_visor_cap_shell(
        0.0,
        HEAD_CY,
        HEAD_CZ,
        r_inner=0.2275,
        r_outer=0.2305,
        half_span_x_deg=44.0,
        arc_start_deg=36.0,
        arc_end_deg=43.0,
        rows=4,
        cols=20,
        col=C_WHITE,
    )

    for side in (-1.0, 1.0):
        piv_y = HEAD_CY + 0.022
        piv_z = HEAD_CZ + 0.012
        piv_x_in = side * 0.204
        piv_x_out = side * 0.228
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
    phi_min = 0.305 * math.pi

    def eval_dome(u, v):
        theta = (u - 0.5) * math.pi * 2.0
        phi = phi_min + v * (math.pi - phi_min)
        sn = math.sin(phi)
        cs = -math.cos(phi)
        r_horiz_dome = r_dome * sn
        y_dome = HEAD_CY + r_dome * 1.02 * cs

        neck_t = 1.0 - smoothstep_g2(phi_min, phi_min + 0.16 * math.pi, phi)
        r_horiz_ring = 0.163
        y_ring = 0.010 - 0.005 * math.cos(theta)

        rx = r_horiz_dome * (1.0 - neck_t) + r_horiz_ring * neck_t
        rz = (r_horiz_dome * 1.01) * (1.0 - neck_t) + (r_horiz_ring * 0.96) * neck_t
        py = y_dome * (1.0 - neck_t) + y_ring * neck_t
        px = rx * math.sin(theta)
        pz = HEAD_CZ + rz * math.cos(theta)
        return (px, py, pz), C_WHITE

    mb.add_grid_surface(32, 48, eval_dome, wrap_u=True, close_poles=True, interior_ref=(0.0, HEAD_CY, HEAD_CZ))
    return mb


def pack_glb():
    atlas_png_bytes = build_atlas_texture_png(512, 512)

    torso_mbs = build_torso_primitives()
    flip_l_mbs = build_flipper_primitives(is_left=True)
    flip_r_mbs = build_flipper_primitives(is_left=False)
    foot_l_mbs = build_foot_primitives(is_left=True)
    foot_r_mbs = build_foot_primitives(is_left=False)
    head_mbs = build_head_primitives()
    eyes_open_mb = build_eye_state_mesh(0.0, 0.3333)
    eyes_half_mb = build_eye_state_mesh(0.3333, 0.3334)
    eyes_closed_mb = build_eye_state_mesh(0.6667, 0.3333)
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
                prims.append(append_primitive(mb, mat_idx, include_uv=(mat_idx in (MAT_HEAD_PLUMAGE, MAT_KAWAII_EYES))))
        return prims

    meshes = [
        {"name": "TorsoMesh", "primitives": build_primitives_from_dict(torso_mbs)},
        {"name": "FlipperLMesh", "primitives": build_primitives_from_dict(flip_l_mbs)},
        {"name": "FlipperRMesh", "primitives": build_primitives_from_dict(flip_r_mbs)},
        {"name": "FootLMesh", "primitives": build_primitives_from_dict(foot_l_mbs)},
        {"name": "FootRMesh", "primitives": build_primitives_from_dict(foot_r_mbs)},
        {"name": "HeadMesh", "primitives": build_primitives_from_dict(head_mbs)},
        {"name": "HelmetGlassMesh", "primitives": [append_primitive(glass_mb, MAT_HELMET_GLASS)]},
        {"name": "EyesOpenMesh", "primitives": [append_primitive(eyes_open_mb, MAT_KAWAII_EYES, include_uv=True)]},
        {"name": "EyesHalfMesh", "primitives": [append_primitive(eyes_half_mb, MAT_KAWAII_EYES, include_uv=True)]},
        {"name": "EyesClosedMesh", "primitives": [append_primitive(eyes_closed_mb, MAT_KAWAII_EYES, include_uv=True)]},
    ]

    # Note: EyesOpen (node 8) is active at scale [1,1,1] by default;
    # EyesHalf (node 9) and EyesClosed (node 10) start at scale [0,0,0] so static viewers
    # like Finder Quick Look show EyesOpen cleanly, while Three.js toggles them for 3D blinking!
    nodes = [
        {"name": "PenguinRoot", "children": [1, 4, 5]},
        {"name": "Torso", "mesh": 0, "translation": [0.0, 0.20, 0.0], "children": [2, 3, 6, 7]},
        {"name": "FlipperL", "mesh": 1, "translation": [0.158, 0.250, 0.014]},
        {"name": "FlipperR", "mesh": 2, "translation": [-0.158, 0.250, 0.014]},
        {"name": "FootL", "mesh": 3, "translation": [0.095, 0.18, 0.01]},
        {"name": "FootR", "mesh": 4, "translation": [-0.095, 0.18, 0.01]},
        {"name": "Head", "mesh": 5, "translation": [0.0, 0.365, 0.01], "scale": [1.06, 1.06, 1.06], "children": [8, 9, 10]},
        {"name": "HelmetGlass", "mesh": 6, "translation": [0.0, 0.365, 0.01], "scale": [1.06, 1.06, 1.06]},
        {"name": "EyesOpen", "mesh": 7},
        {"name": "EyesHalf", "mesh": 8, "scale": [0.0, 0.0, 0.0]},
        {"name": "EyesClosed", "mesh": 9, "scale": [0.0, 0.0, 0.0]},
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
                "roughnessFactor": 0.92,
            },
            "doubleSided": False,
        },
        {
            "name": "KawaiiEyesAtlas",
            "pbrMetallicRoughness": {
                "baseColorTexture": {"index": 0},
                "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
                "metallicFactor": 0.04,
                "roughnessFactor": 0.12,
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
            "name": "PureWhiteHighlight",
            "pbrMetallicRoughness": {
                "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
                "metallicFactor": 0.02,
                "roughnessFactor": 0.08,
            },
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
                "baseColorFactor": [0.88, 0.96, 1.0, 0.15],
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
            "generator": "Cyberpenguins 3D Character Builder v6 (3-State Kawaii Blue Eyes + Blink Nodes)",
        },
        "scene": 0,
        "scenes": [{"name": "CyberpenguinScene", "nodes": [0]}],
        "nodes": nodes,
        "meshes": meshes,
        "materials": materials,
        "textures": [{"sampler": 0, "source": 0}],
        "images": [{"bufferView": bv_png, "mimeType": "image/png", "name": "KawaiiPenguinAtlasTex"}],
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
