#!/usr/bin/env python3
"""Build an optimized glTF 2.0 binary (.glb) 3D terrain mesh for Ares Vallis
(Mars Pathfinder / Sojourner landing site) from the real ESA/NASA Mars Express
HRSC Level-4 Stereo DTM (H3147_0000_DA4.IMG).

Uses Python standard library only.
"""

import json
import math
import os
import struct
import sys

SLICE_PATH = (
    "/Users/pedro/.gemini/antigravity/brain/ddb2d113-a138-4676-b2b7-5e9c4aba80d9"
    "/scratch/h3147_ares_slice.bin"
)
OUT_GLB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "assets",
    "models",
    "ares-vallis-terrain.glb",
)

REC_BYTES = 1716
LINE_SAMPLES = 858
SLICE_ROWS = 121
MISSING_DN = -32768

WIN_N = 120
CENTER_ROW_LOCAL = 60  # line 1854 (~19.094 N)
CENTER_SAMPLE = 211    # ~326.751 E (33.249 W)
SAMPLE_START = CENTER_SAMPLE - 60  # 151 .. 270 inclusive -> 120 samples
DX_UNITS = 0.75        # 75 m/px where 1 unit = 100 m
VERT_EXAG = 2.2


def clamp(v, lo, hi):
    return lo if v < lo else hi if v > hi else v


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


def load_window(path):
    with open(path, "rb") as f:
        raw = f.read()
    expected = REC_BYTES * SLICE_ROWS
    if len(raw) != expected:
        raise RuntimeError(f"Expected {expected} bytes in DTM slice, got {len(raw)}")

    grid = []
    for r in range(WIN_N):
        off = r * REC_BYTES
        row = struct.unpack(f">{LINE_SAMPLES}h", raw[off : off + REC_BYTES])
        grid.append(list(row[SAMPLE_START : SAMPLE_START + WIN_N]))

    # Fill any missing DNs via local median
    missing_coords = [
        (r, c)
        for r in range(WIN_N)
        for c in range(WIN_N)
        if grid[r][c] == MISSING_DN
    ]
    if missing_coords:
        filled = [row[:] for row in grid]
        for r, c in missing_coords:
            neigh = []
            for dr in (-2, -1, 0, 1, 2):
                for dc in (-2, -1, 0, 1, 2):
                    rr = clamp(r + dr, 0, WIN_N - 1)
                    cc = clamp(c + dc, 0, WIN_N - 1)
                    val = grid[rr][cc]
                    if val != MISSING_DN:
                        neigh.append(val)
            neigh.sort()
            filled[r][c] = neigh[len(neigh) // 2] if neigh else -3640
        grid = filled

    # Soft 3x3 Gaussian pass to remove 1 m integer quantization stair-stepping
    smooth = [[0.0] * WIN_N for _ in range(WIN_N)]
    for r in range(WIN_N):
        r0 = max(0, r - 1)
        r2 = min(WIN_N - 1, r + 1)
        for c in range(WIN_N):
            c0 = max(0, c - 1)
            c2 = min(WIN_N - 1, c + 1)
            center = grid[r][c]
            ortho = grid[r0][c] + grid[r2][c] + grid[r][c0] + grid[r][c2]
            diag = grid[r0][c0] + grid[r0][c2] + grid[r2][c0] + grid[r2][c2]
            smooth[r][c] = 0.5 * center + 0.0875 * ortho + 0.0375 * diag

    return grid, smooth, len(missing_coords)


def build_mesh_data(raw_grid, elev):
    lander_elev = elev[60][60]

    # Build 3D positions (Y-up right-handed)
    positions = [[(0.0, 0.0, 0.0)] * WIN_N for _ in range(WIN_N)]
    for r in range(WIN_N):
        z = (r - 60) * DX_UNITS
        for c in range(WIN_N):
            x = (c - 60) * DX_UNITS
            y = ((elev[r][c] - lander_elev) / 100.0) * VERT_EXAG
            positions[r][c] = (x, y, z)

    # Central-difference normals
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

    # Martian PBR albedo palette in sRGB
    c_plain = hex_to_srgb("#c87f52")
    c_crest = hex_to_srgb("#dfa274")
    c_slope = hex_to_srgb("#834227")
    c_crater = hex_to_srgb("#5c2c1a")

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

            # Local 5-cell neighborhood average for concavity / convexity
            n_sum = 0.0
            n_cnt = 0
            for dr, dc in ((-2, 0), (2, 0), (0, -2), (0, 2), (-1, -1), (1, 1), (-1, 1), (1, -1)):
                rr = clamp(r + dr, 0, WIN_N - 1)
                cc = clamp(c + dc, 0, WIN_N - 1)
                n_sum += positions[rr][cc][1]
                n_cnt += 1
            curv = y - (n_sum / n_cnt)  # >0 ridge/crest, <0 crater/hollow
            slope = clamp(1.0 - ny, 0.0, 1.0)

            col = c_plain
            # Mix toward golden sand on elevated ridges and convex crests
            ridge_t = clamp((y - 0.15) * 0.45 + max(0.0, curv) * 1.4, 0.0, 1.0)
            col = lerp3(col, c_crest, ridge_t * 0.85)
            # Mix toward basaltic red-brown on steeper slopes
            slope_t = clamp((slope - 0.015) / 0.10, 0.0, 1.0)
            col = lerp3(col, c_slope, slope_t * 0.85)
            # Darken crater bowls / deep depressions (Big Crater etc.)
            crater_t = clamp((-0.25 - y) * 0.42 + max(0.0, -curv - 0.04) * 1.8, 0.0, 1.0)
            col = lerp3(col, c_crater, crater_t * 0.88)

            # Deterministic organic micro-variation (+/- 4%)
            h1 = math.sin(x * 12.9898 + z * 78.233) * 43758.5453
            micro = ((h1 - math.floor(h1)) * 2.0 - 1.0) * 0.04
            r_s = clamp(col[0] + micro, 0.0, 1.0)
            g_s = clamp(col[1] + micro * 0.85, 0.0, 1.0)
            b_s = clamp(col[2] + micro * 0.65, 0.0, 1.0)

            # Convert sRGB -> linear RGB per glTF 2.0 specification for COLOR_0
            r_lin = int(round(clamp(math.pow(r_s, 2.2), 0.0, 1.0) * 255.0))
            g_lin = int(round(clamp(math.pow(g_s, 2.2), 0.0, 1.0) * 255.0))
            b_lin = int(round(clamp(math.pow(b_s, 2.2), 0.0, 1.0) * 255.0))

            pos_bytes.extend(struct.pack("<3f", x, y, z))
            norm_bytes.extend(struct.pack("<3f", nx, ny, nz))
            uv_bytes.extend(struct.pack("<2f", u_coord, v_coord))
            col_bytes.extend(struct.pack("<4B", r_lin, g_lin, b_lin, 255))

    # Indexed triangles (CCW winding facing +Y)
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

    # Verify triangle winding points +Y on center quad
    p00 = positions[60][60]
    p10 = positions[61][60]
    p01 = positions[60][61]
    v1 = (p10[0] - p00[0], p10[1] - p00[1], p10[2] - p00[2])
    v2 = (p01[0] - p00[0], p01[1] - p00[1], p01[2] - p00[2])
    cross_y = v1[2] * v2[0] - v1[0] * v2[2]
    if cross_y <= 0:
        raise RuntimeError(f"Triangle winding check failed: cross_y={cross_y}")

    return positions, pos_bytes, norm_bytes, uv_bytes, col_bytes, idx_bytes, pos_min, pos_max, lander_elev


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
            "generator": "Cyberpenguins build_ares_vallis_glb.py (ESA/NASA MEX HRSC H3147_0000_DA4)",
        },
        "scene": 0,
        "scenes": [{"name": "AresVallisScene", "nodes": [0]}],
        "nodes": [{"name": "AresVallisTerrain", "mesh": 0}],
        "meshes": [{
            "name": "AresVallisMesh",
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
            "name": "MartianRegolith",
            "doubleSided": False,
            "pbrMetallicRoughness": {
                "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
                "metallicFactor": 0.02,
                "roughnessFactor": 0.94,
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
    raw_grid, smooth, missing = load_window(SLICE_PATH)
    flat_raw = [raw_grid[r][c] for r in range(WIN_N) for c in range(WIN_N)]
    positions, pos_b, norm_b, uv_b, col_b, idx_b, pmin, pmax, lander_e = build_mesh_data(raw_grid, smooth)
    total_len = write_glb(OUT_GLB_PATH, pos_b, norm_b, uv_b, col_b, idx_b, pmin, pmax)

    print(f"missing={missing} min_m={min(flat_raw)} max_m={max(flat_raw)} lander_m={lander_e:.2f}")
    print(f"GLB written: {OUT_GLB_PATH} ({total_len} bytes, {WIN_N}x{WIN_N} verts)")
    print(f"pos_min={[round(v, 3) for v in pmin]} pos_max={[round(v, 3) for v in pmax]}")

    # Sample key landmark coordinates in 3D space
    def at_xz(x_t, z_t):
        c = clamp(int(round(x_t / DX_UNITS + 60)), 0, WIN_N - 1)
        r = clamp(int(round(z_t / DX_UNITS + 60)), 0, WIN_N - 1)
        return positions[r][c]

    print("Sample lander (0,0):", tuple(round(v, 3) for v in at_xz(0, 0)))
    print("Sample North ridge (0,-14):", tuple(round(v, 3) for v in at_xz(0, -14)))
    print("Sample NNW crest (-3,-15):", tuple(round(v, 3) for v in at_xz(-3, -15)))
    print("Sample SW Twin Peaks (-6,6):", tuple(round(v, 3) for v in at_xz(-6, 6)))
    print("Sample SW (-8,4):", tuple(round(v, 3) for v in at_xz(-8, 4)))
    print("Sample Big Crater (10.5,17.2):", tuple(round(v, 3) for v in at_xz(10.5, 17.2)))

    # Print elevation range in quadrants around lander to identify best horizon direction
    for name, r0, r1, c0, c1 in [
        ("North (z<0)", 25, 55, 45, 75),
        ("NE", 25, 55, 65, 95),
        ("NW", 25, 55, 25, 55),
        ("SW (Twin Peaks dir)", 60, 85, 35, 60),
        ("SE (Big Crater dir)", 65, 95, 60, 90),
    ]:
        ys = [positions[r][c][1] for r in range(r0, r1) for c in range(c0, c1)]
        best = max(
            (positions[r][c] for r in range(r0, r1) for c in range(c0, c1)),
            key=lambda p: p[1],
        )
        worst = min(
            (positions[r][c] for r in range(r0, r1) for c in range(c0, c1)),
            key=lambda p: p[1],
        )
        print(
            f"Quad {name}: y_min={min(ys):.2f} (at x={worst[0]:.1f},z={worst[2]:.1f}), "
            f"y_max={max(ys):.2f} (at x={best[0]:.1f},z={best[2]:.1f})"
        )


if __name__ == "__main__":
    main()
