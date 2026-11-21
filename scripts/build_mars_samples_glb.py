#!/usr/bin/env python3
"""Build a realistic 3D glTF 2.0 binary (.glb) pack containing the 3 famous NASA Mars
Pathfinder / Sojourner geological sample rocks of Ares Vallis (`assets/models/mars-samples.glb`):

  1. `BarnacleBill` (`sample-mars-2`):
     Angular, wind-faceted (ventifact) dark grey-brown andesite pyramid (~42 cm wide, ~32 cm tall)
     with pitted vesicular cavities ("barnacles") and dusty ochre regolith trapped in crevices.
  2. `Yogi` (`sample-mars-3`):
     Iconic large two-toned basaltic boulder (~1.05 m wide, ~0.82 m tall) shaped like a bear's
     head, with a bright rusty iron-oxide soil/dust cap on its windward side and darker exposed
     basalt on its leeward underside.
  3. `ScoobyDoo` (`sample-mars-4`):
     Flat, tabular, pale-ochre cemented indurated soil / duricrust slab (~55 cm wide, ~18 cm tall)
     with fine laminar sedimentary fractures and light dusty sheen.

Includes an embedded 512x512 PNG geological rock texture atlas (vesicular pits, mineral grain,
dust crusts, and stratified fractures). Uses Python standard library only.
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
    "mars-samples.glb",
)


def clamp(v, lo, hi):
    return lo if v < lo else hi if v > hi else v


def smoothstep(e0, e1, x):
    if e1 == e0:
        return 0.0
    t = clamp((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def mix_col(c0, c1, t):
    t = clamp(t, 0.0, 1.0)
    return (
        c0[0] + (c1[0] - c0[0]) * t,
        c0[1] + (c1[1] - c0[1]) * t,
        c0[2] + (c1[2] - c0[2]) * t,
    )


def hex_srgb(h):
    h = h.lstrip("#")
    return (
        int(h[0:2], 16) / 255.0,
        int(h[2:4], 16) / 255.0,
        int(h[4:6], 16) / 255.0,
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


def build_mars_rocks_atlas_png(width=512, height=512):
    """Build a 512x512 RGBA PNG geological texture atlas divided into 3 horizontal bands:
      - Band 0 (v in [0.00, 0.33]): Barnacle Bill (dark pitted grey-brown andesite + ochre dust pockets)
      - Band 1 (v in [0.33, 0.67]): Yogi (two-toned rusty ochre cap + dark basaltic underside)
      - Band 2 (v in [0.67, 1.00]): Scooby Doo (pale-ochre indurated duricrust + laminar cracks)
    """
    buf = bytearray(width * height * 4)

    # Barnacle Bill palette (andesite)
    bb_dark = hex_srgb("#3e3633")
    bb_mid = hex_srgb("#66574f")
    bb_dust = hex_srgb("#b57352")
    bb_pit = hex_srgb("#241f1d")

    # Yogi palette (two-toned basalt/iron oxide)
    yg_rust = hex_srgb("#c46d45")
    yg_ochre = hex_srgb("#d88b5f")
    yg_basalt = hex_srgb("#4f3e37")
    yg_crevice = hex_srgb("#2d221e")

    # Scooby Doo palette (pale cemented duricrust)
    sd_pale = hex_srgb("#d9a982")
    sd_mid = hex_srgb("#bc845c")
    sd_crust = hex_srgb("#e8c3a3")
    sd_crack = hex_srgb("#6e4b38")

    b1 = height // 3
    b2 = (height * 2) // 3

    for py in range(height):
        for px in range(width):
            u = px / float(max(1, width - 1))
            if py < b1:
                # Band 0: Barnacle Bill (vesicular pitted andesite)
                v = py / float(max(1, b1 - 1))
                grain = (
                    0.5
                    + 0.25 * math.sin(u * 29.0 + v * 17.0)
                    + 0.15 * math.cos(u * 61.0 - v * 43.0)
                    + 0.10 * math.sin(u * 113.0 + v * 89.0)
                )
                # Vesicular pits ("barnacles")
                pit_wave = abs(math.sin(u * 38.0 + math.sin(v * 23.0)) * math.cos(v * 29.0 + math.cos(u * 19.0)))
                pit_mask = 1.0 - smoothstep(0.0, 0.14, pit_wave)
                dust_mask = smoothstep(0.55, 0.92, 0.5 + 0.5 * math.sin(u * 12.0 - v * 9.0)) * (0.4 + 0.6 * v)

                col = mix_col(bb_dark, bb_mid, clamp(grain, 0.0, 1.0))
                col = mix_col(col, bb_dust, clamp(dust_mask * 0.65, 0.0, 0.72))
                col = mix_col(col, bb_pit, clamp(pit_mask * 0.80, 0.0, 0.85))
            elif py < b2:
                # Band 1: Yogi (two-toned rusty ochre cap on upper/windward side, darker basalt below)
                v = (py - b1) / float(max(1, b2 - b1 - 1))
                grain = (
                    0.5
                    + 0.25 * math.sin(u * 23.0 - v * 19.0)
                    + 0.15 * math.cos(u * 53.0 + v * 37.0)
                    + 0.10 * math.sin(u * 97.0 - v * 71.0)
                )
                # Two-toned boundary (windward rusty dust coat vs exposed dark basalt)
                tone_split = smoothstep(0.28, 0.68, v + 0.14 * math.sin(u * math.pi * 2.0 + 0.6))
                rust_col = mix_col(yg_rust, yg_ochre, clamp(grain, 0.0, 1.0))
                base_col = mix_col(yg_crevice, yg_basalt, clamp(0.3 + 0.7 * grain, 0.0, 1.0))
                col = mix_col(base_col, rust_col, tone_split)
                # Micro fracture lines
                frac = abs(math.sin((u * 16.0 + v * 11.0 + 0.25 * math.sin(u * 9.0)) * math.pi))
                if frac < 0.08:
                    col = mix_col(col, yg_crevice, 0.55)
            else:
                # Band 2: Scooby Doo (pale cemented indurated duricrust slab)
                v = (py - b2) / float(max(1, height - b2 - 1))
                grain = (
                    0.5
                    + 0.25 * math.sin(u * 21.0 + v * 33.0)
                    + 0.15 * math.cos(u * 47.0 - v * 59.0)
                    + 0.10 * math.sin(u * 83.0 + v * 79.0)
                )
                lam = 0.5 + 0.5 * math.sin(v * math.pi * 14.0 + 0.6 * math.sin(u * 11.0))
                col = mix_col(sd_mid, sd_pale, clamp(0.35 + 0.55 * grain, 0.0, 1.0))
                col = mix_col(col, sd_crust, clamp(lam * 0.42, 0.0, 0.55))
                crack = abs(math.sin((u * 14.0 - v * 9.0) * math.pi))
                if crack < 0.065:
                    col = mix_col(col, sd_crack, 0.65)

            idx = (py * width + px) * 4
            buf[idx] = int(round(clamp(col[0], 0.0, 1.0) * 255))
            buf[idx + 1] = int(round(clamp(col[1], 0.0, 1.0) * 255))
            buf[idx + 2] = int(round(clamp(col[2], 0.0, 1.0) * 255))
            buf[idx + 3] = 255

    return encode_png_rgba(width, height, buf)


def build_rock_mesh(rock_kind, rows=32, cols=48):
    """Build a realistic faceted geological rock mesh resting on y = 0.000."""
    positions = []
    uvs = []
    indices = []

    if rock_kind == "barnacle_bill":
        v_band_start, v_band_len = 0.01, 0.31
    elif rock_kind == "yogi":
        v_band_start, v_band_len = 0.34, 0.31
    else:
        v_band_start, v_band_len = 0.68, 0.31

    u_count = cols + 1
    for r in range(rows + 1):
        v = r / float(rows)
        phi = v * math.pi
        sp = math.sin(phi)
        ny = -math.cos(phi)  # -1 bottom, +1 top
        for c in range(u_count):
            u_raw = c / float(cols)
            u_wrap = (c % cols) / float(cols)
            theta = (u_wrap - 0.5) * math.pi * 2.0
            nx = sp * math.sin(theta)
            nz = sp * math.cos(theta)

            if rock_kind == "barnacle_bill":
                # Angular pyramidal ventifact (~44 cm wide, ~34 cm tall)
                taper = 1.0 - 0.52 * smoothstep(-0.2, 0.95, ny)
                facet = (
                    0.92
                    + 0.14 * math.cos(theta * 3.0 + 0.4) * (1.0 - abs(ny) * 0.5)
                    + 0.08 * math.sin(theta * 5.0 - ny * 3.2)
                    + 0.045 * math.cos(nx * 9.0 + ny * 7.0 - nz * 8.0)
                )
                rx = 0.24 * taper * facet
                rz = 0.22 * taper * facet
                ry = 0.19 * facet
                px = nx * rx
                pz = nz * rz
                py = max(-0.04, ny * ry) + 0.15
            elif rock_kind == "yogi":
                # Large bear-head boulder (~1.05 m wide, ~0.82 m tall)
                snout = 0.16 * smoothstep(0.1, 0.95, nz) * (1.0 - abs(ny) * 0.6)
                brow = 0.12 * smoothstep(0.0, 0.85, ny) * smoothstep(-0.8, 0.2, -nx)
                facet = (
                    0.94
                    + 0.10 * math.sin(theta * 2.0 + 0.9) * math.cos(ny * 2.0)
                    + 0.065 * math.cos(theta * 4.0 + ny * 3.8)
                    + 0.035 * math.sin(nx * 8.0 - ny * 6.5 + nz * 7.5)
                )
                px = nx * (0.50 * facet)
                pz = nz * (0.48 * facet + snout)
                py = max(-0.08, ny * (0.40 * facet + brow)) + 0.36
            else:
                # Scooby Doo: flat tabular duricrust slab (~58 cm wide, ~18 cm tall)
                facet = (
                    0.95
                    + 0.12 * math.cos(theta * 4.0 - 0.5)
                    + 0.06 * math.sin(theta * 6.0 + ny * 2.5)
                    + 0.03 * math.cos(nx * 11.0 + nz * 9.0)
                )
                flat_top = 0.72 if ny > 0.35 else 1.0
                px = nx * (0.31 * facet)
                pz = nz * (0.26 * facet)
                py = max(-0.02, ny * (0.105 * facet * flat_top)) + 0.085

            positions.append((px, py, pz))
            uvs.append((clamp(u_raw, 0.0, 1.0), v_band_start + clamp(v, 0.0, 1.0) * v_band_len))

    # Compute center for outward winding check
    cy_mid = sum(p[1] for p in positions) / float(len(positions))
    center = (0.0, cy_mid, 0.0)

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
        p0, p1, p2 = positions[i0], positions[i1], positions[i2]
        fn = v_cross(v_sub(p1, p0), v_sub(p2, p0))
        centroid = (
            (p0[0] + p1[0] + p2[0]) / 3.0,
            (p0[1] + p1[1] + p2[1]) / 3.0,
            (p0[2] + p1[2] + p2[2]) / 3.0,
        )
        if v_dot(fn, v_sub(centroid, center)) < 0.0:
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

    for r in range(rows + 1):
        i_start = r * u_count
        i_end = r * u_count + cols
        sx = acc[i_start][0] + acc[i_end][0]
        sy = acc[i_start][1] + acc[i_end][1]
        sz = acc[i_start][2] + acc[i_end][2]
        acc[i_start] = [sx, sy, sz]
        acc[i_end] = [sx, sy, sz]

    for pole_r in (0, rows):
        px = sum(acc[pole_r * u_count + c][0] for c in range(cols))
        py = sum(acc[pole_r * u_count + c][1] for c in range(cols))
        pz = sum(acc[pole_r * u_count + c][2] for c in range(cols))
        for c in range(u_count):
            acc[pole_r * u_count + c] = [px, py, pz]

    normals = [v_norm(n) for n in acc]
    for i0, i1, i2 in fixed_tris:
        indices.extend((i0, i1, i2))

    return positions, normals, uvs, indices


def pack_glb():
    png_bytes = build_mars_rocks_atlas_png(512, 512)
    rock_specs = [
        ("BarnacleBill", "barnacle_bill"),
        ("Yogi", "yogi"),
        ("ScoobyDoo", "scooby_doo"),
    ]

    bin_chunks = bytearray()
    buffer_views = []
    accessors = []
    meshes = []
    nodes = []

    def align4(buf):
        rem = len(buf) % 4
        if rem:
            buf.extend(b"\x00" * (4 - rem))

    align4(bin_chunks)
    png_off = len(bin_chunks)
    bin_chunks.extend(png_bytes)
    png_len = len(png_bytes)
    bv_png = len(buffer_views)
    buffer_views.append({"buffer": 0, "byteOffset": png_off, "byteLength": png_len})

    total_verts = 0
    total_tris = 0

    for idx_rock, (node_name, kind) in enumerate(rock_specs):
        positions, normals, uvs, indices = build_rock_mesh(kind, rows=32, cols=48)
        v_count = len(positions)
        i_count = len(indices)
        total_verts += v_count
        total_tris += i_count // 3

        align4(bin_chunks)
        pos_off = len(bin_chunks)
        min_p = [float("inf")] * 3
        max_p = [float("-inf")] * 3
        for p in positions:
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
        for n in normals:
            bin_chunks.extend(struct.pack("<3f", *n))
        bv_norm = len(buffer_views)
        buffer_views.append({"buffer": 0, "byteOffset": norm_off, "byteLength": len(bin_chunks) - norm_off, "target": 34962})
        acc_norm = len(accessors)
        accessors.append({
            "bufferView": bv_norm,
            "byteOffset": 0,
            "componentType": 5126,
            "count": v_count,
            "type": "VEC3",
        })

        align4(bin_chunks)
        uv_off = len(bin_chunks)
        for uv in uvs:
            bin_chunks.extend(struct.pack("<2f", *uv))
        bv_uv = len(buffer_views)
        buffer_views.append({"buffer": 0, "byteOffset": uv_off, "byteLength": len(bin_chunks) - uv_off, "target": 34962})
        acc_uv = len(accessors)
        accessors.append({
            "bufferView": bv_uv,
            "byteOffset": 0,
            "componentType": 5126,
            "count": v_count,
            "type": "VEC2",
        })

        align4(bin_chunks)
        idx_off = len(bin_chunks)
        for i in indices:
            bin_chunks.extend(struct.pack("<H", i))
        bv_idx = len(buffer_views)
        buffer_views.append({"buffer": 0, "byteOffset": idx_off, "byteLength": len(bin_chunks) - idx_off, "target": 34963})
        acc_idx = len(accessors)
        accessors.append({
            "bufferView": bv_idx,
            "byteOffset": 0,
            "componentType": 5123,
            "count": i_count,
            "type": "SCALAR",
        })

        meshes.append({
            "name": f"{node_name}Mesh",
            "primitives": [{
                "attributes": {"POSITION": acc_pos, "NORMAL": acc_norm, "TEXCOORD_0": acc_uv},
                "indices": acc_idx,
                "material": 0,
                "mode": 4,
            }],
        })
        nodes.append({"name": node_name, "mesh": idx_rock})

    gltf = {
        "asset": {"version": "2.0", "generator": "CyberPenguin 2.0 Mars Pathfinder Rocks Builder"},
        "scene": 0,
        "scenes": [{"name": "MarsSamplesScene", "nodes": [0, 1, 2]}],
        "nodes": nodes,
        "meshes": meshes,
        "textures": [{"sampler": 0, "source": 0}],
        "images": [{"bufferView": bv_png, "mimeType": "image/png", "name": "MarsPathfinderRocksAtlas"}],
        "samplers": [{"magFilter": 9729, "minFilter": 9729, "wrapS": 33071, "wrapT": 33071}],
        "materials": [{
            "name": "MarsPathfinderRockRegolith",
            "doubleSided": False,
            "pbrMetallicRoughness": {
                "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
                "baseColorTexture": {"index": 0},
                "roughnessFactor": 0.92,
                "metallicFactor": 0.04,
            },
        }],
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
        f"vertices={total_verts:,}, triangles={total_tris:,}, png={png_len:,} B"
    )


if __name__ == "__main__":
    pack_glb()
