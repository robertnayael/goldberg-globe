import { ReactNode } from 'react';
import { RepeatWrapping, TextureLoader } from 'three';
import { useLoader } from '@react-three/fiber';

import waterMapImg from './assets/water.jpg';

export function Water(): ReactNode {
  const waterMap = useLoader(TextureLoader, waterMapImg);
  waterMap.wrapS = RepeatWrapping;
  waterMap.wrapT = RepeatWrapping;

  return (
    <mesh receiveShadow>
      <sphereGeometry args={[1.017, 50, 50]} />
      <meshPhysicalMaterial
        color="rgb(107, 233, 255)"
        roughnessMap={waterMap}
        ior={1.4}
        transmission={0.5}
        transparent={true}
        thickness={0.0}
        envMapIntensity={0.2}
        metalness={0.01}
        roughness={1.4}
      />
    </mesh>
  );
}
