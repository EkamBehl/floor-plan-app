// components/SceneRenderer.tsx
"use client";
import React, { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import sceneBuilder from './sceneBuilder';
import * as THREE from 'three';

interface SceneContentProps {
  data: any[];
}

const SceneContent: React.FC<SceneContentProps> = ({ data }) => {
  const { scene } = useThree();

  useEffect(() => {
    const loadScene = async () => {
      const sceneJson = await sceneBuilder({ data });
      const sceneData = JSON.parse(sceneJson);

      const loader = new THREE.ObjectLoader();
      const loadedScene = loader.parse(sceneData);

      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }

      scene.add(loadedScene);
    };

    loadScene();
  }, [data, scene]);

  return null;
};

interface SceneRendererProps {
  data: any[];
  onSaveScene: (sceneJson: string) => void;
}

const SceneRenderer: React.FC<SceneRendererProps> = ({ data, onSaveScene }) => {
  const handleSave = () => {
    const scene = useThree().scene;
    const sceneJson = JSON.stringify(scene.toJSON());
    onSaveScene(sceneJson);
  };

  return (
    <>
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />
        <SceneContent data={data} />
      </Canvas>
      <button onClick={handleSave}>Save Scene</button>
    </>
  );
};

export default SceneRenderer;
