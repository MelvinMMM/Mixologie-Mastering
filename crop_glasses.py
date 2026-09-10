# -*- coding: utf-8 -*-
import pymupdf
import os

os.makedirs('assets/verres', exist_ok=True)
doc = pymupdf.open('socle-des-cocktails-de-re-ference-version-finale-12-2026.pdf')
page = doc[7]

glasses_coords = [
    # INCONTOURNABLES
    {'id': 'shot', 'name': 'Verre Shot', 'type': 'Incontournable', 'rect': (50, 142, 92, 226)},
    {'id': 'mule', 'name': 'Timbale Mule', 'type': 'Complémentaire', 'rect': (95, 142, 145, 226)},
    {'id': 'rocks', 'name': 'Verre Rocks', 'type': 'Incontournable', 'rect': (148, 142, 198, 226)},
    {'id': 'highball', 'name': 'Verre Highball', 'type': 'Incontournable', 'rect': (200, 142, 250, 226)},
    {'id': 'degustation', 'name': 'Verre Dégustation', 'type': 'Incontournable', 'rect': (252, 142, 302, 226)},
    {'id': 'nick_nora', 'name': 'Verre Nick & Nora', 'type': 'Incontournable', 'rect': (304, 142, 354, 226)},
    {'id': 'coupe', 'name': 'Coupe', 'type': 'Incontournable', 'rect': (356, 142, 406, 226)},
    {'id': 'martini', 'name': 'Verre Martini', 'type': 'Incontournable', 'rect': (408, 142, 458, 226)},
    {'id': 'vin', 'name': 'Verre à Vin', 'type': 'Incontournable', 'rect': (460, 142, 498, 226)},
    {'id': 'flute', 'name': 'Flûte', 'type': 'Incontournable', 'rect': (500, 142, 542, 226)},
    
    # COMPLÉMENTAIRES
    {'id': 'digestif', 'name': 'Verre Digestif', 'type': 'Complémentaire', 'rect': (50, 285, 95, 370)},
    {'id': 'absinthe', 'name': 'Verre à Absinthe', 'type': 'Complémentaire', 'rect': (96, 285, 146, 370)},
    {'id': 'toddy', 'name': 'Verre Toddy', 'type': 'Complémentaire', 'rect': (148, 285, 198, 370)},
    {'id': 'punch', 'name': 'Verre Punch', 'type': 'Complémentaire', 'rect': (200, 285, 250, 370)},
    {'id': 'hurricane', 'name': 'Verre Hurricane', 'type': 'Complémentaire', 'rect': (252, 285, 302, 370)},
    {'id': 'copa', 'name': 'Verre Copa', 'type': 'Complémentaire', 'rect': (304, 285, 354, 370)},
    {'id': 'biere', 'name': 'Verre à Bière', 'type': 'Complémentaire', 'rect': (356, 285, 404, 370)},
    {'id': 'julep', 'name': 'Timbale Julep', 'type': 'Complémentaire', 'rect': (406, 285, 452, 370)},
    {'id': 'tiki', 'name': 'Verre Tiki', 'type': 'Complémentaire', 'rect': (454, 285, 496, 370)},
    {'id': 'fantaisie', 'name': 'Verre Fantaisie', 'type': 'Complémentaire', 'rect': (498, 285, 542, 370)}
]

zoom = 4
mat = pymupdf.Matrix(zoom, zoom)

for g in glasses_coords:
    r = pymupdf.Rect(g['rect'])
    pix = page.get_pixmap(matrix=mat, clip=r)
    filepath = 'assets/verres/' + g['id'] + '.png'
    pix.save(filepath)
    print('Generated', filepath, pix.width, 'x', pix.height, '-', g['name'])

print('All 20 glass images extracted successfully!')
