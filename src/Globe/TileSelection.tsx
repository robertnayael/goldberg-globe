import { ReactNode, useEffect, useMemo } from 'react';
import { Color, MeshBasicMaterial } from 'three';
import { useFrame } from '@react-three/fiber';

import { Tile } from '@/Polyhedron';

export function TileSelection({ tile }: { tile: Tile | null }): ReactNode {
  const geos = useSelectionGeometries(tile);
  const materials = useSelectionMaterials();

  return (
    <group>
      <mesh>
        {geos ? <primitive object={geos.outline} /> : null}
        <primitive object={materials.solid} />
      </mesh>
      <mesh>
        {geos ? <primitive object={geos.fill} /> : null}
        <primitive object={materials.opaque} />
      </mesh>
    </group>
  );
}

function useSelectionGeometries(tile: Tile | null) {
  const geos = useMemo(() => tile?.createSelectionGeometry(), [tile]);
  useEffect(() => () => [geos?.outline, geos?.fill].forEach((g) => g?.dispose()), [geos]);

  return geos;
}

function useSelectionMaterials() {
  // Create:
  const materials = useMemo(
    () => ({
      solid: new MeshBasicMaterial({ color: 'rgb(255, 165, 0)', transparent: true, depthTest: false, opacity: 1 }),
      opaque: new MeshBasicMaterial({ color: 'rgb(255, 165, 0)', transparent: true, depthTest: false, opacity: 0.5 }),
    }),
    [],
  );

  // Dispose:
  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), []);

  // Animate:
  useFrame(({ clock }) => {
    const pulse = Math.sin(clock.getElapsedTime() * 8) / 2 + 0.5;
    const fromColor = new Color('rgb(255, 165, 0)');
    const toColor = new Color('rgb(255, 77, 0)');
    materials.solid.color = materials.opaque.color = fromColor.lerp(toColor, pulse);
  });

  return materials;
}
