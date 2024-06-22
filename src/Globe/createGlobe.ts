import { createNoise3D } from 'simplex-noise';
import { BufferGeometry, MathUtils } from 'three';

import { Polyhedron } from '@/Polyhedron';

export function createGlobe(subdivisions: number) {
  const polyhedron = new Polyhedron(subdivisions);
  const noise = createNoise3D();

  const columnGeos = {
    underwater: [] as BufferGeometry[],
    sand: [] as BufferGeometry[],
    grass: [] as BufferGeometry[],
    forest: [] as BufferGeometry[],
    rockLow: [] as BufferGeometry[],
    rockHigh: [] as BufferGeometry[],
    snow: [] as BufferGeometry[],
  };

  const capGeos = {
    underwater: [] as BufferGeometry[],
    sand: [] as BufferGeometry[],
    grass: [] as BufferGeometry[],
    forest: [] as BufferGeometry[],
    rockLow: [] as BufferGeometry[],
    rockHigh: [] as BufferGeometry[],
    snow: [] as BufferGeometry[],
  };

  const hitTestGeos: BufferGeometry[] = [];

  polyhedron.tiles.forEach((tile) => {
    const sample = [tile.center.x * 3, tile.center.y * 1.5, tile.center.z * 2] as const;
    let height = MathUtils.mapLinear(noise(...sample), -1, 1, 1, 0);
    const terrainHeight = Math.pow(height, 3);
    tile.height = 1 + terrainHeight * 0.3;

    const terrainType = (() => {
      const v = MathUtils.mapLinear(terrainHeight, 0, 1, 0, 1.2);
      if (v > 1.1) return 'snow';
      if (v > 0.8) return 'rockHigh';
      if (v > 0.5) return 'rockLow';
      if (v > 0.2) return 'forest';
      if (v > 0.08) return 'grass';
      if (v > 0.05) return 'sand';
      return 'underwater';
    })();

    let capMode = ['rockLow', 'rockHigh'].includes(terrainType) ? 'separate' : 'inColumn';
    if (capMode === 'separate' && Math.random() > 0.5) capMode = 'inColumn';

    const column = tile.createColumn(capMode === 'inColumn');
    const cap = capMode === 'separate' ? tile.createCap() : null;
    hitTestGeos.push(tile.createHitTestGeometry());

    if (column) {
      columnGeos[terrainType].push(column);
    }
    if (cap) {
      capGeos[terrainType].push(cap);
    }
  });

  return {
    polyhedron,
    columnGeos,
    capGeos,
    hitTestGeos,
  };
}
