import { Fragment, memo } from 'react';

import { MergedMesh } from './MergedMesh';
import { Water } from './Water';
import { TileHitTester } from './TileHitTester';
import { createGlobe } from './createGlobe';

function Globe({ subdivisions }: { subdivisions: number }) {
  const g = createGlobe(subdivisions);

  return (
    <Fragment key={g.polyhedron.id}>
      <MergedMesh geometries={g.columnGeos['underwater']} color="rgb(145, 118, 35)" />
      <MergedMesh geometries={g.columnGeos['sand']} color="rgb(245, 218, 66)" />
      <MergedMesh geometries={g.columnGeos['grass']} color="rgb(126, 245, 51)" />
      <MergedMesh geometries={g.columnGeos['forest']} color="rgb(37, 148, 22)" />
      <MergedMesh geometries={g.columnGeos['rockLow']} color="rgb(91, 92, 91)" />
      <MergedMesh geometries={g.columnGeos['rockHigh']} color="rgb(153, 151, 151)" />
      <MergedMesh geometries={g.columnGeos['snow']} color="rgb(215, 245, 242)" />

      <MergedMesh geometries={g.capGeos['sand']} color="rgb(245, 218, 66)" />
      <MergedMesh geometries={g.capGeos['grass']} color="rgb(86, 181, 25)" />
      <MergedMesh geometries={g.capGeos['forest']} color="rgb(21, 105, 9)" />
      <MergedMesh geometries={g.capGeos['rockLow']} color="rgb(24, 105, 14)" noShadow />
      <MergedMesh geometries={g.capGeos['rockHigh']} color="rgb(245, 245, 245)" noShadow />

      <TileHitTester
        geometries={g.hitTestGeos}
        // onTileEnter={(id) => console.log('tile enter', id)}
        // onTileLeave={(id) => console.log('tile leave', id)}
        // debug
      />

      <mesh castShadow>
        <sphereGeometry args={[0.99]} />
        <meshStandardMaterial color="rgb(0, 0, 0)" />
      </mesh>

      <Water />
    </Fragment>
  );
}

export default memo(Globe);
