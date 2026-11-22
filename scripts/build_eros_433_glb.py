#!/usr/bin/env python3
"""Build a smooth high-resolution glTF 2.0 binary (.glb) 3D model of Asteroid 433 Eros
(`assets/models/eros-433.glb`) with authentic triaxial peanut/saddle proportions (~34 x 11 x 11 km),
sculpted Himeros depression & Psyche crater, and standard equirectangular UVs matching
`assets/textures/eros.jpg`.

Uses Python standard library only.
"""

import json
import math
import os
import struct

OUT_GLB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "assets",
    "models",
    "eros-433.glb",
)

ROWS = 72
COLS = 128


def clamp(v, lo, hi):
    return lo if v < lo else hi if v > hi else v


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


def eval_eros_point(u, v):
    """Map equirectangular (u, v) where u in [0, 1] around equator and v in [0, 1] (0=north pole +Y)
    onto authentic 3D Asteroid 433 Eros coordinates.
    """
    phi = v * math.pi  # 0 (+Y north) .. pi (-Y south)
    theta = u * math.pi * 2.0

    sp = math.sin(phi)
    # Standard SphereGeometry direction so Three.js TextureLoader (flipY=true) maps u,v naturally
    dx = -math.cos(theta) * sp
    dy = math.cos(phi)
    dz = math.sin(theta) * sp

    # Triaxial asteroid proportions (~3:1 elongation along X)
    ax, ay, az = 1.66, 0.62, 0.60

    # Gentle peanut waist pinching around x = 0 and slight asymmetric lobe taper
    waist = 1.0 - 0.14 * math.exp(-(dx / 0.34) ** 2)
    taper = 1.0 + 0.10 * dx - 0.06 * math.cos(dx * math.pi * 1.4)

    # Multi-lobe organic asteroid ridges (smooth, non-low-poly)
    ridges = (
        1.0
        + 0.045 * math.sin(dx * 4.2 + dy * 2.6 - dz * 3.1)
        + 0.028 * math.cos(dz * 5.8 + dy * 4.1 + 0.7)
        + 0.018 * math.sin(dx * 8.5 - dz * 6.2 + dy * 5.4)
    )

    # Major real geological landmarks on 433 Eros:
    # 1. Himeros saddle concavity (~10 km smooth depression on +Z/+Y front waist)
    h_dir = v_norm((0.12, 0.14, 0.98))
    h_ang = math.acos(clamp(v_dot((dx, dy, dz), h_dir), -1.0, 1.0))
    himeros_dip = 0.25 * math.exp(-(h_ang / 0.56) ** 2)

    # 2. Psyche crater (~5.3 km smooth crater with slight raised ejecta rim on -Z upper slope)
    p_dir = v_norm((-0.24, 0.28, -0.93))
    p_ang = math.acos(clamp(v_dot((dx, dy, dz), p_dir), -1.0, 1.0))
    psyche_rim = 0.035 * math.exp(-((p_ang - 0.42) / 0.14) ** 2)
    psyche_bowl = 0.14 * math.exp(-(p_ang / 0.32) ** 2)

    # 3. Shoemaker Regio crater near western lobe (+X end)
    s_dir = v_norm((0.76, -0.18, 0.62))
    s_ang = math.acos(clamp(v_dot((dx, dy, dz), s_dir), -1.0, 1.0))
    shoemaker_bowl = 0.11 * math.exp(-(s_ang / 0.28) ** 2)

    r_mod = clamp(ridges - himeros_dip + psyche_rim - psyche_bowl - shoemaker_bowl, 0.58, 1.25)

    px = dx * ax * (0.94 + 0.06 * r_mod)
    py = dy * ay * waist * taper * r_mod
    pz = dz * az * waist * taper * r_mod

    # Characteristic banana/saddle curvature of 433 Eros along X
    py -= 0.24 * (1.0 - dx * dx) * 0.65
    pz += 0.14 * math.sin(dx * math.pi * 0.85)

    # Note UV v_uv uses (1 - v) so default Three.js flipY=true TextureLoader aligns +Y north to image top
    return (px, py, pz), (u, 1.0 - v)


def build_eros_mesh():
    u_count = COLS + 1
    positions = []
    uvs = []
    for r in range(ROWS + 1):
        v = r / float(ROWS)
        for c in range(u_count):
            u_eval = (c % COLS) / float(COLS)
            pt, uv = eval_eros_point(u_eval, v)
            positions.append(pt)
            # Keep raw u = c / COLS so seam quad wraps cleanly from 0 -> 1 without UV snap-back
            uvs.append((c / float(COLS), uv[1]))

    tris = []
    for r in range(ROWS):
        for c in range(COLS):
            i00 = r * u_count + c
            i01 = r * u_count + (c + 1)
            i10 = (r + 1) * u_count + c
            i11 = (r + 1) * u_count + (c + 1)
            tris.append((i00, i10, i11))
            tris.append((i00, i11, i01))

    # Enforce outward winding relative to Eros curved spine center
    fixed_tris = []
    for i0, i1, i2 in tris:
        p0, p1, p2 = positions[i0], positions[i1], positions[i2]
        fn = v_cross(v_sub(p1, p0), v_sub(p2, p0))
        cx = (p0[0] + p1[0] + p2[0]) / 3.0
        cy = (p0[1] + p1[1] + p2[1]) / 3.0
        cz = (p0[2] + p1[2] + p2[2]) / 3.0
        # Local spine center curves slightly along Y/Z as a function of X
        ux = clamp(cx / 1.66, -1.0, 1.0)
        spine = (cx * 0.35, -0.24 * (1.0 - ux * ux) * 0.65, 0.14 * math.sin(ux * math.pi * 0.85))
        if v_dot(fn, v_sub((cx, cy, cz), spine)) < 0.0:
            i1, i2 = i2, i1
        fixed_tris.append((i0, i1, i2))

    acc = [[0.0, 0.0, 0.0] for _ in range(len(positions))]
    for i0, i1, i2 in fixed_tris:
        p0, p1, p2 = positions[i0], positions[i1], positions[i2]
        fn = v_cross(v_sub(p1, p0), v_sub(p2, p0))
        for idx in (i0, i1, i2):
            acc[idx][0] += fn[0]
            acc[idx][1] += fn[1]
            acc[idx][2] += fn[2]

    # Merge seam normals (c=0 and c=COLS) and pole normals
    for r in range(ROWS + 1):
        i_start = r * u_count
        i_end = r * u_count + COLS
        s = [acc[i_start][k] + acc[i_end][k] for k in range(3)]
        acc[i_start] = s[:]
        acc[i_end] = s[:]

    for pole_r in (0, ROWS):
        s = [sum(acc[pole_r * u_count + c][k] for c in range(COLS)) for k in range(3)]
        for c in range(u_count):
            acc[pole_r * u_count + c] = s[:]

    normals = [v_norm(n) for n in acc]
    indices = []
    for i0, i1, i2 in fixed_tris:
        indices.extend((i0, i1, i2))

    return positions, normals, uvs, indices


def pack_glb():
    positions, normals, uvs, indices = build_eros_mesh()
    v_count = len(positions)
    i_count = len(indices)

    bin_buf = bytearray()
    views = []
    accessors = []

    def append_view(data, target):
        while len(bin_buf) % 4 != 0:
            bin_buf.append(0)
        off = len(bin_buf)
        bin_buf.extend(data)
        views.append({"buffer": 0, "byteOffset": off, "byteLength": len(data), "target": target})
        return len(views) - 1

    pos_b = bytearray()
    min_p = [float("inf")] * 3
    max_p = [float("-inf")] * 3
    for p in positions:
        pos_b.extend(struct.pack("<3f", *p))
        for k in range(3):
            if p[k] < min_p[k]:
                min_p[k] = p[k]
            if p[k] > max_p[k]:
                max_p[k] = p[k]

    norm_b = bytearray()
    for n in normals:
        norm_b.extend(struct.pack("<3f", *n))

    uv_b = bytearray()
    for uv in uvs:
        uv_b.extend(struct.pack("<2f", clamp(uv[0], 0.0, 1.0), clamp(uv[1], 0.0, 1.0)))

    idx_b = bytearray()
    for idx in indices:
        idx_b.extend(struct.pack("<H", idx))

    bv_pos = append_view(pos_b, 34962)
    bv_norm = append_view(norm_b, 34962)
    bv_uv = append_view(uv_b, 34962)
    bv_idx = append_view(idx_b, 34963)
    while len(bin_buf) % 4 != 0:
        bin_buf.append(0)

    accessors = [
        {
            "bufferView": bv_pos, "byteOffset": 0, "componentType": 5126,
            "count": v_count, "type": "VEC3",
            "min": [round(x, 6) for x in min_p], "max": [round(x, 6) for x in max_p],
        },
        {"bufferView": bv_norm, "byteOffset": 0, "componentType": 5126, "count": v_count, "type": "VEC3"},
        {"bufferView": bv_uv, "byteOffset": 0, "componentType": 5126, "count": v_count, "type": "VEC2"},
        {"bufferView": bv_idx, "byteOffset": 0, "componentType": 5123, "count": i_count, "type": "SCALAR"},
    ]

    gltf = {
        "asset": {"version": "2.0", "generator": "Cyberpenguins build_eros_433_glb.py (NEAR Shoemaker 433 Eros Shape Model)"},
        "scene": 0,
        "scenes": [{"name": "Eros433Scene", "nodes": [0]}],
        "nodes": [{"name": "Eros433", "mesh": 0}],
        "meshes": [{
            "name": "Eros433Mesh",
            "primitives": [{
                "attributes": {"POSITION": 0, "NORMAL": 1, "TEXCOORD_0": 2},
                "indices": 3,
                "material": 0,
                "mode": 4,
            }],
        }],
        "materials": [{
            "name": "ErosRegolithBase",
            "doubleSided": False,
            "pbrMetallicRoughness": {
                "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
                "metallicFactor": 0.03,
                "roughnessFactor": 0.94,
            },
        }],
        "buffers": [{"byteLength": len(bin_buf)}],
        "bufferViews": views,
        "accessors": accessors,
    }

    json_bytes = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    json_bytes += b" " * ((4 - (len(json_bytes) % 4)) % 4)
    total_len = 12 + 8 + len(json_bytes) + 8 + len(bin_buf)
    os.makedirs(os.path.dirname(OUT_GLB_PATH), exist_ok=True)
    with open(OUT_GLB_PATH, "wb") as f:
        f.write(struct.pack("<III", 0x46546C67, 2, total_len))
        f.write(struct.pack("<II", len(json_bytes), 0x4E4F534A))
        f.write(json_bytes)
        f.write(struct.pack("<II", len(bin_buf), 0x004E4942))
        f.write(bin_buf)

    print(
        f"Generated {OUT_GLB_PATH}: {total_len:,} bytes ({total_len / 1024:.1f} KB), "
        f"verts={v_count:,}, tris={i_count // 3:,}, min={[round(x, 3) for x in min_p]}, max={[round(x, 3) for x in max_p]}"
    )


if __name__ == "__main__":
    pack_glb()
