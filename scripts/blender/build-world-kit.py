"""Rakit kit props dunia Omen Workshop di Blender.

Sumber: Kenney Furniture/Nature/Survival Kit (CC0) di .cache/world-assets/src,
ditambah tanaman tropis, pohon besar, dan bougainvillea yang dimodelkan di sini.
Setiap prop menjadi satu objek root bernama, origin di dasar-tengah, satuan meter,
material diseragamkan ke palet sunset. Hasil: .cache/world-assets/kit-raw.glb,
lalu dioptimasi oleh scripts/optimize-world-kit.mjs ke public/models/world/kit.glb.

Jalankan headless:
  flatpak run org.blender.Blender -b -P scripts/blender/build-world-kit.py
atau lewat MCP: exec(open(PATH).read()).
"""

import math
import os
import random

import bmesh
import bpy
from mathutils import Matrix, Vector

ROOT = os.environ.get(
    "OMEN_ROOT", "/home/nanaaa/Code/portfolio/omen-workshop"
)
SRC = os.path.join(ROOT, ".cache/world-assets/src")
OUT = os.path.join(ROOT, ".cache/world-assets/kit-raw.glb")

PALETTE = {
    "leaf": ("#3d6a37", 0.75),
    "leafLight": ("#6a9a48", 0.75),
    "leafDark": ("#24452b", 0.8),
    "bark": ("#6b4a35", 0.95),
    "wood": ("#8a5634", 0.8),
    "woodDark": ("#4a2f22", 0.8),
    "dirt": ("#4a3329", 1.0),
    "stone": ("#8b7676", 0.95),
    "terracotta": ("#a0533a", 0.9),
    "flower": ("#e0287a", 0.7),
    "flowerSoft": ("#f05f9a", 0.7),
    "flowerYellow": ("#f2b33a", 0.7),
    "flowerPurple": ("#9b5cff", 0.7),
    "fabric": ("#e9d8c0", 1.0),
    "fabricRed": ("#b23a3a", 1.0),
    "metal": ("#3a3946", 0.45),
    "metalLight": ("#a8a6b5", 0.35),
    "fur": ("#9a6a44", 1.0),
    "paper": ("#efe6d2", 0.9),
}


def hex_to_linear(hex_color):
    h = hex_color.lstrip("#")
    srgb = [int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    return [
        c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb
    ] + [1.0]


def palette_material(name):
    mat = bpy.data.materials.get("kit_" + name)
    if mat:
        return mat
    color, roughness = PALETTE[name]
    mat = bpy.data.materials.new("kit_" + name)
    mat.use_nodes = True
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = hex_to_linear(color)
    bsdf.inputs["Roughness"].default_value = roughness
    if name.startswith("leaf") or name.startswith("flower"):
        mat.use_backface_culling = False
    if name.startswith("metal"):
        bsdf.inputs["Metallic"].default_value = 0.6
    return mat


# Nama material Kenney -> nama palet. Dicek berurutan; kata yang lebih spesifik dulu.
REMAP = [
    ("leafsGreen", "leaf"),
    ("leafs", "leaf"),
    ("woodBarkDark", "woodDark"),
    ("woodBark", "bark"),
    ("woodDark", "woodDark"),
    ("wood", "wood"),
    ("grass", "leafLight"),
    ("plant", "leaf"),
    ("dirt", "dirt"),
    ("colorRed", "flower"),
    ("colorPurple", "flowerPurple"),
    ("colorYellow", "flowerYellow"),
    ("carpetDarker", "fabricRed"),
    ("carpetWhite", "paper"),
    ("carpet", "fabric"),
    ("metalMedium", "metalLight"),
    ("metalDark", "metal"),
    ("metal", "metal"),
    ("fur", "fur"),
    ("_defaultMat", "stone"),
    ("stone", "stone"),
    ("rock", "stone"),
]


def remap_materials(obj):
    for slot in obj.material_slots:
        if not slot.material:
            continue
        name = slot.material.name
        if name.startswith("kit_") or "colormap" in name:
            continue
        for key, target in REMAP:
            if name.startswith(key) or key in name:
                slot.material = palette_material(target)
                break


def clear_scene():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.images):
        for block in list(coll):
            if block.users == 0:
                coll.remove(block)


def kit_collection():
    coll = bpy.data.collections.get("Kit")
    if not coll:
        coll = bpy.data.collections.new("Kit")
        bpy.context.scene.collection.children.link(coll)
    return coll


def finalize(obj, name, height=None, width=None):
    """Origin di dasar-tengah, skala ke ukuran meter, pindah ke koleksi Kit."""
    bpy.context.view_layer.update()
    corners = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    lo = Vector([min(c[i] for c in corners) for i in range(3)])
    hi = Vector([max(c[i] for c in corners) for i in range(3)])
    size = hi - lo
    scale = 1.0
    if height:
        scale = height / max(size.z, 1e-6)
    elif width:
        scale = width / max(size.x, size.y, 1e-6)
    base = Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, lo.z))
    obj.data.transform(
        Matrix.Scale(scale, 4) @ Matrix.Translation(-base) @ obj.matrix_world
    )
    obj.matrix_world = Matrix.Identity(4)
    obj.name = name
    obj.data.name = name
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    kit_collection().objects.link(obj)
    return obj


def import_kenney(kit, model):
    folder = None
    for root, _, files in os.walk(os.path.join(SRC, kit)):
        if model + ".glb" in files:
            folder = root
            break
    if not folder:
        raise FileNotFoundError(f"{kit}/{model}")
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(folder, model + ".glb"))
    new = [o for o in bpy.data.objects if o not in before]
    new_names = [o.name for o in new]
    meshes = [o for o in new if o.type == "MESH"]
    bpy.ops.object.select_all(action="DESELECT")
    for o in meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    # Lepas parent sambil mempertahankan transform, lalu gabungkan.
    bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM")
    if len(meshes) > 1:
        bpy.ops.object.join()
    obj = bpy.context.view_layer.objects.active
    # Objek yang sudah digabung ikut terhapus; sisa empty/node dibersihkan lewat nama.
    for name in new_names:
        other = bpy.data.objects.get(name)
        if other is not None and other != obj:
            bpy.data.objects.remove(other, do_unlink=True)
    remap_materials(obj)
    return obj


KENNEY = [
    # (nama kit, kit, model, tinggi meter)
    ("palm_tall", "nature-kit", "tree_palmDetailedTall", 7.8),
    ("palm_bend", "nature-kit", "tree_palmBend", 5.6),
    ("palm_short", "nature-kit", "tree_palmShort", 4.2),
    ("tree_round", "nature-kit", "tree_detailed", 6.5),
    ("tree_oak", "nature-kit", "tree_oak", 5.5),
    ("bush_round", "nature-kit", "plant_bushDetailed", 1.0),
    ("bush_large", "nature-kit", "plant_bushLarge", 1.2),
    ("leafy_low", "nature-kit", "grass_leafsLarge", 0.55),
    ("plant_flat", "nature-kit", "plant_flatTall", 0.9),
    ("flower_red", "nature-kit", "flower_redB", 0.5),
    ("flower_purple", "nature-kit", "flower_purpleA", 0.45),
    ("flower_yellow", "nature-kit", "flower_yellowA", 0.45),
    ("moss", "nature-kit", "hanging_moss", 1.1),
    ("rock_a", "nature-kit", "rock_largeA", 1.1),
    ("rock_b", "nature-kit", "rock_largeC", 0.9),
    ("rock_tall", "nature-kit", "rock_tallB", 1.6),
    ("barrel", "survival-kit", "barrel", 0.95),
    ("chest", "survival-kit", "chest", 0.55),
    ("crate", "survival-kit", "box", 0.6),
    ("bucket", "survival-kit", "bucket", 0.35),
    ("anvil", "survival-kit", "workbench-anvil", 0.9),
    ("potted_plant", "furniture-kit", "pottedPlant", 1.1),
    ("plant_small", "furniture-kit", "plantSmall2", 0.35),
    ("plant_small_b", "furniture-kit", "plantSmall1", 0.32),
    ("bear", "furniture-kit", "bear", 0.42),
    ("speaker", "furniture-kit", "speaker", 1.05),
    ("radio", "furniture-kit", "radio", 0.28),
    ("books", "furniture-kit", "books", 0.24),
    ("box_closed", "furniture-kit", "cardboardBoxClosed", 0.45),
    ("box_open", "furniture-kit", "cardboardBoxOpen", 0.45),
    ("bookcase", "furniture-kit", "bookcaseOpen", 2.0),
    ("lamp_floor", "furniture-kit", "lampRoundFloor", 1.6),
]


def leaf_mesh(name, length, width, droop, curl, segments=8, notches=0, seed=0):
    """Daun memanjang yang melengkung: profil sinus, ujung meruncing."""
    rnd = random.Random(seed)
    bm = bmesh.new()
    rows = []
    for i in range(segments + 1):
        u = i / segments
        w = width * (math.sin(math.pi * min(u * 1.05, 1.0)) ** 0.7) * (1 - 0.15 * u)
        if notches and 0.2 < u < 0.9 and i % 2 == 0:
            w *= 0.72
        row = []
        for j, v in enumerate((-1.0, -0.45, 0.0, 0.45, 1.0)):
            x = v * w
            y = u * length
            z = -droop * u * u * length + curl * (v * v) * w + (0.02 if v == 0 else 0)
            row.append(bm.verts.new((x, y, z)))
        rows.append(row)
    for i in range(segments):
        for j in range(4):
            bm.faces.new((rows[i][j], rows[i][j + 1], rows[i + 1][j + 1], rows[i + 1][j]))
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    return mesh


def make_plant(name, leaves, material_cycle, stem_material=None, stem_height=0.0):
    """Gabungkan daun-daun (mesh, transform) jadi satu objek."""
    bm = bmesh.new()
    mats = []
    for mesh, matrix, mat_name in leaves:
        if mat_name not in mats:
            mats.append(mat_name)
        tmp = bmesh.new()
        tmp.from_mesh(mesh)
        bmesh.ops.transform(tmp, matrix=matrix, verts=tmp.verts)
        idx = mats.index(mat_name)
        for f in tmp.faces:
            f.material_index = idx
        tmp_mesh = bpy.data.meshes.new("tmp")
        tmp.to_mesh(tmp_mesh)
        tmp.free()
        bm.from_mesh(tmp_mesh)
        bpy.data.meshes.remove(tmp_mesh)
    out = bpy.data.meshes.new(name)
    bm.to_mesh(out)
    bm.free()
    for m in mats:
        out.materials.append(palette_material(m))
    obj = bpy.data.objects.new(name, out)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def add_cylinder(bm, start, end, r0, r1, sides=7):
    start, end = Vector(start), Vector(end)
    axis = end - start
    length = axis.length
    rot = axis.normalized().to_track_quat("Z", "Y").to_matrix().to_4x4()
    ret = bmesh.ops.create_cone(
        bm, cap_ends=True, segments=sides, radius1=r0, radius2=r1, depth=length
    )
    m = Matrix.Translation(start + axis / 2) @ rot
    bmesh.ops.transform(bm, matrix=m, verts=ret["verts"])
    return ret


def add_blob(bm, center, radius, squash=0.7, seed=0, subdiv=1):
    rnd = random.Random(seed)
    ret = bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=radius)
    for v in ret["verts"]:
        k = 1 + (rnd.random() - 0.5) * 0.35
        v.co = Vector((v.co.x * k, v.co.y * k, v.co.z * k * squash))
        v.co += Vector(center)
    return ret


def monstera(seed=1):
    rnd = random.Random(seed)
    leaves = []
    bm = bmesh.new()
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.55), 0.025, 0.02, 6)
    stalk = bpy.data.meshes.new("mstalk")
    bm.to_mesh(stalk)
    bm.free()
    leaves.append((stalk, Matrix.Identity(4), "leafDark"))
    count = 9
    for i in range(count):
        a = i / count * math.tau + rnd.uniform(-0.2, 0.2)
        up = math.radians(rnd.uniform(8, 38))
        length = rnd.uniform(0.42, 0.6)
        mesh = leaf_mesh(f"mleaf{i}", length, length * 0.6, 0.28, 0.16, 8, notches=1)
        m = (
            Matrix.Translation((0, 0, rnd.uniform(0.25, 0.6)))
            @ Matrix.Rotation(a, 4, "Z")
            @ Matrix.Rotation(up, 4, "X")
        )
        leaves.append((mesh, m, "leaf" if i % 2 else "leafLight"))
    return make_plant("monstera", leaves, None)


def banana(seed=2):
    rnd = random.Random(seed)
    leaves = []
    bm = bmesh.new()
    add_cylinder(bm, (0, 0, 0), (0, 0, 1.3), 0.09, 0.07, 8)
    trunk = bpy.data.meshes.new("btrunk")
    bm.to_mesh(trunk)
    bm.free()
    leaves.append((trunk, Matrix.Identity(4), "leafDark"))
    for i in range(7):
        a = i / 7 * math.tau + rnd.uniform(-0.25, 0.25)
        length = rnd.uniform(1.2, 1.6)
        mesh = leaf_mesh(f"bleaf{i}", length, 0.28, 0.32, 0.1, 10, notches=1)
        m = (
            Matrix.Translation((0, 0, 1.25 + rnd.uniform(-0.1, 0.15)))
            @ Matrix.Rotation(a, 4, "Z")
            @ Matrix.Rotation(math.radians(rnd.uniform(30, 58)), 4, "X")
        )
        leaves.append((mesh, m, "leafLight" if i % 3 else "leaf"))
    return make_plant("banana", leaves, None)


def fern(seed=3):
    rnd = random.Random(seed)
    leaves = []
    for i in range(14):
        a = i / 14 * math.tau + rnd.uniform(-0.15, 0.15)
        length = rnd.uniform(0.6, 0.85)
        mesh = leaf_mesh(f"fleaf{i}", length, 0.11, 0.6, 0.0, 8, notches=1)
        m = Matrix.Rotation(a, 4, "Z") @ Matrix.Rotation(math.radians(rnd.uniform(28, 52)), 4, "X")
        leaves.append((mesh, m, "leaf" if i % 2 else "leafDark"))
    return make_plant("fern", leaves, None)


def bougainvillea(seed=4):
    """Semak daun dengan kelopak magenta menyebar di permukaannya."""
    rnd = random.Random(seed)
    bm = bmesh.new()
    mats = ["leafDark", "leaf", "flower", "flowerSoft"]
    blobs = []
    for i in range(8):
        c = Vector((rnd.uniform(-0.5, 0.5), rnd.uniform(-0.5, 0.5), rnd.uniform(0.4, 1.0)))
        r = rnd.uniform(0.34, 0.48)
        blobs.append((c, r))
        ret = add_blob(bm, c, r, 0.88, seed + i, subdiv=2)
        for f in {f for v in ret["verts"] for f in v.link_faces}:
            f.material_index = i % 2
    for i in range(300):
        c, r = blobs[rnd.randrange(len(blobs))]
        d = Vector((rnd.uniform(-1, 1), rnd.uniform(-1, 1), rnd.uniform(-0.3, 1))).normalized()
        p = c + Vector((d.x * r, d.y * r, d.z * r * 0.88)) * 1.02
        ret = bmesh.ops.create_icosphere(bm, subdivisions=0, radius=rnd.uniform(0.05, 0.08))
        for v in ret["verts"]:
            v.co = v.co * Vector((1, 1, 0.55)) + p
        for f in {f for v in ret["verts"] for f in v.link_faces}:
            f.material_index = 2 if i % 3 else 3
    mesh = bpy.data.meshes.new("bougainvillea")
    bm.to_mesh(mesh)
    bm.free()
    for m in mats:
        mesh.materials.append(palette_material(m))
    obj = bpy.data.objects.new("bougainvillea", mesh)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def big_tree(seed=5):
    """Pohon peneduh besar dengan cabang lebar untuk lampion gantung."""
    rnd = random.Random(seed)
    bm = bmesh.new()
    mats = ["bark", "leafDark", "leaf", "leafLight"]
    add_cylinder(bm, (0, 0, 0), (0.2, 0.1, 3.2), 0.5, 0.32, 9)
    branches = [
        ((0.2, 0.1, 3.0), (3.6, 0.8, 5.0), 0.28, 0.1),
        ((0.2, 0.1, 3.1), (-2.6, 1.6, 5.4), 0.26, 0.1),
        ((0.2, 0.1, 3.2), (0.6, -2.8, 5.6), 0.24, 0.1),
        ((0.2, 0.1, 3.2), (0.0, 0.4, 6.4), 0.24, 0.12),
        ((2.2, 0.5, 4.2), (4.6, -0.8, 4.4), 0.12, 0.06),
    ]
    for a, b, r0, r1 in branches:
        add_cylinder(bm, a, b, r0, r1, 7)
    for i, (x, y, z, r) in enumerate(
        [
            (3.6, 0.8, 5.4, 1.7),
            (-2.6, 1.6, 5.8, 1.6),
            (0.6, -2.8, 6.0, 1.6),
            (0.0, 0.4, 6.9, 1.9),
            (1.6, 1.8, 6.2, 1.4),
            (-1.4, -1.2, 6.2, 1.4),
            (4.6, -0.8, 4.8, 1.1),
            (2.0, -1.4, 6.6, 1.3),
            (-1.0, 2.6, 5.2, 1.2),
            (3.0, 1.8, 5.0, 1.0),
            (-2.0, -0.2, 6.6, 1.2),
            (1.2, -2.2, 5.2, 1.0),
            (-3.2, 1.0, 5.0, 0.9),
        ]
    ):
        ret = add_blob(bm, (x, y, z), r, 0.74, seed * 10 + i, subdiv=2)
        idx = 1 + i % 3
        for f in {f for v in ret["verts"] for f in v.link_faces}:
            f.material_index = idx
    mesh = bpy.data.meshes.new("tree_big")
    bm.to_mesh(mesh)
    bm.free()
    for m in mats:
        mesh.materials.append(palette_material(m))
    obj = bpy.data.objects.new("tree_big", mesh)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def build():
    clear_scene()
    built = []
    for name, kit, model, height in KENNEY:
        obj = import_kenney(kit, model)
        built.append(finalize(obj, name, height=height))
    for fn, name, height, width in (
        (monstera, "monstera", None, 1.1),
        (banana, "banana", 2.6, None),
        (fern, "fern", None, 1.4),
        (bougainvillea, "bougainvillea", 1.5, None),
        (big_tree, "tree_big", 7.6, None),
    ):
        built.append(finalize(fn(), name, height=height, width=width))
    for obj in built:
        obj.data.polygons.foreach_set("use_smooth", [False] * len(obj.data.polygons))
        for p in obj.data.polygons:
            p.use_smooth = obj.name in {"bougainvillea", "tree_big", "monstera", "banana", "fern"}
    # Tata dalam grid agar mudah dilihat sebelum ekspor.
    for i, obj in enumerate(built):
        obj.location = ((i % 8) * 4.0, (i // 8) * 5.0, 0)
    bpy.ops.object.select_all(action="DESELECT")
    for obj in built:
        obj.select_set(True)
    return built


def export(built):
    for obj in built:
        obj.location = (0, 0, 0)
    bpy.ops.object.select_all(action="DESELECT")
    for obj in built:
        obj.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=OUT,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_animations=False,
    )
    print("exported", OUT, os.path.getsize(OUT))


if __name__ == "__main__" or os.environ.get("OMEN_KIT_EXPORT"):
    objs = build()
    export(objs)
