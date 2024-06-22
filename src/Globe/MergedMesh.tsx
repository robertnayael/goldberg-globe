import { ReactNode, useMemo } from 'react';
import { BufferGeometry } from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/Addons.js';

export function MergedMesh({
  geometries,
  color,
  noShadow = false,
}: {
  geometries: BufferGeometry[];
  color: string;
  noShadow?: boolean;
}): ReactNode {
  if (!geometries.length) return null;

  const mergedGeometry = useMemo(() => {
    let merged = BufferGeometryUtils.mergeGeometries(geometries);
    merged.computeVertexNormals();
    merged.normalizeNormals();
    merged.computeBoundingBox();
    merged.computeBoundingSphere();
    return merged;
  }, [geometries]);

  return (
    <mesh castShadow={!noShadow} receiveShadow={!noShadow}>
      <primitive object={mergedGeometry} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  );
}
