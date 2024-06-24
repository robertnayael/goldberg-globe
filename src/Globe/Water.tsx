import { ReactNode, useRef } from 'react';
import { MeshPhysicalMaterial, RepeatWrapping, TextureLoader } from 'three';
import { useFrame, useLoader } from '@react-three/fiber';

import waterMapImg from './assets/water.jpg';
import { fragmentShader, vertexShader } from './waterShader';

export function Water(): ReactNode {
  const waterMap = useLoader(TextureLoader, waterMapImg);
  waterMap.wrapS = RepeatWrapping;
  waterMap.wrapT = RepeatWrapping;

  const materialRef = useRef<MeshPhysicalMaterial>(null);
  useFrame(({ clock }) => {
    if (!materialRef.current?.userData?.shader?.uniforms) {
      return;
    }
    const elapsedTime = clock.getElapsedTime();
    materialRef.current!.userData.shader.uniforms.uTime.value = elapsedTime;
  });

  return (
    <mesh receiveShadow>
      <sphereGeometry args={[1.017, 50, 50]} />
      <meshPhysicalMaterial
        ref={materialRef}
        color="rgb(107, 233, 255)"
        ior={1.4}
        transmission={0.5}
        transparent={true}
        thickness={0.0}
        envMapIntensity={0.2}
        metalness={0.0}
        opacity={0.9}
        roughnessMap={waterMap}
        onBeforeCompile={(shader) => {
          materialRef.current!.userData.shader = shader;
          shader.uniforms.uTime = { value: 0 };
          shader.vertexShader = vertexShader;
          shader.fragmentShader = fragmentShader;
        }}
      />
    </mesh>
  );
}
