#!/usr/bin/env python3
"""Build an optimized glTF 2.0 binary (.glb) 3D terrain mesh for the Moon's
Mare Tranquillitatis (Apollo 11 Eagle landing site) in `assets/models/luna-terrain.glb`.

Uses Python standard library only. Matches the glTF 2.0 layout of `ares-vallis-terrain.glb`
(120x120 grid, POSITION + NORMAL + TEXCOORD_0 + linear COLOR_0, CCW +Y winding).
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
    "luna-terrain.glb",
)

WIN_N = 120
DX_UNITS = 0.75  # 120 samples -> -45.00 .. +44.25 units in X and Z


def clamp(v, lo, hi):
    return lo if v < lo else hi if v > hi else v


def smoothstep(e0, e1, x):
    if e1 == e0:
        return 0.0
    t = clamp((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def lerp3(c0, c1, t):
    t = clamp(t, 0.0, 1.0)
    return (
        c0[0] + (c1[0] - c0[0]) * t,
        c0[1] + (c1[1] - c0[1]) * t,
        c0[2] + (c1[2] - c0[2]) * t,
    )


def hex_to_srgb(h):
    h = h.lstrip("#")
    return (
        int(h[0:2], 16) / 255.0,
        int(h[2:4], 16) / 255.0,
        int(h[4:6], 16) / 255.0,
    )


# Authentic 3D lunar craters: (cx, cz, radius, depth)
# All clear of the immediate (-0.35, 0.20) lander pad at r < 2.2 so Eagle sits stably
CRATERS = [
    (4.8, -3.6, 2.5, 0.48),
    (-6.2, -5.0, 3.2, 0.62),
    (1.4, -7.8, 2.2, 0.38),
    (11.0, -13.5, 6.2, 1.25),
    (-12.8, -14.8, 7.2, 1.45),
    (-3.9, 3.8, 1.6, 0.26),
    (4.6, 4.4, 2.0, 0.34),
    (15.5, -4.5, 4.5, 0.88),
    (-15.5, -3.2, 4.8, 0.96),
    (0.4, -18.5, 5.2, 1.05),
    (22.0, -19.0, 8.2, 1.65),
    (-22.5, -20.5, 8.6, 1.72),
    (8.8, 8.5, 3.4, 0.58),
    (-9.5, 9.2, 3.8, 0.64),
]


def eval_lunar_height(x, z):
    # Gentle multi-frequency Mare Tranquillitatis swell
    swell = (
        0.18 * math.sin(x * 0.14 + 0.5) * math.cos(z * 0.12 - 0.3)
        + 0.11 * math.cos(x * 0.28 - z * 0.24 + 1.1)
        + 0.05 * math.sin(x * 0.62 + z * 0.55)
    )
    # Flatten subtly right under the Apollo 11 Eagle landing pad zone
    pad_dist = math.hypot(x + 0.35, z - 0.20)
    pad_blend = smoothstep(1.35, 3.1, pad_dist)
    h = swell * (0.15 + 0.85 * pad_blend)

    # Smooth 3D parabolic impact craters + raised ejecta rim
    for cx, cz, rad, depth in CRATERS:
        d = math.hypot(x - cx, z - cz) / rad
        if d < 1.85:
            # Rim peaks near d = 1.05, smooth zero slope at center and far field
            rim = (depth * 0.28) * math.exp(-((d - 1.06) / 0.22) ** 2)
            bowl = depth * (1.0 - smoothstep(0.0, 1.02, d) ** 1.15)
            if d < 1.02:
                # True parabolic inner profile for smooth lighting inside crater
                bowl = depth * ((1.0 - (d / 1.02) ** 2) ** 1.35)
            h += rim - bowl

    # Distant lunar massif / crater wall silhouettes along north horizon (z < -13)
    if z < -12.0:
        ridge_t = smoothstep(-12.0, -34.0, z)
        peaks = (
            1.0
            + 0.36 * math.sin(x * 0.11 + 0.8)
            + 0.22 * math.cos(x * 0.23 - 1.2)
            + 0.10 * math.sin(x * 0.45 + z * 0.15)
        )
        h += ridge_t * 3.85 * peaks

    # Gentle outer horizon lift behind far perimeter
    rad_out = math.hypot(x, z)
    if rad_out > 24.0:
        h += smoothstep(24.0, 44.0, rad_out) * 0.85

    return h


def build_mesh_data():
    positions = [[(0.0, 0.0, 0.0)] * WIN_N for _ in range(WIN_N)]
    for r in range(WIN_N):
        z = (r - 60) * DX_UNITS
        for c in range(WIN_N):
            x = (c - 60) * DX_UNITS
            y = eval_lunar_height(x, z)
            positions[r][c] = (x, y, z)

    # Zero-offset height at nominal landing point (-0.35, 0.20)
    y_center = positions[60][60][1]
    for r in range(WIN_N):
        for c in range(WIN_N):
            x, y, z = positions[r][c]
            positions[r][c] = (x, y - y_center, z)

    # Central-difference smooth vertex normals
    normals = [[(0.0, 1.0, 0.0)] * WIN_N for _ in range(WIN_N)]
    for r in range(WIN_N):
        r_prev = max(0, r - 1)
        r_next = min(WIN_N - 1, r + 1)
        dz = (r_next - r_prev) * DX_UNITS
        for c in range(WIN_N):
            c_prev = max(0, c - 1)
            c_next = min(WIN_N - 1, c + 1)
            dx = (c_next - c_prev) * DX_UNITS
            dydx = (positions[r][c_next][1] - positions[r][c_prev][1]) / dx
            dydz = (positions[r_next][c][1] - positions[r_prev][c][1]) / dz
            nx, ny, nz = -dydx, 1.0, -dydz
            inv_len = 1.0 / math.sqrt(nx * nx + ny * ny + nz * nz)
            normals[r][c] = (nx * inv_len, ny * inv_len, nz * inv_len)

    # Authentic ash-grey lunar regolith PBR palette in sRGB
    c_plain = hex_to_srgb("#8c929a")
    c_crest = hex_to_srgb("#c6ccd4")
    c_slope = hex_to_srgb("#595f68")
    c_crater = hex_to_srgb("#3e434c")

    pos_bytes = bytearray()
    norm_bytes = bytearray()
    uv_bytes = bytearray()
    col_bytes = bytearray()

    pos_min = [float("inf"), float("inf"), float("inf")]
    pos_max = [float("-inf"), float("-inf"), float("-inf")]

    for r in range(WIN_N):
        v_coord = r / (WIN_N - 1)
        for c in range(WIN_N):
            u_coord = c / (WIN_N - 1)
            x, y, z = positions[r][c]
            nx, ny, nz = normals[r][c]

            for idx, val in enumerate((x, y, z)):
                if val < pos_min[idx]:
                    pos_min[idx] = val
                if val > pos_max[idx]:
                    pos_max[idx] = val

            n_sum = 0.0
            n_cnt = 0
            for dr, dc in ((-2, 0), (2, 0), (0, -2), (0, 2), (-1, -1), (1, 1), (-1, 1), (1, -1)):
                rr = clamp(r + dr, 0, WIN_N - 1)
                cc = clamp(c + dc, 0, WIN_N - 1)
                n_sum += positions[rr][cc][1]
                n_cnt += 1
            curv = y - (n_sum / n_cnt)
            slope = clamp(1.0 - ny, 0.0, 1.0)

            col = c_plain
            ridge_t = clamp((y - 0.12) * 0.25 + max(0.0, curv) * 1.6, 0.0, 1.0)
            col = lerp3(col, c_crest, ridge_t * 0.85)
            slope_t = clamp((slope - 0.012) / 0.09, 0.0, 1.0)
            col = lerp3(col, c_slope, slope_t * 0.85)
            crater_t = clamp((-0.18 - y) * 0.45 + max(0.0, -curv - 0.03) * 1.9, 0.0, 1.0)
            col = lerp3(col, c_crater, crater_t * 0.86)

            # Deterministic organic regolith albedo speckle (±3.5%)
            h1 = math.sin(x * 12.9898 + z * 78.233) * 43758.5453
            micro = ((h1 - math.floor(h1)) * 2.0 - 1.0) * 0.035
            r_s = clamp(col[0] + micro, 0.0, 1.0)
            g_s = clamp(col[1] + micro, 0.0, 1.0)
            b_s = clamp(col[2] + micro * 1.04, 0.0, 1.0)

            r_lin = int(round(clamp(math.pow(r_s, 2.2), 0.0, 1.0) * 255.0))
            g_lin = int(round(clamp(math.pow(g_s, 2.2), 0.0, 1.0) * 255.0))
            b_lin = int(round(clamp(math.pow(b_s, 2.2), 0.0, 1.0) * 255.0))

            pos_bytes.extend(struct.pack("<3f", x, y, z))
            norm_bytes.extend(struct.pack("<3f", nx, ny, nz))
            uv_bytes.extend(struct.pack("<2f", u_coord, v_coord))
            col_bytes.extend(struct.pack("<4B", r_lin, g_lin, b_lin, 255))

    idx_bytes = bytearray()
    for r in range(WIN_N - 1):
        row_a = r * WIN_N
        row_b = (r + 1) * WIN_N
        for c in range(WIN_N - 1):
            i00 = row_a + c
            i10 = row_b + c
            i01 = row_a + c + 1
            i11 = row_b + c + 1
            idx_bytes.extend(struct.pack("<6H", i00, i10, i01, i01, i10, i11))

    p00 = positions[60][60]
    p10 = positions[61][60]
    p01 = positions[60][61]
    v1 = (p10[0] - p00[0], p10[1] - p00[1], p10[2] - p00[2])
    v2 = (p01[0] - p00[0], p01[1] - p00[1], p01[2] - p00[2])
    cross_y = v1[2] * v2[0] - v1[0] * v2[2]
    if cross_y <= 0:
        raise RuntimeError(f"Triangle winding check failed: cross_y={cross_y}")

    return pos_bytes, norm_bytes, uv_bytes, col_bytes, idx_bytes, pos_min, pos_max


def write_glb(out_path, pos_bytes, norm_bytes, uv_bytes, col_bytes, idx_bytes, pos_min, pos_max):
    vertex_count = WIN_N * WIN_N
    index_count = (WIN_N - 1) * (WIN_N - 1) * 6

    bin_buf = bytearray()
    views = []

    def append_view(data_bytes, target):
        while len(bin_buf) % 4 != 0:
            bin_buf.append(0)
        offset = len(bin_buf)
        bin_buf.extend(data_bytes)
        views.append({
            "buffer": 0,
            "byteOffset": offset,
            "byteLength": len(data_bytes),
            "target": target,
        })
        return len(views) - 1

    bv_pos = append_view(pos_bytes, 34962)
    bv_norm = append_view(norm_bytes, 34962)
    bv_uv = append_view(uv_bytes, 34962)
    bv_col = append_view(col_bytes, 34962)
    bv_idx = append_view(idx_bytes, 34963)
    while len(bin_buf) % 4 != 0:
        bin_buf.append(0)

    gltf = {
        "asset": {
            "version": "2.0",
            "generator": "Cyberpenguins build_luna_terrain_glb.py (Mare Tranquillitatis 3D Relief)",
        },
        "scene": 0,
        "scenes": [{"name": "LunaTerrainScene", "nodes": [0]}],
        "nodes": [{"name": "LunaTerrain", "mesh": 0}],
        "meshes": [{
            "name": "LunaTerrainMesh",
            "primitives": [{
                "attributes": {
                    "POSITION": 0,
                    "NORMAL": 1,
                    "TEXCOORD_0": 2,
                    "COLOR_0": 3,
                },
                "indices": 4,
                "material": 0,
                "mode": 4,
            }],
        }],
        "materials": [{
            "name": "LunarRegolith",
            "doubleSided": False,
            "pbrMetallicRoughness": {
                "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
                "metallicFactor": 0.02,
                "roughnessFactor": 0.96,
            },
        }],
        "buffers": [{"byteLength": len(bin_buf)}],
        "bufferViews": views,
        "accessors": [
            {
                "bufferView": bv_pos,
                "byteOffset": 0,
                "componentType": 5126,
                "count": vertex_count,
                "type": "VEC3",
                "min": [round(pos_min[0], 5), round(pos_min[1], 5), round(pos_min[2], 5)],
                "max": [round(pos_max[0], 5), round(pos_max[1], 5), round(pos_max[2], 5)],
            },
            {
                "bufferView": bv_norm,
                "byteOffset": 0,
                "componentType": 5126,
                "count": vertex_count,
                "type": "VEC3",
            },
            {
                "bufferView": bv_uv,
                "byteOffset": 0,
                "componentType": 5126,
                "count": vertex_count,
                "type": "VEC2",
            },
            {
                "bufferView": bv_col,
                "byteOffset": 0,
                "componentType": 5121,
                "normalized": True,
                "count": vertex_count,
                "type": "VEC4",
            },
            {
                "bufferView": bv_idx,
                "byteOffset": 0,
                "componentType": 5123,
                "count": index_count,
                "type": "SCALAR",
                "min": [0],
                "max": [vertex_count - 1],
            },
        ],
    }

    json_bytes = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    while len(json_bytes) % 4 != 0:
        json_bytes += b" "

    total_len = 12 + 8 + len(json_bytes) + 8 + len(bin_buf)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "wb") as f:
        f.write(struct.pack("<III", 0x46546C67, 2, total_len))
        f.write(struct.pack("<II", len(json_bytes), 0x4E4F534A))
        f.write(json_bytes)
        f.write(struct.pack("<II", len(bin_buf), 0x004E4942))
        f.write(bin_buf)

    return total_len


def main():
    pos_b, norm_b, uv_b, col_b, idx_b, pmin, pmax = build_mesh_data()
    total_len = write_glb(OUT_GLB_PATH, pos_b, norm_b, uv_b, col_b, idx_b, pmin, pmax)
    print(f"Generated {OUT_GLB_PATH}: {total_len:,} bytes ({WIN_N}x{WIN_N} verts)")
    print(f"pos_min={[round(v, 3) for v in pmin]} pos_max={[round(v, 3) for v in pmax]}")


if __name__ == "__main__":
    main()
