import { Fragment, ReactNode, useEffect, useState } from 'react';
import { BufferGeometry, MathUtils } from 'three';
import { createNoise3D } from 'simplex-noise';

import { Polyhedron } from '@/Polyhedron';
import { MergedMesh } from './MergedMesh';
import { Water } from './Water';

export function Globe({ subdivisions }: { subdivisions: number }) {
  const [output, setOutput] = useState<ReactNode | null>(null);

  useEffect(() => {
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

    polyhedron.tiles.forEach((tile) => {
      const sample = [tile.center.x * 3, tile.center.y * 1.5, tile.center.z * 2] as const;
      let height = MathUtils.mapLinear(noise(...sample), -1, 1, 1, 0);
      height = Math.pow(height, 3);

      const terrainType = (() => {
        const v = MathUtils.mapLinear(height, 0, 1, 0, 1.2);
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

      const column = tile.createColumn(height, capMode === 'inColumn');
      const cap = capMode === 'separate' ? tile.createCap(height) : null;

      if (column) {
        columnGeos[terrainType].push(column);
      }
      if (cap) {
        capGeos[terrainType].push(cap);
      }
    });

    setOutput(
      <Fragment key={Math.random().toString()}>
        <MergedMesh geometries={columnGeos['underwater']} color="rgb(145, 118, 35)" />
        <MergedMesh geometries={columnGeos['sand']} color="rgb(245, 218, 66)" />
        <MergedMesh geometries={columnGeos['grass']} color="rgb(126, 245, 51)" />
        <MergedMesh geometries={columnGeos['forest']} color="rgb(37, 148, 22)" />
        <MergedMesh geometries={columnGeos['rockLow']} color="rgb(91, 92, 91)" />
        <MergedMesh geometries={columnGeos['rockHigh']} color="rgb(153, 151, 151)" />
        <MergedMesh geometries={columnGeos['snow']} color="rgb(215, 245, 242)" />

        <MergedMesh geometries={capGeos['sand']} color="rgb(245, 218, 66)" />
        <MergedMesh geometries={capGeos['grass']} color="rgb(86, 181, 25)" />
        <MergedMesh geometries={capGeos['forest']} color="rgb(21, 105, 9)" />
        <MergedMesh geometries={capGeos['rockLow']} color="rgb(24, 105, 14)" noShadow />
        <MergedMesh geometries={capGeos['rockHigh']} color="rgb(245, 245, 245)" noShadow />

        <mesh castShadow>
          <sphereGeometry args={[0.99]} />
          <meshStandardMaterial color="rgb(0, 0, 0)" />
        </mesh>

        <Water />
      </Fragment>,
    );
  }, [subdivisions]);

  return output;
}
