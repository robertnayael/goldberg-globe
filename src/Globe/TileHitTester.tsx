import { useCallback, useMemo, useRef } from 'react';
import { BufferGeometry } from 'three';
import { Bvh } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import { BufferGeometryUtils } from 'three/examples/jsm/Addons.js';

import { Tile } from '@/Polyhedron';

export function TileHitTester({
  geometries,
  onTileEnter,
  onTileLeave,
  debug = false,
}: {
  geometries: BufferGeometry[];
  onTileEnter?: (id: Tile['id']) => void;
  onTileLeave?: (id: Tile['id'] | null) => void;
  debug?: boolean;
}) {
  const [mergedGeometry, tileIds] = useMemo(() => {
    let merged = BufferGeometryUtils.mergeGeometries(geometries);
    merged.computeVertexNormals();
    merged.normalizeNormals();
    merged.computeBoundingBox();
    merged.computeBoundingSphere();
    const tileIds = merged.getAttribute('tile-id2')!;
    return [merged, tileIds];
  }, [geometries]);

  const prevIdRef = useRef<Tile['id'] | null>(null);

  const onPointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const prevId = prevIdRef.current;
      const id = Tile.getIdFromHitTestGeometry(e.intersections[0]);

      if (!id) {
        onTileLeave?.(null);
      } else if (id === prevId) {
        return;
      } else if (id !== prevId) {
        onTileLeave?.(prevId);
        onTileEnter?.(id);
      }

      prevIdRef.current = id;
    },
    [mergedGeometry, tileIds],
  );

  const onPointerLeave = useCallback(() => {
    const prevId = prevIdRef.current;
    onTileLeave?.(prevId);
    prevIdRef.current = null;
  }, [mergedGeometry, tileIds]);

  return (
    <Bvh firstHitOnly>
      <mesh onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} visible={debug}>
        <primitive object={mergedGeometry} />
        <meshStandardMaterial color="rgb(255,0,0)" flatShading />
      </mesh>
    </Bvh>
  );
}
