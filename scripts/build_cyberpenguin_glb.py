#!/usr/bin/env python3
"""Build a realistic, high-subdivision, smooth-shaded 3D glTF 2.0 binary (.glb)
model of Cyberpenguin (Baby Emperor Penguin *Aptenodytes forsteri* chick inside
a realistic NASA Apollo A7L / EMU spacesuit) with articulated hierarchical nodes:
  - PenguinRoot
    - Torso (pear-shaped A7L/EMU suit, neck ring, DCM chest unit, red/blue valves, PLSS backpack)
      - FlipperL (left anatomical EVA penguin flipper)
      - FlipperR (right anatomical EVA penguin flipper)
      - Head (baby emperor penguin head, fluffy down plumage, short chick beak, glossy eyes, raised gold LEVA sun visor)
      - HelmetGlass (transparent polycarbonate bubble helmet dome)
    - FootL (left short penguin leg + ribbed lunar overboot)
    - FootR (right short penguin leg + ribbed lunar overboot)

Coordinate convention:
  +Y = up (feet soles at Y = 0.0, top of helmet/antenna at Y ~ 0.96)
  +Z = forward (beak & chest DCM face +Z)
  +X = character's left side

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


def hex_lin(h):
    h = h.lstrip("#")
    r = int(h[0:2], 16) / 255.0
    g = int(h[2:4], 16) / 255.0
    b = int(h[4:6], 16) / 255.0
    return (srgb_to_linear(r), srgb_to_linear(g), srgb_to_linear(b))


def mix_col(c0, c1, t):
    t = clamp(t, 0.0, 1.0)
    return (
        c0[0] + (c1[0] - c0[0]) * t,
        c0[1] + (c1[1] - c0[1]) * t,
        c0[2] + (c1[2] - c0[2]) * t,
    )


def scale_col(c, s):
    return (clamp(c[0] * s, 0.0, 1.0), clamp(c[1] * s, 0.0, 1.0), clamp(c[2] * s, 0.0, 1.0))


def v_sub(a, b):
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def v_add(a, b):
    return (a[0] + b[0], a[1] + b[1], a[2] + b[2])


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


class MeshBuilder:
    """Collects smooth-shaded sub-surfaces with exact averaged per-surface vertex normals."""

    def __init__(self):
        self.positions = []
        self.normals = []
        self.colors = []
        self.indices = []

    def add_surface(self, pos_list, tri_list, col_list, custom_normals=None):
        base = len(self.positions)
        if custom_normals is not None:
            norms = custom_normals
        else:
            acc = [[0.0, 0.0, 0.0] for _ in range(len(pos_list))]
            for i0, i1, i2 in tri_list:
                p0, p1, p2 = pos_list[i0], pos_list[i1], pos_list[i2]
                fn = v_cross(v_sub(p1, p0), v_sub(p2, p0))
                for idx in (i0, i1, i2):
                    acc[idx][0] += fn[0]
                    acc[idx][1] += fn[1]
                    acc[idx][2] += fn[2]
            norms = [v_norm(n) for n in acc]

        for p, n, c in zip(pos_list, norms, col_list):
            self.positions.append(p)
            self.normals.append(n)
            self.colors.append(c)
        for i0, i1, i2 in tri_list:
            self.indices.extend((base + i0, base + i1, base + i2))

    def add_grid_surface(self, rows, cols, eval_fn, wrap_u=True, close_poles=False):
        """Build a smooth parametric grid (r in 0..rows, c in 0..cols-1 if wrap_u else 0..cols)."""
        u_count = cols if wrap_u else cols + 1
        pos_list = []
        col_list = []
        for r in range(rows + 1):
            v = r / float(rows)
            for c in range(u_count):
                u = c / float(cols)
                p, col = eval_fn(u, v)
                pos_list.append(p)
                col_list.append(col)

        tri_list = []
        for r in range(rows):
            for c in range(cols):
                c1 = (c + 1) % cols if wrap_u else c + 1
                i00 = r * u_count + c
                i01 = r * u_count + c1
                i10 = (r + 1) * u_count + c
                i11 = (r + 1) * u_count + c1
                if close_poles and r == 0:
                    tri_list.append((i00, i10, i11))
                elif close_poles and r == rows - 1:
                    tri_list.append((i00, i10, i01))
                else:
                    tri_list.append((i00, i10, i11))
                    tri_list.append((i00, i11, i01))

        self.add_surface(pos_list, tri_list, col_list)

    def add_rounded_box(self, cx, cy, cz, sx, sy, sz, radius, color_fn, segs=5):
        """Smooth bevelled/rounded 3D box using a subdivided cube projected onto a superellipsoid/round-box."""
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
            dy = math.cos(phi)
            dz = math.sin(phi) * math.cos(theta)
            # Push unit sphere toward box prior to rounding
            tx = math.copysign(abs(dx) ** 0.55, dx) * (sx * 0.5)
            ty = math.copysign(abs(dy) ** 0.55, dy) * (sy * 0.5)
            tz = math.copysign(abs(dz) ** 0.55, dz) * (sz * 0.5)
            p = clamp_box(tx, ty, tz)
            lx, ly, lz = p[0] - cx, p[1] - cy, p[2] - cz
            return p, color_fn(lx, ly, lz, dx, dy, dz)

        self.add_grid_surface(n_v, n_u, eval_fn, wrap_u=True, close_poles=True)

    def add_cylinder(self, p0, p1, r0, r1, col, radial_segs=20, height_segs=4, cap_start=True, cap_end=True):
        axis = v_sub(p1, p0)
        length = math.sqrt(axis[0] ** 2 + axis[1] ** 2 + axis[2] ** 2)
        ax = v_norm(axis)
        ref = (1.0, 0.0, 0.0) if abs(ax[0]) < 0.8 else (0.0, 1.0, 0.0)
        t1 = v_norm(v_cross(ax, ref))
        t2 = v_norm(v_cross(ax, t1))

        def eval_side(u, v):
            ang = u * math.pi * 2.0
            ca, sa = math.cos(ang), math.sin(ang)
            r = r0 + (r1 - r0) * v
            cx = p0[0] + axis[0] * v + (t1[0] * ca + t2[0] * sa) * r
            cy = p0[1] + axis[1] * v + (t1[1] * ca + t2[1] * sa) * r
            cz = p0[2] + axis[2] * v + (t1[2] * ca + t2[2] * sa) * r
            c = col(u, v) if callable(col) else col
            return (cx, cy, cz), c

        self.add_grid_surface(height_segs, radial_segs, eval_side, wrap_u=True, close_poles=False)

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
            tris = [(0, 1 + (i + 1) % radial_segs, 1 + i) for i in range(radial_segs)]
            self.add_surface(pos, tris, cols, custom_normals=norms)

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
            self.add_surface(pos, tris, cols, custom_normals=norms)


# Palette (Linear RGB)
C_SUIT_WHITE = hex_lin("#f2f0ea")       # NASA Beta-cloth warm ivory white
C_SUIT_SHADE = hex_lin("#cfd6e0")       # Soft pressure fold shadow
C_SUIT_SEAM = hex_lin("#94a3b8")        # Technical seam / bellows groove
C_COBALT = hex_lin("#1d4ed8")           # NASA anodized cobalt blue
C_COBALT_LIGHT = hex_lin("#3b82f6")     # Highlighted blue ring
C_NAVY_DARK = hex_lin("#172554")        # Deep space navy trim
C_METAL_ALU = hex_lin("#9ca3af")        # Brushed aluminum ring/latches
C_METAL_DARK = hex_lin("#334155")       # Dark titanium / boot sole / controls
C_VALVE_RED = hex_lin("#dc2626")        # Anodized red oxygen purge valve
C_VALVE_BLUE = hex_lin("#2563eb")       # Anodized blue coolant valve
C_CYAN_LED = hex_lin("#38bdf8")         # Telemetry indicator light
C_AMBER_LED = hex_lin("#f59e0b")        # Status indicator
C_GOLD_VISOR = hex_lin("#eab308")       # 24K gold solar visor coating

# Baby Emperor Penguin (*Aptenodytes forsteri* chick) palette
C_CHICK_HOOD = hex_lin("#141720")       # Soft velvety charcoal-black crown & hood
C_CHICK_MASK = hex_lin("#f8fafc")       # Pure white baby emperor cheek & eye mask
C_CHICK_DOWN_LIGHT = hex_lin("#d5dbe3") # Fluffy silvery-grey chick down
C_CHICK_DOWN_MID = hex_lin("#9aa3b2")   # Mid silvery-ash down
C_BEAK_DARK = hex_lin("#1e222d")        # Dark slate chick bill
C_BEAK_CORAL = hex_lin("#e07a5f")       # Warm salmon-pink lower mandible base
C_EYE_OBSIDIAN = hex_lin("#060810")     # Deep glossy dark eye
C_EYE_IRIS = hex_lin("#291c14")         # Subtle warm dark-brown iris rim
C_PURE_WHITE = hex_lin("#ffffff")


def build_torso_mesh():
    """Node 1 (`Torso`), origin at hip pivot (0, 0.20, 0) in world space.
    Local Y ranges from -0.04 (pelvis bottom) to +0.36 (neck disconnect ring).
    """
    mb = MeshBuilder()

    # 1. Pear-shaped plump baby-penguin pressure suit torso (Beta-cloth with pressure ribs)
    def eval_suit(u, v):
        theta = u * math.pi * 2.0  # 0 = +Z (front), pi/2 = +X (left), pi = -Z (back)
        phi = v * math.pi          # 0 = bottom (-0.05), pi = top (+0.36)
        y = -0.05 + (1.0 - math.cos(phi)) * 0.5 * 0.41
        t = (y + 0.05) / 0.41  # 0 at bottom, 1 at neck

        # Plump pear profile (wider belly at t ~ 0.36, tapering smoothly to neck ring)
        s = math.sin(phi)
        belly_bulge = 1.0 + 0.24 * math.exp(-((t - 0.35) / 0.28) ** 2)
        rx = 0.215 * s * belly_bulge
        rz = 0.195 * s * belly_bulge

        # Slight forward tummy curve (+Z) for authentic baby penguin posture
        z_offset = 0.022 * math.sin(t * math.pi)

        # Subtle circumferential pressure-suit bellows / quilted thermal seams
        rib = math.sin(t * math.pi * 14.0)
        rib_indent = 0.0035 * max(0.0, -rib) * smoothstep(0.12, 0.25, t) * (1.0 - smoothstep(0.75, 0.90, t))
        rx -= rib_indent
        rz -= rib_indent

        x = rx * math.sin(theta)
        z = rz * math.cos(theta) + z_offset

        # Color & material details mapped smoothly onto the suit
        col = C_SUIT_WHITE
        # Soft ambient shading toward bottom and seam grooves
        shade = 0.92 + 0.08 * t - 0.10 * max(0.0, -rib) * smoothstep(0.15, 0.85, t)
        col = scale_col(col, shade)

        # Waist harness / telemetry belt at y ~ 0.075 (t ~ 0.30..0.38)
        belt_mask = smoothstep(0.28, 0.30, t) * (1.0 - smoothstep(0.37, 0.39, t))
        if belt_mask > 0.01:
            col = mix_col(col, C_METAL_DARK, belt_mask * 0.85)

        # NASA Blue Mission Patch on left upper chest (x < -0.06, z > 0.10, y ~ 0.23)
        patch_d = math.sqrt(((x + 0.082) / 0.036) ** 2 + ((y - 0.235) / 0.034) ** 2)
        if z > 0.08 and patch_d < 1.0:
            p_edge = 1.0 - smoothstep(0.78, 1.0, patch_d)
            col = mix_col(col, C_COBALT, p_edge)
            if 0.72 < patch_d < 0.88:
                col = mix_col(col, C_PURE_WHITE, 0.7)

        return (x, y, z), col

    mb.add_grid_surface(44, 56, eval_suit, wrap_u=True, close_poles=True)

    # 2. Anodized Aluminum Neck Disconnect Ring (y = 0.33 .. 0.375)
    def eval_neck_ring(u, v):
        theta = u * math.pi * 2.0
        # Torus-like bevelled collar tilted slightly forward
        ang_v = (v - 0.5) * math.pi
        r_major = 0.168
        r_minor_x = 0.024
        r_minor_y = 0.022
        r = r_major + r_minor_x * math.cos(ang_v)
        y = 0.352 + r_minor_y * math.sin(ang_v) - 0.014 * math.cos(theta)
        x = r * math.sin(theta)
        z = r * 0.95 * math.cos(theta) + 0.012
        # 8 metallic bayonet latch lugs around the anodized cobalt ring
        lug = max(0.0, math.cos(theta * 8.0)) ** 6
        col = mix_col(C_COBALT, C_COBALT_LIGHT, 0.5 + 0.5 * math.sin(ang_v))
        col = mix_col(col, C_METAL_ALU, lug * 0.82)
        return (x, y, z), col

    mb.add_grid_surface(16, 48, eval_neck_ring, wrap_u=True, close_poles=False)

    # 3. Chest Display & Control Module (DCM / RCU) on front torso (+Z)
    def dcm_color(lx, ly, lz, nx, ny, nz):
        c = mix_col(C_SUIT_WHITE, C_SUIT_SHADE, 0.35)
        if nz > 0.5:
            # Top dark telemetry bar
            if ly > 0.012 and abs(lx) < 0.042:
                c = C_NAVY_DARK
                if lx < -0.015:
                    c = C_CYAN_LED
                elif abs(lx) < 0.008:
                    c = C_AMBER_LED
            # Center pressure dial bezel
            elif math.sqrt((lx - 0.018) ** 2 + (ly + 0.010) ** 2) < 0.016:
                c = C_METAL_DARK
        return c

    mb.add_rounded_box(0.0, 0.195, 0.205, 0.115, 0.088, 0.048, 0.012, dcm_color, segs=4)

    # 4. Iconic Red & Blue NASA Anodized Umbilical Connector Valves on lower chest
    mb.add_cylinder(
        (0.055, 0.115, 0.185),
        (0.055, 0.115, 0.222),
        0.018,
        0.015,
        C_VALVE_BLUE,
        radial_segs=18,
        height_segs=2,
    )
    mb.add_cylinder(
        (-0.055, 0.115, 0.185),
        (-0.055, 0.115, 0.222),
        0.018,
        0.015,
        C_VALVE_RED,
        radial_segs=18,
        height_segs=2,
    )

    # 5. NASA PLSS Life Support Backpack (-Z rear)
    def plss_color(lx, ly, lz, nx, ny, nz):
        # Thermal white shell with cobalt-blue technical side panels & upper radiator grille
        c = C_SUIT_WHITE
        if abs(lx) > 0.118 or (ly < -0.095):
            c = mix_col(C_COBALT, C_NAVY_DARK, 0.35)
        elif nz < -0.5 and ly > 0.075 and abs(lx) < 0.095:
            # Upper thermal radiator louvres
            stripe = 0.5 + 0.5 * math.sin(ly * 260.0)
            c = mix_col(C_METAL_DARK, C_SUIT_SHADE, stripe * 0.6)
        elif nz < -0.5 and abs(ly + 0.015) < 0.018 and abs(lx) < 0.075:
            # NASA telemetry badge strip on back of PLSS
            c = C_COBALT
        return c

    mb.add_rounded_box(0.0, 0.185, -0.175, 0.265, 0.315, 0.135, 0.028, plss_color, segs=5)

    # Twin cylindrical O2 pressure tanks sculpted along back of PLSS + UHF whip antenna
    for side in (-1.0, 1.0):
        mb.add_cylinder(
            (side * 0.068, 0.055, -0.228),
            (side * 0.068, 0.305, -0.228),
            0.038,
            0.038,
            mix_col(C_SUIT_WHITE, C_SUIT_SHADE, 0.45),
            radial_segs=18,
            height_segs=3,
        )

    # UHF communication whip antenna rising from top-right of PLSS
    mb.add_cylinder(
        (0.092, 0.335, -0.195),
        (0.092, 0.515, -0.205),
        0.008,
        0.004,
        C_METAL_DARK,
        radial_segs=12,
        height_segs=3,
    )
    mb.add_cylinder(
        (0.092, 0.515, -0.205),
        (0.092, 0.538, -0.207),
        0.010,
        0.008,
        C_AMBER_LED,
        radial_segs=12,
        height_segs=2,
    )

    return mb


def build_flipper_mesh(is_left=True):
    """Nodes 2 & 3 (`FlipperL`, `FlipperR`), origin at shoulder pivot (±0.215, 0.28, 0.02) relative to Torso.
    Builds an anatomical, curved hydrodynamic penguin flipper inside a ribbed NASA EVA sleeve.
    """
    mb = MeshBuilder()
    sign = 1.0 if is_left else -1.0

    def eval_flipper(u, v):
        theta = u * math.pi * 2.0
        phi = v * math.pi  # 0 = shoulder top, pi = flipper tip
        t = (1.0 - math.cos(phi)) * 0.5  # 0 at shoulder, 1 at tip

        # Length down along -Y, curving gently outward and slightly backward like a real penguin flipper
        L = 0.255
        y = 0.025 - t * L
        s = math.sin(phi)

        # Flattened hydrodynamic paddle cross-section (thin in X, wider in Z, tapering to rounded tip)
        thick_x = 0.038 * s * (1.0 - 0.38 * t)
        width_z = 0.072 * s * (1.0 + 0.15 * math.sin(t * math.pi) - 0.28 * (t ** 2))

        # Concertina shoulder joint bellows near top (t in 0.08..0.34)
        rib = math.sin(t * math.pi * 10.0)
        bellows_mask = smoothstep(0.06, 0.14, t) * (1.0 - smoothstep(0.32, 0.42, t))
        thick_x += 0.004 * rib * bellows_mask
        width_z += 0.004 * rib * bellows_mask

        # Natural outward drape + slight backward sweep of a penguin flipper
        curve_x = sign * (0.015 + 0.042 * math.sin(t * math.pi * 0.85))
        curve_z = 0.010 - 0.028 * (t ** 1.4)

        x = curve_x + thick_x * math.sin(theta)
        z = curve_z + width_z * math.cos(theta)

        # Color: Beta-cloth white upper sleeve, cobalt EVA mission band, dark thermal grip tip
        col = C_SUIT_WHITE
        if bellows_mask > 0.05 and rib < 0:
            col = mix_col(col, C_SUIT_SEAM, -rib * bellows_mask * 0.45)

        # Cobalt stripe at mid-flipper (t in 0.42..0.52)
        band = smoothstep(0.41, 0.44, t) * (1.0 - smoothstep(0.51, 0.54, t))
        if band > 0.01:
            col = mix_col(col, C_COBALT, band * 0.9)

        # Dark grey thermal EVA palm/tip cover (t > 0.68)
        tip_mask = smoothstep(0.66, 0.72, t)
        if tip_mask > 0.01:
            col = mix_col(col, C_METAL_DARK, tip_mask * 0.92)

        return (x, y, z), col

    mb.add_grid_surface(30, 32, eval_flipper, wrap_u=True, close_poles=True)
    return mb


def build_foot_mesh(is_left=True):
    """Nodes 4 & 5 (`FootL`, `FootR`), origin at hip pivot (±0.095, 0.18, 0.01) relative to PenguinRoot.
    Soles touch world Y = 0.0 (local y = -0.18).
    """
    mb = MeshBuilder()
    sign = 1.0 if is_left else -1.0

    # 1. Short stout penguin leg with accordion pressure bellows (local y = +0.02 down to -0.115)
    def eval_leg(u, v):
        theta = u * math.pi * 2.0
        y = 0.02 - v * 0.135
        rib = math.sin(v * math.pi * 6.0)
        rx = 0.056 + 0.004 * rib
        rz = 0.060 + 0.004 * rib
        x = rx * math.sin(theta)
        z = rz * math.cos(theta)
        col = mix_col(C_SUIT_WHITE, C_SUIT_SHADE, 0.35 * max(0.0, -rib))
        return (x, y, z), col

    mb.add_grid_surface(14, 24, eval_leg, wrap_u=True, close_poles=False)

    # 2. Wide webbed-penguin Apollo/Artemis lunar overboot (local y = -0.105 down to -0.180)
    def eval_boot(u, v):
        theta = u * math.pi * 2.0
        phi = v * math.pi
        t = (1.0 - math.cos(phi)) * 0.5  # 0 at ankle top, 1 at sole center
        s = math.sin(phi)

        # Flatten bottom sole cleanly at y = -0.180
        raw_y = -0.098 - t * 0.088
        y = max(-0.180, raw_y)

        # Wide fan-like toe box for penguin webbed foot (+Z forward)
        forward = max(0.0, math.cos(theta))
        rx = (0.064 + 0.018 * forward * math.sin(t * math.pi)) * (s ** 0.72)
        rz_front = 0.118 * (s ** 0.70)
        rz_back = 0.065 * (s ** 0.75)
        rz = rz_front if math.cos(theta) >= 0 else rz_back

        # Ribbed lunar tread grooves along the sole rim
        sole_mask = smoothstep(0.68, 0.78, t)
        tread = math.sin(z_est := (rz * math.cos(theta) + 0.025) * 140.0)
        if sole_mask > 0.1:
            y += 0.0025 * tread * sole_mask

        x = rx * math.sin(theta) + sign * 0.004 * forward
        z = rz * math.cos(theta) + 0.028 * math.sin(t * math.pi * 0.75)

        # Overboot color scheme: thermal grey-white upper, cobalt protective toe cap & strap, dark ribbed sole
        col = mix_col(C_SUIT_WHITE, C_SUIT_SHADE, 0.25)
        # Cobalt toe guard & ankle strap
        toe_guard = smoothstep(0.035, 0.055, z) * smoothstep(0.30, 0.45, t) * (1.0 - sole_mask)
        strap = smoothstep(0.28, 0.34, t) * (1.0 - smoothstep(0.42, 0.48, t))
        col = mix_col(col, C_COBALT, max(toe_guard, strap * 0.85))
        # Dark ribbed lunar sole
        if sole_mask > 0.05:
            sole_col = mix_col(C_METAL_DARK, C_NAVY_DARK, 0.35 * max(0.0, -tread))
            col = mix_col(col, sole_col, sole_mask)

        return (x, y, z), col

    mb.add_grid_surface(24, 32, eval_boot, wrap_u=True, close_poles=True)
    return mb


def build_head_meshes():
    """Node 6 (`Head`), origin at neck pivot (0, 0.37, 0.01) relative to Torso (world Y = 0.57).
    Returns two MeshBuilders:
      - `mb_matte`: Baby emperor penguin head/plumage, short chick beak, and white LEVA sun-shield housing
      - `mb_gloss`: Glossy dark obsidian eyes, catchlights, and 24K gold raised solar visor
    """
    mb_matte = MeshBuilder()
    mb_gloss = MeshBuilder()

    head_cy = 0.145
    head_cz = 0.005

    # 1. Baby Emperor Penguin (*Aptenodytes forsteri* chick) Head & Fluffy Down Plumage
    def eval_chick_head(u, v):
        theta = u * math.pi * 2.0  # 0 = +Z (face), pi = -Z (back of head)
        phi = v * math.pi          # 0 = neck base, pi = crown top
        s = math.sin(phi)
        c_phi = math.cos(phi)

        # Plump baby chick cranium with adorable puffed lower cheeks
        y_norm = -c_phi  # -1 at neck base, +1 at crown
        cheek_puff = 1.0 + 0.11 * math.exp(-((y_norm + 0.18) / 0.38) ** 2) * max(0.0, math.cos(theta - 0.55))
        cheek_puff_r = 1.0 + 0.11 * math.exp(-((y_norm + 0.18) / 0.38) ** 2) * max(0.0, math.cos(theta + 0.55))
        puff = max(cheek_puff, cheek_puff_r)

        rx = 0.142 * s * puff
        ry = 0.148
        rz = 0.140 * s * (1.0 + 0.05 * max(0.0, math.cos(theta)))

        # Subtle micro-down fluffiness along neck and cheeks
        fluff = 0.0018 * math.sin(theta * 22.0) * math.sin(phi * 18.0) * s
        x = (rx + fluff) * math.sin(theta)
        y = head_cy + ry * y_norm
        z = head_cz + (rz + fluff) * math.cos(theta)

        # Authentic *Aptenodytes forsteri* chick plumage pattern:
        # - Heart/binocular white mask around eyes and puffed cheeks on +Z face
        # - Velvety jet-black hood over crown, temples, back of head, and small chin bib under beak
        # - Silvery ash-grey fluffy down around lower neck collar (y_norm < -0.52)
        nx = x / 0.145
        ny = (y - head_cy) / 0.148
        nz = (z - head_cz) / 0.142

        # Left and right white cheek/eye lobes joining across the bridge
        d_left = math.sqrt(((nx - 0.34) / 0.44) ** 2 + ((ny - 0.02) / 0.52) ** 2)
        d_right = math.sqrt(((nx + 0.34) / 0.44) ** 2 + ((ny - 0.02) / 0.52) ** 2)
        d_cheek = math.sqrt((nx / 0.68) ** 2 + ((ny + 0.22) / 0.38) ** 2)
        mask_dist = min(d_left, d_right, d_cheek)

        # Dark chin/throat bib right under the beak center
        d_bib = math.sqrt((nx / 0.29) ** 2 + ((ny + 0.26) / 0.25) ** 2)
        bib_cut = 1.0 - smoothstep(0.65, 1.05, d_bib)

        face_front = smoothstep(0.15, 0.48, nz)
        white_mask = (1.0 - smoothstep(0.76, 1.04, mask_dist)) * face_front * (1.0 - 0.88 * bib_cut)

        # Silvery-grey fluffy chick neck down at bottom of head
        neck_down = 1.0 - smoothstep(-0.62, -0.28, ny)

        # Soft downy feather texture micro-tone
        down_tex = 0.5 + 0.5 * math.sin(nx * 38.0 + ny * 32.0) * math.cos(nz * 34.0)
        hood_col = mix_col(C_CHICK_HOOD, C_METAL_DARK, down_tex * 0.14)
        mask_col = mix_col(C_CHICK_DOWN_LIGHT, C_CHICK_MASK, 0.72 + 0.28 * down_tex)
        down_col = mix_col(C_CHICK_DOWN_MID, C_CHICK_DOWN_LIGHT, 0.45 + 0.45 * down_tex)

        col = mix_col(hood_col, mask_col, white_mask)
        col = mix_col(col, down_col, neck_down)
        return (x, y, z), col

    mb_matte.add_grid_surface(44, 56, eval_chick_head, wrap_u=True, close_poles=True)

    # 2. Short Conical Baby Emperor Penguin Chick Beak (+Z)
    # Dark slate-black upper mandible with subtle warm coral-salmon lower mandible base
    def eval_beak(u, v):
        theta = u * math.pi * 2.0
        # v = 0 at base inside face (z ~ 0.125), v = 1 at rounded tip (z ~ 0.205)
        t = v
        profile = (1.0 - t) ** 0.78
        rx = 0.030 * profile
        ry = 0.023 * profile
        # Slight downward hook at tip of chick bill
        droop_y = -0.007 * (t ** 1.8)
        x = rx * math.sin(theta)
        y = (head_cy - 0.016) + droop_y + ry * math.cos(theta)
        z = head_cz + 0.122 + t * 0.082

        # Coral-pink/salmon highlight on lower/side mandible base (real emperor chick feature)
        lower_mask = smoothstep(-0.1, -0.7, math.cos(theta)) * (1.0 - smoothstep(0.15, 0.78, t))
        col = mix_col(C_BEAK_DARK, C_BEAK_CORAL, lower_mask * 0.78)
        return (x, y, z), col

    mb_matte.add_grid_surface(18, 28, eval_beak, wrap_u=True, close_poles=True)

    # 3. Expressive Glossy 3D Eyes + Specular Catchlights (added to `mb_gloss`)
    for side in (-1.0, 1.0):
        ex = side * 0.056
        ey = head_cy + 0.018
        ez = head_cz + 0.124

        def make_eye_eval(cx, cy, cz, s_dir):
            def eval_eye(u, v):
                theta = u * math.pi * 2.0
                phi = v * math.pi
                sn = math.sin(phi)
                dx = sn * math.sin(theta)
                dy = math.cos(phi)
                dz = sn * math.cos(theta)
                # Slightly flattened ellipsoid oriented with the cheek surface
                px = cx + dx * 0.024
                py = cy + dy * 0.026
                pz = cz + dz * 0.018 - abs(dx) * 0.004
                # Subtle warm dark-brown iris ring around deep obsidian pupil
                front_dot = dz
                iris_ring = smoothstep(0.35, 0.62, front_dot) * (1.0 - smoothstep(0.75, 0.92, front_dot))
                col = mix_col(C_EYE_OBSIDIAN, C_EYE_IRIS, iris_ring * 0.85)
                return (px, py, pz), col
            return eval_eye

        mb_gloss.add_grid_surface(18, 24, make_eye_eval(ex, ey, ez, side), wrap_u=True, close_poles=True)

        # Primary & secondary 3D white catchlight spheres on the cornea surface
        for (ox, oy, oz, rad) in [(-0.006 * side, 0.008, 0.017, 0.0052), (0.006 * side, -0.006, 0.016, 0.0028)]:
            def make_spark_eval(sx, sy, sz, sr):
                def eval_spark(u, v):
                    theta = u * math.pi * 2.0
                    phi = v * math.pi
                    sn = math.sin(phi)
                    return (
                        sx + sr * sn * math.sin(theta),
                        sy + sr * math.cos(phi),
                        sz + sr * sn * math.cos(theta),
                    ), C_PURE_WHITE
                return eval_spark

            mb_gloss.add_grid_surface(8, 12, make_spark_eval(ex + ox, ey + oy, ez + oz, rad), wrap_u=True, close_poles=True)

    # 4. NASA LEVA Extravehicular Helmet Shell & Raised 24K Gold Solar Visor Assembly
    # Pivoted up over the forehead/crown of the bubble helmet so the baby penguin face is 100% unobstructed
    # 4a. Gleaming 24K Gold Solar Visor band peeking from under the white LEVA shroud (in `mb_gloss`)
    def eval_gold_visor(u, v):
        # u spans azimuth across front/sides (-118 deg to +118 deg)
        # v spans elevation arc from forehead brow (+24 deg) up to crown (+105 deg)
        az = (u - 0.5) * math.radians(232.0)
        el = math.radians(23.0 + v * 84.0)
        r_vis = 0.194
        # Slight thickness / lip at the bottom brow edge (v near 0)
        lip = 0.004 * math.sin(v * math.pi)
        r = r_vis + lip
        x = r * math.cos(el) * math.sin(az)
        y = head_cy + r * math.sin(el)
        z = head_cz + r * math.cos(el) * math.cos(az)
        col = mix_col(C_GOLD_VISOR, C_PURE_WHITE, 0.18 * math.sin(v * math.pi))
        return (x, y, z), col

    mb_gloss.add_grid_surface(16, 36, eval_gold_visor, wrap_u=False, close_poles=False)

    # 4b. Outer White Thermal Sun-Shield Shroud (LEVA) over the gold visor (in `mb_matte`)
    def eval_outer_shroud(u, v):
        az = (u - 0.5) * math.radians(240.0)
        el = math.radians(33.0 + v * 98.0)
        r = 0.203
        x = r * math.cos(el) * math.sin(az)
        y = head_cy + r * math.sin(el)
        z = head_cz + r * math.cos(el) * math.cos(az)
        # Subtle cobalt telemetry accent stripe along the front brow rim of the shroud
        brow_stripe = (1.0 - smoothstep(0.0, 0.12, v)) * (1.0 - smoothstep(0.32, 0.42, abs(u - 0.5)))
        col = mix_col(C_SUIT_WHITE, C_COBALT, brow_stripe * 0.85)
        return (x, y, z), col

    mb_matte.add_grid_surface(16, 36, eval_outer_shroud, wrap_u=False, close_poles=False)

    # 4c. Compact NASA Side Visor Hinge Pivot Pods & EVA Work Lamps at temples (x = ±0.195)
    for side in (-1.0, 1.0):
        mb_matte.add_cylinder(
            (side * 0.178, head_cy + 0.015, head_cz - 0.005),
            (side * 0.208, head_cy + 0.015, head_cz - 0.005),
            0.032,
            0.026,
            C_METAL_ALU,
            radial_segs=18,
            height_segs=2,
        )
        # Forward-facing miniature EVA lamp barrel on hinge pod
        mb_gloss.add_cylinder(
            (side * 0.198, head_cy + 0.015, head_cz - 0.005),
            (side * 0.198, head_cy + 0.015, head_cz + 0.038),
            0.012,
            0.014,
            C_CYAN_LED,
            radial_segs=14,
            height_segs=2,
        )

    return mb_matte, mb_gloss


def build_helmet_glass_mesh():
    """Node 7 (`HelmetGlass`), origin at neck pivot (0, 0.37, 0.01) relative to Torso.
    High-resolution smooth polycarbonate pressure bubble dome enclosing `Head`.
    """
    mb = MeshBuilder()
    head_cy = 0.145
    head_cz = 0.005
    r_dome = 0.184

    pos_list = []
    norm_list = []
    col_list = []
    rows = 28
    cols = 44

    # Phi from neck ring base (0.16*pi) to top crown (pi)
    phi_min = 0.16 * math.pi
    for r in range(rows + 1):
        v = r / float(rows)
        phi = phi_min + v * (math.pi - phi_min)
        sn = math.sin(phi)
        cs = -math.cos(phi)
        for c in range(cols):
            u = c / float(cols)
            theta = u * math.pi * 2.0
            nx = sn * math.sin(theta)
            ny = cs
            nz = sn * math.cos(theta)
            px = r_dome * nx
            py = head_cy + r_dome * 1.03 * ny
            pz = head_cz + r_dome * 0.99 * nz
            pos_list.append((px, py, pz))
            norm_list.append(v_norm((nx, ny / 1.03, nz / 0.99)))
            col_list.append(C_PURE_WHITE)

    tri_list = []
    for r in range(rows):
        for c in range(cols):
            c1 = (c + 1) % cols
            i00 = r * cols + c
            i01 = r * cols + c1
            i10 = (r + 1) * cols + c
            i11 = (r + 1) * cols + c1
            if r == rows - 1:
                tri_list.append((i00, i10, i01))
            else:
                tri_list.append((i00, i10, i11))
                tri_list.append((i00, i11, i01))

    mb.add_surface(pos_list, tri_list, col_list, custom_normals=norm_list)
    return mb


def pack_glb():
    torso_mb = build_torso_mesh()
    flip_l_mb = build_flipper_mesh(is_left=True)
    flip_r_mb = build_flipper_mesh(is_left=False)
    foot_l_mb = build_foot_mesh(is_left=True)
    foot_r_mb = build_foot_mesh(is_left=False)
    head_matte_mb, head_gloss_mb = build_head_meshes()
    glass_mb = build_helmet_glass_mesh()

    bin_chunks = bytearray()
    buffer_views = []
    accessors = []

    def align4(buf):
        rem = len(buf) % 4
        if rem:
            buf.extend(b"\x00" * (4 - rem))

    def append_primitive(mb, mat_idx):
        v_count = len(mb.positions)
        i_count = len(mb.indices)

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

        # Colors
        align4(bin_chunks)
        col_off = len(bin_chunks)
        for c in mb.colors:
            bin_chunks.extend(struct.pack("<3f", *c))
        col_len = len(bin_chunks) - col_off
        bv_col = len(buffer_views)
        buffer_views.append({"buffer": 0, "byteOffset": col_off, "byteLength": col_len, "target": 34962})
        acc_col = len(accessors)
        accessors.append({
            "bufferView": bv_col,
            "byteOffset": 0,
            "componentType": 5126,
            "count": v_count,
            "type": "VEC3",
        })

        # Indices (uint16 if v_count < 65535 else uint32)
        align4(bin_chunks)
        idx_off = len(bin_chunks)
        use_u32 = v_count >= 65535
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
            "min": [0],
            "max": [v_count - 1],
        })

        return {
            "attributes": {
                "POSITION": acc_pos,
                "NORMAL": acc_norm,
                "COLOR_0": acc_col,
            },
            "indices": acc_idx,
            "material": mat_idx,
            "mode": 4,
        }

    meshes = [
        {"name": "TorsoMesh", "primitives": [append_primitive(torso_mb, 0)]},
        {"name": "FlipperLMesh", "primitives": [append_primitive(flip_l_mb, 0)]},
        {"name": "FlipperRMesh", "primitives": [append_primitive(flip_r_mb, 0)]},
        {"name": "FootLMesh", "primitives": [append_primitive(foot_l_mb, 0)]},
        {"name": "FootRMesh", "primitives": [append_primitive(foot_r_mb, 0)]},
        {
            "name": "HeadMesh",
            "primitives": [
                append_primitive(head_matte_mb, 0),
                append_primitive(head_gloss_mb, 1),
            ],
        },
        {"name": "HelmetGlassMesh", "primitives": [append_primitive(glass_mb, 2)]},
    ]

    nodes = [
        {
            "name": "PenguinRoot",
            "children": [1, 4, 5],
        },
        {
            "name": "Torso",
            "mesh": 0,
            "translation": [0.0, 0.20, 0.0],
            "children": [2, 3, 6, 7],
        },
        {
            "name": "FlipperL",
            "mesh": 1,
            "translation": [0.215, 0.28, 0.02],
        },
        {
            "name": "FlipperR",
            "mesh": 2,
            "translation": [-0.215, 0.28, 0.02],
        },
        {
            "name": "FootL",
            "mesh": 3,
            "translation": [0.095, 0.18, 0.01],
        },
        {
            "name": "FootR",
            "mesh": 4,
            "translation": [-0.095, 0.18, 0.01],
        },
        {
            "name": "Head",
            "mesh": 5,
            "translation": [0.0, 0.37, 0.01],
        },
        {
            "name": "HelmetGlass",
            "mesh": 6,
            "translation": [0.0, 0.37, 0.01],
        },
    ]

    materials = [
        {
            "name": "PenguinSuitAndPlumage",
            "pbrMetallicRoughness": {
                "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
                "metallicFactor": 0.06,
                "roughnessFactor": 0.68,
            },
            "doubleSided": False,
        },
        {
            "name": "PenguinEyesAndGoldVisor",
            "pbrMetallicRoughness": {
                "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
                "metallicFactor": 0.35,
                "roughnessFactor": 0.12,
            },
            "doubleSided": True,
        },
        {
            "name": "HelmetPolycarbonateDome",
            "pbrMetallicRoughness": {
                "baseColorFactor": [0.86, 0.96, 1.0, 0.22],
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
            "generator": "Cyberpenguins 3D Character Builder (Baby Emperor Penguin + NASA A7L/EMU Suit)",
        },
        "scene": 0,
        "scenes": [{"name": "CyberpenguinScene", "nodes": [0]}],
        "nodes": nodes,
        "meshes": meshes,
        "materials": materials,
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

    total_verts = sum(
        len(m.positions)
        for m in (torso_mb, flip_l_mb, flip_r_mb, foot_l_mb, foot_r_mb, head_matte_mb, head_gloss_mb, glass_mb)
    )
    total_tris = sum(
        len(m.indices) // 3
        for m in (torso_mb, flip_l_mb, flip_r_mb, foot_l_mb, foot_r_mb, head_matte_mb, head_gloss_mb, glass_mb)
    )
    print(
        f"Generated {OUT_GLB_PATH}: {total_len:,} bytes ({total_len/1024:.1f} KB), "
        f"vertices={total_verts:,}, triangles={total_tris:,}, nodes={len(nodes)}"
    )


if __name__ == "__main__":
    pack_glb()
