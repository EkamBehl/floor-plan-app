"use client"
import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Mesh } from 'three';
import { Box, TransformControls } from '@react-three/drei';

const Cube = () => {
  const meshRef = useRef<Mesh>(null);
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="royalblue" />
    </mesh>
  );
};

const Scene = () => {
  const [selectedObject, setSelectedObject] = useState<React.MutableRefObject<Mesh | null>>(null);
  const cubeRef = useRef<Mesh>(null);

  const onCubeClick = () => {
    setSelectedObject(cubeRef);
  };

  return (
    <>
      {selectedObject && <TransformControls object={selectedObject.current} mode="translate" />}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh ref={cubeRef} onClick={onCubeClick} position={[0, 0, 0]}>
        <Cube />
      </mesh>
    </>
  );
};

const MoveObject = () => {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Canvas>
        <Scene />
      </Canvas>
    </div>
  );
};

export default MoveObject;
