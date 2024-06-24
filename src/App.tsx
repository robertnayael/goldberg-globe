import { useRef } from 'react';
import { Perf } from 'r3f-perf';
import { SpotLight } from 'three';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { CameraControls, PerformanceMonitor } from '@react-three/drei';

import { Globe } from './Globe';

// https://github.com/mrdoob/three.js/tree/dev/examples/jsm/shaders

function App() {
  return (
    <Canvas shadows={true} camera={{ position: [0, 0, 14], near: 0.01 }}>
      <PerformanceMonitor>
        <Main />
      </PerformanceMonitor>
      <Perf position="top-left" showGraph={true} />
    </Canvas>
  );
}

function Main() {
  const refs = {
    spotLight: useRef<SpotLight>(null!),
  };

  return (
    <>
      <ambientLight intensity={Math.PI / 64} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.13}
        penumbra={1}
        decay={0}
        intensity={Math.PI * 2}
        castShadow={true}
        color="rgb(255, 255, 255)"
        ref={refs.spotLight}
      />
      <spotLight
        position={[-10, -10, -10]}
        angle={0.13}
        penumbra={1}
        decay={0}
        intensity={(Math.PI * 2) / 10}
        castShadow={false}
        color="rgb(150, 150, 255)"
        ref={refs.spotLight}
      />
      <CameraControls />
      <EffectComposer>
        <Bloom mipmapBlur={true} luminanceThreshold={0.99} radius={0.5} intensity={0.9} />
      </EffectComposer>
      <Globe subdivisions={25} />
    </>
  );
}

export default App;
